import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import jwksRsa from 'jwks-rsa'

const MulterError = multer.MulterError
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { remoteDownloadBuffer, remotePut, remoteRemove, useRemoteFiles } from './storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret'
/** Same value as Supabase Dashboard → Project Settings → API → JWT Secret (signs Auth users’ access tokens). */
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || ''
const ADMIN_SECRET = String(process.env.ADMIN_SECRET || '').trim()

function supabaseJwksUri() {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '')
  if (!base) return null
  return `${base}/auth/v1/.well-known/jwks.json`
}

const supabaseJwks = jwksRsa({
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 60 * 60 * 1000,
  jwksUri: supabaseJwksUri() || 'https://example.invalid/auth/v1/.well-known/jwks.json',
})

function verifySupabaseJwt(token) {
  const decoded = jwt.decode(token, { complete: true })
  const header = decoded && typeof decoded === 'object' ? decoded.header : null
  const alg = header?.alg

  if (!alg || typeof alg !== 'string') {
    throw new Error('missing alg')
  }

  if (alg.startsWith('HS')) {
    if (!SUPABASE_JWT_SECRET) throw new Error('SUPABASE_JWT_SECRET missing')
    return jwt.verify(token, SUPABASE_JWT_SECRET, { algorithms: ['HS256', 'HS384', 'HS512'] })
  }

  if (alg.startsWith('RS')) {
    const uri = supabaseJwksUri()
    if (!uri) throw new Error('SUPABASE_URL missing for JWKS')
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        (header, cb) => {
          supabaseJwks.getSigningKey(header.kid, (err, key) => {
            if (err) return cb(err)
            cb(null, key.getPublicKey())
          })
        },
        { algorithms: ['RS256', 'RS384', 'RS512'] },
        (err, payload) => {
          if (err) return reject(err)
          resolve(payload)
        },
      )
    })
  }

  throw new Error(`unsupported alg ${alg}`)
}

/** Vercel serverless FS is read-only except /tmp — creating ./uploads crashes the whole function at import time. */
const uploadsRoot = process.env.VERCEL
  ? path.join('/tmp', 'apply-once-uploads')
  : path.join(__dirname, '..', 'uploads')

function ensureUploadsDir(userId) {
  const dir = path.join(uploadsRoot, userId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

try {
  if (!fs.existsSync(uploadsRoot)) {
    fs.mkdirSync(uploadsRoot, { recursive: true })
  }
} catch (e) {
  console.error('Could not create uploads root:', uploadsRoot, e)
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

/**
 * Vercel rewrites `/api/*` → `/api` (see `api/index.js`). Incoming `req.url` may be stripped
 * (e.g. `/auth/register` instead of `/api/auth/register`) — normalize so `/api/...` routes match.
 */
function restoreVercelApiUrl(req) {
  if (!process.env.VERCEL) return
  const candidates = [
    req.originalUrl,
    req.headers['x-invoke-path'],
    req.headers['x-forwarded-uri'],
    req.headers['x-vercel-original-url'],
    req.headers['x-url'],
    req.headers['x-matched-path'],
  ].filter((v) => typeof v === 'string')

  for (const raw of candidates) {
    let p = raw.split('#')[0]
    if (p.includes('://')) {
      try {
        const u = new URL(p)
        p = u.pathname + u.search
      } catch {
        continue
      }
    }
    if (!p.startsWith('/')) p = `/${p}`
    if (p.startsWith('/api')) {
      req.url = p
      return
    }
  }

  const raw = req.url.split('#')[0]
  const pathOnly = raw.split('?')[0]
  const search = raw.includes('?') ? raw.slice(raw.indexOf('?')) : ''
  if (!pathOnly.startsWith('/api') && pathOnly.length > 1) {
    req.url = `/api${pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`}${search}`
  }
}

app.use((req, _res, next) => {
  restoreVercelApiUrl(req)
  next()
})

async function ensureAppUserFromSupabase(authId, jwtPayload) {
  const email =
    typeof jwtPayload.email === 'string'
      ? jwtPayload.email.trim().toLowerCase()
      : typeof jwtPayload.user_metadata?.email === 'string'
        ? String(jwtPayload.user_metadata.email).trim().toLowerCase()
        : ''

  let user = await prisma.user.findUnique({ where: { supabaseAuthId: authId } })
  if (user) return user

  if (email) {
    const byEmail = await prisma.user.findUnique({ where: { email } })
    if (byEmail) {
      if (byEmail.supabaseAuthId && byEmail.supabaseAuthId !== authId) {
        const err = new Error('CONFLICT_EMAIL_AUTH')
        throw err
      }
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { supabaseAuthId: authId },
      })
    }
  }

  const syntheticEmail =
    email || `oauth-${authId.replace(/-/g, '')}@oauth.apply-once.invalid`

  user = await prisma.user.create({
    data: {
      email: syntheticEmail,
      passwordHash: null,
      supabaseAuthId: authId,
      profile: { create: {} },
      application: { create: { payload: '{}' } },
    },
  })
  await prisma.profileInboxItem.create({
    data: {
      userId: user.id,
      title: 'Your profile hub is live',
      body: 'Use your profile to upload a photo, track your application, and respond when we need something extra for a bursary (essays, documents, and more).',
      kind: 'application_status',
      requiresResponse: false,
    },
  })
  return user
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    return next()
  } catch {
    /* try Supabase Auth JWT */
  }
  try {
    const payload = await verifySupabaseJwt(token)
    // Supabase access tokens typically include aud: "authenticated". Be lenient here because
    // libraries differ on how they interpret `audience` vs payload.aud (string/array).
    if (payload?.aud && payload.aud !== 'authenticated') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    const authId = payload.sub
    if (!authId || typeof authId !== 'string') {
      return res.status(401).json({ error: 'Invalid token' })
    }
    try {
      const user = await ensureAppUserFromSupabase(authId, payload)
      req.userId = user.id
      return next()
    } catch (e) {
      if (e instanceof Error && e.message === 'CONFLICT_EMAIL_AUTH') {
        return res.status(409).json({
          error:
            'This email is already linked to another account. Sign in with email/password or contact support.',
        })
      }
      console.error(e)
      return res.status(401).json({ error: 'Invalid token' })
    }
  } catch (e) {
    const decoded = jwt.decode(token, { complete: true })
    const alg = decoded && typeof decoded === 'object' ? decoded.header?.alg : undefined
    console.error('Supabase JWT rejected:', e instanceof Error ? e.message : e, 'alg=', alg)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function adminMiddleware(req, res, next) {
  if (!ADMIN_SECRET) {
    return res.status(503).json({
      error:
        'Admin API disabled: add ADMIN_SECRET to your .env file on the server, then restart the API.',
    })
  }
  const token = req.get('x-admin-token')
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid admin token' })
  }
  next()
}

const documentDiskStorage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const dir = ensureUploadsDir(req.userId)
      cb(null, dir)
    } catch (e) {
      cb(e, uploadsRoot)
    }
  },
  filename(req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safe}`)
  },
})

const documentUploadDisk = multer({
  storage: documentDiskStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
})

const documentUploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
})

function documentUploadMiddleware(req, res, next) {
  ;(useRemoteFiles() ? documentUploadMemory : documentUploadDisk).single('file')(req, res, next)
}

const avatarImageFilter = (_req, file, cb) => {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'))
    return
  }
  cb(null, true)
}

const avatarUploadDisk = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      try {
        cb(null, ensureUploadsDir(req.userId))
      } catch (e) {
        cb(e, uploadsRoot)
      }
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname || '').toLowerCase()
      const safe = ext && ext.length < 8 ? ext : '.jpg'
      cb(null, `avatar${safe}`)
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: avatarImageFilter,
})

const avatarUploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: avatarImageFilter,
})

function avatarUploadMiddleware(req, res, next) {
  ;(useRemoteFiles() ? avatarUploadMemory : avatarUploadDisk).single('file')(req, res, next)
}

function projectRoot() {
  return path.join(__dirname, '..')
}

function absFromStorage(rel) {
  return path.join(projectRoot(), rel.replace(/\//g, path.sep))
}

function safeUnlink(relPath) {
  if (!relPath) return
  const abs = absFromStorage(relPath)
  if (!abs.startsWith(uploadsRoot)) return
  fs.unlink(abs, () => {})
}

async function removeStoredPath(p) {
  if (!p) return
  if (p.startsWith('uploads/')) safeUnlink(p)
  else {
    try {
      await remoteRemove(p)
    } catch {
      /* ignore */
    }
  }
}

function mimeFromExt(ext) {
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

function vercelNeedsRemoteFiles() {
  return Boolean(process.env.VERCEL) && process.env.VERCEL !== '0' && !useRemoteFiles()
}

/** Supabase transaction pooler (6543) + Prisma without `pgbouncer=true` → Postgres 42P05 prepared statement errors. */
function supabaseTransactionPoolerMissingPgbouncer() {
  const dbUrl = process.env.DATABASE_URL || ''
  if (!dbUrl.includes('pooler.supabase.com')) return false
  if (!/:6543(\/|\?|$)/.test(dbUrl)) return false
  return !/[?&]pgbouncer=true(?:&|$)/.test(dbUrl)
}

app.get('/api/health', (req, res) => {
  const poolerMisconfigured = supabaseTransactionPoolerMissingPgbouncer()
  res.json({
    ok: true,
    vercel: Boolean(process.env.VERCEL),
    path: req.url,
    originalUrl: req.originalUrl,
    jwtSecretSet: Boolean(process.env.JWT_SECRET && String(process.env.JWT_SECRET).length >= 16),
    supabaseJwtSecretSet: Boolean(SUPABASE_JWT_SECRET && SUPABASE_JWT_SECRET.length >= 32),
    databasePoolerOk: !poolerMisconfigured,
    ...(poolerMisconfigured
      ? {
          databaseFix:
            'Set DATABASE_URL to include ?pgbouncer=true (e.g. ...6543/postgres?pgbouncer=true). Keeps Prisma compatible with Supabase transaction pooling and fixes error 42P05.',
        }
      : {}),
  })
})

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const password = String(req.body?.password || '')
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Valid email and password (min 8 chars) required' })
  }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: {} },
      application: { create: { payload: '{}' } },
    },
  })
  await prisma.profileInboxItem.create({
    data: {
      userId: user.id,
      title: 'Your profile hub is live',
      body: 'Use your profile to upload a photo, track your application, and respond when we need something extra for a bursary (essays, documents, and more).',
      kind: 'application_status',
      requiresResponse: false,
    },
  })
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '14d' })
  res.status(201).json({ token, user: { id: user.id, email: user.email } })
})

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase()
  const password = String(req.body?.password || '')
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  if (!user.passwordHash) {
    return res.status(401).json({
      error: 'This account uses Google sign-in—use “Continue with Google”.',
    })
  }
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '14d' })
  res.json({ token, user: { id: user.id, email: user.email } })
})

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      avatarStoragePath: true,
      profile: { select: { firstName: true, lastName: true } },
    },
  })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    firstName: user.profile?.firstName ?? null,
    lastName: user.profile?.lastName ?? null,
    hasAvatar: Boolean(user.avatarStoragePath),
  })
})

app.get('/api/profile/avatar', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { avatarStoragePath: true },
  })
  const storagePath = user?.avatarStoragePath
  if (!storagePath) {
    return res.status(404).end()
  }
  if (storagePath.startsWith('uploads/')) {
    const abs = absFromStorage(storagePath)
    if (!abs.startsWith(uploadsRoot) || !fs.existsSync(abs)) {
      return res.status(404).end()
    }
    const ext = path.extname(abs).toLowerCase()
    res.setHeader('Content-Type', mimeFromExt(ext))
    res.setHeader('Cache-Control', 'private, max-age=3600')
    return res.sendFile(abs)
  }
  try {
    const buf = await remoteDownloadBuffer(storagePath)
    const ext = path.extname(storagePath).toLowerCase()
    res.setHeader('Content-Type', mimeFromExt(ext))
    res.setHeader('Cache-Control', 'private, max-age=3600')
    return res.send(buf)
  } catch {
    return res.status(404).end()
  }
})

app.post('/api/profile/avatar', authMiddleware, avatarUploadMiddleware, async (req, res, next) => {
  try {
    if (vercelNeedsRemoteFiles()) {
      return res.status(503).json({
        error:
          'Avatar uploads on Vercel need Supabase Storage. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.',
      })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' })
    }
    const current = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { avatarStoragePath: true },
    })
    let storedPath
    if (useRemoteFiles()) {
      const ext = path.extname(req.file.originalname || '').toLowerCase()
      const safeExt = ext && ext.length < 8 ? ext : '.jpg'
      storedPath = `avatars/${req.userId}/avatar${safeExt}`
      await remotePut(storedPath, req.file.buffer, req.file.mimetype)
    } else {
      storedPath = path.relative(projectRoot(), req.file.path).replace(/\\/g, '/')
    }
    if (current?.avatarStoragePath && current.avatarStoragePath !== storedPath) {
      await removeStoredPath(current.avatarStoragePath)
    }
    await prisma.user.update({
      where: { id: req.userId },
      data: { avatarStoragePath: storedPath },
    })
    res.json({ ok: true, hasAvatar: true })
  } catch (err) {
    if (useRemoteFiles()) {
      console.error('avatar upload storage/db:', err)
      return res.status(502).json({
        error:
          'Could not save your photo to Supabase Storage. In Supabase: create a bucket with that exact name, set it to non-public if you prefer (the server uses the service role). Verify SUPABASE_STORAGE_BUCKET, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY on Vercel.',
      })
    }
    next(err)
  }
})

app.get('/api/profile', authMiddleware, async (req, res) => {
  const profile = await prisma.profile.upsert({
    where: { userId: req.userId },
    update: {},
    create: { userId: req.userId },
  })
  res.json(profile)
})

app.put('/api/profile', authMiddleware, async (req, res) => {
  const body = req.body || {}
  const data = {
    firstName: body.firstName ?? undefined,
    lastName: body.lastName ?? undefined,
    phone: body.phone ?? undefined,
    dateOfBirth: body.dateOfBirth ?? undefined,
    idNumber: body.idNumber ?? undefined,
    gender: body.gender ?? undefined,
    citizenship: body.citizenship ?? undefined,
    disability: typeof body.disability === 'boolean' ? body.disability : undefined,
    disabilityNotes: body.disabilityNotes ?? undefined,
    homeLanguage: body.homeLanguage ?? undefined,
    residentialAddress: body.residentialAddress ?? undefined,
    postalAddress: body.postalAddress ?? undefined,
  }
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])

  const profile = await prisma.profile.upsert({
    where: { userId: req.userId },
    create: { userId: req.userId, ...data },
    update: data,
  })
  res.json(profile)
})

app.get('/api/application', authMiddleware, async (req, res) => {
  const draft = await prisma.applicationDraft.upsert({
    where: { userId: req.userId },
    update: {},
    create: { userId: req.userId, payload: '{}', stepIndex: 0 },
  })
  let parsed = {}
  try {
    parsed = JSON.parse(draft.payload || '{}')
  } catch {
    parsed = {}
  }
  res.json({ ...draft, payload: parsed })
})

app.put('/api/application', authMiddleware, async (req, res) => {
  const payload = req.body?.payload
  const stepIndex = req.body?.stepIndex
  if (payload !== undefined && typeof payload !== 'object') {
    return res.status(400).json({ error: 'payload must be an object' })
  }
  const payloadStr =
    payload !== undefined ? JSON.stringify(payload) : undefined

  const draft = await prisma.applicationDraft.upsert({
    where: { userId: req.userId },
    create: {
      userId: req.userId,
      payload: payloadStr ?? '{}',
      stepIndex: typeof stepIndex === 'number' ? stepIndex : 0,
    },
    update: {
      ...(payloadStr !== undefined ? { payload: payloadStr } : {}),
      ...(typeof stepIndex === 'number' ? { stepIndex } : {}),
    },
  })
  let parsed = {}
  try {
    parsed = JSON.parse(draft.payload || '{}')
  } catch {
    parsed = {}
  }
  res.json({ ...draft, payload: parsed })
})

app.get('/api/documents', authMiddleware, async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      category: true,
      filename: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  })
  res.json(docs)
})

app.get('/api/inbox', authMiddleware, async (req, res) => {
  const items = await prisma.profileInboxItem.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      body: true,
      kind: true,
      requiresResponse: true,
      studentResponse: true,
      respondedAt: true,
      createdAt: true,
    },
  })
  res.json(items)
})

app.put('/api/inbox/:id/reply', authMiddleware, async (req, res) => {
  const id = String(req.params.id || '')
  const text = String(req.body?.response ?? '').trim()
  if (!text) {
    return res.status(400).json({ error: 'Response text required' })
  }
  const item = await prisma.profileInboxItem.findFirst({
    where: { id, userId: req.userId },
  })
  if (!item) {
    return res.status(404).json({ error: 'Not found' })
  }
  if (!item.requiresResponse) {
    return res.status(400).json({ error: 'This message does not need a reply' })
  }
  if (item.studentResponse) {
    return res.status(400).json({ error: 'Already replied' })
  }
  const updated = await prisma.profileInboxItem.update({
    where: { id },
    data: {
      studentResponse: text,
      respondedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      body: true,
      kind: true,
      requiresResponse: true,
      studentResponse: true,
      respondedAt: true,
      createdAt: true,
    },
  })
  res.json(updated)
})

app.post('/api/documents', authMiddleware, documentUploadMiddleware, async (req, res, next) => {
  try {
    if (vercelNeedsRemoteFiles()) {
      return res.status(503).json({
        error:
          'Document uploads on Vercel need Supabase Storage. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.',
      })
    }
    const category = String(req.body?.category || 'other')
    if (!req.file) {
      return res.status(400).json({ error: 'file required' })
    }
    let storagePath
    if (useRemoteFiles()) {
      const safe = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
      storagePath = `documents/${req.userId}/${Date.now()}-${safe}`
      await remotePut(storagePath, req.file.buffer, req.file.mimetype)
    } else {
      const relPath = path.relative(path.join(__dirname, '..'), req.file.path)
      storagePath = relPath.replace(/\\/g, '/')
    }
    const doc = await prisma.document.create({
      data: {
        userId: req.userId,
        category,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath,
      },
      select: {
        id: true,
        category: true,
        filename: true,
        mimeType: true,
        size: true,
        createdAt: true,
      },
    })
    res.status(201).json(doc)
  } catch (err) {
    if (useRemoteFiles()) {
      console.error('document upload storage/db:', err)
      return res.status(502).json({
        error:
          'Could not save the file to Supabase Storage. Create the bucket named in SUPABASE_STORAGE_BUCKET and confirm env vars on Vercel.',
      })
    }
    next(err)
  }
})

app.get('/api/admin/students', adminMiddleware, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      createdAt: true,
      avatarStoragePath: true,
      profile: {
        select: { firstName: true, lastName: true, phone: true },
      },
      application: {
        select: { stepIndex: true, updatedAt: true },
      },
      _count: {
        select: { inboxItems: true, documents: true },
      },
    },
  })
  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
      firstName: u.profile?.firstName ?? null,
      lastName: u.profile?.lastName ?? null,
      phone: u.profile?.phone ?? null,
      hasAvatar: Boolean(u.avatarStoragePath),
      stepIndex: u.application?.stepIndex ?? 0,
      applicationUpdatedAt: u.application?.updatedAt ?? null,
      inboxCount: u._count.inboxItems,
      documentCount: u._count.documents,
    })),
  )
})

app.get('/api/admin/students/:id', adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '')
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
      avatarStoragePath: true,
      profile: true,
      application: true,
      documents: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          category: true,
          filename: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      },
      inboxItems: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          body: true,
          kind: true,
          requiresResponse: true,
          studentResponse: true,
          respondedAt: true,
          createdAt: true,
        },
      },
    },
  })
  if (!user) {
    return res.status(404).json({ error: 'Student not found' })
  }
  let payload = {}
  try {
    payload = JSON.parse(user.application?.payload || '{}')
  } catch {
    payload = {}
  }
  const applicationOut = user.application
    ? {
        stepIndex: user.application.stepIndex,
        updatedAt: user.application.updatedAt,
        payload,
      }
    : null
  res.json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    hasAvatar: Boolean(user.avatarStoragePath),
    profile: user.profile,
    application: applicationOut,
    documents: user.documents,
    inboxItems: user.inboxItems,
  })
})

app.post('/api/admin/inbox', adminMiddleware, async (req, res) => {
  const userId = String(req.body?.userId || '').trim()
  const title = String(req.body?.title || '').trim()
  const bodyText = String(req.body?.body || '').trim()
  const kind =
    String(req.body?.kind || 'information_request').trim() || 'information_request'
  const requiresResponse = Boolean(req.body?.requiresResponse)
  if (!userId || !title || !bodyText) {
    return res.status(400).json({ error: 'userId, title, and body are required' })
  }
  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
  if (!exists) {
    return res.status(404).json({ error: 'Student not found' })
  }
  const item = await prisma.profileInboxItem.create({
    data: {
      userId,
      title,
      body: bodyText,
      kind,
      requiresResponse,
    },
    select: {
      id: true,
      title: true,
      body: true,
      kind: true,
      requiresResponse: true,
      createdAt: true,
    },
  })
  res.status(201).json(item)
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err instanceof MulterError) {
    const hint =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field (use field name "file")'
          : err.message || err.code
    return res.status(400).json({ error: hint })
  }
  const msg = err instanceof Error ? err.message : String(err)
  if (/Only JPEG|PNG|WebP|GIF/i.test(msg)) {
    return res.status(400).json({ error: msg })
  }
  res.status(500).json({ error: 'Server error' })
})

export default app

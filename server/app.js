import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'
import PDFDocument from 'pdfkit'

const MulterError = multer.MulterError
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { remoteDownloadBuffer, remotePut, remoteRemove, useRemoteFiles } from './storage.js'
import { seedVarsityCatalogueFromRepo } from './varsitySeed.js'
import { sortProgrammesForCatalogue, sortUniversitiesForCatalogue } from './varsityDisplayOrder.js'
import {
  ensureBursaryCatalogueSeeded,
  isOpportunityOpen,
  loadBursaryCatalogue,
  matchOpenOpportunities,
  rowToBursary,
  syncBursaryCatalogue,
} from './bursaryMatch.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret'
const ADMIN_SECRET = String(process.env.ADMIN_SECRET || '').trim()
const ADMIN_EMAILS = String(process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

/** If set, POST /api/admin/varsity/seed-from-json must send matching X-Varsity-Seed-Token or JSON seedToken. */
const VARSITY_SEED_TOKEN = String(process.env.VARSITY_SEED_TOKEN || '').trim()

function supabaseAdmin() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
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

  const firstName =
    typeof jwtPayload.user_metadata?.firstName === 'string'
      ? jwtPayload.user_metadata.firstName.trim()
      : typeof jwtPayload.user_metadata?.first_name === 'string'
        ? jwtPayload.user_metadata.first_name.trim()
        : ''
  const lastName =
    typeof jwtPayload.user_metadata?.lastName === 'string'
      ? jwtPayload.user_metadata.lastName.trim()
      : typeof jwtPayload.user_metadata?.last_name === 'string'
        ? jwtPayload.user_metadata.last_name.trim()
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
        data: {
          supabaseAuthId: authId,
          profile:
            firstName || lastName
              ? {
                  upsert: {
                    create: { firstName: firstName || null, lastName: lastName || null },
                    update: {
                      ...(firstName ? { firstName } : {}),
                      ...(lastName ? { lastName } : {}),
                    },
                  },
                }
              : undefined,
        },
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
      profile: { create: { firstName: firstName || undefined, lastName: lastName || undefined } },
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
    const sb = supabaseAdmin()
    if (!sb) {
      return res.status(503).json({
        error:
          'Supabase Auth not configured on server. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel.',
      })
    }

    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user?.id) {
      console.error('Supabase auth.getUser failed:', error?.message || error)
      return res.status(401).json({ error: 'Invalid token' })
    }

    const authId = data.user.id
    req.supabaseEmail = (data.user.email || '').trim().toLowerCase()
    const payloadLike = {
      sub: authId,
      email: data.user.email ?? null,
      user_metadata: data.user.user_metadata ?? {},
    }
    try {
      const user = await ensureAppUserFromSupabase(authId, payloadLike)
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
    console.error('Supabase token validation error:', e instanceof Error ? e.message : e)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function adminMiddleware(req, res, next) {
  // Backward compatible: allow either:
  // - legacy X-Admin-Token == ADMIN_SECRET
  // - Supabase-authenticated admin email allowlist (ADMIN_EMAILS)
  const legacy = req.get('x-admin-token')
  if (ADMIN_SECRET && legacy && legacy === ADMIN_SECRET) return next()

  if (!ADMIN_EMAILS.length) {
    return res.status(503).json({
      error:
        'Admin API disabled: set ADMIN_EMAILS (comma-separated) or keep using ADMIN_SECRET with X-Admin-Token.',
    })
  }

  const email = String(req.supabaseEmail || '').trim().toLowerCase()
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return res.status(401).json({ error: 'Not an admin account' })
  }
  next()
}

/** Sets req.supabaseEmail from Bearer token so adminMiddleware can allowlist Supabase admins without full authMiddleware. */
async function attachSupabaseEmailIfPresent(req, _res, next) {
  if (req.supabaseEmail) return next()
  const header = String(req.headers.authorization || '')
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()
  try {
    const sb = supabaseAdmin()
    if (!sb) return next()
    const { data } = await sb.auth.getUser(token)
    if (data?.user?.email) req.supabaseEmail = String(data.user.email).trim().toLowerCase()
  } catch {
    /* ignore */
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

const varsityReportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const name = String(file.originalname || '')
    const mt = String(file.mimetype || '').toLowerCase()
    const ok =
      mt === 'application/pdf' ||
      mt === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.pdf$/i.test(name) ||
      /\.docx$/i.test(name)
    if (!ok) {
      const err = new Error('Only PDF or Word (.docx) school reports are supported')
      err.code = 'INVALID_FILE_TYPE'
      return cb(err)
    }
    cb(null, true)
  },
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
    supabaseServiceRoleSet: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
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

function parseQuestionnaireAnswers(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const allowed = [
    'studyChoice1',
    'studyChoice2',
    'studyChoice3',
    'workSector',
    'jobLinkedBursary',
    'careerPriority',
  ]
  /** @type {Record<string, string>} */
  const out = {}
  for (const key of allowed) {
    if (typeof raw[key] === 'string' && raw[key].trim()) out[key] = raw[key].trim()
  }
  return out
}

app.get('/api/questionnaire', authMiddleware, async (req, res) => {
  const row = await prisma.careerQuestionnaire.findUnique({
    where: { userId: req.userId },
  })
  if (!row) {
    return res.json({
      answers: {},
      skipped: false,
      completedAt: null,
      bursaryCount: null,
      scholarshipCount: null,
      matchedAt: null,
    })
  }
  let answers = {}
  try {
    answers = JSON.parse(row.answers || '{}')
  } catch {
    answers = {}
  }
  res.json({
    answers,
    skipped: row.skipped,
    completedAt: row.completedAt,
    bursaryCount: row.bursaryCount,
    scholarshipCount: row.scholarshipCount,
    matchedAt: row.matchedAt,
    updatedAt: row.updatedAt,
  })
})

app.put('/api/questionnaire', authMiddleware, async (req, res) => {
  const skipped = Boolean(req.body?.skipped)
  const answers = parseQuestionnaireAnswers(req.body?.answers)

  if (!skipped) {
    const required = ['studyChoice1', 'studyChoice2', 'studyChoice3', 'workSector', 'jobLinkedBursary', 'careerPriority']
    const missing = required.filter((k) => !answers[k])
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Please answer all questionnaire questions before continuing.' })
    }
  }

  await ensureBursaryCatalogueSeeded(prisma)

  let bursaryCount = null
  let scholarshipCount = null
  let matchedAt = null
  let completedAt = null

  if (!skipped && Object.keys(answers).length > 0) {
    const rows = await prisma.bursaryOpportunity.findMany({ where: { active: true } })
    const catalogue = rows.map(rowToBursary)
    const match = matchOpenOpportunities(answers, catalogue)
    bursaryCount = match.bursaryCount
    scholarshipCount = match.scholarshipCount
    matchedAt = new Date()
    completedAt = matchedAt
  }

  const row = await prisma.careerQuestionnaire.upsert({
    where: { userId: req.userId },
    create: {
      userId: req.userId,
      answers: JSON.stringify(answers),
      skipped,
      completedAt,
      bursaryCount,
      scholarshipCount,
      matchedAt,
    },
    update: {
      answers: JSON.stringify(answers),
      skipped,
      completedAt: skipped ? null : completedAt,
      bursaryCount: skipped ? null : bursaryCount,
      scholarshipCount: skipped ? null : scholarshipCount,
      matchedAt: skipped ? null : matchedAt,
    },
  })

  let parsedAnswers = {}
  try {
    parsedAnswers = JSON.parse(row.answers || '{}')
  } catch {
    parsedAnswers = {}
  }

  res.json({
    answers: parsedAnswers,
    skipped: row.skipped,
    completedAt: row.completedAt,
    bursaryCount: row.bursaryCount,
    scholarshipCount: row.scholarshipCount,
    matchedAt: row.matchedAt,
    updatedAt: row.updatedAt,
  })
})

app.post('/api/questionnaire/match', authMiddleware, async (req, res) => {
  const answers = parseQuestionnaireAnswers(req.body?.answers ?? req.body)
  await ensureBursaryCatalogueSeeded(prisma)
  const rows = await prisma.bursaryOpportunity.findMany({ where: { active: true } })
  const catalogue = rows.map(rowToBursary)
  const match = matchOpenOpportunities(answers, catalogue)
  res.json(match)
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

async function buildApplicationSnapshot(userId) {
  const [profile, draft, docs, user] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.applicationDraft.findUnique({ where: { userId } }),
    prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { category: true, filename: true, size: true, createdAt: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, createdAt: true },
    }),
  ])

  let payload = {}
  try {
    payload = JSON.parse(draft?.payload || '{}')
  } catch {
    payload = {}
  }

  return {
    email: user?.email ?? '',
    createdAt: user?.createdAt ?? null,
    profile: profile ?? null,
    stepIndex: draft?.stepIndex ?? 0,
    payload,
    documents: docs,
  }
}

function writeSection(doc, title, lines) {
  doc.moveDown(0.6)
  doc.fontSize(13).fillColor('#0f172a').text(title, { underline: true })
  doc.moveDown(0.25)
  doc.fontSize(10).fillColor('#0f172a')
  for (const line of lines) {
    if (!line) continue
    doc.text(`• ${line}`)
  }
}

function safeText(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  return String(v)
}

async function generateApplicationPdfBuffer(snapshot) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 })
  const chunks = []
  doc.on('data', (c) => chunks.push(c))

  doc.fontSize(18).fillColor('#0f172a').text('Apply Once — Student Application Snapshot')
  doc.moveDown(0.25)
  doc.fontSize(10).fillColor('#334155').text(`Generated: ${new Date().toLocaleString()}`)
  doc.fontSize(10).fillColor('#334155').text(`Student email: ${snapshot.email || '—'}`)
  doc.fontSize(10).fillColor('#334155').text(
    `Progress step index: ${snapshot.stepIndex} (saved draft)`,
  )

  const p = snapshot.profile || {}
  writeSection(doc, 'Profile', [
    `Name: ${[safeText(p.firstName), safeText(p.lastName)].filter(Boolean).join(' ') || '—'}`,
    `Phone: ${safeText(p.phone) || '—'}`,
    `Date of birth: ${safeText(p.dateOfBirth) || '—'}`,
    `ID number: ${safeText(p.idNumber) || '—'}`,
    `Citizenship: ${safeText(p.citizenship) || '—'}`,
    `Gender: ${safeText(p.gender) || '—'}`,
    `Home language: ${safeText(p.homeLanguage) || '—'}`,
    `Residential address: ${safeText(p.residentialAddress) || '—'}`,
    `Postal address: ${safeText(p.postalAddress) || '—'}`,
    `Disability: ${p.disability ? 'Yes' : 'No'}`,
    p.disability ? `Disability notes: ${safeText(p.disabilityNotes) || '—'}` : '',
  ])

  const a = snapshot.payload?.academics || {}
  writeSection(doc, 'Academics', [
    `School: ${safeText(a.schoolName) || '—'}`,
    `Grade/year: ${safeText(a.grade) || '—'}`,
    `Curriculum: ${safeText(a.curriculum) || '—'}`,
    `Institution: ${safeText(a.institutionName) || '—'}`,
    `Qualification: ${safeText(a.qualificationName) || '—'}`,
    `Year of study: ${safeText(a.yearOfStudy) || '—'}`,
    `Intended fields: ${safeText(a.intendedFieldsNotes) || '—'}`,
    `Subjects & marks: ${safeText(a.subjectsNotes) || '—'}`,
    `NBT/APS: ${safeText(a.nbtApsNotes) || '—'}`,
    `Achievements: ${safeText(a.achievementsNotes) || '—'}`,
  ])

  const sp = snapshot.payload?.studyPlan || {}
  writeSection(doc, 'Study plan', [
    `Motivation: ${safeText(sp.motivation) || '—'}`,
    `Career goals: ${safeText(sp.careerGoals) || '—'}`,
    `Location preferences: ${safeText(sp.locationPreferences) || '—'}`,
    `Bursary preferences: ${safeText(sp.bursaryPreferences) || '—'}`,
  ])

  const h = snapshot.payload?.household || {}
  writeSection(doc, 'Household', [
    `Guardian name: ${safeText(h.guardianName) || '—'}`,
    `Relationship: ${safeText(h.relationship) || '—'}`,
    `Guardian phone: ${safeText(h.guardianPhone) || '—'}`,
    `Guardian email: ${safeText(h.guardianEmail) || '—'}`,
    `Household members: ${safeText(h.householdMembersNotes) || '—'}`,
    `Employment notes: ${safeText(h.employmentNotes) || '—'}`,
  ])

  const f = snapshot.payload?.financial || {}
  writeSection(doc, 'Financial need', [
    `Income band: ${safeText(f.incomeBand) || '—'}`,
    `Income sources: ${safeText(f.incomeSourcesNotes) || '—'}`,
    `Expenses: ${safeText(f.expenseNotes) || '—'}`,
    `Other funding: ${safeText(f.otherFundingNotes) || '—'}`,
    `NSFAS status: ${safeText(f.nsfasStatus) || '—'}`,
  ])

  const fit = snapshot.payload?.fit || {}
  writeSection(doc, 'Leadership & impact', [
    `Leadership: ${safeText(fit.leadershipNotes) || '—'}`,
    `Community: ${safeText(fit.communityNotes) || '—'}`,
    `Work experience: ${safeText(fit.workExperienceNotes) || '—'}`,
  ])

  const c = snapshot.payload?.compliance || {}
  writeSection(doc, 'Consent', [
    `POPIA consent: ${c.consentPopia ? 'Yes' : 'No'}`,
    `Truthful declaration: ${c.declarationTruthful ? 'Yes' : 'No'}`,
  ])

  writeSection(
    doc,
    'Uploaded documents (metadata)',
    (snapshot.documents || []).map(
      (d) =>
        `${d.category}: ${d.filename} (${Math.round((d.size || 0) / 1024)} KB) — ${new Date(
          d.createdAt,
        ).toLocaleDateString()}`,
    ),
  )

  doc.end()
  return await new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

app.get('/api/application/snapshot', authMiddleware, async (req, res, next) => {
  try {
    const snapshot = await buildApplicationSnapshot(req.userId)
    res.json(snapshot)
  } catch (e) {
    next(e)
  }
})

app.get('/api/application/pdf', authMiddleware, async (req, res, next) => {
  try {
    const snapshot = await buildApplicationSnapshot(req.userId)
    const buf = await generateApplicationPdfBuffer(snapshot)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="apply-once-application.pdf"')
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache')
    res.send(buf)
  } catch (e) {
    next(e)
  }
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

app.get('/api/chat', authMiddleware, async (req, res) => {
  const rows = await prisma.chatMessage.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, sender: true, body: true, createdAt: true },
  })
  res.json(rows)
})

app.post('/api/chat', authMiddleware, async (req, res) => {
  const body = String(req.body?.body ?? '').trim()
  if (!body) return res.status(400).json({ error: 'Message text required' })
  const row = await prisma.chatMessage.create({
    data: { userId: req.userId, sender: 'student', body },
    select: { id: true, sender: true, body: true, createdAt: true },
  })
  res.status(201).json(row)
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

app.get('/api/admin/me', authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ ok: true, email: String(req.supabaseEmail || '') })
})

app.get('/api/admin/bursaries', adminMiddleware, async (req, res) => {
  const filter = String(req.query.filter || 'all')
  await ensureBursaryCatalogueSeeded(prisma)
  const rows = await prisma.bursaryOpportunity.findMany({ orderBy: [{ applicationCloses: 'asc' }, { name: 'asc' }] })
  const now = new Date()
  const items = rows.map((row) => {
    const b = rowToBursary(row)
    const open = isOpportunityOpen(b, now)
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      provider: b.provider,
      type: b.type,
      studyFields: b.studyFields,
      workSectors: b.workSectors,
      offersJobAfterGrad: b.offersJobAfterGrad,
      applicationCloses: b.applicationCloses,
      applyUrl: b.applyUrl ?? null,
      active: b.active,
      isOpen: open,
      notes: b.notes ?? null,
    }
  })
  const filtered =
    filter === 'open' ? items.filter((i) => i.isOpen && i.active) : filter === 'closed' ? items.filter((i) => !i.isOpen || !i.active) : items
  res.json({
    total: filtered.length,
    openCount: items.filter((i) => i.isOpen && i.active).length,
    closedCount: items.filter((i) => !i.isOpen || !i.active).length,
    asOf: now.toISOString(),
    items: filtered,
  })
})

app.post('/api/admin/bursaries/sync', adminMiddleware, async (req, res) => {
  const count = await syncBursaryCatalogue(prisma)
  res.json({ ok: true, upserted: count })
})

app.get('/api/admin/students/:id/bursary-matches', adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '')
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, careerQuestionnaire: true },
  })
  if (!user) return res.status(404).json({ error: 'Student not found' })

  const q = user.careerQuestionnaire
  if (!q || q.skipped || !q.completedAt) {
    return res.json({ hasQuestionnaire: false, answers: {}, bursaryCount: null, scholarshipCount: null, matches: [] })
  }

  let answers = {}
  try {
    answers = JSON.parse(q.answers || '{}')
  } catch {
    answers = {}
  }

  const catalogue = await loadBursaryCatalogue(prisma)
  const match = matchOpenOpportunities(answers, catalogue)

  res.json({
    hasQuestionnaire: true,
    answers,
    bursaryCount: match.bursaryCount,
    scholarshipCount: match.scholarshipCount,
    matchedAt: match.asOf,
    fieldSlugsUsed: match.fieldSlugsUsed,
    matches: match.matched.map((m) => ({
      slug: m.slug,
      name: m.name,
      provider: m.provider,
      type: m.type,
      applicationCloses: m.applicationCloses,
      applyUrl: m.applyUrl ?? null,
      offersJobAfterGrad: m.offersJobAfterGrad,
      studyFields: m.studyFields,
    })),
  })
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
      careerQuestionnaire: true,
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
  let questionnaireOut = null
  let bursaryMatchesOut = null
  if (user.careerQuestionnaire) {
    const q = user.careerQuestionnaire
    let qAnswers = {}
    try {
      qAnswers = JSON.parse(q.answers || '{}')
    } catch {
      qAnswers = {}
    }
    questionnaireOut = {
      answers: qAnswers,
      skipped: q.skipped,
      completedAt: q.completedAt,
      bursaryCount: q.bursaryCount,
      scholarshipCount: q.scholarshipCount,
      matchedAt: q.matchedAt,
    }
    if (!q.skipped && q.completedAt && Object.keys(qAnswers).length > 0) {
      const catalogue = await loadBursaryCatalogue(prisma)
      const match = matchOpenOpportunities(qAnswers, catalogue)
      bursaryMatchesOut = {
        bursaryCount: match.bursaryCount,
        scholarshipCount: match.scholarshipCount,
        matchedAt: match.asOf,
        matches: match.matched.map((m) => ({
          slug: m.slug,
          name: m.name,
          provider: m.provider,
          type: m.type,
          applicationCloses: m.applicationCloses,
          applyUrl: m.applyUrl ?? null,
          offersJobAfterGrad: m.offersJobAfterGrad,
        })),
      }
    }
  }

  res.json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    hasAvatar: Boolean(user.avatarStoragePath),
    profile: user.profile,
    application: applicationOut,
    documents: user.documents,
    inboxItems: user.inboxItems,
    questionnaire: questionnaireOut,
    bursaryMatches: bursaryMatchesOut,
  })
})

app.get('/api/admin/students/:id/chat', adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '')
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return res.status(404).json({ error: 'Student not found' })
  const rows = await prisma.chatMessage.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, sender: true, body: true, createdAt: true },
  })
  res.json(rows)
})

app.get('/api/admin/students/:id/application/snapshot', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = String(req.params.id || '')
    const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!exists) return res.status(404).json({ error: 'Student not found' })
    const snapshot = await buildApplicationSnapshot(id)
    res.json(snapshot)
  } catch (e) {
    next(e)
  }
})

app.get('/api/admin/students/:id/application/pdf', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const id = String(req.params.id || '')
    const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } })
    if (!exists) return res.status(404).json({ error: 'Student not found' })
    const snapshot = await buildApplicationSnapshot(id)
    const buf = await generateApplicationPdfBuffer(snapshot)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=\"apply-once-application.pdf\"')
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache')
    res.send(buf)
  } catch (e) {
    next(e)
  }
})

app.post('/api/admin/students/:id/chat', adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '')
  const body = String(req.body?.body ?? '').trim()
  if (!body) return res.status(400).json({ error: 'Message text required' })
  const exists = await prisma.user.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return res.status(404).json({ error: 'Student not found' })
  const row = await prisma.chatMessage.create({
    data: { userId: id, sender: 'admin', body },
    select: { id: true, sender: true, body: true, createdAt: true },
  })
  res.status(201).json(row)
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

function parseCatalogueYear(req) {
  let yearRaw = String(req.query?.year ?? '').trim()
  if (!yearRaw && req.body && req.body.year != null) yearRaw = String(req.body.year).trim()
  const y = yearRaw ? Number(yearRaw) : 2026
  if (!Number.isFinite(y) || y < 2000 || y > 2100) return 2026
  return Math.floor(y)
}

app.get('/api/varsity/catalogue', async (req, res) => {
  const year = parseCatalogueYear(req)
  const universitiesRaw = await prisma.varsityUniversity.findMany({
    where: { active: true },
    select: { id: true, name: true, shortName: true, website: true, logoPath: true, calculatorType: true },
  })
  const universities = sortUniversitiesForCatalogue(universitiesRaw)

  const programmes = await prisma.varsityProgramme.findMany({
    where: { active: true, university: { active: true } },
    orderBy: [{ universityId: 'asc' }, { faculty: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      universityId: true,
      name: true,
      faculty: true,
      campus: true,
      externalCode: true,
      ruleSets: {
        where: { catalogueYear: year },
        select: {
          id: true,
          catalogueYear: true,
          minAps: true,
          notes: true,
          requirements: { select: { kind: true, label: true, payloadJson: true } },
        },
      },
    },
  })

  const programmePayload = sortProgrammesForCatalogue(
    programmes
      .map((p) => {
        const rs = p.ruleSets?.[0]
        if (!rs) return null
        let subjectRequirements = []
        for (const r of rs.requirements || []) {
          try {
            subjectRequirements.push(JSON.parse(r.payloadJson || '{}'))
          } catch {
            // ignore invalid JSON payloads
          }
        }
        return {
          id: p.externalCode || p.id,
          programmeId: p.id,
          universityId: p.universityId,
          name: p.name,
          faculty: p.faculty,
          campus: p.campus,
          minAps: rs.minAps,
          notes: rs.notes,
          subjectRequirements,
        }
      })
      .filter(Boolean),
  )

  res.json({
    year,
    universities: universities.map((u) => ({
      id: u.id,
      name: u.name,
      shortName: u.shortName,
      website: u.website,
      logo: u.logoPath,
      calculator: u.calculatorType,
    })),
    programmes: programmePayload,
  })
})

/** Local dev + fallback: Vercel routes this path to api/varsity/report-import.js instead. */
app.post('/api/varsity/report-import', varsityReportUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'file required (multipart field name: file)' })
    }
    const { importVarsityReportMarksFromBuffer, varsityReportMimeFromFile } = await import(
      './varsityReportImport.js',
    )
    const mimetype = varsityReportMimeFromFile(req.file)
    if (!mimetype) {
      return res.status(400).json({ error: 'Only PDF or Word (.docx) school reports are supported' })
    }
    const payload = await importVarsityReportMarksFromBuffer({
      buffer: req.file.buffer,
      mimetype,
    })
    res.json({
      rows: payload.rows,
      warnings: payload.warnings,
      textSample: payload.textSample,
      confidence: payload.confidence,
    })
  } catch (e) {
    next(e)
  }
})

app.get('/api/admin/varsity/catalogue', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const year = parseCatalogueYear(req)
  const universitiesRaw = await prisma.varsityUniversity.findMany({
    select: { id: true, name: true, shortName: true, website: true, logoPath: true, calculatorType: true, active: true },
  })
  const universities = sortUniversitiesForCatalogue(universitiesRaw)
  const programmes = sortProgrammesForCatalogue(
    await prisma.varsityProgramme.findMany({
    orderBy: [{ universityId: 'asc' }, { faculty: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      universityId: true,
      name: true,
      faculty: true,
      campus: true,
      externalCode: true,
      active: true,
      ruleSets: {
        where: { catalogueYear: year },
        select: {
          id: true,
          catalogueYear: true,
          minAps: true,
          notes: true,
          requirements: { select: { id: true, kind: true, label: true, payloadJson: true } },
        },
      },
    },
  }),
  )
  res.json({ year, universities, programmes })
})

app.post('/api/admin/varsity/universities', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const id = String(req.body?.id || '').trim().toLowerCase()
  const name = String(req.body?.name || '').trim()
  const shortName = String(req.body?.shortName || '').trim()
  const website = String(req.body?.website || '').trim()
  const logoPath = String(req.body?.logoPath || '').trim()
  const calculatorType = String(req.body?.calculatorType || '').trim()
  const active = req.body?.active === undefined ? true : Boolean(req.body.active)
  if (!id || !name || !shortName || !website || !logoPath || !calculatorType) {
    return res.status(400).json({ error: 'id, name, shortName, website, logoPath, calculatorType are required' })
  }
  const row = await prisma.varsityUniversity.upsert({
    where: { id },
    update: { name, shortName, website, logoPath, calculatorType, active },
    create: { id, name, shortName, website, logoPath, calculatorType, active },
    select: { id: true, name: true, shortName: true, website: true, logoPath: true, calculatorType: true, active: true },
  })
  res.status(201).json(row)
})

app.patch('/api/admin/varsity/universities/:id', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '').trim().toLowerCase()
  const data = {}
  for (const k of ['name', 'shortName', 'website', 'logoPath', 'calculatorType']) {
    if (req.body?.[k] !== undefined) data[k] = String(req.body[k]).trim()
  }
  if (req.body?.active !== undefined) data.active = Boolean(req.body.active)
  const row = await prisma.varsityUniversity.update({
    where: { id },
    data,
    select: { id: true, name: true, shortName: true, website: true, logoPath: true, calculatorType: true, active: true },
  })
  res.json(row)
})

app.post('/api/admin/varsity/programmes', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const id = String(req.body?.id || '').trim()
  const universityId = String(req.body?.universityId || '').trim().toLowerCase()
  const name = String(req.body?.name || '').trim()
  const faculty = String(req.body?.faculty || '').trim()
  const campus = req.body?.campus === undefined ? null : String(req.body.campus || '').trim() || null
  const externalCode = req.body?.externalCode === undefined ? null : String(req.body.externalCode || '').trim() || null
  const active = req.body?.active === undefined ? true : Boolean(req.body.active)
  if (!id || !universityId || !name || !faculty) {
    return res.status(400).json({ error: 'id, universityId, name, faculty are required' })
  }
  const row = await prisma.varsityProgramme.upsert({
    where: { id },
    update: { universityId, name, faculty, campus, externalCode, active },
    create: { id, universityId, name, faculty, campus, externalCode, active },
    select: { id: true, universityId: true, name: true, faculty: true, campus: true, externalCode: true, active: true },
  })
  res.status(201).json(row)
})

app.patch('/api/admin/varsity/programmes/:id', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '').trim()
  const data = {}
  for (const k of ['universityId', 'name', 'faculty', 'campus', 'externalCode']) {
    if (req.body?.[k] !== undefined) {
      const v = String(req.body[k] || '').trim()
      data[k] = v || null
    }
  }
  if (data.universityId) data.universityId = String(data.universityId).toLowerCase()
  if (req.body?.active !== undefined) data.active = Boolean(req.body.active)
  const row = await prisma.varsityProgramme.update({
    where: { id },
    data,
    select: { id: true, universityId: true, name: true, faculty: true, campus: true, externalCode: true, active: true },
  })
  res.json(row)
})

app.post('/api/admin/varsity/programmes/:id/ruleset', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const programmeId = String(req.params.id || '').trim()
  const catalogueYear = parseCatalogueYear(req)
  const minAps = Number(req.body?.minAps ?? NaN)
  const notes = req.body?.notes === undefined ? null : String(req.body.notes || '').trim() || null
  if (!Number.isFinite(minAps) || minAps < 0 || minAps > 60) {
    return res.status(400).json({ error: 'minAps must be a number (0-60)' })
  }
  const rs = await prisma.varsityProgrammeRuleSet.upsert({
    where: { programmeId_catalogueYear: { programmeId, catalogueYear } },
    update: { minAps: Math.floor(minAps), notes },
    create: { programmeId, catalogueYear, minAps: Math.floor(minAps), notes },
    select: { id: true, programmeId: true, catalogueYear: true, minAps: true, notes: true },
  })
  res.status(201).json(rs)
})

app.put('/api/admin/varsity/rulesets/:id/requirements', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const ruleSetId = String(req.params.id || '').trim()
  const requirements = Array.isArray(req.body?.requirements) ? req.body.requirements : []
  // Basic validation: each item should be an object and JSON-serializable
  for (const r of requirements) {
    if (!r || typeof r !== 'object') return res.status(400).json({ error: 'requirements must be an array of objects' })
  }

  await prisma.varsityProgrammeRequirement.deleteMany({ where: { ruleSetId } })
  for (const r of requirements) {
    const kind = Array.isArray(r.anyOf) ? 'anyOf' : 'single'
    const label = typeof r.label === 'string' ? r.label.trim() : null
    await prisma.varsityProgrammeRequirement.create({
      data: { ruleSetId, kind, label, payloadJson: JSON.stringify(r) },
    })
  }
  res.json({ ok: true })
})

app.post(
  '/api/admin/varsity/seed-from-json',
  attachSupabaseEmailIfPresent,
  adminMiddleware,
  async (req, res) => {
    if (VARSITY_SEED_TOKEN) {
      const sent =
        String(req.get('x-varsity-seed-token') || '').trim() ||
        String(req.body?.seedToken ?? '').trim()
      if (sent !== VARSITY_SEED_TOKEN) {
        return res.status(403).json({
          error:
            'Invalid or missing seed token. Set VARSITY_SEED_TOKEN on the server and send the same value in header X-Varsity-Seed-Token or JSON body { seedToken }.',
        })
      }
    }
    const year = parseCatalogueYear(req)
    try {
      // Batch the work to avoid Vercel timeouts. Defaults to 1 programme file per request.
      const fileStart = Number(req.query?.fileStart ?? req.body?.fileStart ?? 0)
      const fileCountRaw = req.query?.fileCount ?? req.body?.fileCount
      const fileCount = fileCountRaw == null ? 1 : Number(fileCountRaw)
      const stats = await seedVarsityCatalogueFromRepo({
        prisma,
        catalogueYear: year,
        fileStart,
        fileCount,
      })
      console.info('varsity seed-from-json', stats, 'actor', req.supabaseEmail || 'legacy-admin')
      res.json({ ok: true, ...stats })
    } catch (e) {
      console.error('varsity seed-from-json failed', e)
      res.status(500).json({ error: e instanceof Error ? e.message : 'Seed failed' })
    }
  },
)

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message })
  }
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

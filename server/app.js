import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import { remoteDownloadBuffer, remotePut, remoteRemove, useRemoteFiles } from './storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret'
const ADMIN_SECRET = String(process.env.ADMIN_SECRET || '').trim()

const uploadsRoot = path.join(__dirname, '..', 'uploads')

function ensureUploadsDir(userId) {
  const dir = path.join(uploadsRoot, userId)
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true })
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))

/**
 * Vercel rewrites `/api/*` → `/server`. `req.url` / `originalUrl` may point at `/server`;
 * Express routes are registered as `/api/...`, so recover the real path from headers fallbacks.
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
}

app.use((req, _res, next) => {
  restoreVercelApiUrl(req)
  next()
})

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
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
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
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

app.post('/api/profile/avatar', authMiddleware, avatarUploadMiddleware, async (req, res) => {
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
})

app.get('/api/profile', authMiddleware, async (req, res) => {
  let profile = await prisma.profile.findUnique({ where: { userId: req.userId } })
  if (!profile) {
    profile = await prisma.profile.create({ data: { userId: req.userId } })
  }
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
  let draft = await prisma.applicationDraft.findUnique({ where: { userId: req.userId } })
  if (!draft) {
    draft = await prisma.applicationDraft.create({
      data: { userId: req.userId, payload: '{}', stepIndex: 0 },
    })
  }
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

app.post('/api/documents', authMiddleware, documentUploadMiddleware, async (req, res) => {
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
  res.status(500).json({ error: 'Server error' })
})

export default app

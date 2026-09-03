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
import crypto from 'crypto'
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
import {
  PAYMENT_FULLY_PAID_CENTS,
  PAYMENT_INSTALLMENT_CENTS,
  PAYMENT_ONCE_OFF_CENTS,
  PAYMENT_SPLIT_TOTAL_CENTS,
  paymentAmountCentsForPlan,
  paymentAmountLabelForPlan,
} from './paymentAmounts.js'
const YOCO_SECRET_KEY = String(process.env.YOCO_SECRET_KEY || '').trim()
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim()
const EMAIL_FROM = String(process.env.EMAIL_FROM || 'Apply Once <onboarding@resend.dev>').trim()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()
const app = express()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret'
const SUPABASE_JWT_SECRET = String(process.env.SUPABASE_JWT_SECRET || '').trim()
const ADMIN_SECRET = String(process.env.ADMIN_SECRET || '').trim()
const ADMIN_EMAILS = String(process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

/** Student counts as online if heartbeat within this window. */
const PRESENCE_ONLINE_MS = 2 * 60 * 1000

function isUserOnline(lastSeenAt) {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() <= PRESENCE_ONLINE_MS
}

const chatMessageSelect = { id: true, sender: true, body: true, createdAt: true, readAt: true }

async function touchUserPresence(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: new Date() },
  })
}

/** Mark the other party's unread messages as read when this side opens the chat. */
async function markChatMessagesRead(userId, readerRole) {
  const other = readerRole === 'student' ? 'admin' : 'student'
  await prisma.chatMessage.updateMany({
    where: { userId, sender: other, readAt: null },
    data: { readAt: new Date() },
  })
}

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

function verifySupabaseAccessToken(token) {
  if (!SUPABASE_JWT_SECRET) return null
  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET)
    if (!payload || typeof payload !== 'object' || !payload.sub) return null
    return payload
  } catch {
    return null
  }
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

  const sbPayload = verifySupabaseAccessToken(token)
  if (sbPayload) {
    try {
      const authId = String(sbPayload.sub)
      req.supabaseEmail = String(sbPayload.email || '').trim().toLowerCase()
      const user = await ensureAppUserFromSupabase(authId, {
        sub: authId,
        email: sbPayload.email ?? null,
        user_metadata: sbPayload.user_metadata ?? {},
      })
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

const paymentProofFileFilter = (_req, file, cb) => {
  const mt = String(file.mimetype || '').toLowerCase()
  const name = String(file.originalname || '')
  const ok =
    /^image\/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(mt) ||
    mt === 'application/pdf' ||
    /\.(jpe?g|png|webp|gif|heic|heif|pdf)$/i.test(name)
  if (!ok) {
    cb(new Error('Upload a screenshot or PDF from your banking app'))
    return
  }
  cb(null, true)
}

const paymentProofUploadDisk = multer({
  storage: documentDiskStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: paymentProofFileFilter,
})

const paymentProofUploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: paymentProofFileFilter,
})

function paymentProofUploadMiddleware(req, res, next) {
  ;(useRemoteFiles() ? paymentProofUploadMemory : paymentProofUploadDisk).single('file')(req, res, next)
}

function buildEftPaymentReference(profile, email) {
  const surname = String(profile?.lastName || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
  const phone = String(profile?.phone || '').replace(/\D/g, '')
  const phoneTail = phone.slice(-4) || '0000'
  const emailLocal = String(email || '').split('@')[0] || 'STUDENT'
  const slug =
    surname ||
    emailLocal
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12) ||
    'STUDENT'
  return `AO-${slug}-${phoneTail}`
}

async function notifyAdminsEftProof(user, plan, amountLabel, reference) {
  if (!RESEND_API_KEY || !ADMIN_EMAILS.length) return
  const adminUrl = String(process.env.PUBLIC_SITE_URL || 'https://applyonce.org').replace(/\/$/, '')
  const subject = `EFT proof submitted — ${user.email} (${amountLabel})`
  const body = `A student submitted proof of EFT payment on Apply Once.

Student: ${user.email}
Amount: ${amountLabel}
Payment reference: ${reference}
Plan: ${plan}

Open Admin, find this student, review the payment proof, and mark as paid.
Admin: ${adminUrl}/admin
`
  for (const to of ADMIN_EMAILS) {
    try {
      await sendResendEmail(to, subject, body)
    } catch (e) {
      console.error('EFT admin notify failed:', to, e)
    }
  }
}

const avatarImageFilter = (_req, file, cb) => {
  const mt = String(file.mimetype || '').toLowerCase()
  const ok =
    /^image\/(jpeg|jpg|png|webp|gif|heic|heif)$/i.test(mt) ||
    /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(String(file.originalname || ''))
  if (!ok) {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF, or HEIC)'))
    return
  }
  cb(null, true)
}

const AVATAR_MAX_BYTES = 4 * 1024 * 1024

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
  limits: { fileSize: AVATAR_MAX_BYTES },
  fileFilter: avatarImageFilter,
})

const avatarUploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_BYTES },
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

app.get('/api/profile/bootstrap', authMiddleware, async (req, res) => {
  const userId = req.userId
  const [
    inboxItems,
    draft,
    questionnaireRow,
    paidRows,
    pendingEft,
    profileRow,
    workProgrammeRow,
  ] = await Promise.all([
    prisma.profileInboxItem.findMany({
      where: { userId },
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
    }),
    prisma.applicationDraft.upsert({
      where: { userId },
      update: {},
      create: { userId, payload: '{}', stepIndex: 0 },
    }),
    prisma.careerQuestionnaire.findUnique({ where: { userId } }),
    prisma.payment.findMany({
      where: { userId, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      select: { amountPaidCents: true },
    }),
    prisma.payment.findFirst({
      where: { userId, status: 'pending', provider: 'eft' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        plan: true,
        amountDueCents: true,
        providerChargeId: true,
        createdAt: true,
      },
    }),
    prisma.profile.findUnique({
      where: { userId },
      select: { lastName: true, phone: true },
    }),
    prisma.workProgrammeProfile.findUnique({ where: { userId } }),
  ])

  let applicationPayload = {}
  try {
    applicationPayload = JSON.parse(draft.payload || '{}')
  } catch {
    applicationPayload = {}
  }

  let questionnaireAnswers = {}
  if (questionnaireRow) {
    try {
      questionnaireAnswers = JSON.parse(questionnaireRow.answers || '{}')
    } catch {
      questionnaireAnswers = {}
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  const totalPaidCents = sumPaidCents(paidRows)

  // Presence + mark admin DMs as read when the student opens their profile.
  await Promise.all([touchUserPresence(userId), markChatMessagesRead(userId, 'student')])
  const chatFresh = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: chatMessageSelect,
  })

  res.json({
    inbox: inboxItems,
    application: {
      stepIndex: draft.stepIndex,
      payload: applicationPayload,
      updatedAt: draft.updatedAt,
    },
    chat: chatFresh,
    questionnaire: questionnaireRow
      ? {
          answers: questionnaireAnswers,
          skipped: questionnaireRow.skipped,
          completedAt: questionnaireRow.completedAt,
          bursaryCount: questionnaireRow.bursaryCount,
          scholarshipCount: questionnaireRow.scholarshipCount,
          matchedAt: questionnaireRow.matchedAt,
          updatedAt: questionnaireRow.updatedAt,
        }
      : {
          answers: {},
          skipped: false,
          completedAt: null,
          bursaryCount: null,
          scholarshipCount: null,
          matchedAt: null,
        },
    payments: {
      totalPaidCents,
      paidR95: totalPaidCents >= PAYMENT_FULLY_PAID_CENTS,
      needsPayment: totalPaidCents < PAYMENT_FULLY_PAID_CENTS,
      pendingEft: pendingEft
        ? {
            id: pendingEft.id,
            plan: pendingEft.plan,
            amountDueCents: pendingEft.amountDueCents,
            documentId: pendingEft.providerChargeId,
            submittedAt: pendingEft.createdAt,
          }
        : null,
    },
    eftReference: buildEftPaymentReference(profileRow, user?.email || ''),
    workProgrammeProfile: workProgrammeRow ? workProgrammeRowToJson(workProgrammeRow) : null,
  })
})

function sumPaidCents(rows) {
  return rows.reduce((acc, r) => acc + (Number(r.amountPaidCents) || 0), 0)
}

app.get('/api/payments/status', authMiddleware, async (req, res) => {
  const rows = await prisma.payment.findMany({
    where: { userId: req.userId, status: 'paid' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      plan: true,
      amountDueCents: true,
      amountPaidCents: true,
      status: true,
      provider: true,
      createdAt: true,
    },
  })
  const totalPaidCents = sumPaidCents(rows.filter((r) => r.status === 'paid'))
  const pendingEft = await prisma.payment.findFirst({
    where: { userId: req.userId, status: 'pending', provider: 'eft' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      plan: true,
      amountDueCents: true,
      providerChargeId: true,
      createdAt: true,
    },
  })
  res.json({
    rows,
    totalPaidCents,
    paidR95: totalPaidCents >= PAYMENT_FULLY_PAID_CENTS,
    paidSplitTotal: totalPaidCents >= PAYMENT_SPLIT_TOTAL_CENTS,
    paidSplitFirst: totalPaidCents >= PAYMENT_INSTALLMENT_CENTS,
    needsPayment: totalPaidCents < PAYMENT_FULLY_PAID_CENTS,
    pendingEft: pendingEft
      ? {
          id: pendingEft.id,
          plan: pendingEft.plan,
          amountDueCents: pendingEft.amountDueCents,
          documentId: pendingEft.providerChargeId,
          submittedAt: pendingEft.createdAt,
        }
      : null,
  })
})

app.get('/api/payments/eft/reference', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { email: true, profile: { select: { lastName: true, phone: true } } },
  })
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({
    reference: buildEftPaymentReference(user.profile, user.email),
  })
})

app.post('/api/payments/eft/proof', authMiddleware, paymentProofUploadMiddleware, async (req, res, next) => {
  try {
    if (vercelNeedsRemoteFiles()) {
      return res.status(503).json({
        error:
          'Payment proof uploads need Supabase Storage. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.',
      })
    }
    const plan = String(req.body?.plan || '').trim()
    if (!['once_off_95', 'split_50_first', 'split_50_second'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid payment plan' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Upload a screenshot or PDF of your payment' })
    }
    const bankReference = String(req.body?.bankReference || '').trim().slice(0, 120)

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        profile: { select: { firstName: true, lastName: true, phone: true } },
      },
    })
    if (!user) return res.status(404).json({ error: 'Not found' })

    const paidRows = await prisma.payment.findMany({
      where: { userId: req.userId, status: 'paid' },
      select: { amountPaidCents: true },
    })
    const totalPaidCents = sumPaidCents(paidRows)
    if (totalPaidCents >= PAYMENT_FULLY_PAID_CENTS) {
      return res.status(400).json({ error: 'Your application fee is already paid' })
    }
    if (plan === 'split_50_second' && totalPaidCents < PAYMENT_INSTALLMENT_CENTS) {
      return res.status(400).json({ error: 'Pay the first R40 installment before the second' })
    }
    if (plan !== 'split_50_second' && totalPaidCents >= PAYMENT_INSTALLMENT_CENTS) {
      return res.status(400).json({ error: 'Use the remaining R40 installment option' })
    }

    const existingPending = await prisma.payment.findFirst({
      where: { userId: req.userId, status: 'pending', provider: 'eft', plan },
      select: { id: true },
    })
    if (existingPending) {
      return res.status(409).json({
        error: 'We already have your proof for this payment — we will confirm it within one business day.',
      })
    }

    let storagePath
    if (useRemoteFiles()) {
      const safe = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
      storagePath = `documents/${req.userId}/${Date.now()}-payment-proof-${safe}`
      await remotePut(storagePath, req.file.buffer, req.file.mimetype)
    } else {
      const relPath = path.relative(path.join(__dirname, '..'), req.file.path)
      storagePath = relPath.replace(/\\/g, '/')
    }

    const doc = await prisma.document.create({
      data: {
        userId: req.userId,
        category: 'payment_proof',
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        storagePath,
      },
      select: { id: true, filename: true, createdAt: true },
    })

    const amountInCents = paymentAmountCentsForPlan(plan)
    const amountLabel = paymentAmountLabelForPlan(plan)
    const eftReference = buildEftPaymentReference(user.profile, user.email)

    const payment = await prisma.payment.create({
      data: {
        userId: req.userId,
        plan,
        amountDueCents: amountInCents,
        amountPaidCents: 0,
        status: 'pending',
        provider: 'eft',
        providerChargeId: doc.id,
        failureReason: bankReference || null,
      },
      select: { id: true, plan: true, createdAt: true },
    })

    const studentName =
      [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ').trim() || user.email
    const chatBody = [
      `EFT payment proof submitted (${amountLabel}).`,
      bankReference ? `Bank reference: ${bankReference}` : null,
      `Our reference: ${eftReference}`,
      'Awaiting confirmation — usually within one business day.',
    ]
      .filter(Boolean)
      .join(' ')

    await prisma.chatMessage.create({
      data: { userId: req.userId, sender: 'student', body: chatBody },
    })

    void notifyAdminsEftProof(user, plan, amountLabel, eftReference)

    res.status(201).json({
      ok: true,
      payment,
      document: doc,
      message: 'Proof received — we will confirm your payment within one business day.',
    })
  } catch (err) {
    if (useRemoteFiles()) {
      console.error('eft proof upload:', err)
      return res.status(502).json({ error: 'Could not save payment proof. Please try again.' })
    }
    next(err)
  }
})

app.post('/api/payments/yoco/charge', authMiddleware, async (req, res) => {
  if (!YOCO_SECRET_KEY) {
    return res.status(503).json({ error: 'Payments not configured on server. Set YOCO_SECRET_KEY on Vercel.' })
  }
  const token = String(req.body?.token || '').trim()
  const plan = String(req.body?.plan || '').trim()
  if (!token) return res.status(400).json({ error: 'Missing payment token' })
  if (!['once_off_95', 'split_50_first', 'split_50_second'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid payment plan' })
  }
  const amountInCents = paymentAmountCentsForPlan(plan)

  const payment = await prisma.payment.create({
    data: {
      userId: req.userId,
      plan,
      amountDueCents: amountInCents,
      status: 'pending',
      provider: 'yoco',
      providerTokenId: token,
    },
    select: { id: true },
  })

  try {
    const yRes = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        amountInCents,
        currency: 'ZAR',
        metadata: { paymentId: payment.id, userId: req.userId, plan },
      }),
    })

    const text = await yRes.text()
    let data = {}
    try {
      data = JSON.parse(text || '{}')
    } catch {
      data = { raw: text }
    }

    if (!yRes.ok) {
      const reason =
        typeof data === 'object' && data !== null && 'message' in data ? String(data.message) : 'Charge failed'
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed', failureReason: reason },
      })
      return res.status(400).json({ error: reason })
    }

    const chargeId = typeof data === 'object' && data !== null && 'id' in data ? String(data.id) : null
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid', amountPaidCents: amountInCents, providerChargeId: chargeId },
    })
    return res.json({ ok: true, paymentId: payment.id, chargeId, amountInCents })
  } catch (e) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'failed', failureReason: e instanceof Error ? e.message : 'Charge failed' },
    })
    return res.status(502).json({ error: 'Payment gateway error. Please try again.' })
  }
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

const WORK_PROGRAMME_STAGES = new Set([
  'in_matric',
  'finished_matric',
  'in_university',
  'finished_university',
])

function workProgrammeRowToJson(row) {
  return {
    stage: row.stage,
    province: row.province,
    locationDetail: row.locationDetail || '',
    interests: row.interests || '',
    fieldOfStudy: row.fieldOfStudy || '',
    stillInHighSchool: Boolean(row.stillInHighSchool),
    jobInterests: row.jobInterests || '',
    displayName: row.displayName || '',
    completedAt: row.completedAt ? row.completedAt.toISOString() : new Date().toISOString(),
  }
}

function parseWorkProgrammeProfileBody(body) {
  const stage = typeof body?.stage === 'string' ? body.stage.trim() : ''
  if (!WORK_PROGRAMME_STAGES.has(stage)) {
    return { error: 'Invalid study stage.' }
  }
  const province = typeof body?.province === 'string' ? body.province.trim() : ''
  if (!province) return { error: 'Province is required.' }
  const displayName = typeof body?.displayName === 'string' ? body.displayName.trim() : ''
  if (!displayName) return { error: 'Display name is required.' }
  const interests = typeof body?.interests === 'string' ? body.interests.trim() : ''
  const jobInterests = typeof body?.jobInterests === 'string' ? body.jobInterests.trim() : ''
  if (interests.length < 2) return { error: 'Please share your interests.' }
  if (jobInterests.length < 2) return { error: 'Please share your job interests.' }
  return {
    data: {
      stage,
      province,
      locationDetail: typeof body?.locationDetail === 'string' ? body.locationDetail.trim() : '',
      interests,
      fieldOfStudy: typeof body?.fieldOfStudy === 'string' ? body.fieldOfStudy.trim() : '',
      stillInHighSchool: Boolean(body?.stillInHighSchool),
      jobInterests,
      displayName,
      completedAt: new Date(),
    },
  }
}

app.get('/api/work-programmes/profile', authMiddleware, async (req, res) => {
  const row = await prisma.workProgrammeProfile.findUnique({ where: { userId: req.userId } })
  res.json({ profile: row ? workProgrammeRowToJson(row) : null })
})

app.put('/api/work-programmes/profile', authMiddleware, async (req, res) => {
  const parsed = parseWorkProgrammeProfileBody(req.body)
  if (parsed.error) return res.status(400).json({ error: parsed.error })
  const row = await prisma.workProgrammeProfile.upsert({
    where: { userId: req.userId },
    create: { userId: req.userId, ...parsed.data },
    update: parsed.data,
  })
  res.json({ profile: workProgrammeRowToJson(row) })
})

app.delete('/api/work-programmes/profile', authMiddleware, async (req, res) => {
  await prisma.workProgrammeProfile.deleteMany({ where: { userId: req.userId } })
  res.json({ ok: true })
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

function safeText(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  return String(v)
}

const PDF_BRAND = '#2132e6'
const PDF_TEXT = '#0f172a'
const PDF_MUTED = '#64748b'
const PDF_MARGIN = 48

function pdfEnsureSpace(doc, needed = 56) {
  const bottom = doc.page.height - PDF_MARGIN
  if (doc.y + needed > bottom) doc.addPage()
}

function pdfSectionHeading(doc, title) {
  pdfEnsureSpace(doc, 52)
  const y = doc.y
  doc.save()
  doc.rect(PDF_MARGIN, y, 5, 16).fill(PDF_BRAND)
  doc.restore()
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(PDF_BRAND)
    .text(title.toUpperCase(), PDF_MARGIN + 12, y + 1, { width: doc.page.width - PDF_MARGIN * 2 - 12 })
  doc.y = y + 22
  doc
    .moveTo(PDF_MARGIN, doc.y)
    .lineTo(doc.page.width - PDF_MARGIN, doc.y)
    .strokeColor('#e2e8f0')
    .lineWidth(0.75)
    .stroke()
  doc.moveDown(0.45)
}

function pdfFieldRow(doc, label, value) {
  const v = safeText(value)
  if (!v) return
  pdfEnsureSpace(doc, 32)
  doc.font('Helvetica-Bold').fontSize(9).fillColor(PDF_MUTED).text(`${label}`, { continued: true })
  doc.font('Helvetica').fontSize(10).fillColor(PDF_TEXT).text(`  ${v}`, { lineGap: 2 })
  doc.moveDown(0.2)
}

function pdfParagraphBlock(doc, label, text) {
  const v = safeText(text)
  if (!v) return
  pdfEnsureSpace(doc, 48)
  doc.font('Helvetica-Bold').fontSize(9).fillColor(PDF_MUTED).text(label)
  doc.moveDown(0.15)
  doc.font('Helvetica').fontSize(10).fillColor(PDF_TEXT).text(v, { lineGap: 4, align: 'left' })
  doc.moveDown(0.4)
}

async function sendResendEmail(to, subject, body) {
  const htmlBody = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
  const mailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      text: body,
      html: `<div style="font-family:system-ui,sans-serif;line-height:1.55;color:#0f172a">${htmlBody}</div>`,
    }),
  })
  const mailText = await mailRes.text()
  let mailData = {}
  try {
    mailData = JSON.parse(mailText || '{}')
  } catch {
    mailData = { raw: mailText }
  }
  if (!mailRes.ok) {
    const reason =
      typeof mailData === 'object' && mailData !== null && 'message' in mailData
        ? String(mailData.message)
        : 'Could not send email'
    throw new Error(reason)
  }
  return mailData
}

async function generateApplicationPdfBuffer(snapshot) {
  const doc = new PDFDocument({ size: 'A4', margin: PDF_MARGIN })
  const chunks = []
  doc.on('data', (c) => chunks.push(c))

  const p = snapshot.profile || {}
  const fullName =
    [safeText(p.firstName), safeText(p.lastName)].filter(Boolean).join(' ') ||
    snapshot.email ||
    'Student application'
  const contactParts = [
    snapshot.email ? snapshot.email : '',
    safeText(p.phone) ? safeText(p.phone) : '',
    safeText(p.residentialAddress) ? safeText(p.residentialAddress) : '',
  ].filter(Boolean)

  const headerY = PDF_MARGIN
  doc.save()
  doc.rect(PDF_MARGIN, headerY, doc.page.width - PDF_MARGIN * 2, 68).fill(PDF_BRAND)
  doc.restore()
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text('APPLY ONCE', PDF_MARGIN + 14, headerY + 14, {
    characterSpacing: 1.2,
  })
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#ffffff').text(fullName, PDF_MARGIN + 14, headerY + 30, {
    width: doc.page.width - PDF_MARGIN * 2 - 28,
  })
  if (contactParts.length) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#dbeafe')
      .text(contactParts.join('  ·  '), PDF_MARGIN + 14, headerY + 54, {
        width: doc.page.width - PDF_MARGIN * 2 - 28,
      })
  }
  doc.y = headerY + 82

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(PDF_MUTED)
    .text(`Generated ${new Date().toLocaleString()}  ·  Application step ${(snapshot.stepIndex ?? 0) + 1} of 8 saved`)
  doc.moveDown(0.6)

  pdfSectionHeading(doc, 'Personal profile')
  pdfFieldRow(doc, 'Full name', fullName)
  pdfFieldRow(doc, 'Phone', p.phone)
  pdfFieldRow(doc, 'Date of birth', p.dateOfBirth)
  pdfFieldRow(doc, 'ID number', p.idNumber)
  pdfFieldRow(doc, 'Citizenship', p.citizenship)
  pdfFieldRow(doc, 'Gender', p.gender)
  pdfFieldRow(doc, 'Home language', p.homeLanguage)
  pdfFieldRow(doc, 'Residential address', p.residentialAddress)
  pdfFieldRow(doc, 'Postal address', p.postalAddress)
  pdfFieldRow(doc, 'Disability', p.disability ? 'Yes' : 'No')
  if (p.disability) pdfParagraphBlock(doc, 'Disability notes', p.disabilityNotes)

  const a = snapshot.payload?.academics || {}
  pdfSectionHeading(doc, 'Academics')
  pdfFieldRow(doc, 'School', a.schoolName)
  pdfFieldRow(doc, 'Grade / year', a.grade)
  pdfFieldRow(doc, 'Curriculum', a.curriculum)
  pdfFieldRow(doc, 'Institution', a.institutionName)
  pdfFieldRow(doc, 'Qualification', a.qualificationName)
  pdfFieldRow(doc, 'Year of study', a.yearOfStudy)
  pdfParagraphBlock(doc, 'Intended fields of study', a.intendedFieldsNotes)
  pdfParagraphBlock(doc, 'Subjects and marks', a.subjectsNotes)
  pdfParagraphBlock(doc, 'NBT / APS', a.nbtApsNotes)
  pdfParagraphBlock(doc, 'Achievements', a.achievementsNotes)

  const sp = snapshot.payload?.studyPlan || {}
  pdfSectionHeading(doc, 'Study plan')
  pdfParagraphBlock(doc, 'Motivation', sp.motivation)
  pdfParagraphBlock(doc, 'Career goals', sp.careerGoals)
  pdfFieldRow(doc, 'Location preferences', sp.locationPreferences)
  pdfParagraphBlock(doc, 'Bursary preferences', sp.bursaryPreferences)

  const h = snapshot.payload?.household || {}
  pdfSectionHeading(doc, 'Household')
  pdfFieldRow(doc, 'Guardian name', h.guardianName)
  pdfFieldRow(doc, 'Relationship', h.relationship)
  pdfFieldRow(doc, 'Guardian phone', h.guardianPhone)
  pdfFieldRow(doc, 'Guardian email', h.guardianEmail)
  pdfParagraphBlock(doc, 'Household members', h.householdMembersNotes)
  pdfParagraphBlock(doc, 'Employment', h.employmentNotes)

  const f = snapshot.payload?.financial || {}
  pdfSectionHeading(doc, 'Financial need')
  pdfFieldRow(doc, 'Household income band', f.incomeBand)
  pdfParagraphBlock(doc, 'Income sources', f.incomeSourcesNotes)
  pdfParagraphBlock(doc, 'Monthly expenses', f.expenseNotes)
  pdfParagraphBlock(doc, 'Other funding', f.otherFundingNotes)
  pdfFieldRow(doc, 'NSFAS status', f.nsfasStatus)

  const fit = snapshot.payload?.fit || {}
  pdfSectionHeading(doc, 'Leadership and impact')
  pdfParagraphBlock(doc, 'Leadership roles', fit.leadershipNotes)
  pdfParagraphBlock(doc, 'Community involvement', fit.communityNotes)
  pdfParagraphBlock(doc, 'Work experience', fit.workExperienceNotes)

  const c = snapshot.payload?.compliance || {}
  pdfSectionHeading(doc, 'Consent and declaration')
  pdfFieldRow(doc, 'POPIA consent', c.consentPopia ? 'Yes — agreed' : 'Not yet')
  pdfFieldRow(doc, 'Truthful declaration', c.declarationTruthful ? 'Yes — agreed' : 'Not yet')

  const docs = snapshot.documents || []
  if (docs.length) {
    pdfSectionHeading(doc, 'Supporting documents')
    for (const d of docs) {
      pdfFieldRow(
        doc,
        d.category.replace(/_/g, ' '),
        `${d.filename} (${Math.round((d.size || 0) / 1024)} KB, uploaded ${new Date(d.createdAt).toLocaleDateString()})`,
      )
    }
  }

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
  await Promise.all([touchUserPresence(req.userId), markChatMessagesRead(req.userId, 'student')])
  const rows = await prisma.chatMessage.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
    select: chatMessageSelect,
  })
  res.json(rows)
})

app.post('/api/chat', authMiddleware, async (req, res) => {
  const body = String(req.body?.body ?? '').trim()
  if (!body) return res.status(400).json({ error: 'Message text required' })
  await touchUserPresence(req.userId)
  const row = await prisma.chatMessage.create({
    data: { userId: req.userId, sender: 'student', body },
    select: chatMessageSelect,
  })
  res.status(201).json(row)
})

app.post('/api/presence/heartbeat', authMiddleware, async (req, res) => {
  await touchUserPresence(req.userId)
  res.json({ ok: true, at: new Date().toISOString() })
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
      lastSeenAt: true,
      profile: {
        select: { firstName: true, lastName: true, phone: true },
      },
      application: {
        select: { stepIndex: true, updatedAt: true },
      },
      payments: {
        where: { status: 'paid' },
        orderBy: { createdAt: 'desc' },
        select: { amountPaidCents: true, plan: true, provider: true, createdAt: true },
      },
      _count: {
        select: {
          inboxItems: true,
          documents: true,
          payments: { where: { status: 'pending', provider: 'eft' } },
        },
      },
    },
  })
  res.json(
    users.map((u) => ({
      paidCents: u.payments.reduce((acc, p) => acc + (Number(p.amountPaidCents) || 0), 0),
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
      eftPending: u._count.payments > 0,
      lastSeenAt: u.lastSeenAt,
      online: isUserOnline(u.lastSeenAt),
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

app.post('/api/admin/students/:id/payments/record', adminMiddleware, async (req, res) => {
  const id = String(req.params.id || '')
  const plan = String(req.body?.plan || '').trim()
  if (!['once_off_95', 'split_50_first', 'split_50_second'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid payment plan' })
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } })
  if (!user) return res.status(404).json({ error: 'Student not found' })

  const amountInCents = paymentAmountCentsForPlan(plan)
  const note = String(req.body?.note || '').trim()

  const hadPendingEft = await prisma.payment.count({
    where: { userId: user.id, status: 'pending', provider: 'eft', plan },
  })

  await prisma.payment.updateMany({
    where: { userId: user.id, status: 'pending', provider: 'eft', plan },
    data: { status: 'cancelled', failureReason: 'confirmed_by_admin' },
  })

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      plan,
      amountDueCents: amountInCents,
      amountPaidCents: amountInCents,
      status: 'paid',
      provider: hadPendingEft ? 'eft' : 'yoco_link',
      providerChargeId: note || 'admin_confirmed',
    },
    select: { id: true, plan: true, amountPaidCents: true, createdAt: true },
  })

  const rows = await prisma.payment.findMany({
    where: { userId: user.id, status: 'paid' },
    select: { amountPaidCents: true },
  })

  res.json({
    ok: true,
    payment,
    paidCents: sumPaidCents(rows),
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
      payments: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          plan: true,
          amountPaidCents: true,
          amountDueCents: true,
          status: true,
          provider: true,
          providerChargeId: true,
          failureReason: true,
          createdAt: true,
        },
      },
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

  const paidCents = sumPaidCents(user.payments.filter((p) => p.status === 'paid'))
  const pendingEftPayments = user.payments.filter((p) => p.status === 'pending' && p.provider === 'eft')

  res.json({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    hasAvatar: Boolean(user.avatarStoragePath),
    paidCents,
    payments: user.payments,
    pendingEftPayments,
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
  const exists = await prisma.user.findUnique({
    where: { id },
    select: { id: true, lastSeenAt: true },
  })
  if (!exists) return res.status(404).json({ error: 'Student not found' })
  await markChatMessagesRead(id, 'admin')
  const rows = await prisma.chatMessage.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'asc' },
    select: chatMessageSelect,
  })
  res.json({
    messages: rows,
    online: isUserOnline(exists.lastSeenAt),
    lastSeenAt: exists.lastSeenAt,
  })
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
    select: chatMessageSelect,
  })
  res.status(201).json(row)
})

app.get('/api/admin/students/:id/documents/:docId/file', adminMiddleware, async (req, res) => {
  const studentId = String(req.params.id || '')
  const docId = String(req.params.docId || '')
  const doc = await prisma.document.findFirst({
    where: { id: docId, userId: studentId },
    select: { storagePath: true, filename: true, mimeType: true },
  })
  if (!doc) return res.status(404).json({ error: 'Document not found' })

  const safeName = String(doc.filename || 'document').replace(/[^\w.\-() ]+/g, '_')
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`)

  if (doc.storagePath.startsWith('uploads/')) {
    const abs = absFromStorage(doc.storagePath)
    if (!abs.startsWith(uploadsRoot) || !fs.existsSync(abs)) {
      return res.status(404).json({ error: 'File not found' })
    }
    const ext = path.extname(abs).toLowerCase()
    res.setHeader('Content-Type', doc.mimeType || mimeFromExt(ext))
    return res.sendFile(abs)
  }
  try {
    const buf = await remoteDownloadBuffer(doc.storagePath)
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream')
    return res.send(buf)
  } catch {
    return res.status(404).json({ error: 'File not found' })
  }
})

app.post('/api/admin/students/:id/email', adminMiddleware, async (req, res) => {
  if (!RESEND_API_KEY) {
    return res.status(503).json({
      error: 'Email not configured. Set RESEND_API_KEY and EMAIL_FROM on the server. See docs/SETUP-EMAIL.md.',
    })
  }
  const id = String(req.params.id || '')
  const subject = String(req.body?.subject ?? '').trim()
  const body = String(req.body?.body ?? '').trim()
  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and message are required' })
  }
  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } })
  if (!user) return res.status(404).json({ error: 'Student not found' })

  try {
    const mailData = await sendResendEmail(user.email, subject, body)
    return res.status(201).json({ ok: true, id: mailData.id ?? null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Email delivery failed'
    const code = /not configured/i.test(msg) ? 503 : 400
    return res.status(code).json({ error: msg })
  }
})

app.post('/api/admin/students/email-bulk', adminMiddleware, async (req, res) => {
  if (!RESEND_API_KEY) {
    return res.status(503).json({
      error: 'Email not configured. Set RESEND_API_KEY and EMAIL_FROM on the server. See docs/SETUP-EMAIL.md.',
    })
  }
  const userIds = Array.isArray(req.body?.userIds)
    ? [...new Set(req.body.userIds.map((id) => String(id || '').trim()).filter(Boolean))]
    : []
  const subject = String(req.body?.subject ?? '').trim()
  const body = String(req.body?.body ?? '').trim()
  if (!userIds.length) return res.status(400).json({ error: 'Select at least one student' })
  if (!subject || !body) return res.status(400).json({ error: 'Subject and message are required' })

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  })
  if (!users.length) return res.status(404).json({ error: 'No matching students found' })

  let sent = 0
  const failed = []
  for (const user of users) {
    try {
      await sendResendEmail(user.email, subject, body)
      sent += 1
    } catch (e) {
      failed.push({
        id: user.id,
        email: user.email,
        error: e instanceof Error ? e.message : 'Send failed',
      })
    }
  }

  return res.status(sent ? 201 : 400).json({
    ok: sent > 0,
    sent,
    failed: failed.length,
    errors: failed,
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

// ——— Weekly School → Industry newsletter ———

const PUBLIC_SITE_URL = String(process.env.PUBLIC_SITE_URL || 'https://applyonce.org').replace(/\/$/, '')

function slugifyNewsletter(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function issuePublicJson(issue, { fullBody = false } = {}) {
  const articleType = issue.articleType === 'industry' ? 'industry' : 'main'
  return {
    id: issue.id,
    slug: issue.slug,
    title: issue.title,
    kicker: issue.kicker || '',
    summary: issue.summary || '',
    body: fullBody ? issue.body || '' : undefined,
    articleType,
    industry: articleType === 'industry' ? String(issue.industry || '') : '',
    issueNumber: issue.issueNumber,
    published: issue.published,
    publishedAt: issue.publishedAt,
    emailSentAt: issue.emailSentAt,
  }
}

async function findActiveSubscriberByToken(token) {
  const t = String(token || '').trim()
  if (!t || t.length < 16) return null
  const row = await prisma.newsletterSubscriber.findUnique({ where: { accessToken: t } })
  if (!row || row.unsubscribedAt) return null
  return row
}

async function sendNewsletterIssueEmail(subscriber, issue) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')
  const readUrl = `${PUBLIC_SITE_URL}/newsletter/${issue.slug}?token=${encodeURIComponent(subscriber.accessToken)}`
  const unsubUrl = `${PUBLIC_SITE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(subscriber.accessToken)}`
  const first = subscriber.firstName || 'there'
  const plain = [
    `Hi ${first},`,
    '',
    `School → Industry Weekly — Issue ${issue.issueNumber}`,
    issue.title,
    '',
    issue.summary || '',
    '',
    `Read this week's edition: ${readUrl}`,
    '',
    `Opportunities hub: ${PUBLIC_SITE_URL}/programmes-for-work`,
    '',
    `Unsubscribe: ${unsubUrl}`,
    '',
    '— Apply Once',
  ].join('\n')
  await sendResendEmail(
    subscriber.email,
    `School → Industry #${issue.issueNumber}: ${issue.title}`,
    plain,
  )
}

app.post('/api/newsletter/subscribe', async (req, res) => {
  const firstName = String(req.body?.firstName || '').trim()
  const lastName = String(req.body?.lastName || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  if (firstName.length < 1) return res.status(400).json({ error: 'First name is required.' })
  if (lastName.length < 1) return res.status(400).json({ error: 'Surname is required.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
  if (existing) {
    if (existing.unsubscribedAt) {
      const restored = await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          firstName,
          lastName,
          unsubscribedAt: null,
          accessToken: crypto.randomBytes(24).toString('hex'),
        },
      })
      return res.json({
        ok: true,
        accessToken: restored.accessToken,
        subscriber: {
          firstName: restored.firstName,
          lastName: restored.lastName,
          email: restored.email,
        },
        restored: true,
      })
    }
    return res.json({
      ok: true,
      accessToken: existing.accessToken,
      subscriber: {
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
      },
      alreadySubscribed: true,
    })
  }

  const accessToken = crypto.randomBytes(24).toString('hex')
  const row = await prisma.newsletterSubscriber.create({
    data: { firstName, lastName, email, accessToken },
  })
  res.status(201).json({
    ok: true,
    accessToken: row.accessToken,
    subscriber: { firstName: row.firstName, lastName: row.lastName, email: row.email },
  })
})

app.get('/api/newsletter/me', async (req, res) => {
  const sub = await findActiveSubscriberByToken(req.query.token || req.get('x-newsletter-token'))
  if (!sub) return res.json({ subscriber: null })
  res.json({
    subscriber: { firstName: sub.firstName, lastName: sub.lastName, email: sub.email },
  })
})

app.get('/api/newsletter/issues', async (req, res) => {
  const sub = await findActiveSubscriberByToken(req.query.token || req.get('x-newsletter-token'))
  const unlocked = Boolean(sub)
  const issues = await prisma.newsletterIssue.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: 'desc' }, { issueNumber: 'desc' }],
  })
  res.json({
    unlocked,
    brand: {
      name: 'School → Industry Weekly',
      tagline: 'The free SA & Africa brief from school to industry.',
    },
    issues: issues.map((issue) => issuePublicJson(issue, { fullBody: unlocked })),
    subscriber: sub
      ? { firstName: sub.firstName, lastName: sub.lastName, email: sub.email }
      : null,
  })
})

app.get('/api/newsletter/issues/:slug', async (req, res) => {
  const sub = await findActiveSubscriberByToken(req.query.token || req.get('x-newsletter-token'))
  const issue = await prisma.newsletterIssue.findUnique({ where: { slug: String(req.params.slug) } })
  if (!issue || !issue.published) {
    return res.status(404).json({ error: 'Issue not found.' })
  }
  if (!sub) {
    return res.status(403).json({
      error: 'Subscribe with your name and email to read full issues.',
      locked: true,
      teaser: issuePublicJson(issue, { fullBody: false }),
    })
  }
  res.json({
    unlocked: true,
    issue: issuePublicJson(issue, { fullBody: true }),
    subscriber: { firstName: sub.firstName, lastName: sub.lastName, email: sub.email },
  })
})

app.post('/api/newsletter/unsubscribe', async (req, res) => {
  const token = String(req.body?.token || req.query.token || '').trim()
  const sub = await prisma.newsletterSubscriber.findUnique({ where: { accessToken: token } })
  if (!sub) return res.status(404).json({ error: 'Subscription not found.' })
  await prisma.newsletterSubscriber.update({
    where: { id: sub.id },
    data: { unsubscribedAt: new Date() },
  })
  res.json({ ok: true })
})

app.get('/api/admin/newsletter/subscribers', attachSupabaseEmailIfPresent, adminMiddleware, async (_req, res) => {
  const rows = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
  res.json({
    subscribers: rows.map((r) => ({
      id: r.id,
      email: r.email,
      firstName: r.firstName,
      lastName: r.lastName,
      createdAt: r.createdAt,
      unsubscribedAt: r.unsubscribedAt,
      active: !r.unsubscribedAt,
    })),
    activeCount: rows.filter((r) => !r.unsubscribedAt).length,
    total: rows.length,
  })
})

app.get('/api/admin/newsletter/issues', attachSupabaseEmailIfPresent, adminMiddleware, async (_req, res) => {
  const issues = await prisma.newsletterIssue.findMany({
    orderBy: [{ issueNumber: 'desc' }],
  })
  res.json({
    issues: issues.map((issue) => ({
      ...issuePublicJson(issue, { fullBody: true }),
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    })),
  })
})

app.post('/api/admin/newsletter/issues', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const title = String(req.body?.title || '').trim()
  if (title.length < 3) return res.status(400).json({ error: 'Title is required.' })
  const kicker = String(req.body?.kicker || '').trim()
  const summary = String(req.body?.summary || '').trim()
  const body = String(req.body?.body || '').trim()
  const publishNow = Boolean(req.body?.publish)
  const articleType = req.body?.articleType === 'industry' ? 'industry' : 'main'
  const industry =
    articleType === 'industry' ? String(req.body?.industry || '').trim().toLowerCase() : ''
  if (articleType === 'industry' && !industry) {
    return res.status(400).json({ error: 'Pick an industry for industry articles.' })
  }

  const max = await prisma.newsletterIssue.aggregate({ _max: { issueNumber: true } })
  const issueNumber = (max._max.issueNumber || 0) + 1
  let slug = slugifyNewsletter(req.body?.slug || title) || `issue-${issueNumber}`
  const clash = await prisma.newsletterIssue.findUnique({ where: { slug } })
  if (clash) slug = `${slug}-${issueNumber}`

  const issue = await prisma.newsletterIssue.create({
    data: {
      title,
      kicker,
      summary,
      body,
      slug,
      issueNumber,
      articleType,
      industry,
      published: publishNow,
      publishedAt: publishNow ? new Date() : null,
    },
  })
  res.status(201).json({ issue: issuePublicJson(issue, { fullBody: true }) })
})

app.put('/api/admin/newsletter/issues/:id', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  const id = String(req.params.id)
  const existing = await prisma.newsletterIssue.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Issue not found.' })

  const data = {}
  if (typeof req.body?.title === 'string') data.title = req.body.title.trim()
  if (typeof req.body?.kicker === 'string') data.kicker = req.body.kicker.trim()
  if (typeof req.body?.summary === 'string') data.summary = req.body.summary.trim()
  if (typeof req.body?.body === 'string') data.body = req.body.body
  if (typeof req.body?.slug === 'string' && req.body.slug.trim()) {
    data.slug = slugifyNewsletter(req.body.slug)
  }
  if (req.body?.articleType === 'main' || req.body?.articleType === 'industry') {
    data.articleType = req.body.articleType
  }
  if (typeof req.body?.industry === 'string') {
    data.industry = String(req.body.industry || '').trim().toLowerCase()
  }
  if (data.articleType === 'main') data.industry = ''
  if (data.articleType === 'industry' || (data.articleType == null && existing.articleType === 'industry')) {
    const industryVal = data.industry != null ? data.industry : existing.industry
    if (!industryVal) {
      return res.status(400).json({ error: 'Pick an industry for industry articles.' })
    }
  }
  if (typeof req.body?.published === 'boolean') {
    data.published = req.body.published
    if (req.body.published && !existing.publishedAt) data.publishedAt = new Date()
    if (!req.body.published) data.publishedAt = null
  }

  try {
    const issue = await prisma.newsletterIssue.update({ where: { id }, data })
    res.json({ issue: issuePublicJson(issue, { fullBody: true }) })
  } catch (e) {
    if (e && e.code === 'P2002') {
      return res.status(400).json({ error: 'That URL slug is already used by another issue.' })
    }
    throw e
  }
})

app.post('/api/admin/newsletter/issues/:id/send', attachSupabaseEmailIfPresent, adminMiddleware, async (req, res) => {
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server.' })
  }
  const id = String(req.params.id)
  const issue = await prisma.newsletterIssue.findUnique({ where: { id } })
  if (!issue) return res.status(404).json({ error: 'Issue not found.' })
  if (!issue.published) {
    return res.status(400).json({ error: 'Publish the issue before emailing subscribers.' })
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
  })
  let sent = 0
  let failed = 0
  const errors = []
  for (const sub of subscribers) {
    try {
      await sendNewsletterIssueEmail(sub, issue)
      sent += 1
      // Soft rate limit for Resend free tiers
      await new Promise((r) => setTimeout(r, 120))
    } catch (e) {
      failed += 1
      if (errors.length < 5) {
        errors.push(`${sub.email}: ${e instanceof Error ? e.message : 'send failed'}`)
      }
    }
  }
  await prisma.newsletterIssue.update({
    where: { id },
    data: { emailSentAt: new Date() },
  })
  res.json({ sent, failed, total: subscribers.length, errors })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ error: err.message })
  }
  if (err instanceof MulterError) {
    const hint =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Photo is too large (max 4 MB after compression). Try a smaller image.'
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

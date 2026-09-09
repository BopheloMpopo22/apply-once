import { loadBursaryCatalogue, matchOpenOpportunities } from './bursaryMatch.js'
import { PAYMENT_FULLY_PAID_CENTS, PAYMENT_INSTALLMENT_CENTS } from './paymentAmounts.js'

const REQUIRED_DOC_CATEGORIES = [
  { category: 'id_proof', label: 'Certified ID' },
  { category: 'academic', label: 'Academic report / results' },
  { category: 'income', label: 'Proof of household income' },
]

const TASK_STATUSES = new Set(['queued', 'blocked', 'in_progress', 'ready', 'submitted', 'skipped'])
const PRESERVE_STATUS = new Set(['submitted', 'skipped'])

function text(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v.trim()
  return String(v).trim()
}

function parseJsonArray(raw, fallback = []) {
  if (!raw) return fallback
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}

/**
 * Same required fields as the student completion meter, plus core bursary documents.
 */
export function evaluatePackCompleteness(profile, payload, documents) {
  const p = profile || {}
  const a = payload?.academics || {}
  const sp = payload?.studyPlan || {}
  const h = payload?.household || {}
  const f = payload?.financial || {}
  const c = payload?.compliance || {}
  const docs = Array.isArray(documents) ? documents : []
  const categories = new Set(docs.map((d) => d.category))

  const checks = [
    { label: 'First name', ok: Boolean(text(p.firstName)) },
    { label: 'Last name', ok: Boolean(text(p.lastName)) },
    { label: 'Cell phone', ok: Boolean(text(p.phone)) },
    { label: 'Date of birth', ok: Boolean(text(p.dateOfBirth)) },
    { label: 'SA ID number', ok: Boolean(text(p.idNumber)) },
    { label: 'Residential address', ok: Boolean(text(p.residentialAddress)) },
    { label: 'School name', ok: Boolean(text(a.schoolName)) },
    { label: 'Grade / year', ok: Boolean(text(a.grade)) },
    { label: 'Intended field(s)', ok: Boolean(text(a.intendedFieldsNotes)) },
    { label: 'Subjects & marks', ok: Boolean(text(a.subjectsNotes)) },
    { label: 'Motivation', ok: Boolean(text(sp.motivation)) },
    { label: 'Career goals', ok: Boolean(text(sp.careerGoals)) },
    { label: 'Guardian name', ok: Boolean(text(h.guardianName)) },
    { label: 'Guardian relationship', ok: Boolean(text(h.relationship)) },
    { label: 'Guardian phone', ok: Boolean(text(h.guardianPhone)) },
    { label: 'Household income band', ok: Boolean(text(f.incomeBand)) },
    { label: 'POPIA consent', ok: Boolean(c.consentPopia) },
    { label: 'Truthful declaration', ok: Boolean(c.declarationTruthful) },
  ]

  for (const d of REQUIRED_DOC_CATEGORIES) {
    checks.push({ label: d.label, ok: categories.has(d.category) })
  }

  const missing = checks.filter((x) => !x.ok).map((x) => x.label)
  const total = checks.length
  const done = total - missing.length
  return {
    ready: missing.length === 0,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    missing,
    documentCount: docs.length,
  }
}

export function buildCopyLines(profile, payload, userEmail) {
  const p = profile || {}
  const a = payload?.academics || {}
  const sp = payload?.studyPlan || {}
  const h = payload?.household || {}
  const f = payload?.financial || {}
  const fit = payload?.fit || {}
  const lines = [
    ['Email', userEmail],
    ['First name', p.firstName],
    ['Last name', p.lastName],
    ['Phone', p.phone],
    ['Date of birth', p.dateOfBirth],
    ['ID number', p.idNumber],
    ['Citizenship', p.citizenship],
    ['Gender', p.gender],
    ['Home language', p.homeLanguage],
    ['Residential address', p.residentialAddress],
    ['Postal address', p.postalAddress],
    ['School', a.schoolName],
    ['Grade / year', a.grade],
    ['Curriculum', a.curriculum],
    ['Institution', a.institutionName],
    ['Qualification', a.qualificationName],
    ['Year of study', a.yearOfStudy],
    ['Intended fields', a.intendedFieldsNotes],
    ['Subjects & marks', a.subjectsNotes],
    ['NBT / APS', a.nbtApsNotes],
    ['Motivation', sp.motivation],
    ['Career goals', sp.careerGoals],
    ['Location preferences', sp.locationPreferences],
    ['Bursary preferences', sp.bursaryPreferences],
    ['Guardian name', h.guardianName],
    ['Relationship', h.relationship],
    ['Guardian phone', h.guardianPhone],
    ['Guardian email', h.guardianEmail],
    ['Income band', f.incomeBand],
    ['NSFAS status', f.nsfasStatus],
    ['Leadership', fit.leadershipNotes],
    ['Community', fit.communityNotes],
  ]
  return lines
    .filter(([, v]) => text(v))
    .map(([label, v]) => `${label}: ${text(v)}`)
    .join('\n')
}

function serializeTask(row) {
  const bursary = row.bursary
  return {
    id: row.id,
    status: row.status,
    blockReasons: parseJsonArray(row.blockReasons, []),
    notes: row.notes || '',
    lastOpenedAt: row.lastOpenedAt,
    submittedAt: row.submittedAt,
    updatedAt: row.updatedAt,
    bursary: bursary
      ? {
          id: bursary.id,
          slug: bursary.slug,
          name: bursary.name,
          provider: bursary.provider,
          type: bursary.type,
          applicationCloses: bursary.applicationCloses,
          applyUrl: bursary.applyUrl,
          active: bursary.active,
          needsReview: bursary.needsReview,
          linkStatus: bursary.linkStatus,
        }
      : null,
  }
}

function statusForNewTask(packReady) {
  return packReady ? 'queued' : 'blocked'
}

/**
 * Load student + matched open bursaries + apply tasks.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @param {{ buildSnapshot: (id: string) => Promise<object> }} helpers
 */
export async function loadApplyPack(prisma, userId, helpers) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: true,
      application: true,
      careerQuestionnaire: true,
      payments: { where: { status: 'paid' }, select: { amountPaidCents: true } },
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
      bursaryApplyTasks: {
        include: { bursary: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!user) return null

  let payload = {}
  try {
    payload = JSON.parse(user.application?.payload || '{}')
  } catch {
    payload = {}
  }

  const paidCents = user.payments.reduce((acc, p) => acc + (Number(p.amountPaidCents) || 0), 0)
  const completeness = evaluatePackCompleteness(user.profile, payload, user.documents)
  const copyText = buildCopyLines(user.profile, payload, user.email)

  let answers = {}
  const q = user.careerQuestionnaire
  if (q && !q.skipped) {
    try {
      answers = JSON.parse(q.answers || '{}')
    } catch {
      answers = {}
    }
  }

  const catalogue = await loadBursaryCatalogue(prisma)
  const match =
    q && !q.skipped && q.completedAt && Object.keys(answers).length > 0
      ? matchOpenOpportunities(answers, catalogue)
      : { bursaryCount: 0, scholarshipCount: 0, matched: [], asOf: new Date().toISOString() }

  const snapshot = helpers?.buildSnapshot ? await helpers.buildSnapshot(userId) : null

  return {
    student: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phone: user.profile?.phone || '',
    },
    paidCents,
    paidEnoughToStart: paidCents >= PAYMENT_INSTALLMENT_CENTS,
    fullyPaid: paidCents >= PAYMENT_FULLY_PAID_CENTS,
    questionnaireCompleted: Boolean(q && q.completedAt && !q.skipped),
    completeness,
    copyText,
    documents: user.documents,
    snapshot,
    match: {
      bursaryCount: match.bursaryCount,
      scholarshipCount: match.scholarshipCount,
      matchedAt: match.asOf,
      matches: match.matched,
    },
    tasks: user.bursaryApplyTasks.map(serializeTask),
  }
}

/**
 * Create or refresh apply tasks for currently matched open bursaries.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {string} userId
 * @param {{ buildSnapshot: (id: string) => Promise<object> }} helpers
 */
export async function startApplyPack(prisma, userId, helpers) {
  const pack = await loadApplyPack(prisma, userId, helpers)
  if (!pack) return { error: 'Student not found', status: 404 }
  if (!pack.paidEnoughToStart) {
    return { error: 'Student has not paid the application fee yet.', status: 400 }
  }
  if (!pack.questionnaireCompleted) {
    return { error: 'Student has not completed the career questionnaire.', status: 400 }
  }

  const matchedIds = pack.match.matches.map((m) => m.id).filter(Boolean)
  const existingByBursary = new Map(pack.tasks.map((t) => [t.bursary?.id, t]))
  const reasons = pack.completeness.missing
  const nextStatus = statusForNewTask(pack.completeness.ready)

  for (const bursaryId of matchedIds) {
    const existing = existingByBursary.get(bursaryId)
    if (existing && PRESERVE_STATUS.has(existing.status)) continue

    if (!existing) {
      await prisma.bursaryApplyTask.create({
        data: {
          userId,
          bursaryId,
          status: nextStatus,
          blockReasons: JSON.stringify(reasons),
        },
      })
      continue
    }

    const keepInProgress = existing.status === 'in_progress' || existing.status === 'ready'
    await prisma.bursaryApplyTask.update({
      where: { id: existing.id },
      data: {
        status: pack.completeness.ready ? (keepInProgress ? existing.status : 'queued') : 'blocked',
        blockReasons: JSON.stringify(reasons),
      },
    })
  }

  return loadApplyPack(prisma, userId, helpers)
}

export function normalizeTaskStatus(raw) {
  const v = String(raw || '').trim()
  return TASK_STATUSES.has(v) ? v : null
}

export { REQUIRED_DOC_CATEGORIES }

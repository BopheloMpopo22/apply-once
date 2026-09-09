/**
 * @typedef {object} BursaryRow
 * @property {string} slug
 * @property {string} name
 * @property {string} provider
 * @property {string} type
 * @property {string[]} studyFields
 * @property {string[]} workSectors
 * @property {boolean} offersJobAfterGrad
 * @property {Date} applicationCloses
 * @property {boolean} [active]
 * @property {string} [applyUrl]
 * @property {string} [notes]
 */

/**
 * @typedef {object} QuestionnaireAnswers
 * @property {string} [studyChoice1]
 * @property {string} [studyChoice2]
 * @property {string} [studyChoice3]
 * @property {string} [workSector]
 * @property {string} [jobLinkedBursary]
 * @property {string} [careerPriority]
 */

const STUDY_SLUGS = [
  'engineering',
  'health',
  'commerce',
  'law',
  'education',
  'it',
  'science',
  'arts',
  'agriculture',
  'hospitality',
  'all',
]

/** Map free-text study answers to catalogue field slugs. */
const FIELD_KEYWORDS = {
  engineering: ['engineer', 'civil', 'mechanical', 'electrical', 'built', 'mining', 'architect'],
  health: ['medic', 'nurs', 'doctor', 'health', 'pharm', 'dent', 'physio', 'clinical'],
  commerce: ['account', 'finance', 'business', 'econom', 'commerce', 'mba', 'ca '],
  law: ['law', 'legal', 'llb', 'attorney', 'advocate'],
  education: ['teach', 'education', 'bed', 'pedagog'],
  it: ['computer', 'software', 'data', 'cyber', 'information tech', 'programming', 'coding'],
  science: ['physics', 'chemistry', 'biology', 'mathematic', 'science', 'biotech'],
  arts: ['art', 'media', 'humanities', 'design', 'journal', 'film', 'music'],
  agriculture: ['agri', 'farm', 'environment', 'forestry', 'horticult'],
  hospitality: ['hotel', 'tourism', 'culinary', 'chef', 'hospitality'],
}

const LABEL_TO_SLUG = {
  'engineering & built environment': 'engineering',
  'health sciences & medicine': 'health',
  'commerce, accounting & finance': 'commerce',
  law: 'law',
  'education & teaching': 'education',
  'it, computer science & data': 'it',
  'pure & applied sciences': 'science',
  'arts, media & humanities': 'arts',
  'agriculture & environmental': 'agriculture',
  'hospitality, tourism & culinary': 'hospitality',
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

/** @param {string} raw */
export function resolveStudyFieldSlug(raw) {
  if (!raw || !String(raw).trim()) return []
  const v = String(raw).trim().toLowerCase()
  if (STUDY_SLUGS.includes(v)) return [v]
  const fromLabel = LABEL_TO_SLUG[v]
  if (fromLabel) return [fromLabel]
  const slugs = new Set()
  for (const [slug, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (keywords.some((k) => v.includes(k.trim()))) slugs.add(slug)
  }
  return slugs.size > 0 ? [...slugs] : [v]
}

/** @param {QuestionnaireAnswers} answers */
export function resolveStudyFieldsFromAnswers(answers) {
  const raw = [answers.studyChoice1, answers.studyChoice2, answers.studyChoice3].filter(Boolean)
  const slugs = new Set()
  for (const r of raw) {
    for (const s of resolveStudyFieldSlug(r)) slugs.add(s)
  }
  return [...slugs]
}

/** @param {import('@prisma/client').BursaryOpportunity} row */
export function rowToBursary(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    provider: row.provider,
    type: row.type,
    studyFields: parseJsonArray(row.studyFields, []),
    workSectors: parseJsonArray(row.workSectors, ['any']),
    offersJobAfterGrad: row.offersJobAfterGrad,
    applicationCloses: row.applicationCloses,
    active: row.active,
    applyUrl: row.applyUrl ?? undefined,
    notes: row.notes ?? undefined,
    lastCheckedAt: row.lastCheckedAt ?? null,
    lastVerifiedAt: row.lastVerifiedAt ?? null,
    linkStatus: row.linkStatus || 'unknown',
    linkStatusDetail: row.linkStatusDetail ?? null,
    needsReview: Boolean(row.needsReview),
  }
}

/** @param {BursaryRow} b */
export function isOpportunityOpen(b, now = new Date()) {
  if (b.active === false) return false
  return new Date(b.applicationCloses) >= now
}

export function slugifyBursaryName(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export function parseStringList(raw, fallback = []) {
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  if (typeof raw === 'string') return raw.split(/[,]+/).map((x) => x.trim()).filter(Boolean)
  return fallback
}

/** Admin catalogue row, including health fields. */
export function toAdminBursaryItem(row, now = new Date()) {
  const b = rowToBursary(row)
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
    active: Boolean(b.active),
    isOpen: isOpportunityOpen(b, now),
    notes: b.notes ?? null,
    lastCheckedAt: b.lastCheckedAt,
    lastVerifiedAt: b.lastVerifiedAt,
    linkStatus: b.linkStatus,
    linkStatusDetail: b.linkStatusDetail,
    needsReview: Boolean(b.needsReview),
  }
}

/**
 * @param {QuestionnaireAnswers} answers
 * @param {BursaryRow[]} catalogue
 */
export function matchOpenOpportunities(answers, catalogue, now = new Date()) {
  const fieldSlugs = resolveStudyFieldsFromAnswers(answers)
  const workSector = answers.workSector || ''
  const jobPref = answers.jobLinkedBursary || ''

  const wantsJobLinked = jobPref === 'yes_very' || jobPref === 'yes_open'
  const prefersNoBond = jobPref === 'no_obligation'

  const open = catalogue.filter((b) => isOpportunityOpen(b, now))

  const matched = open.filter((b) => {
    const fieldHit =
      b.studyFields.includes('all') ||
      fieldSlugs.some((f) => b.studyFields.includes(f)) ||
      fieldSlugs.length === 0

    if (!fieldHit) return false

    if (
      b.workSectors.length &&
      !b.workSectors.includes('any') &&
      workSector &&
      !b.workSectors.includes(workSector)
    ) {
      return false
    }

    if (prefersNoBond && b.offersJobAfterGrad) return false

    if (wantsJobLinked && !b.offersJobAfterGrad && b.type === 'bursary') {
      // Still include general bursaries
    }

    return true
  })

  return {
    bursaryCount: matched.filter((m) => m.type === 'bursary').length,
    scholarshipCount: matched.filter((m) => m.type === 'scholarship').length,
    totalCount: matched.length,
    matched: matched.map((m) => ({
      ...m,
      isOpen: true,
      applicationCloses: new Date(m.applicationCloses).toISOString(),
    })),
    fieldSlugsUsed: fieldSlugs,
    asOf: now.toISOString(),
  }
}

/**
 * Insert catalogue slugs that are not in the DB yet.
 * Existing rows are left alone so admin-edited dates, URLs, and flags are not overwritten.
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function syncBursaryCatalogue(prisma) {
  const { BURSARY_CATALOGUE } = await import('./data/bursaryCatalogue.js')
  const existing = await prisma.bursaryOpportunity.findMany({ select: { slug: true } })
  const have = new Set(existing.map((r) => r.slug))
  let created = 0
  for (const b of BURSARY_CATALOGUE) {
    if (have.has(b.slug)) continue
    await prisma.bursaryOpportunity.create({
      data: {
        slug: b.slug,
        name: b.name,
        provider: b.provider,
        type: b.type,
        studyFields: JSON.stringify(b.studyFields),
        workSectors: JSON.stringify(b.workSectors ?? ['any']),
        offersJobAfterGrad: b.offersJobAfterGrad,
        applicationCloses: b.applicationCloses,
        active: true,
        notes: b.notes ?? null,
        applyUrl: b.applyUrl ?? null,
        needsReview: true,
        linkStatus: b.applyUrl ? 'unknown' : 'no_url',
      },
    })
    created += 1
  }
  return { created, skipped: BURSARY_CATALOGUE.length - created, totalInFile: BURSARY_CATALOGUE.length }
}

/** @param {import('@prisma/client').PrismaClient} prisma */
export async function ensureBursaryCatalogueSeeded(prisma) {
  const count = await prisma.bursaryOpportunity.count()
  if (count > 0) return count
  await syncBursaryCatalogue(prisma)
  return prisma.bursaryOpportunity.count()
}

/** @param {import('@prisma/client').PrismaClient} prisma */
export async function loadBursaryCatalogue(prisma) {
  await ensureBursaryCatalogueSeeded(prisma)
  const rows = await prisma.bursaryOpportunity.findMany({ orderBy: { name: 'asc' } })
  return rows.map(rowToBursary)
}

/**
 * Recalculate open-match counts from the live DB catalogue (not the code file).
 * Writes the cache only when totals changed.
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {import('@prisma/client').CareerQuestionnaire | null} questionnaire
 */
export async function refreshCachedMatchCounts(prisma, questionnaire) {
  if (!questionnaire || questionnaire.skipped || !questionnaire.completedAt) return questionnaire
  let answers = {}
  try {
    answers = JSON.parse(questionnaire.answers || '{}')
  } catch {
    answers = {}
  }
  if (!answers || Object.keys(answers).length === 0) return questionnaire
  const catalogue = await loadBursaryCatalogue(prisma)
  const match = matchOpenOpportunities(answers, catalogue)
  if (
    questionnaire.bursaryCount === match.bursaryCount &&
    questionnaire.scholarshipCount === match.scholarshipCount
  ) {
    return questionnaire
  }
  return prisma.careerQuestionnaire.update({
    where: { id: questionnaire.id },
    data: {
      bursaryCount: match.bursaryCount,
      scholarshipCount: match.scholarshipCount,
      matchedAt: new Date(),
    },
  })
}

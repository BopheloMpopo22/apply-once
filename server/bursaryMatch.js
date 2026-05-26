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

function parseJsonArray(raw, fallback = []) {
  if (!raw) return fallback
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : fallback
  } catch {
    return fallback
  }
}

/** @param {import('@prisma/client').BursaryOpportunity} row */
export function rowToBursary(row) {
  return {
    slug: row.slug,
    name: row.name,
    provider: row.provider,
    type: row.type,
    studyFields: parseJsonArray(row.studyFields, []),
    workSectors: parseJsonArray(row.workSectors, ['any']),
    offersJobAfterGrad: row.offersJobAfterGrad,
    applicationCloses: row.applicationCloses,
    active: row.active,
  }
}

/** @param {BursaryRow} b */
function isOpen(b, now = new Date()) {
  if (b.active === false) return false
  return new Date(b.applicationCloses) >= now
}

/**
 * @param {QuestionnaireAnswers} answers
 * @param {BursaryRow[]} catalogue
 */
export function matchOpenOpportunities(answers, catalogue, now = new Date()) {
  const fields = [answers.studyChoice1, answers.studyChoice2, answers.studyChoice3].filter(Boolean)
  const workSector = answers.workSector || ''
  const jobPref = answers.jobLinkedBursary || ''

  const wantsJobLinked = jobPref === 'yes_very' || jobPref === 'yes_open'
  const prefersNoBond = jobPref === 'no_obligation'

  const open = catalogue.filter((b) => isOpen(b, now))

  const matched = open.filter((b) => {
    const fieldHit =
      b.studyFields.includes('all') ||
      fields.some((f) => b.studyFields.includes(f)) ||
      fields.length === 0

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
      // Still include general bursaries; only exclude if user ONLY wants bonded — handled above
    }

    return true
  })

  return {
    bursaryCount: matched.filter((m) => m.type === 'bursary').length,
    scholarshipCount: matched.filter((m) => m.type === 'scholarship').length,
    totalCount: matched.length,
    asOf: now.toISOString(),
  }
}

/** @param {import('@prisma/client').PrismaClient} prisma */
export async function ensureBursaryCatalogueSeeded(prisma) {
  const count = await prisma.bursaryOpportunity.count()
  if (count > 0) return count

  const { BURSARY_CATALOGUE } = await import('./data/bursaryCatalogue.js')
  await prisma.bursaryOpportunity.createMany({
    data: BURSARY_CATALOGUE.map((b) => ({
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
    })),
    skipDuplicates: true,
  })
  return prisma.bursaryOpportunity.count()
}

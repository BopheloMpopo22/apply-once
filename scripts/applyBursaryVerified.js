import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { BURSARY_VERIFIED, VERIFIED_ON } from '../server/data/bursaryVerified.js'
import { parseCoverage, parseStudyLevels } from '../server/bursaryCalendar.js'

const prisma = new PrismaClient()

function endOfDay(isoDate) {
  if (!isoDate) return undefined
  const d = new Date(`${isoDate}T23:59:59.000Z`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function startOfDay(isoDate) {
  if (!isoDate) return undefined
  const d = new Date(`${isoDate}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function jsonList(value, fallback) {
  if (Array.isArray(value) && value.length) return JSON.stringify(value)
  return fallback
}

async function main() {
  const verifiedAt = new Date(`${VERIFIED_ON}T12:00:00.000Z`)
  let updated = 0
  let created = 0
  let skipped = 0
  const missing = []

  for (const row of BURSARY_VERIFIED) {
    const existing = await prisma.bursaryOpportunity.findUnique({ where: { slug: row.slug } })
    const data = {
      applyUrl: row.applyUrl,
      notes: row.notes || null,
      lastVerifiedAt: verifiedAt,
      needsReview: !row.datesConfirmed,
    }
    if (row.name) data.name = row.name
    if (row.provider) data.provider = row.provider
    if (row.type) data.type = row.type
    if (row.studyFields) data.studyFields = JSON.stringify(row.studyFields)
    if (row.workSectors) data.workSectors = JSON.stringify(row.workSectors)
    if (typeof row.offersJobAfterGrad === 'boolean') data.offersJobAfterGrad = row.offersJobAfterGrad
    if (row.studyLevels) data.studyLevels = JSON.stringify(parseStudyLevels(row.studyLevels))
    if (row.coverage) data.coverage = parseCoverage(row.coverage)
    if (row.region) data.region = row.region
    if (row.eligibility) data.eligibility = row.eligibility
    if (row.requiredDocs) data.requiredDocs = row.requiredDocs
    if (row.datesConfirmed) {
      if (row.applicationCloses) data.applicationCloses = endOfDay(row.applicationCloses)
      data.applicationOpens = row.applicationOpens ? startOfDay(row.applicationOpens) : null
      data.nextExpectedOpens = row.nextExpectedOpens ? startOfDay(row.nextExpectedOpens) : null
    }

    if (!existing) {
      if (!row.createIfMissing) {
        skipped += 1
        missing.push(row.slug)
        continue
      }
      if (!data.applicationCloses && row.applicationCloses) {
        data.applicationCloses = endOfDay(row.applicationCloses)
      }
      await prisma.bursaryOpportunity.create({
        data: {
          slug: row.slug,
          name: row.name || row.slug,
          provider: row.provider || row.slug,
          type: row.type || 'bursary',
          studyFields: jsonList(row.studyFields, '["all"]'),
          workSectors: jsonList(row.workSectors, '["any"]'),
          offersJobAfterGrad: Boolean(row.offersJobAfterGrad),
          applicationCloses: data.applicationCloses || endOfDay(row.applicationCloses) || new Date(),
          applicationOpens: data.applicationOpens ?? null,
          nextExpectedOpens: data.nextExpectedOpens ?? null,
          studyLevels: data.studyLevels || JSON.stringify(parseStudyLevels(row.studyLevels)),
          coverage: data.coverage || 'unknown',
          region: data.region || 'nationwide',
          eligibility: data.eligibility || null,
          requiredDocs: data.requiredDocs || null,
          applyUrl: row.applyUrl,
          notes: row.notes || null,
          active: true,
          lastVerifiedAt: verifiedAt,
          needsReview: !row.datesConfirmed,
          linkStatus: row.applyUrl ? 'unknown' : 'no_url',
        },
      })
      created += 1
      continue
    }

    await prisma.bursaryOpportunity.update({ where: { slug: row.slug }, data })
    updated += 1
  }

  console.log(
    `Verified ${VERIFIED_ON}: updated ${updated}, created ${created}, skipped ${skipped} (not in DB).`,
  )
  if (missing.length) {
    console.log(`Missing slugs (import from code first, then re-run): ${missing.join(', ')}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

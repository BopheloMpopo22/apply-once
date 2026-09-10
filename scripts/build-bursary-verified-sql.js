import { writeFileSync } from 'fs'
import { BURSARY_VERIFIED, VERIFIED_ON } from '../server/data/bursaryVerified.js'

function sql(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

function jsonArr(list) {
  if (!list?.length) return 'NULL'
  return sql(JSON.stringify(list))
}

function startDay(date) {
  if (!date) return 'NULL'
  return `TIMESTAMP '${date}T00:00:00.000Z'`
}

function endDay(date) {
  if (!date) return 'NULL'
  return `TIMESTAMP '${date}T23:59:59.000Z'`
}

function writeDates(row) {
  return Boolean(row.datesConfirmed || row.dateConfidence === 'typical')
}

function confidence(row) {
  return row.dateConfidence || (row.datesConfirmed ? 'official' : 'unknown')
}

const lines = [
  `-- Verified bursary dates from official funder pages (checked ${VERIFIED_ON}).`,
  '-- Run this in the Supabase SQL editor — same place as supabase-bursary-calendar.sql.',
  '-- Official dates overwrite the live row. Typical dates are last year’s window as a labelled guide.',
  '-- Rows without official or typical dates only update the URL, notes, and review flag.',
  '',
  'ALTER TABLE "BursaryOpportunity"',
  '  ADD COLUMN IF NOT EXISTS "dateConfidence" TEXT NOT NULL DEFAULT \'unknown\';',
  '',
]

for (const row of BURSARY_VERIFIED) {
  const sets = [
    `"applyUrl" = ${sql(row.applyUrl)}`,
    `"notes" = ${sql(row.notes || null)}`,
    `"lastVerifiedAt" = TIMESTAMP '${VERIFIED_ON}T12:00:00.000Z'`,
    `"needsReview" = ${row.datesConfirmed ? 'false' : 'true'}`,
    `"dateConfidence" = ${sql(confidence(row))}`,
  ]
  if (row.name) sets.push(`"name" = ${sql(row.name)}`)
  if (row.provider) sets.push(`"provider" = ${sql(row.provider)}`)
  if (row.type) sets.push(`"type" = ${sql(row.type)}`)
  if (row.studyFields) sets.push(`"studyFields" = ${jsonArr(row.studyFields)}`)
  if (row.workSectors) sets.push(`"workSectors" = ${jsonArr(row.workSectors)}`)
  if (typeof row.offersJobAfterGrad === 'boolean') {
    sets.push(`"offersJobAfterGrad" = ${row.offersJobAfterGrad}`)
  }
  if (row.studyLevels) sets.push(`"studyLevels" = ${jsonArr(row.studyLevels)}`)
  if (row.coverage) sets.push(`"coverage" = ${sql(row.coverage)}`)
  if (row.region) sets.push(`"region" = ${sql(row.region)}`)
  if (row.eligibility) sets.push(`"eligibility" = ${sql(row.eligibility)}`)
  if (row.requiredDocs) sets.push(`"requiredDocs" = ${sql(row.requiredDocs)}`)
  if (writeDates(row)) {
    if (row.applicationCloses) sets.push(`"applicationCloses" = ${endDay(row.applicationCloses)}`)
    sets.push(`"applicationOpens" = ${row.applicationOpens ? startDay(row.applicationOpens) : 'NULL'}`)
    sets.push(`"nextExpectedOpens" = ${row.nextExpectedOpens ? startDay(row.nextExpectedOpens) : 'NULL'}`)
  }

  lines.push(`-- ${row.slug}`)
  lines.push('UPDATE "BursaryOpportunity" SET')
  lines.push(`  ${sets.join(',\n  ')}`)
  lines.push(`WHERE "slug" = ${sql(row.slug)};`)
  lines.push('')
}

const mining = BURSARY_VERIFIED.find((row) => row.slug === 'sasol-mining-women')
lines.push('-- Add Sasol Mining women bursary if it is not in the catalogue yet.')
lines.push(`INSERT INTO "BursaryOpportunity" (
  "id", "slug", "name", "provider", "type", "studyFields", "workSectors", "offersJobAfterGrad",
  "applicationCloses", "applicationOpens", "nextExpectedOpens", "studyLevels", "coverage", "region",
  "eligibility", "requiredDocs", "applyUrl", "active", "notes", "lastVerifiedAt", "needsReview",
  "dateConfidence", "linkStatus", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  ${sql(mining.slug)},
  ${sql(mining.name)},
  ${sql(mining.provider)},
  ${sql(mining.type)},
  ${jsonArr(mining.studyFields)},
  ${jsonArr(mining.workSectors)},
  true,
  ${endDay(mining.applicationCloses)},
  ${startDay(mining.applicationOpens)},
  NULL,
  ${jsonArr(mining.studyLevels)},
  ${sql(mining.coverage)},
  ${sql(mining.region)},
  ${sql(mining.eligibility)},
  NULL,
  ${sql(mining.applyUrl)},
  true,
  ${sql(mining.notes)},
  TIMESTAMP '${VERIFIED_ON}T12:00:00.000Z',
  false,
  ${sql(confidence(mining))},
  'unknown',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "BursaryOpportunity" WHERE "slug" = ${sql(mining.slug)});
`)

writeFileSync(new URL('./supabase-bursary-verified.sql', import.meta.url), lines.join('\n'))
console.log('Wrote scripts/supabase-bursary-verified.sql')

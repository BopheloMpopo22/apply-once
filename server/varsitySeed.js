import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function isAnyOfRequirement(req) {
  return req && typeof req === 'object' && Array.isArray(req.anyOf)
}

/**
 * Import bundled JSON under src/data/varsity into Postgres (idempotent upserts).
 * @param {{ prisma: import('@prisma/client').PrismaClient; catalogueYear: number; repoRoot?: string }} opts
 */
export async function seedVarsityCatalogueFromRepo({
  prisma,
  catalogueYear,
  repoRoot,
  fileStart,
  fileCount,
}) {
  const root = repoRoot ?? path.join(__dirname, '..')
  const year = Math.floor(Number(catalogueYear) || 2026)

  const universitiesPath = path.join(root, 'src', 'data', 'varsity', 'universities.json')
  const universities = JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'))

  let universityUpserts = 0
  for (const u of universities) {
    await prisma.varsityUniversity.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        shortName: u.shortName,
        website: u.website,
        logoPath: u.logo,
        calculatorType: u.calculator,
        active: true,
      },
      create: {
        id: u.id,
        name: u.name,
        shortName: u.shortName,
        website: u.website,
        logoPath: u.logo,
        calculatorType: u.calculator,
        active: true,
      },
    })
    universityUpserts += 1
  }

  const dataDir = path.join(root, 'src', 'data', 'varsity')
  const filesAll = fs
    .readdirSync(dataDir)
    .filter((f) => /^programmes\..+\.json$/.test(f))
    .sort()

  const start = Math.max(0, Number(fileStart ?? 0) || 0)
  const count = Math.max(0, Number(fileCount ?? filesAll.length) || 0)
  const files = filesAll.slice(start, start + count)

  let programmeUpserts = 0
  let requirementRows = 0

  for (const file of files) {
    const uniId = file.replace(/^programmes\./, '').replace(/\.json$/, '')
    const programmes = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'))

    const uni = await prisma.varsityUniversity.findUnique({ where: { id: uniId } })
    if (!uni) continue

    for (const p of programmes) {
      const programmeId = `${uniId}:${p.id}`
      await prisma.varsityProgramme.upsert({
        where: { id: programmeId },
        update: {
          name: p.name,
          faculty: p.faculty,
          campus: p.campus ?? null,
          externalCode: p.id,
          active: true,
        },
        create: {
          id: programmeId,
          universityId: uniId,
          name: p.name,
          faculty: p.faculty,
          campus: p.campus ?? null,
          externalCode: p.id,
          active: true,
        },
      })
      programmeUpserts += 1

      const ruleSet = await prisma.varsityProgrammeRuleSet.upsert({
        where: { programmeId_catalogueYear: { programmeId, catalogueYear: year } },
        update: {
          minAps: Number(p.minAps || 0),
          notes: p.notes ?? null,
        },
        create: {
          programmeId,
          catalogueYear: year,
          minAps: Number(p.minAps || 0),
          notes: p.notes ?? null,
        },
      })

      await prisma.varsityProgrammeRequirement.deleteMany({ where: { ruleSetId: ruleSet.id } })
      const reqs = Array.isArray(p.subjectRequirements) ? p.subjectRequirements : []
      for (const req of reqs) {
        const kind = isAnyOfRequirement(req) ? 'anyOf' : 'single'
        const label = isAnyOfRequirement(req) ? req.label ?? null : null
        await prisma.varsityProgrammeRequirement.create({
          data: {
            ruleSetId: ruleSet.id,
            kind,
            label,
            payloadJson: JSON.stringify(req),
          },
        })
        requirementRows += 1
      }
    }
  }

  return {
    catalogueYear: year,
    universityUpserts,
    programmeUpserts,
    requirementRows,
    processedFiles: files.length,
    totalFiles: filesAll.length,
    nextFileStart: start + files.length < filesAll.length ? start + files.length : null,
  }
}

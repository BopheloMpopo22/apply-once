import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prisma = new PrismaClient()

const CATALOGUE_YEAR = Number(process.env.CATALOGUE_YEAR || 2026)

function readJson(rel) {
  const p = path.join(__dirname, '..', rel)
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function isAnyOfRequirement(req) {
  return req && typeof req === 'object' && Array.isArray(req.anyOf)
}

async function main() {
  const universities = readJson('src/data/varsity/universities.json')

  // Upsert universities
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
  }

  // For each university, load programmes.*.json
  const dataDir = path.join(__dirname, '..', 'src', 'data', 'varsity')
  const files = fs.readdirSync(dataDir).filter((f) => /^programmes\..+\.json$/.test(f))

  for (const file of files) {
    const uniId = file.replace(/^programmes\./, '').replace(/\.json$/, '')
    const programmes = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'))

    const uni = await prisma.varsityUniversity.findUnique({ where: { id: uniId } })
    if (!uni) {
      console.warn(`Skipping ${file}: no matching VarsityUniversity id='${uniId}'`)
      continue
    }

    for (const p of programmes) {
      const programme = await prisma.varsityProgramme.upsert({
        where: { id: `${uniId}:${p.id}` },
        update: {
          name: p.name,
          faculty: p.faculty,
          campus: p.campus ?? null,
          externalCode: p.id,
          active: true,
        },
        create: {
          id: `${uniId}:${p.id}`,
          universityId: uniId,
          name: p.name,
          faculty: p.faculty,
          campus: p.campus ?? null,
          externalCode: p.id,
          active: true,
        },
      })

      const ruleSet = await prisma.varsityProgrammeRuleSet.upsert({
        where: { programmeId_catalogueYear: { programmeId: programme.id, catalogueYear: CATALOGUE_YEAR } },
        update: {
          minAps: Number(p.minAps || 0),
          notes: p.notes ?? null,
        },
        create: {
          programmeId: programme.id,
          catalogueYear: CATALOGUE_YEAR,
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
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log(`Seeded varsity catalogue for year ${CATALOGUE_YEAR}.`)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


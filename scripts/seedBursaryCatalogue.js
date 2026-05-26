import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { BURSARY_CATALOGUE } from '../server/data/bursaryCatalogue.js'

const prisma = new PrismaClient()

async function main() {
  for (const b of BURSARY_CATALOGUE) {
    await prisma.bursaryOpportunity.upsert({
      where: { slug: b.slug },
      create: {
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
      },
      update: {
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
      },
    })
  }
  const count = await prisma.bursaryOpportunity.count()
  console.log(`Bursary catalogue seeded: ${count} opportunities`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { syncBursaryCatalogue } from '../server/bursaryMatch.js'

const prisma = new PrismaClient()

async function main() {
  const result = await syncBursaryCatalogue(prisma)
  const count = await prisma.bursaryOpportunity.count()
  console.log(
    `Bursary catalogue: ${result.created} new, ${result.skipped} already present (${count} total). Existing dates/URLs were not overwritten.`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

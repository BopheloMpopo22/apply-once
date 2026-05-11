import { PrismaClient } from '@prisma/client'
import { seedVarsityCatalogueFromRepo } from '../server/varsitySeed.js'

const prisma = new PrismaClient()
const CATALOGUE_YEAR = Number(process.env.CATALOGUE_YEAR || 2026)

seedVarsityCatalogueFromRepo({ prisma, catalogueYear: CATALOGUE_YEAR })
  .then(async (stats) => {
    await prisma.$disconnect()
    console.log('Seeded varsity catalogue:', stats)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    await prisma.$connect()
    console.log('SUCCESS: Connected to Supabase')
    const count = await prisma.clinic.count()
    console.log('Clinic count:', count)
  } catch (e) {
    console.error('FAILURE:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()

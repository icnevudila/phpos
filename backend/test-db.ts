import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const res = await prisma.$queryRaw`SELECT 1`;
    console.log("Success:", res);
  } catch (e) {
    console.error("Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();

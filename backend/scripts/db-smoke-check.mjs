/**
 * One-off: clinic / user / patient / appointment row counts (no secrets printed).
 * Run: node scripts/db-smoke-check.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [clinics, users, patients, appointments] = await Promise.all([
    prisma.clinic.count(),
    prisma.user.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
  ]);

  const clinicsList = await prisma.clinic.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { patients: true, users: true } } },
  });

  console.log(JSON.stringify({ clinics, users, patients, appointments, clinicsList }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

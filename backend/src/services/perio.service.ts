import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type {
  PerioExamCreateInput,
  PerioToothInput,
} from "../validation/perio.schemas.js";

const examInclude = {
  teeth: {
    include: { sites: true },
    orderBy: { toothNumber: "asc" },
  },
  examinedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.PerioExamInclude;

async function assertPatientInClinic(clinicId: string, patientId: string): Promise<void> {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true },
  });
  if (!p) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
}

async function assertExamInClinic(clinicId: string, examId: string): Promise<void> {
  const exam = await prisma.perioExam.findFirst({
    where: { id: examId, clinicId },
    select: { id: true },
  });
  if (!exam) {
    throw new AppError("Perio exam not found", 404, "PERIO_EXAM_NOT_FOUND");
  }
}

/**
 * BOP ve plak yüzdelerini verilen diş/site verisinden hesaplar.
 * Eksik (missing) dişler dahil edilmez.
 */
function computeStats(teeth: PerioToothInput[]): { bop: number; plaque: number; totalSites: number } {
  let bleeding = 0;
  let plaqueCount = 0;
  let total = 0;
  for (const t of teeth) {
    if (t.missing) continue;
    for (const s of t.sites) {
      total++;
      if (s.bleeding) bleeding++;
      if (s.plaque) plaqueCount++;
    }
  }
  if (total === 0) return { bop: 0, plaque: 0, totalSites: 0 };
  return {
    bop: Math.round((bleeding / total) * 10000) / 100,
    plaque: Math.round((plaqueCount / total) * 10000) / 100,
    totalSites: total,
  };
}

export async function listPerioExams(clinicId: string, patientId: string) {
  await assertPatientInClinic(clinicId, patientId);
  return prisma.perioExam.findMany({
    where: { clinicId, patientId },
    include: {
      examinedBy: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { teeth: true } },
    },
    orderBy: { examDate: "desc" },
  });
}

export async function getPerioExam(clinicId: string, examId: string) {
  const exam = await prisma.perioExam.findFirst({
    where: { id: examId, clinicId },
    include: examInclude,
  });
  if (!exam) {
    throw new AppError("Perio exam not found", 404, "PERIO_EXAM_NOT_FOUND");
  }
  return exam;
}

export async function createPerioExam(
  clinicId: string,
  patientId: string,
  examinedById: string,
  input: PerioExamCreateInput,
) {
  await assertPatientInClinic(clinicId, patientId);

  const stats = computeStats(input.teeth);

  return prisma.perioExam.create({
    data: {
      clinicId,
      patientId,
      examinedById,
      examDate: input.examDate ?? new Date(),
      notes: input.notes ?? null,
      bopPercent: new Prisma.Decimal(stats.bop),
      plaquePercent: new Prisma.Decimal(stats.plaque),
      teeth: {
        create: input.teeth.map((t) => ({
          toothNumber: t.toothNumber,
          mobility: t.mobility ?? null,
          furcation: t.furcation ?? null,
          missing: t.missing,
          notes: t.notes ?? null,
          sites: {
            create: t.sites.map((s) => ({
              siteCode: s.siteCode,
              pocketDepth: s.pocketDepth,
              recession: s.recession,
              bleeding: s.bleeding,
              suppuration: s.suppuration,
              plaque: s.plaque,
            })),
          },
        })),
      },
    },
    include: examInclude,
  });
}

/**
 * Mevcut bir muayeneyi günceller.
 * Diş/site verisi verilirse önce tüm mevcut diş kayıtları silinir (cascade ile siteler de)
 * ve yeni set baştan oluşturulur — bu "upsert" en temiz yol.
 */
export async function updatePerioExam(
  clinicId: string,
  examId: string,
  input: {
    examDate?: Date;
    notes?: string | null;
    teeth?: PerioToothInput[];
  },
) {
  await assertExamInClinic(clinicId, examId);

  const data: Prisma.PerioExamUpdateInput = {};
  if (input.examDate) data.examDate = input.examDate;
  if (input.notes !== undefined) data.notes = input.notes;

  if (input.teeth && input.teeth.length > 0) {
    const stats = computeStats(input.teeth);
    data.bopPercent = new Prisma.Decimal(stats.bop);
    data.plaquePercent = new Prisma.Decimal(stats.plaque);

    return prisma.$transaction(async (tx) => {
      await tx.perioTooth.deleteMany({ where: { examId } });
      return tx.perioExam.update({
        where: { id: examId },
        data: {
          ...data,
          teeth: {
            create: input.teeth!.map((t) => ({
              toothNumber: t.toothNumber,
              mobility: t.mobility ?? null,
              furcation: t.furcation ?? null,
              missing: t.missing,
              notes: t.notes ?? null,
              sites: {
                create: t.sites.map((s) => ({
                  siteCode: s.siteCode,
                  pocketDepth: s.pocketDepth,
                  recession: s.recession,
                  bleeding: s.bleeding,
                  suppuration: s.suppuration,
                  plaque: s.plaque,
                })),
              },
            })),
          },
        },
        include: examInclude,
      });
    });
  }

  return prisma.perioExam.update({
    where: { id: examId },
    data,
    include: examInclude,
  });
}

export async function deletePerioExam(clinicId: string, examId: string): Promise<void> {
  await assertExamInClinic(clinicId, examId);
  await prisma.perioExam.delete({ where: { id: examId } });
}

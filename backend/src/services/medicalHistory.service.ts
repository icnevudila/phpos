import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type { MedicalHistoryUpsertInput } from "../validation/medicalHistory.schemas.js";

async function assertPatientInClinic(clinicId: string, patientId: string): Promise<void> {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true },
  });
  if (!p) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
}

export async function getMedicalHistory(clinicId: string, patientId: string) {
  await assertPatientInClinic(clinicId, patientId);
  return prisma.medicalHistory.findUnique({
    where: { patientId },
    include: {
      recordedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function upsertMedicalHistory(
  clinicId: string,
  patientId: string,
  recordedById: string,
  input: MedicalHistoryUpsertInput,
) {
  await assertPatientInClinic(clinicId, patientId);

  const existing = await prisma.medicalHistory.findUnique({
    where: { patientId },
    select: { id: true, version: true },
  });

  if (existing) {
    return prisma.medicalHistory.update({
      where: { patientId },
      data: {
        ...input,
        version: existing.version + 1,
        recordedById,
        recordedAt: new Date(),
      },
      include: {
        recordedBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  return prisma.medicalHistory.create({
    data: {
      patientId,
      recordedById,
      version: 1,
      ...input,
    },
    include: {
      recordedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

export type CreatePatientReferralInput = {
  patientId: string;
  referredTo?: string;
  specialty?: string;
  reason?: string;
  notes?: string;
};

export async function listPatientReferrals(clinicId: string, patientId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true },
  });
  if (!patient) throw new AppError("Patient not found", 404, "NOT_FOUND");

  return prisma.patientReferral.findMany({
    where: { clinicId, patientId },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPatientReferral(
  clinicId: string,
  authorId: string,
  data: CreatePatientReferralInput,
) {
  const referredTo = data.referredTo?.trim() ?? "";
  const reason = data.reason?.trim() ?? "";
  if (!referredTo && !reason) {
    throw new AppError("Clinic name or clinical reason is required", 400, "VALIDATION_ERROR");
  }

  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId },
    select: { id: true },
  });
  if (!patient) throw new AppError("Patient not found", 404, "NOT_FOUND");

  return prisma.patientReferral.create({
    data: {
      clinicId,
      patientId: data.patientId,
      authorId,
      referredTo,
      specialty: data.specialty?.trim() ?? "",
      reason,
      notes: data.notes?.trim() ?? "",
    },
    include: {
      author: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

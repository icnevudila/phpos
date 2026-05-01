import type { ToothCondition } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type { UpsertToothBody } from "../validation/teeth.schemas.js";

async function assertPatientInClinic(
  clinicId: string,
  patientId: string,
  opts?: { activeOnly?: boolean },
): Promise<void> {
  const p = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clinicId,
      ...(opts?.activeOnly ? { isActive: true } : {}),
    },
    select: { id: true },
  });
  if (!p) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }
}

export async function listTeeth(clinicId: string, patientId: string) {
  await assertPatientInClinic(clinicId, patientId);
  return prisma.tooth.findMany({
    where: { patientId },
    orderBy: { toothNumber: "asc" },
    select: {
      id: true,
      toothNumber: true,
      surfaces: true,
      condition: true,
      notes: true,
      updatedAt: true,
    },
  });
}

export async function upsertTooth(
  clinicId: string,
  patientId: string,
  toothNumber: number,
  body: UpsertToothBody,
  userId: string,
) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, clinicId, isActive: true },
    select: { id: true, clinicId: true },
  });
  if (!patient) {
    throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  }

  const existing = await prisma.tooth.findUnique({
    where: { patientId_toothNumber: { patientId, toothNumber } },
  });

  const oldCondition = existing?.condition ?? null;
  const oldSurfaces = existing?.surfaces?.length ? existing.surfaces.join(",") : null;

  const tooth = await prisma.tooth.upsert({
    where: { patientId_toothNumber: { patientId, toothNumber } },
    create: {
      patientId,
      toothNumber,
      condition: body.condition,
      surfaces: body.surfaces,
      notes: body.notes ?? null,
    },
    update: {
      condition: body.condition,
      surfaces: body.surfaces,
      notes: body.notes ?? null,
    },
    select: {
      id: true,
      toothNumber: true,
      surfaces: true,
      condition: true,
      notes: true,
      updatedAt: true,
    },
  });

  await prisma.toothAuditLog.create({
    data: {
      clinicId: patient.clinicId,
      patientId,
      toothNumber,
      userId,
      oldCondition: oldCondition,
      newCondition: body.condition,
      oldSurfaces,
      newSurfaces: body.surfaces.length ? body.surfaces.join(",") : null,
    },
  });

  return tooth;
}

export async function listToothHistory(clinicId: string, patientId: string) {
  await assertPatientInClinic(clinicId, patientId);
  const rows = await prisma.toothAuditLog.findMany({
    where: { patientId, clinicId },
    orderBy: { changedAt: "desc" },
    take: 200,
    include: {
      user: {
        select: { firstName: true, lastName: true, id: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    toothNumber: r.toothNumber,
    oldCondition: r.oldCondition as ToothCondition | null,
    newCondition: r.newCondition as ToothCondition,
    oldSurfaces: r.oldSurfaces,
    newSurfaces: r.newSurfaces,
    changedAt: r.changedAt,
    dentist: {
      id: r.user.id,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
      fullName: `${r.user.firstName} ${r.user.lastName}`.trim(),
    },
  }));
}

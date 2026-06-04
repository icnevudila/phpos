import { TreatmentPlanStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

const rowSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  title: true,
  notes: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
  treatments: {
    select: {
      id: true,
      procedure: true,
      quantity: true,
      unitPrice: true,
      phase: true,
      notes: true,
      createdAt: true,
    },
  },
} as const;

function toDto(row: any) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    title: row.title,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    patient: {
      id: row.patient.id,
      firstName: row.patient.firstName,
      lastName: row.patient.lastName,
      fullName: `${row.patient.firstName} ${row.patient.lastName}`.trim(),
      phone: row.patient.phone,
    },
    treatments: row.treatments.map((t: any) => ({
      id: t.id,
      procedure: t.procedure,
      quantity: t.quantity,
      unitPrice: t.unitPrice.toString(),
      phase: t.phase,
      notes: t.notes,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

export type TreatmentPlanDto = ReturnType<typeof toDto>;

export async function listTreatmentPlans(
  clinicId: string,
  patientId?: string,
): Promise<TreatmentPlanDto[]> {
  const where: any = { clinicId };
  if (patientId) {
    where.patientId = patientId;
  }

  const rows = await prisma.treatmentPlan.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: rowSelect,
  });

  return rows.map(toDto);
}

export async function createTreatmentPlan(
  clinicId: string,
  data: {
    patientId: string;
    title: string;
    notes?: string;
    treatmentIds?: string[];
  },
): Promise<TreatmentPlanDto> {
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId, isActive: true },
    select: { id: true },
  });
  if (!patient) {
    throw new AppError("Patient not found", 404, "NOT_FOUND");
  }

  const row = await prisma.treatmentPlan.create({
    data: {
      clinicId,
      patientId: data.patientId,
      title: data.title.trim(),
      notes: data.notes?.trim() || null,
      status: TreatmentPlanStatus.DRAFT,
    },
    select: rowSelect,
  });

  if (data.treatmentIds && data.treatmentIds.length > 0) {
    await prisma.treatment.updateMany({
      where: {
        id: { in: data.treatmentIds },
        patientId: data.patientId,
      },
      data: {
        treatmentPlanId: row.id,
      },
    });
  }

  const updated = await prisma.treatmentPlan.findUnique({
    where: { id: row.id },
    select: rowSelect,
  });

  return toDto(updated);
}

export async function updateTreatmentPlan(
  id: string,
  clinicId: string,
  data: {
    title?: string;
    notes?: string;
    status?: TreatmentPlanStatus;
    treatmentIds?: string[];
  },
): Promise<TreatmentPlanDto> {
  const existing = await prisma.treatmentPlan.findFirst({
    where: { id, clinicId },
    select: { id: true, patientId: true },
  });
  if (!existing) {
    throw new AppError("Treatment plan not found", 404, "NOT_FOUND");
  }

  await prisma.treatmentPlan.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });

  if (data.treatmentIds !== undefined) {
    // Unlink old treatments first
    await prisma.treatment.updateMany({
      where: { treatmentPlanId: id },
      data: { treatmentPlanId: null },
    });

    // Link new ones
    if (data.treatmentIds.length > 0) {
      await prisma.treatment.updateMany({
        where: {
          id: { in: data.treatmentIds },
          patientId: existing.patientId,
        },
        data: { treatmentPlanId: id },
      });
    }
  }

  const updated = await prisma.treatmentPlan.findUnique({
    where: { id },
    select: rowSelect,
  });

  return toDto(updated);
}

export async function deleteTreatmentPlan(id: string, clinicId: string): Promise<void> {
  const existing = await prisma.treatmentPlan.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Treatment plan not found", 404, "NOT_FOUND");
  }

  await prisma.treatmentPlan.delete({ where: { id } });
}

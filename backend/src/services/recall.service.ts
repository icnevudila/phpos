import { RecallStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

const rowSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  recallType: true,
  intervalMonths: true,
  nextDueDate: true,
  lastCompletedDate: true,
  status: true,
  notes: true,
  notifiedAt: true,
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
} as const;

function toDto(row: {
  id: string;
  clinicId: string;
  patientId: string;
  recallType: string;
  intervalMonths: number;
  nextDueDate: Date;
  lastCompletedDate: Date | null;
  status: RecallStatus;
  notes: string | null;
  notifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; firstName: string; lastName: string; phone: string };
}) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    recallType: row.recallType,
    intervalMonths: row.intervalMonths,
    nextDueDate: row.nextDueDate.toISOString(),
    lastCompletedDate: row.lastCompletedDate?.toISOString() ?? null,
    status: row.status,
    notes: row.notes,
    notifiedAt: row.notifiedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    patient: {
      id: row.patient.id,
      firstName: row.patient.firstName,
      lastName: row.patient.lastName,
      fullName: `${row.patient.firstName} ${row.patient.lastName}`.trim(),
      phone: row.patient.phone,
    },
  };
}

export type RecallDto = ReturnType<typeof toDto>;

/* ── List ────────────────────────────────────────────────────────────── */

export async function listRecalls(
  clinicId: string,
  filters: { status?: RecallStatus; patientId?: string; dueBefore?: Date },
): Promise<RecallDto[]> {
  const where: Record<string, unknown> = { clinicId };

  if (filters.status) where.status = filters.status;
  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.dueBefore) where.nextDueDate = { lte: filters.dueBefore };

  const rows = await prisma.recall.findMany({
    where,
    orderBy: [{ nextDueDate: "asc" }],
    select: rowSelect,
  });
  return rows.map(toDto);
}

/* ── Create ──────────────────────────────────────────────────────────── */

export async function createRecall(
  clinicId: string,
  data: {
    patientId: string;
    recallType: string;
    intervalMonths?: number;
    nextDueDate: Date;
    notes?: string;
  },
): Promise<RecallDto> {
  const patient = await prisma.patient.findFirst({
    where: { id: data.patientId, clinicId, isActive: true },
    select: { id: true },
  });
  if (!patient) {
    throw new AppError("Patient not found", 404, "NOT_FOUND");
  }

  const row = await prisma.recall.create({
    data: {
      clinicId,
      patientId: data.patientId,
      recallType: data.recallType,
      intervalMonths: data.intervalMonths ?? 6,
      nextDueDate: data.nextDueDate,
      notes: data.notes?.trim() || null,
      status: RecallStatus.PENDING,
    },
    select: rowSelect,
  });
  return toDto(row);
}

/* ── Update ──────────────────────────────────────────────────────────── */

export async function updateRecall(
  id: string,
  clinicId: string,
  data: {
    recallType?: string;
    intervalMonths?: number;
    nextDueDate?: Date;
    status?: RecallStatus;
    notes?: string;
  },
): Promise<RecallDto> {
  const existing = await prisma.recall.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Recall not found", 404, "NOT_FOUND");
  }

  const row = await prisma.recall.update({
    where: { id },
    data: {
      ...(data.recallType !== undefined && { recallType: data.recallType }),
      ...(data.intervalMonths !== undefined && { intervalMonths: data.intervalMonths }),
      ...(data.nextDueDate !== undefined && { nextDueDate: data.nextDueDate }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
    },
    select: rowSelect,
  });
  return toDto(row);
}

/* ── Delete ──────────────────────────────────────────────────────────── */

export async function deleteRecall(id: string, clinicId: string): Promise<void> {
  const existing = await prisma.recall.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Recall not found", 404, "NOT_FOUND");
  }

  await prisma.recall.delete({ where: { id } });
}

/* ── Get Due (next 7 days) ───────────────────────────────────────────── */

export async function getDueRecalls(clinicId: string): Promise<RecallDto[]> {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const rows = await prisma.recall.findMany({
    where: {
      clinicId,
      status: RecallStatus.PENDING,
      nextDueDate: { lte: sevenDaysLater },
    },
    orderBy: [{ nextDueDate: "asc" }],
    select: rowSelect,
  });
  return rows.map(toDto);
}

/* ── Mark Completed ──────────────────────────────────────────────────── */

export async function markCompleted(id: string, clinicId: string): Promise<RecallDto> {
  const existing = await prisma.recall.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Recall not found", 404, "NOT_FOUND");
  }

  const now = new Date();

  const row = await prisma.recall.update({
    where: { id },
    data: {
      status: RecallStatus.COMPLETED,
      lastCompletedDate: now,
    },
    select: rowSelect,
  });
  return toDto(row);
}

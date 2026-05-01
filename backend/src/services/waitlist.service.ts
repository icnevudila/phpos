import { WaitlistStatus } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type { CreateWaitlistBody, ListWaitlistQuery, PatchWaitlistBody } from "../validation/waitlist.schemas.js";

const rowSelect = {
  id: true,
  clinicId: true,
  patientId: true,
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
} as const;

function toDto(row: {
  id: string;
  clinicId: string;
  patientId: string;
  notes: string | null;
  status: WaitlistStatus;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; firstName: string; lastName: string; phone: string };
}) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
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
  };
}

export type WaitlistEntryDto = ReturnType<typeof toDto>;

export async function listWaitlistEntries(
  clinicId: string,
  query: ListWaitlistQuery,
): Promise<WaitlistEntryDto[]> {
  const where =
    query.scope === "all"
      ? { clinicId }
      : { clinicId, status: WaitlistStatus.WAITING };

  const rows = await prisma.waitlistEntry.findMany({
    where,
    orderBy: [{ createdAt: "asc" }],
    select: rowSelect,
  });
  return rows.map(toDto);
}

export async function createWaitlistEntry(clinicId: string, body: CreateWaitlistBody): Promise<WaitlistEntryDto> {
  const patient = await prisma.patient.findFirst({
    where: { id: body.patientId, clinicId, isActive: true },
    select: { id: true },
  });
  if (!patient) {
    throw new AppError("Patient not found", 404, "NOT_FOUND");
  }

  const existing = await prisma.waitlistEntry.findFirst({
    where: { clinicId, patientId: body.patientId, status: WaitlistStatus.WAITING },
    select: { id: true },
  });
  if (existing) {
    throw new AppError("Patient is already on the active waitlist", 409, "WAITLIST_DUPLICATE");
  }

  const row = await prisma.waitlistEntry.create({
    data: {
      clinicId,
      patientId: body.patientId,
      notes: body.notes?.trim() || null,
      status: WaitlistStatus.WAITING,
    },
    select: rowSelect,
  });
  return toDto(row);
}

export async function patchWaitlistEntry(
  clinicId: string,
  id: string,
  body: PatchWaitlistBody,
): Promise<WaitlistEntryDto> {
  const next =
    body.status === "FULFILLED" ? WaitlistStatus.FULFILLED : WaitlistStatus.CANCELLED;

  const existing = await prisma.waitlistEntry.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Waitlist entry not found", 404, "NOT_FOUND");
  }

  const row = await prisma.waitlistEntry.update({
    where: { id },
    data: { status: next },
    select: rowSelect,
  });
  return toDto(row);
}

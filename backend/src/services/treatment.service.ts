import { AppointmentStatus, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type {
  CreateTreatmentInput,
  UpdateTreatmentInput,
} from "../validation/treatment.schemas.js";

const selectTreatment = {
  id: true,
  appointmentId: true,
  patientId: true,
  dentistId: true,
  procedure: true,
  quantity: true,
  unitPrice: true,
  toothIds: true,
  notes: true,
  createdAt: true,
  dentist: { select: { firstName: true, lastName: true } },
} satisfies Prisma.TreatmentSelect;

async function getAppointmentInClinic(clinicId: string, appointmentId: string) {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, clinicId },
    select: {
      id: true,
      patientId: true,
      dentistId: true,
      status: true,
    },
  });
  if (!appt) {
    throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  }
  return appt;
}

async function getTreatmentInClinic(clinicId: string, treatmentId: string) {
  const t = await prisma.treatment.findFirst({
    where: { id: treatmentId, appointment: { clinicId } },
    include: {
      appointment: { select: { id: true, status: true, clinicId: true } },
    },
  });
  if (!t) {
    throw new AppError("Treatment not found", 404, "TREATMENT_NOT_FOUND");
  }
  return t;
}

export async function listTreatmentsByAppointment(clinicId: string, appointmentId: string) {
  await getAppointmentInClinic(clinicId, appointmentId);
  return prisma.treatment.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "asc" },
    select: selectTreatment,
  });
}

export async function listTreatmentsByPatient(clinicId: string, patientId: string) {
  const exists = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { id: true },
  });
  if (!exists) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");

  return prisma.treatment.findMany({
    where: { patientId, appointment: { clinicId } },
    orderBy: { createdAt: "desc" },
    select: selectTreatment,
  });
}

export async function createTreatment(
  clinicId: string,
  appointmentId: string,
  body: CreateTreatmentInput,
) {
  const appt = await getAppointmentInClinic(clinicId, appointmentId);
  if (appt.status === AppointmentStatus.CANCELLED) {
    throw new AppError(
      "Cannot add treatment to a cancelled appointment",
      409,
      "APPOINTMENT_CANCELLED",
    );
  }
  if (appt.status === AppointmentStatus.COMPLETED) {
    throw new AppError(
      "Cannot add treatment to a completed appointment",
      409,
      "APPOINTMENT_COMPLETED",
    );
  }

  return prisma.treatment.create({
    data: {
      appointmentId: appt.id,
      patientId: appt.patientId,
      dentistId: appt.dentistId,
      procedure: body.procedure,
      quantity: body.quantity,
      unitPrice: new Prisma.Decimal(body.unitPrice.toFixed(2)),
      toothIds: body.toothIds,
      notes: body.notes ?? null,
    },
    select: selectTreatment,
  });
}

export async function updateTreatment(
  clinicId: string,
  treatmentId: string,
  body: UpdateTreatmentInput,
) {
  const existing = await getTreatmentInClinic(clinicId, treatmentId);
  if (existing.appointment.status === AppointmentStatus.CANCELLED) {
    throw new AppError(
      "Cannot edit treatment for a cancelled appointment",
      409,
      "APPOINTMENT_CANCELLED",
    );
  }

  const data: Prisma.TreatmentUpdateInput = {};
  if (body.procedure !== undefined) data.procedure = body.procedure;
  if (body.quantity !== undefined) data.quantity = body.quantity;
  if (body.unitPrice !== undefined) data.unitPrice = new Prisma.Decimal(body.unitPrice.toFixed(2));
  if (body.toothIds !== undefined) data.toothIds = body.toothIds;
  if (body.notes !== undefined) data.notes = body.notes || null;

  return prisma.treatment.update({
    where: { id: treatmentId },
    data,
    select: selectTreatment,
  });
}

export async function deleteTreatment(clinicId: string, treatmentId: string): Promise<void> {
  const existing = await getTreatmentInClinic(clinicId, treatmentId);
  if (existing.appointment.status === AppointmentStatus.CANCELLED) {
    throw new AppError(
      "Cannot delete treatment for a cancelled appointment",
      409,
      "APPOINTMENT_CANCELLED",
    );
  }
  await prisma.treatment.delete({ where: { id: treatmentId } });
}

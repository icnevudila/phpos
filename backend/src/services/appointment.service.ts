import { AppointmentStatus, Prisma, UserRole } from "@prisma/client";

import { emitAppointmentEvent } from "../events/notifications.js";
import { prisma } from "../lib/prisma.js";
import { sendSMS } from "../services/notification/smsService.js";
import { AppError } from "../utils/errors.js";
import {
  MANILA_BUSINESS_END_HOUR,
  MANILA_BUSINESS_START_HOUR,
  isSundayInManila,
  isWithinBusinessHours,
  manilaDayRangeUtc,
} from "../utils/manilaTime.js";
import type {
  CreateAppointmentBody,
  ListAppointmentsQuery,
  PatchAppointmentStatusBody,
  SendAppointmentQueueAlertBody,
  UpdateAppointmentBody,
} from "../validation/appointment.schemas.js";

const DEFAULT_DURATION = 30;

const blocksFutureConflict: AppointmentStatus[] = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.CHECKED_IN,
  AppointmentStatus.IN_PROGRESS,
  AppointmentStatus.COMPLETED,
];

const publicSelect = {
  id: true,
  clinicId: true,
  scheduledAt: true,
  duration: true,
  status: true,
  type: true,
  chairNo: true,
  notes: true,
  arrivedAt: true,
  inProgressAt: true,
  completedAt: true,
  createdAt: true,
  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
  dentist: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  },
} satisfies Prisma.AppointmentSelect;

type AppointmentRow = Prisma.AppointmentGetPayload<{ select: typeof publicSelect }>;

function toDto(row: AppointmentRow) {
  const endsAt = new Date(row.scheduledAt.getTime() + row.duration * 60_000);
  return {
    id: row.id,
    clinicId: row.clinicId,
    scheduledAt: row.scheduledAt.toISOString(),
    endsAt: endsAt.toISOString(),
    duration: row.duration,
    status: row.status,
    type: row.type,
    chairNo: row.chairNo,
    notes: row.notes,
    arrivedAt: row.arrivedAt?.toISOString() ?? null,
    inProgressAt: row.inProgressAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    patient: {
      id: row.patient.id,
      firstName: row.patient.firstName,
      lastName: row.patient.lastName,
      fullName: `${row.patient.firstName} ${row.patient.lastName}`.trim(),
      phone: row.patient.phone,
    },
    dentist: {
      id: row.dentist.id,
      firstName: row.dentist.firstName,
      lastName: row.dentist.lastName,
      fullName: `${row.dentist.firstName} ${row.dentist.lastName}`.trim(),
      role: row.dentist.role,
    },
  };
}

export type AppointmentDto = ReturnType<typeof toDto>;

function applyQueueStatusTimestamps(
  status: AppointmentStatus,
  existing: { arrivedAt: Date | null; inProgressAt: Date | null; completedAt: Date | null },
): Prisma.AppointmentUpdateInput {
  const now = new Date();
  if (status === AppointmentStatus.CHECKED_IN) {
    return {
      arrivedAt: existing.arrivedAt ?? now,
      inProgressAt: existing.inProgressAt,
      completedAt: null,
    };
  }
  if (status === AppointmentStatus.IN_PROGRESS) {
    return {
      arrivedAt: existing.arrivedAt ?? now,
      inProgressAt: existing.inProgressAt ?? now,
      completedAt: null,
    };
  }
  if (status === AppointmentStatus.COMPLETED) {
    return {
      arrivedAt: existing.arrivedAt ?? now,
      inProgressAt: existing.inProgressAt ?? now,
      completedAt: now,
    };
  }
  if (status === AppointmentStatus.CANCELLED || status === AppointmentStatus.NO_SHOW) {
    return {
      completedAt: null,
    };
  }
  return {};
}

async function assertPatientInClinic(clinicId: string, patientId: string): Promise<void> {
  const p = await prisma.patient.findFirst({
    where: { id: patientId, clinicId, isActive: true },
    select: { id: true },
  });
  if (!p) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
}

async function assertDentistInClinic(clinicId: string, dentistId: string): Promise<void> {
  const d = await prisma.user.findFirst({
    where: {
      id: dentistId,
      clinicId,
      isActive: true,
      role: { in: [UserRole.DENTIST, UserRole.ADMIN] },
    },
    select: { id: true },
  });
  if (!d) throw new AppError("Dentist not found", 404, "DENTIST_NOT_FOUND");
}

function assertBusinessHours(scheduledAt: Date, durationMinutes: number): void {
  if (isSundayInManila(scheduledAt)) {
    throw new AppError(
      "Clinic is closed on Sundays (Asia/Manila)",
      409,
      "CLINIC_CLOSED_SUNDAY",
    );
  }
  if (
    !isWithinBusinessHours(
      scheduledAt,
      durationMinutes,
      MANILA_BUSINESS_START_HOUR,
      MANILA_BUSINESS_END_HOUR,
    )
  ) {
    throw new AppError(
      `Appointment must be within ${MANILA_BUSINESS_START_HOUR}:00–${MANILA_BUSINESS_END_HOUR}:00 (Asia/Manila)`,
      409,
      "OUTSIDE_BUSINESS_HOURS",
    );
  }
  if (scheduledAt.getTime() < Date.now() - 60_000) {
    throw new AppError("Appointment cannot be in the past", 409, "APPOINTMENT_IN_PAST");
  }
}

async function findConflict(params: {
  clinicId: string;
  dentistId: string;
  scheduledAt: Date;
  duration: number;
  excludeId?: string;
}): Promise<AppointmentRow | null> {
  const start = params.scheduledAt;
  const end = new Date(start.getTime() + params.duration * 60_000);

  // Çakışma: aynı dentist, bloke eden status, zaman aralıkları kesişiyor.
  const candidates = await prisma.appointment.findMany({
    where: {
      clinicId: params.clinicId,
      dentistId: params.dentistId,
      id: params.excludeId ? { not: params.excludeId } : undefined,
      status: { in: blocksFutureConflict },
      // Aday olarak: başlangıcı bizim bitişimizden önce olan randevular
      scheduledAt: { lt: end },
    },
    orderBy: { scheduledAt: "desc" },
    take: 20,
    select: publicSelect,
  });

  for (const c of candidates) {
    const cStart = c.scheduledAt.getTime();
    const cEnd = cStart + c.duration * 60_000;
    if (cEnd > start.getTime() && cStart < end.getTime()) {
      return c;
    }
  }
  return null;
}

export async function listAppointments(
  clinicId: string,
  query: ListAppointmentsQuery,
): Promise<AppointmentDto[]> {
  const where: Prisma.AppointmentWhereInput = { clinicId };

  if (query.date) {
    const { gte, lt } = manilaDayRangeUtc(query.date);
    where.scheduledAt = { gte, lt };
  } else if (query.from || query.to) {
    where.scheduledAt = {};
    if (query.from) where.scheduledAt.gte = manilaDayRangeUtc(query.from).gte;
    if (query.to) where.scheduledAt.lt = manilaDayRangeUtc(query.to).lt;
  }

  if (query.dentistId) where.dentistId = query.dentistId;
  if (query.patientId) where.patientId = query.patientId;
  if (query.status) where.status = query.status;

  const rows = await prisma.appointment.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    select: publicSelect,
  });

  return rows.map(toDto);
}

export async function getAppointment(
  clinicId: string,
  id: string,
): Promise<AppointmentDto> {
  const row = await prisma.appointment.findFirst({
    where: { id, clinicId },
    select: publicSelect,
  });
  if (!row) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  return toDto(row);
}

export async function createAppointment(
  clinicId: string,
  body: CreateAppointmentBody,
): Promise<AppointmentDto> {
  const duration = body.duration ?? DEFAULT_DURATION;

  await assertPatientInClinic(clinicId, body.patientId);
  await assertDentistInClinic(clinicId, body.dentistId);
  assertBusinessHours(body.scheduledAt, duration);

  const conflict = await findConflict({
    clinicId,
    dentistId: body.dentistId,
    scheduledAt: body.scheduledAt,
    duration,
  });
  if (conflict) {
    throw new AppError(
      "Dentist already has an appointment in this time slot",
      409,
      "APPOINTMENT_CONFLICT",
    );
  }

  const row = await prisma.appointment.create({
    data: {
      clinicId,
      patientId: body.patientId,
      dentistId: body.dentistId,
      scheduledAt: body.scheduledAt,
      duration,
      type: body.type,
      chairNo: body.chairNo?.trim() || null,
      notes: body.notes ?? null,
      status: AppointmentStatus.PENDING,
    },
    select: publicSelect,
  });

  emitAppointmentEvent({ type: "appointment.created", appointmentId: row.id });
  return toDto(row);
}

export async function updateAppointment(
  clinicId: string,
  id: string,
  body: UpdateAppointmentBody,
): Promise<AppointmentDto> {
  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId },
    select: {
      id: true,
      scheduledAt: true,
      duration: true,
      dentistId: true,
      status: true,
    },
  });
  if (!existing) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");

  if (
    existing.status === AppointmentStatus.COMPLETED ||
    existing.status === AppointmentStatus.CANCELLED
  ) {
    throw new AppError(
      "Completed or cancelled appointments cannot be edited",
      409,
      "APPOINTMENT_LOCKED",
    );
  }

  if (body.patientId) await assertPatientInClinic(clinicId, body.patientId);
  if (body.dentistId) await assertDentistInClinic(clinicId, body.dentistId);

  const scheduledAt = body.scheduledAt ?? existing.scheduledAt;
  const duration = body.duration ?? existing.duration;
  const dentistId = body.dentistId ?? existing.dentistId;

  const scheduleChanged =
    (body.scheduledAt && body.scheduledAt.getTime() !== existing.scheduledAt.getTime()) ||
    (body.duration !== undefined && body.duration !== existing.duration) ||
    (body.dentistId && body.dentistId !== existing.dentistId);

  if (scheduleChanged) {
    assertBusinessHours(scheduledAt, duration);
    const conflict = await findConflict({
      clinicId,
      dentistId,
      scheduledAt,
      duration,
      excludeId: id,
    });
    if (conflict) {
      throw new AppError(
        "Dentist already has an appointment in this time slot",
        409,
        "APPOINTMENT_CONFLICT",
      );
    }
  }

  const row = await prisma.appointment.update({
    where: { id },
    data: {
      patientId: body.patientId,
      dentistId: body.dentistId,
      scheduledAt: body.scheduledAt,
      duration: body.duration,
      type: body.type,
      chairNo: body.chairNo === undefined ? undefined : body.chairNo?.trim() || null,
      notes: body.notes,
    },
    select: publicSelect,
  });

  if (body.scheduledAt && body.scheduledAt.getTime() !== existing.scheduledAt.getTime()) {
    emitAppointmentEvent({
      type: "appointment.rescheduled",
      appointmentId: row.id,
      previousScheduledAt: existing.scheduledAt.toISOString(),
    });
  }

  return toDto(row);
}

export async function patchAppointmentStatus(
  clinicId: string,
  id: string,
  body: PatchAppointmentStatusBody,
): Promise<AppointmentDto> {
  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId },
    select: {
      id: true,
      status: true,
      notes: true,
      arrivedAt: true,
      inProgressAt: true,
      completedAt: true,
    },
  });
  if (!existing) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");

  if (existing.status === body.status) {
    const row = await prisma.appointment.findUniqueOrThrow({
      where: { id },
      select: publicSelect,
    });
    return toDto(row);
  }

  // Geçiş kuralları: COMPLETED'ten ve CANCELLED'den geri çıkılamaz.
  if (
    existing.status === AppointmentStatus.COMPLETED ||
    existing.status === AppointmentStatus.CANCELLED
  ) {
    throw new AppError(
      "Status of finalized appointments cannot be changed",
      409,
      "APPOINTMENT_LOCKED",
    );
  }

  const data: Prisma.AppointmentUpdateInput = {
    status: body.status,
    ...applyQueueStatusTimestamps(body.status, existing),
  };
  if (body.status === AppointmentStatus.CANCELLED && body.cancellationReason) {
    const suffix = `\n[Cancelled] ${body.cancellationReason}`;
    data.notes = (existing.notes ?? "") + suffix;
  }

  const row = await prisma.appointment.update({
    where: { id },
    data,
    select: publicSelect,
  });

  emitAppointmentEvent({
    type: "appointment.status_changed",
    appointmentId: row.id,
    from: existing.status,
    to: body.status,
  });
  if (body.status === AppointmentStatus.CANCELLED) {
    emitAppointmentEvent({
      type: "appointment.cancelled",
      appointmentId: row.id,
      reason: body.cancellationReason,
    });
  }

  return toDto(row);
}

export async function sendAppointmentQueueAlert(
  clinicId: string,
  id: string,
  body: SendAppointmentQueueAlertBody,
) {
  const appt = await prisma.appointment.findFirst({
    where: { id, clinicId },
    select: {
      id: true,
      type: true,
      scheduledAt: true,
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });
  if (!appt) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");

  const timeText = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(appt.scheduledAt);

  const defaultMessage = `DentEase: Hi ${appt.patient.firstName}, your queue update for ${timeText} is ready. Please proceed to reception.`;
  const result = await sendSMS({
    clinicId,
    patientId: appt.patient.id,
    appointmentId: appt.id,
    kind: "APPOINTMENT_REMINDER_SOON",
    to: appt.patient.phone,
    message: body.message ?? defaultMessage,
  });

  return {
    appointmentId: appt.id,
    recipient: appt.patient.phone,
    notification: result,
  };
}

export async function deleteAppointment(clinicId: string, id: string): Promise<void> {
  const existing = await prisma.appointment.findFirst({
    where: { id, clinicId },
    select: { id: true, status: true },
  });
  if (!existing) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  if (
    existing.status === AppointmentStatus.COMPLETED ||
    existing.status === AppointmentStatus.CANCELLED
  ) {
    throw new AppError(
      "Finalized appointments cannot be deleted; use status change instead",
      409,
      "APPOINTMENT_LOCKED",
    );
  }
  await prisma.appointment.delete({ where: { id } });
}

export async function listDentists(clinicId: string) {
  return prisma.user.findMany({
    where: {
      clinicId,
      isActive: true,
      role: { in: [UserRole.DENTIST, UserRole.ADMIN] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      phone: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
}

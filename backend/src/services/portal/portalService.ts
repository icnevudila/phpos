import { AppointmentStatus, Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/errors.js";

// ───────────────────────── Medical History ─────────────────────────

export async function getPortalMedicalHistory(patientId: string) {
  const row = await prisma.medicalHistory.findUnique({
    where: { patientId },
    select: {
      underPhysicianCare: true,
      underPhysicianCareReason: true,
      hospitalized: true,
      hospitalizedReason: true,
      hospitalizedYear: true,
      takingMedications: true,
      medicationsList: true,
      seriousIllness: true,
      seriousIllnessDetails: true,
      conditions: true,
      conditionsOther: true,
      allergyAnesthetic: true,
      allergyPenicillin: true,
      allergySulfa: true,
      allergyAspirin: true,
      allergyLatex: true,
      allergyOther: true,
      smoker: true,
      alcohol: true,
      recreationalDrug: true,
      womenIsPregnant: true,
      womenIsNursing: true,
      womenTakingBirthControl: true,
      bleedingIssues: true,
      bleedingIssuesDetails: true,
    },
  });
  return row;
}

export async function updatePortalMedicalHistory(patientId: string, data: any) {
  const existing = await prisma.medicalHistory.findUnique({
    where: { patientId },
  });

  if (!existing) {
    return prisma.medicalHistory.create({
      data: {
        patientId,
        ...data,
      },
    });
  }

  return prisma.medicalHistory.update({
    where: { patientId },
    data: {
      ...data,
      version: { increment: 1 },
    },
  });
}

// ───────────────────────── Constants ─────────────────────────

const CLINIC_OPEN_HOUR = 8; // 08:00
const CLINIC_CLOSE_HOUR = 18; // 18:00 (son slot 17:30'da başlar)
const SLOT_MIN = 30;
const MANILA_OFFSET = "+08:00";

// ───────────────────────── Helpers ─────────────────────────

function manilaDayRange(dateIso: string): { gte: Date; lt: Date; weekday: number } {
  // dateIso: "YYYY-MM-DD"
  const gte = new Date(`${dateIso}T00:00:00${MANILA_OFFSET}`);
  const lt = new Date(gte.getTime() + 24 * 60 * 60 * 1000);
  // 0=Sun, 1=Mon ... (Manila saatindeki gün)
  const weekday = (gte.getUTCDay() + Math.floor(8 / 24)) % 7; // MANILA_OFFSET saat cinsinden
  return { gte, lt, weekday };
}

function manilaNow(): Date {
  return new Date();
}

function fmtManilaTime(d: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export interface PortalPatientDto {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  clinicSlug: string;
  clinicName: string;
  clinicPhone: string | null;
}

export async function getPortalMe(patientId: string): Promise<PortalPatientDto> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      clinic: { select: { slug: true, name: true, phone: true } },
    },
  });
  if (!patient) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");
  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    email: patient.email,
    clinicSlug: patient.clinic.slug,
    clinicName: patient.clinic.name,
    clinicPhone: patient.clinic.phone,
  };
}

export interface PortalHomeDto {
  patient: { firstName: string; lastName: string };
  nextAppointment: {
    id: string;
    scheduledAt: string;
    localDate: string; // "YYYY-MM-DD" Asia/Manila
    localTime: string; // "HH:mm"
    dentistName: string;
    type: string | null;
    status: AppointmentStatus;
    canCancel: boolean;
  } | null;
  lastInvoice: {
    id: string;
    orNumber: string | null;
    total: string;
    status: string;
    remaining: string;
    createdAt: string;
  } | null;
  unpaidCount: number;
}

export async function getPortalHome(patientId: string): Promise<PortalHomeDto> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { firstName: true, lastName: true, clinicId: true },
  });
  if (!patient) throw new AppError("Patient not found", 404, "PATIENT_NOT_FOUND");

  const now = manilaNow();

  const [next, lastInvoice, unpaidCount] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        patientId,
        scheduledAt: { gte: now },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        scheduledAt: true,
        type: true,
        status: true,
        dentist: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.invoice.findFirst({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orNumber: true,
        total: true,
        status: true,
        createdAt: true,
        payments: { select: { amount: true } },
      },
    }),
    prisma.invoice.count({ where: { patientId, status: { in: ["UNPAID", "PARTIAL"] } } }),
  ]);

  const unpaidRemaining = (inv: typeof lastInvoice): string => {
    if (!inv) return "0";
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return (Number(inv.total) - paid).toFixed(2);
  };

  return {
    patient: { firstName: patient.firstName, lastName: patient.lastName },
    nextAppointment: next
      ? {
          id: next.id,
          scheduledAt: next.scheduledAt.toISOString(),
          localDate: new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila",
          }).format(next.scheduledAt),
          localTime: fmtManilaTime(next.scheduledAt),
          dentistName: `${next.dentist.firstName} ${next.dentist.lastName}`,
          type: next.type,
          status: next.status,
          canCancel: next.scheduledAt.getTime() - now.getTime() > 24 * 60 * 60 * 1000,
        }
      : null,
    lastInvoice: lastInvoice
      ? {
          id: lastInvoice.id,
          orNumber: lastInvoice.orNumber,
          total: Number(lastInvoice.total).toFixed(2),
          status: lastInvoice.status,
          remaining: unpaidRemaining(lastInvoice),
          createdAt: lastInvoice.createdAt.toISOString(),
        }
      : null,
    unpaidCount,
  };
}

export interface PortalDentistDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  initials: string;
}

export async function listPortalDentists(clinicId: string): Promise<PortalDentistDto[]> {
  const dentists = await prisma.user.findMany({
    where: { clinicId, role: "DENTIST", isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ firstName: "asc" }],
  });
  return dentists.map((d) => ({
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
    avatarUrl: null,
    initials: `${d.firstName[0] ?? ""}${d.lastName[0] ?? ""}`.toUpperCase(),
  }));
}

export interface AvailabilityDto {
  date: string;
  closed: boolean;
  reason?: string;
  slots: Array<{ time: string; iso: string; available: boolean }>;
}

/**
 * Belirli hekim & gün için 30 dakikalık slot listesi döner.
 * Kural: Pazar kapalı (weekday=0), 08:00–18:00 arası, her yarım saat bir slot.
 */
export async function getPortalAvailability(
  clinicId: string,
  dentistId: string,
  dateIso: string,
): Promise<AvailabilityDto> {
  const range = manilaDayRange(dateIso);
  const weekday = new Date(range.gte).getUTCDay(); // UTC'de gün; Asia/Manila için +8 etkili
  // Manila günü hesaplama — 00:00 Manila = 16:00 UTC prev day
  const manilaWeekday = new Date(range.gte.getTime() + 8 * 60 * 60 * 1000).getUTCDay();
  void weekday;

  if (manilaWeekday === 0) {
    return {
      date: dateIso,
      closed: true,
      reason: "Clinic closed on Sundays",
      slots: [],
    };
  }

  // Hekim doğrulama (aynı klinikte mi?)
  const dentist = await prisma.user.findFirst({
    where: { id: dentistId, clinicId, role: "DENTIST", isActive: true },
    select: { id: true },
  });
  if (!dentist) throw new AppError("Dentist not available", 404, "DENTIST_NOT_FOUND");

  const booked = await prisma.appointment.findMany({
    where: {
      dentistId,
      scheduledAt: { gte: range.gte, lt: range.lt },
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    },
    select: { scheduledAt: true, duration: true },
  });

  const occupied = new Set<number>();
  for (const b of booked) {
    const start = b.scheduledAt.getTime();
    const end = start + b.duration * 60_000;
    for (let t = start; t < end; t += SLOT_MIN * 60_000) {
      occupied.add(t);
    }
  }

  const now = Date.now();
  const slots: AvailabilityDto["slots"] = [];
  const dayStart = range.gte.getTime();
  const totalSlots =
    ((CLINIC_CLOSE_HOUR - CLINIC_OPEN_HOUR) * 60) / SLOT_MIN; // 20 slot (08:00–17:30)
  for (let i = 0; i < totalSlots; i += 1) {
    const ts = dayStart + (CLINIC_OPEN_HOUR * 60 + i * SLOT_MIN) * 60_000;
    const iso = new Date(ts).toISOString();
    const time = fmtManilaTime(new Date(ts));
    const past = ts <= now;
    slots.push({
      time,
      iso,
      available: !occupied.has(ts) && !past,
    });
  }

  return { date: dateIso, closed: false, slots };
}

export interface BookInput {
  dentistId: string;
  scheduledAtIso: string;
  type?: string;
  notes?: string;
}

export async function bookPortalAppointment(
  clinicId: string,
  patientId: string,
  input: BookInput,
): Promise<{ id: string; scheduledAt: string; status: AppointmentStatus }> {
  const scheduledAt = new Date(input.scheduledAtIso);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new AppError("Invalid date", 400, "INVALID_DATE");
  }
  if (scheduledAt.getTime() < Date.now()) {
    throw new AppError("Cannot book in the past", 400, "APPT_PAST");
  }

  // Slot sınırlarına uyum (dakika:00 veya 30)
  const minutes = scheduledAt.getUTCMinutes();
  if (![0, 30].includes(minutes)) {
    throw new AppError("Please pick a 30-minute slot", 400, "APPT_SLOT");
  }

  const dentist = await prisma.user.findFirst({
    where: { id: input.dentistId, clinicId, role: "DENTIST", isActive: true },
    select: { id: true },
  });
  if (!dentist) throw new AppError("Dentist not available", 404, "DENTIST_NOT_FOUND");

  // Çakışma kontrolü
  const windowEnd = new Date(scheduledAt.getTime() + SLOT_MIN * 60_000);
  const conflict = await prisma.appointment.findFirst({
    where: {
      dentistId: input.dentistId,
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      scheduledAt: { lt: windowEnd },
      AND: {
        scheduledAt: { gte: new Date(scheduledAt.getTime() - 60 * 60_000) },
      },
    },
    select: { scheduledAt: true, duration: true },
  });
  if (conflict) {
    const confStart = conflict.scheduledAt.getTime();
    const confEnd = confStart + conflict.duration * 60_000;
    if (scheduledAt.getTime() < confEnd && windowEnd.getTime() > confStart) {
      throw new AppError("Slot already booked", 409, "APPT_CONFLICT");
    }
  }

  const appt = await prisma.appointment.create({
    data: {
      clinicId,
      patientId,
      dentistId: input.dentistId,
      scheduledAt,
      duration: SLOT_MIN,
      status: AppointmentStatus.PENDING,
      type: input.type ?? null,
      notes: input.notes ?? null,
    },
    select: { id: true, scheduledAt: true, status: true },
  });

  return {
    id: appt.id,
    scheduledAt: appt.scheduledAt.toISOString(),
    status: appt.status,
  };
}

export interface PortalAppointmentItem {
  id: string;
  scheduledAt: string;
  localDate: string;
  localTime: string;
  status: AppointmentStatus;
  type: string | null;
  dentistName: string;
  canCancel: boolean;
  isPast: boolean;
}

export async function listPortalAppointments(patientId: string): Promise<PortalAppointmentItem[]> {
  const now = Date.now();
  const rows = await prisma.appointment.findMany({
    where: { patientId },
    orderBy: { scheduledAt: "desc" },
    select: {
      id: true,
      scheduledAt: true,
      status: true,
      type: true,
      dentist: { select: { firstName: true, lastName: true } },
    },
  });
  return rows.map((a) => ({
    id: a.id,
    scheduledAt: a.scheduledAt.toISOString(),
    localDate: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(a.scheduledAt),
    localTime: fmtManilaTime(a.scheduledAt),
    status: a.status,
    type: a.type,
    dentistName: `${a.dentist.firstName} ${a.dentist.lastName}`,
    canCancel:
      a.scheduledAt.getTime() - now > 24 * 60 * 60 * 1000 &&
      (a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED),
    isPast: a.scheduledAt.getTime() < now,
  }));
}

export async function cancelPortalAppointment(
  patientId: string,
  appointmentId: string,
): Promise<void> {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId },
    select: { id: true, scheduledAt: true, status: true },
  });
  if (!appt) throw new AppError("Appointment not found", 404, "APPT_NOT_FOUND");
  if (appt.status === AppointmentStatus.CANCELLED) {
    throw new AppError("Already cancelled", 400, "APPT_ALREADY_CANCELLED");
  }
  if (appt.status === AppointmentStatus.COMPLETED) {
    throw new AppError("Completed appointments cannot be cancelled", 400, "APPT_COMPLETED");
  }
  if (appt.scheduledAt.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
    throw new AppError(
      "Appointments can only be cancelled more than 24h in advance",
      400,
      "APPT_CANCEL_WINDOW",
    );
  }
  await prisma.appointment.update({
    where: { id: appt.id },
    data: { status: AppointmentStatus.CANCELLED },
  });
}

export interface PortalHistoryDto {
  treatments: Array<{
    id: string;
    date: string;
    localDate: string;
    procedure: string;
    quantity: number;
    total: string;
    dentistName: string;
    appointmentId: string;
  }>;
  invoices: Array<{
    id: string;
    orNumber: string | null;
    status: string;
    total: string;
    remaining: string;
    createdAt: string;
    isPayable: boolean;
  }>;
  totals: {
    paidAllTime: string;
    outstanding: string;
  };
}

export async function getPortalHistory(patientId: string): Promise<PortalHistoryDto> {
  const [treatments, invoices, paidAllTimeAgg] = await Promise.all([
    prisma.treatment.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        procedure: true,
        quantity: true,
        unitPrice: true,
        appointmentId: true,
        dentist: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.invoice.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orNumber: true,
        status: true,
        total: true,
        createdAt: true,
        payments: { select: { amount: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { invoice: { patientId } },
      _sum: { amount: true },
    }),
  ]);

  const outstanding = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => {
      const paid = i.payments.reduce((s, p) => s + Number(p.amount), 0);
      return sum + (Number(i.total) - paid);
    }, 0);

  return {
    treatments: treatments.map((t) => ({
      id: t.id,
      date: t.createdAt.toISOString(),
      localDate: new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
      }).format(t.createdAt),
      procedure: t.procedure,
      quantity: t.quantity,
      total: new Prisma.Decimal(t.unitPrice).mul(t.quantity).toFixed(2),
      dentistName: `${t.dentist.firstName} ${t.dentist.lastName}`,
      appointmentId: t.appointmentId,
    })),
    invoices: invoices.map((i) => {
      const paid = i.payments.reduce((s, p) => s + Number(p.amount), 0);
      const remaining = Number(i.total) - paid;
      return {
        id: i.id,
        orNumber: i.orNumber,
        status: i.status,
        total: Number(i.total).toFixed(2),
        remaining: remaining.toFixed(2),
        createdAt: i.createdAt.toISOString(),
        isPayable: remaining > 0,
      };
    }),
    totals: {
      paidAllTime: Number(paidAllTimeAgg._sum.amount ?? 0).toFixed(2),
      outstanding: outstanding.toFixed(2),
    },
  };
}

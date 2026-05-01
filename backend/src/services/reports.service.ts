import { AppointmentStatus, HmoClaimStatus, InvoiceStatus, Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

function manilaDayKey(d: Date): string {
  const shifted = new Date(d.getTime() + MANILA_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

function manilaTodayRange(now: Date = new Date()): { gte: Date; lt: Date; key: string } {
  const todayKey = manilaDayKey(now);
  const gte = new Date(`${todayKey}T00:00:00+08:00`);
  const lt = new Date(gte.getTime() + 24 * 60 * 60 * 1000);
  return { gte, lt, key: todayKey };
}

function manilaMonthRange(year: number, month: number): { gte: Date; lt: Date } {
  const mm = String(month).padStart(2, "0");
  const gte = new Date(`${year}-${mm}-01T00:00:00+08:00`);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const lt = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+08:00`);
  return { gte, lt };
}

function manilaLast30Range(now: Date = new Date()): { gte: Date; lt: Date; days: string[] } {
  const todayKey = manilaDayKey(now);
  const lt = new Date(`${todayKey}T00:00:00+08:00`);
  lt.setUTCDate(lt.getUTCDate() + 1);
  const gte = new Date(lt.getTime() - 30 * 24 * 60 * 60 * 1000);
  const days: string[] = [];
  for (let i = 0; i < 30; i += 1) {
    const d = new Date(gte.getTime() + i * 24 * 60 * 60 * 1000);
    days.push(manilaDayKey(d));
  }
  return { gte, lt, days };
}

interface MoneyRow {
  amount: Prisma.Decimal;
  paidAt: Date;
  method: string;
}

/**
 * Randevu statüsü → canonical key map (case-insensitive karşılaştırma için lowercase).
 */
const STATUS_KEY: Record<AppointmentStatus, keyof DashboardStatusCounts> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checkedIn",
  IN_PROGRESS: "inProgress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "noShow",
};

export interface DashboardStatusCounts {
  pending: number;
  confirmed: number;
  checkedIn: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface DashboardTodayAppointment {
  id: string;
  time: string; // Asia/Manila HH:mm
  patientName: string;
  patientPhone: string;
  dentistName: string;
  status: AppointmentStatus;
  chairNo: string | null;
  type: string | null;
  arrivedAt: string | null;
  waitingMinutes: number;
}

export interface DashboardWaitlistRow {
  id: string;
  patientId: string;
  patientName: string;
  note: string | null;
  createdAt: string;
  waitingMinutes: number;
}

export interface DashboardActiveTreatmentPlan {
  appointmentId: string;
  patientId: string;
  patientName: string;
  dentistName: string;
  scheduledAt: string;
  operations: Array<{ procedure: string; fee: string; toothIds: string[] }>;
}

export interface DashboardResponse {
  today: {
    appointments: number;
    completed: number;
    revenue: string;
    upcoming: DashboardTodayAppointment[];
  };
  queue: {
    total: number;
    waiting: number;
    checkedIn: number;
    inProgress: number;
    rows: DashboardTodayAppointment[];
  };
  waitlist: {
    total: number;
    rows: DashboardWaitlistRow[];
  };
  operational: {
    pendingHmoClaims: number;
    inventoryAlerts: number;
  };
  activeTreatmentPlan: DashboardActiveTreatmentPlan | null;
  thisMonth: {
    appointments: number;
    newPatients: number;
    revenue: string;
  };
  topProcedures: Array<{ name: string; count: number; revenue: string }>;
  revenueByDay: Array<{ date: string; amount: string }>;
  appointmentsByStatus: DashboardStatusCounts;
}

export async function buildDashboard(clinicId: string): Promise<DashboardResponse> {
  const now = new Date();
  const today = manilaTodayRange(now);
  const month = manilaMonthRange(now.getUTCFullYear(), now.getUTCMonth() + 1);
  const last30 = manilaLast30Range(now);

  const [
    todayAppointments,
    todayCompleted,
    todayPayments,
    monthAppointments,
    monthNewPatients,
    monthPayments,
    last30Payments,
    topProcedures,
    statusGroups,
    todayList,
    pendingHmoClaims,
    inventoryRows,
    activePlan,
    waitlistRowsRaw,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { clinicId, scheduledAt: { gte: today.gte, lt: today.lt } },
    }),
    prisma.appointment.count({
      where: {
        clinicId,
        scheduledAt: { gte: today.gte, lt: today.lt },
        status: AppointmentStatus.COMPLETED,
      },
    }),
    prisma.payment.findMany({
      where: {
        invoice: { clinicId },
        paidAt: { gte: today.gte, lt: today.lt },
      },
      select: { amount: true, method: true, paidAt: true },
    }),
    prisma.appointment.count({
      where: { clinicId, scheduledAt: { gte: month.gte, lt: month.lt } },
    }),
    prisma.patient.count({
      where: { clinicId, createdAt: { gte: month.gte, lt: month.lt } },
    }),
    prisma.payment.findMany({
      where: {
        invoice: { clinicId },
        paidAt: { gte: month.gte, lt: month.lt },
      },
      select: { amount: true, method: true, paidAt: true },
    }),
    prisma.payment.findMany({
      where: {
        invoice: { clinicId },
        paidAt: { gte: last30.gte, lt: last30.lt },
      },
      select: { amount: true, paidAt: true },
    }),
    prisma.treatment.groupBy({
      by: ["procedure"],
      where: { patient: { clinicId } },
      _count: { _all: true },
      _sum: { unitPrice: true },
      orderBy: { _count: { procedure: "desc" } },
      take: 5,
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { clinicId },
      _count: { _all: true },
    }),
    prisma.appointment.findMany({
      where: { clinicId, scheduledAt: { gte: today.gte, lt: today.lt } },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        scheduledAt: true,
        arrivedAt: true,
        status: true,
        chairNo: true,
        type: true,
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        dentist: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.hmoClaim.count({
      where: {
        clinicId,
        status: { in: [HmoClaimStatus.DRAFT, HmoClaimStatus.SUBMITTED] },
      },
    }),
    prisma.inventory.findMany({
      where: { clinicId },
      select: { quantity: true, minimumStock: true, expiryDate: true },
    }),
    prisma.appointment.findFirst({
      where: {
        clinicId,
        scheduledAt: { gte: today.gte, lt: today.lt },
        status: { in: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CHECKED_IN, AppointmentStatus.CONFIRMED] },
      },
      orderBy: [{ status: "desc" }, { scheduledAt: "asc" }],
      select: {
        id: true,
        scheduledAt: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
        dentist: { select: { firstName: true, lastName: true } },
        treatments: {
          orderBy: { createdAt: "asc" },
          select: { procedure: true, unitPrice: true, quantity: true, toothIds: true },
        },
      },
    }),
    prisma.waitlistEntry.findMany({
      where: { clinicId, status: "WAITING" },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: {
        id: true,
        patientId: true,
        notes: true,
        createdAt: true,
        patient: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const statusCounts: DashboardStatusCounts = {
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  };
  for (const g of statusGroups) {
    statusCounts[STATUS_KEY[g.status]] = g._count._all;
  }

  const todayRevenue = sumAmounts(todayPayments);
  const monthRevenue = sumAmounts(monthPayments);

  // revenueByDay — tüm 30 günü doldur (0 değer dahil)
  const byDayMap = new Map<string, number>();
  for (const key of last30.days) byDayMap.set(key, 0);
  for (const p of last30Payments) {
    const key = manilaDayKey(p.paidAt);
    byDayMap.set(key, (byDayMap.get(key) ?? 0) + Number(p.amount));
  }
  const revenueByDay = last30.days.map((date) => ({
    date,
    amount: (byDayMap.get(date) ?? 0).toFixed(2),
  }));

  // Prosedür bazlı istatistik — quantity dahil edilmesi için ayrı sorgu
  const procedureDetails = await prisma.treatment.groupBy({
    by: ["procedure"],
    where: {
      patient: { clinicId },
      procedure: { in: topProcedures.map((p) => p.procedure) },
    },
    _sum: { quantity: true },
  });
  const quantityByProc = new Map(
    procedureDetails.map((r) => [r.procedure, r._sum.quantity ?? 0] as const),
  );

  // Revenue = Σ quantity * unitPrice — raw sorgu daha doğru; yaklaşıklık olarak
  // top-5 için ayrıca hesaplayalım.
  const procedureRevenueRows = await prisma.$queryRaw<
    Array<{ procedure: string; revenue: string | number }>
  >`
    SELECT t."procedure", COALESCE(SUM(t."quantity" * t."unitPrice"), 0) AS revenue
    FROM "Treatment" t
    JOIN "Patient" p ON p.id = t."patientId"
    WHERE p."clinicId" = ${clinicId}
      AND t."procedure" = ANY(${topProcedures.map((x) => x.procedure)}::text[])
    GROUP BY t."procedure"
  `;
  const revenueByProc = new Map<string, number>(
    procedureRevenueRows.map((r) => [r.procedure, Number(r.revenue)] as const),
  );

  const topProceduresDto = topProcedures.map((p) => ({
    name: p.procedure,
    count: quantityByProc.get(p.procedure) ?? p._count._all,
    revenue: (revenueByProc.get(p.procedure) ?? 0).toFixed(2),
  }));

  const formatTime = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const upcoming: DashboardTodayAppointment[] = todayList.map((a) => {
    const waitFrom = a.arrivedAt ?? a.scheduledAt;
    const waitingMinutes = Math.max(0, Math.floor((Date.now() - waitFrom.getTime()) / 60_000));
    return {
      id: a.id,
      time: formatTime.format(a.scheduledAt),
      patientName: `${a.patient.firstName} ${a.patient.lastName}`.trim(),
      patientPhone: a.patient.phone,
      dentistName: `${a.dentist.firstName} ${a.dentist.lastName}`.trim(),
      status: a.status,
      chairNo: a.chairNo,
      type: a.type,
      arrivedAt: a.arrivedAt?.toISOString() ?? null,
      waitingMinutes,
    };
  });
  const queueRows = upcoming.filter((a) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(a.status),
  );
  const queuedPatientIds = new Set(
    todayList
      .filter((a) => ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(a.status))
      .map((a) => a.patient.id),
  );
  const waitlistRows: DashboardWaitlistRow[] = waitlistRowsRaw
    .filter((w) => !queuedPatientIds.has(w.patientId))
    .map((w) => ({
    id: w.id,
    patientId: w.patientId,
    patientName: `${w.patient.firstName} ${w.patient.lastName}`.trim(),
    note: w.notes,
    createdAt: w.createdAt.toISOString(),
    waitingMinutes: Math.max(0, Math.floor((Date.now() - w.createdAt.getTime()) / 60_000)),
  }));
  const inventoryAlerts = inventoryRows.filter((i) => {
    const low = i.quantity <= i.minimumStock;
    const expiring =
      i.expiryDate !== null &&
      i.expiryDate.getTime() >= Date.now() &&
      i.expiryDate.getTime() <= Date.now() + 30 * 86_400_000;
    return low || expiring;
  }).length;
  const activeTreatmentPlan: DashboardActiveTreatmentPlan | null = activePlan
    ? {
        appointmentId: activePlan.id,
        patientId: activePlan.patient.id,
        patientName: `${activePlan.patient.firstName} ${activePlan.patient.lastName}`.trim(),
        dentistName: `${activePlan.dentist.firstName} ${activePlan.dentist.lastName}`.trim(),
        scheduledAt: activePlan.scheduledAt.toISOString(),
        operations: activePlan.treatments.map((t) => ({
          procedure: t.procedure,
          fee: (Number(t.unitPrice) * t.quantity).toFixed(2),
          toothIds: t.toothIds,
        })),
      }
    : null;

  return {
    today: {
      appointments: todayAppointments,
      completed: todayCompleted,
      revenue: todayRevenue.toFixed(2),
      upcoming,
    },
    queue: {
      total: queueRows.length,
      waiting: queueRows.filter((r) => r.status === "PENDING" || r.status === "CONFIRMED").length,
      checkedIn: queueRows.filter((r) => r.status === "CHECKED_IN").length,
      inProgress: queueRows.filter((r) => r.status === "IN_PROGRESS").length,
      rows: queueRows,
    },
    waitlist: {
      total: waitlistRows.length,
      rows: waitlistRows,
    },
    operational: {
      pendingHmoClaims,
      inventoryAlerts,
    },
    activeTreatmentPlan,
    thisMonth: {
      appointments: monthAppointments,
      newPatients: monthNewPatients,
      revenue: monthRevenue.toFixed(2),
    },
    topProcedures: topProceduresDto,
    revenueByDay,
    appointmentsByStatus: statusCounts,
  };
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalRevenue: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  newPatients: number;
  returningPatients: number;
  topProcedures: Array<{ name: string; count: number; revenue: string }>;
  revenueByWeek: Array<{ week: number; amount: string; startDate: string; endDate: string }>;
  paymentMethods: {
    cash: string;
    gcash: string;
    maya: string;
    creditCard: string;
    cheque: string;
    philhealth: string;
  };
  /** Hekim bazında performans kırılımı (randevu/tamamlanan/ciro). */
  byDentist: Array<{
    dentistId: string;
    name: string;
    appointments: number;
    completed: number;
    revenue: string;
  }>;
}

const METHOD_KEY = {
  CASH: "cash",
  GCASH: "gcash",
  MAYA: "maya",
  CREDIT_CARD: "creditCard",
  CHEQUE: "cheque",
  PHILHEALTH: "philhealth",
} as const;

function sumAmounts(rows: Array<Pick<MoneyRow, "amount">>): number {
  return rows.reduce((s, r) => s + Number(r.amount), 0);
}

export async function buildMonthlyReport(
  clinicId: string,
  year: number,
  month: number,
): Promise<MonthlyReport> {
  const range = manilaMonthRange(year, month);

  const [appointments, completed, cancelled, newPatients, payments, topProc, patientsInMonth] =
    await Promise.all([
      prisma.appointment.count({
        where: { clinicId, scheduledAt: { gte: range.gte, lt: range.lt } },
      }),
      prisma.appointment.count({
        where: {
          clinicId,
          scheduledAt: { gte: range.gte, lt: range.lt },
          status: AppointmentStatus.COMPLETED,
        },
      }),
      prisma.appointment.count({
        where: {
          clinicId,
          scheduledAt: { gte: range.gte, lt: range.lt },
          status: AppointmentStatus.CANCELLED,
        },
      }),
      prisma.patient.count({
        where: { clinicId, createdAt: { gte: range.gte, lt: range.lt } },
      }),
      prisma.payment.findMany({
        where: {
          invoice: { clinicId },
          paidAt: { gte: range.gte, lt: range.lt },
        },
        select: { amount: true, method: true, paidAt: true },
      }),
      prisma.treatment.groupBy({
        by: ["procedure"],
        where: {
          patient: { clinicId },
          createdAt: { gte: range.gte, lt: range.lt },
        },
        _count: { _all: true },
        _sum: { quantity: true },
        orderBy: { _count: { procedure: "desc" } },
        take: 5,
      }),
      prisma.appointment.findMany({
        where: {
          clinicId,
          scheduledAt: { gte: range.gte, lt: range.lt },
        },
        select: { patientId: true, patient: { select: { createdAt: true } } },
      }),
    ]);

  // returning = distinct patients whose account was created before the month
  const returningSet = new Set<string>();
  for (const row of patientsInMonth) {
    if (row.patient.createdAt < range.gte) returningSet.add(row.patientId);
  }

  const paymentMethods = {
    cash: 0,
    gcash: 0,
    maya: 0,
    creditCard: 0,
    cheque: 0,
    philhealth: 0,
  };
  for (const p of payments) {
    const key = METHOD_KEY[p.method as keyof typeof METHOD_KEY];
    if (key) paymentMethods[key] += Number(p.amount);
  }
  const totalRevenue = Object.values(paymentMethods).reduce((a, b) => a + b, 0);

  // Revenue by week — 7-günlük pencereler (ay başından)
  const weeks: Array<{ week: number; amount: string; startDate: string; endDate: string }> = [];
  let weekIdx = 1;
  let cursor = new Date(range.gte.getTime());
  while (cursor < range.lt) {
    const start = new Date(cursor.getTime());
    const end = new Date(Math.min(cursor.getTime() + 7 * 86_400_000, range.lt.getTime()));
    const sum = payments
      .filter((p) => p.paidAt >= start && p.paidAt < end)
      .reduce((s, p) => s + Number(p.amount), 0);
    weeks.push({
      week: weekIdx,
      amount: sum.toFixed(2),
      startDate: manilaDayKey(start),
      endDate: manilaDayKey(new Date(end.getTime() - 1)),
    });
    cursor = end;
    weekIdx += 1;
  }

  // Hekim bazlı kırılım — randevu sayıları + treatment geliri
  const [dentistApptAgg, dentistRevRows] = await Promise.all([
    prisma.appointment.groupBy({
      by: ["dentistId", "status"],
      where: { clinicId, scheduledAt: { gte: range.gte, lt: range.lt } },
      _count: { _all: true },
    }),
    prisma.$queryRaw<Array<{ dentistId: string; revenue: string | number }>>`
      SELECT t."dentistId" as "dentistId",
             COALESCE(SUM(t."quantity" * t."unitPrice"), 0) AS revenue
      FROM "Treatment" t
      JOIN "Patient" p ON p.id = t."patientId"
      WHERE p."clinicId" = ${clinicId}
        AND t."createdAt" >= ${range.gte}
        AND t."createdAt" < ${range.lt}
      GROUP BY t."dentistId"
    `,
  ]);

  const dentistIds = new Set<string>();
  for (const row of dentistApptAgg) dentistIds.add(row.dentistId);
  for (const row of dentistRevRows) dentistIds.add(row.dentistId);
  const dentistUsers =
    dentistIds.size > 0
      ? await prisma.user.findMany({
          where: { id: { in: Array.from(dentistIds) } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
  const nameById = new Map(dentistUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`] as const));
  const revenueById = new Map(dentistRevRows.map((r) => [r.dentistId, Number(r.revenue)] as const));
  const apptTotalById = new Map<string, number>();
  const completedById = new Map<string, number>();
  for (const row of dentistApptAgg) {
    apptTotalById.set(row.dentistId, (apptTotalById.get(row.dentistId) ?? 0) + row._count._all);
    if (row.status === AppointmentStatus.COMPLETED) {
      completedById.set(row.dentistId, (completedById.get(row.dentistId) ?? 0) + row._count._all);
    }
  }
  const byDentist = Array.from(dentistIds)
    .map((id) => ({
      dentistId: id,
      name: nameById.get(id) ?? "—",
      appointments: apptTotalById.get(id) ?? 0,
      completed: completedById.get(id) ?? 0,
      revenue: (revenueById.get(id) ?? 0).toFixed(2),
    }))
    .sort((a, b) => Number(b.revenue) - Number(a.revenue));

  // Top prosedür revenue'ları için ek sorgu
  const procedures = topProc.map((p) => p.procedure);
  let revenueByProc = new Map<string, number>();
  if (procedures.length > 0) {
    const rows = await prisma.$queryRaw<Array<{ procedure: string; revenue: string | number }>>`
      SELECT t."procedure", COALESCE(SUM(t."quantity" * t."unitPrice"), 0) AS revenue
      FROM "Treatment" t
      JOIN "Patient" p ON p.id = t."patientId"
      WHERE p."clinicId" = ${clinicId}
        AND t."createdAt" >= ${range.gte}
        AND t."createdAt" < ${range.lt}
        AND t."procedure" = ANY(${procedures}::text[])
      GROUP BY t."procedure"
    `;
    revenueByProc = new Map(rows.map((r) => [r.procedure, Number(r.revenue)] as const));
  }

  return {
    year,
    month,
    totalRevenue: totalRevenue.toFixed(2),
    totalAppointments: appointments,
    completedAppointments: completed,
    cancelledAppointments: cancelled,
    newPatients,
    returningPatients: returningSet.size,
    topProcedures: topProc.map((p) => ({
      name: p.procedure,
      count: p._sum.quantity ?? p._count._all,
      revenue: (revenueByProc.get(p.procedure) ?? 0).toFixed(2),
    })),
    revenueByWeek: weeks,
    paymentMethods: {
      cash: paymentMethods.cash.toFixed(2),
      gcash: paymentMethods.gcash.toFixed(2),
      maya: paymentMethods.maya.toFixed(2),
      creditCard: paymentMethods.creditCard.toFixed(2),
      cheque: paymentMethods.cheque.toFixed(2),
      philhealth: paymentMethods.philhealth.toFixed(2),
    },
    byDentist,
  };
}

function invoiceToCents(d: Prisma.Decimal | string | number): number {
  return Math.round(Number(d) * 100);
}

export type AgedBucketKey = "0_30" | "31_60" | "61_90" | "91_plus";

export interface AgedReceivablesBucket {
  key: AgedBucketKey;
  label: string;
  invoiceCount: number;
  balance: string;
}

export interface AgedReceivablesRow {
  invoiceId: string;
  orNumber: string | null;
  patientName: string;
  patientId: string;
  balance: string;
  daysOutstanding: number;
  bucket: AgedBucketKey;
  createdAt: string;
  status: InvoiceStatus;
}

export interface AgedReceivablesResponse {
  asOf: string;
  totalOutstanding: string;
  buckets: AgedReceivablesBucket[];
  rows: AgedReceivablesRow[];
}

function manilaDaysBetween(from: Date, to: Date): number {
  const kFrom = manilaDayKey(from);
  const kTo = manilaDayKey(to);
  const t0 = new Date(`${kFrom}T12:00:00+08:00`).getTime();
  const t1 = new Date(`${kTo}T12:00:00+08:00`).getTime();
  return Math.max(0, Math.floor((t1 - t0) / 86400000));
}

/**
 * Ödenmemiş / kısmi faturalar için bakiye yaşlandırması (fatura `createdAt`, Asia/Manila gün farkı).
 */
export async function buildAgedReceivables(clinicId: string): Promise<AgedReceivablesResponse> {
  const now = new Date();
  const asOf = manilaDayKey(now);

  const invoices = await prisma.invoice.findMany({
    where: {
      clinicId,
      status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
    },
    include: {
      payments: { select: { amount: true } },
      patient: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: AgedReceivablesRow[] = [];
  let totalCents = 0;
  const bucketCents: Record<AgedBucketKey, number> = {
    "0_30": 0,
    "31_60": 0,
    "61_90": 0,
    "91_plus": 0,
  };
  const bucketCount: Record<AgedBucketKey, number> = {
    "0_30": 0,
    "31_60": 0,
    "61_90": 0,
    "91_plus": 0,
  };

  for (const inv of invoices) {
    const paidCents = inv.payments.reduce((s, p) => s + invoiceToCents(p.amount), 0);
    const totalC = invoiceToCents(inv.total);
    const balanceCents = Math.max(0, totalC - paidCents);
    if (balanceCents <= 0) continue;

    const days = manilaDaysBetween(inv.createdAt, now);
    let bucket: AgedBucketKey;
    if (days <= 30) bucket = "0_30";
    else if (days <= 60) bucket = "31_60";
    else if (days <= 90) bucket = "61_90";
    else bucket = "91_plus";

    totalCents += balanceCents;
    bucketCents[bucket] += balanceCents;
    bucketCount[bucket] += 1;

    const patientName = [inv.patient.firstName, inv.patient.lastName].filter(Boolean).join(" ");
    rows.push({
      invoiceId: inv.id,
      orNumber: inv.orNumber,
      patientName,
      patientId: inv.patient.id,
      balance: (balanceCents / 100).toFixed(2),
      daysOutstanding: days,
      bucket,
      createdAt: inv.createdAt.toISOString(),
      status: inv.status,
    });
  }

  rows.sort((a, b) => Number(b.balance) - Number(a.balance));

  const labels: Record<AgedBucketKey, string> = {
    "0_30": "0–30 days",
    "31_60": "31–60 days",
    "61_90": "61–90 days",
    "91_plus": "91+ days",
  };

  const bucketKeys: AgedBucketKey[] = ["0_30", "31_60", "61_90", "91_plus"];
  const buckets: AgedReceivablesBucket[] = bucketKeys.map((key) => ({
    key,
    label: labels[key],
    invoiceCount: bucketCount[key],
    balance: (bucketCents[key] / 100).toFixed(2),
  }));

  return {
    asOf,
    totalOutstanding: (totalCents / 100).toFixed(2),
    buckets,
    rows,
  };
}

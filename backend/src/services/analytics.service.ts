import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

/**
 * Prosedür isimlerini kategorilere ayırır.
 * PH Dental standartlarına göre gruplandırma.
 */
function mapToCategory(procedure: string): string {
  const p = procedure.toLowerCase();
  if (p.includes("exam") || p.includes("cleaning") || p.includes("prophy") || p.includes("fluoride")) return "Preventive";
  if (p.includes("filling") || p.includes("composite") || p.includes("restoration")) return "Restorative";
  if (p.includes("extract") || p.includes("surgery") || p.includes("impaction")) return "Oral Surgery";
  if (p.includes("root canal") || p.includes("endo")) return "Endodontics";
  if (p.includes("crown") || p.includes("bridge") || p.includes("denture") || p.includes("veneer")) return "Prosthodontics";
  if (p.includes("braces") || p.includes("ortho") || p.includes("aligner")) return "Orthodontics";
  if (p.includes("x-ray") || p.includes("panoramic") || p.includes("periapical")) return "Diagnostics";
  return "General/Other";
}

export interface AnalyticsOverview {
  treatmentBreakdown: Array<{ name: string; value: number }>;
  categoryRevenue: Array<{ name: string; amount: number }>;
  dentistProductivity: Array<{ name: string; revenue: number; appointments: number }>;
  patientGrowth: Array<{ month: string; newPatients: number; returningPatients: number }>;
  hmoShare: Array<{ name: string; value: number }>;
}

export async function getAnalyticsOverview(clinicId: string): Promise<AnalyticsOverview> {
  // 1. Treatment Breakdown (Pie Chart data)
  const treatments = await prisma.treatment.groupBy({
    by: ["procedure"],
    where: { patient: { clinicId } },
    _count: { _all: true },
    _sum: { quantity: true },
  });

  const treatmentBreakdown = treatments.map(t => ({
    name: t.procedure,
    value: t._sum.quantity || t._count._all
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  // 2. Category Revenue (Pie Chart data)
  const catMap = new Map<string, number>();
  const allTreatments = await prisma.treatment.findMany({
    where: { patient: { clinicId } },
    select: { procedure: true, quantity: true, unitPrice: true }
  });

  for (const t of allTreatments) {
    const cat = mapToCategory(t.procedure);
    const rev = Number(t.unitPrice) * t.quantity;
    catMap.set(cat, (catMap.get(cat) || 0) + rev);
  }
  const categoryRevenue = Array.from(catMap.entries()).map(([name, amount]) => ({
    name,
    amount: Number(amount.toFixed(2))
  })).sort((a, b) => b.amount - a.amount);

  // 3. Dentist Productivity (Bar Chart data)
  const dentistStats = await prisma.user.findMany({
    where: { clinicId, role: "DENTIST" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      treatments: {
        select: { quantity: true, unitPrice: true }
      },
      dentistAppointments: {
        where: { status: AppointmentStatus.COMPLETED },
        select: { id: true }
      }
    }
  });

  const dentistProductivity = dentistStats.map(d => {
    const revenue = d.treatments.reduce((sum: number, t) => sum + (Number(t.unitPrice) * t.quantity), 0);
    return {
      name: `${d.firstName} ${d.lastName}`,
      revenue: Number(revenue.toFixed(2)),
      appointments: d.dentistAppointments.length
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // 4. Patient Growth — tek sorgu (12 ay × 2 count yerine)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setUTCMonth(twelveMonthsAgo.getUTCMonth() - 11);
  twelveMonthsAgo.setUTCDate(1);
  twelveMonthsAgo.setUTCHours(0, 0, 0, 0);

  const newByMonth = await prisma.$queryRaw<Array<{ month: Date; cnt: bigint }>>`
    SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::bigint AS cnt
    FROM "Patient"
    WHERE "clinicId" = ${clinicId}
      AND "createdAt" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month
  `;

  const returningByMonth = await prisma.$queryRaw<Array<{ month: Date; cnt: bigint }>>`
    SELECT DATE_TRUNC('month', a."scheduledAt") AS month,
           COUNT(DISTINCT a."patientId")::bigint AS cnt
    FROM "Appointment" a
    INNER JOIN "Patient" p ON p.id = a."patientId"
    WHERE a."clinicId" = ${clinicId}
      AND a."status" = ${AppointmentStatus.COMPLETED}::"AppointmentStatus"
      AND a."scheduledAt" >= ${twelveMonthsAgo}
      AND p."createdAt" < DATE_TRUNC('month', a."scheduledAt")
    GROUP BY DATE_TRUNC('month', a."scheduledAt")
    ORDER BY month
  `;

  const newMap = new Map(
    newByMonth.map((r) => [r.month.toISOString().slice(0, 7), Number(r.cnt)]),
  );
  const retMap = new Map(
    returningByMonth.map((r) => [r.month.toISOString().slice(0, 7), Number(r.cnt)]),
  );

  const patientGrowth: Array<{ month: string; newPatients: number; returningPatients: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - i);
    d.setUTCDate(1);
    const key = d.toISOString().slice(0, 7);
    const monthLabel = d.toLocaleString("en-PH", { month: "short", year: "2-digit", timeZone: "UTC" });
    patientGrowth.push({
      month: monthLabel,
      newPatients: newMap.get(key) ?? 0,
      returningPatients: retMap.get(key) ?? 0,
    });
  }

  // 5. HMO Share (Pie Chart data)
  const [totalPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { invoice: { clinicId } },
      _sum: { amount: true }
    }),
  ]);

  // Actually check for any payment linked to an invoice that has HMO claims
  const paymentsWithHmo = await prisma.payment.findMany({
    where: { 
      invoice: { 
        clinicId,
        hmoClaims: { some: {} }
      }
    },
    select: { amount: true }
  });
  
  const hmoRev = paymentsWithHmo.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalRev = Number(totalPayments._sum.amount || 0);
  const privateRev = Math.max(0, totalRev - hmoRev);

  const hmoShare = [
    { name: "HMO/Insurance", value: Number(hmoRev.toFixed(2)) },
    { name: "Private Pay", value: Number(privateRev.toFixed(2)) }
  ].filter(v => v.value > 0);

  return {
    treatmentBreakdown,
    categoryRevenue,
    dentistProductivity,
    patientGrowth,
    hmoShare
  };
}

export async function getArAgingReport(clinicId: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      clinicId,
      status: { in: ["UNPAID", "PARTIAL"] },
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const report = {
    current: 0,
    overdue30: 0,
    overdue60: 0,
    overdue90: 0,
    details: [] as any[],
  };

  for (const inv of invoices) {
    const paidSum = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = Math.max(0, Number(inv.total) - paidSum);
    if (balance <= 0) continue;
    const ageDays = Math.floor((now.getTime() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    if (ageDays <= 30) report.current += balance;
    else if (ageDays <= 60) report.overdue30 += balance;
    else if (ageDays <= 90) report.overdue60 += balance;
    else report.overdue90 += balance;
    report.details.push({
      id: inv.id,
      patientId: inv.patient.id,
      patientName: `${inv.patient.firstName} ${inv.patient.lastName}`,
      patientPhone: inv.patient.phone,
      total: Number(inv.total),
      balance: Number(balance.toFixed(2)),
      ageDays,
      createdAt: inv.createdAt,
    });
  }
  return report;
}

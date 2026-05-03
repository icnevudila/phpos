import { AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

function manilaDayKey(d: Date): string {
  const shifted = new Date(d.getTime() + MANILA_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

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
  const now = new Date();
  const year = now.getUTCFullYear();
  
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
        _count: true
      }
    }
  });

  const dentistProductivity = dentistStats.map(d => {
    const revenue = d.treatments.reduce((sum, t) => sum + (Number(t.unitPrice) * t.quantity), 0);
    return {
      name: `${d.firstName} ${d.lastName}`,
      revenue: Number(revenue.toFixed(2)),
      appointments: d.dentistAppointments.length
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // 4. Patient Growth (Line Chart data - Last 12 months)
  const patientGrowth: Array<{ month: string; newPatients: number; returningPatients: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - i);
    const start = new Date(d.getUTCFullYear(), d.getUTCMonth(), 1);
    const end = new Date(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    const monthLabel = d.toLocaleString('en-PH', { month: 'short', year: '2-digit' });

    const [newCount, returningCount] = await Promise.all([
      prisma.patient.count({
        where: { clinicId, createdAt: { gte: start, lt: end } }
      }),
      prisma.appointment.findMany({
        where: { 
          clinicId, 
          scheduledAt: { gte: start, lt: end },
          status: AppointmentStatus.COMPLETED
        },
        select: { patientId: true, patient: { select: { createdAt: true } } }
      })
    ]);

    // Returning = appointments in month where patient was created BEFORE start of month
    const returningPatients = new Set(returningCount.filter(a => a.patient.createdAt < start).map(a => a.patientId)).size;

    patientGrowth.push({
      month: monthLabel,
      newPatients: newCount,
      returningPatients
    });
  }

  // 5. HMO Share (Pie Chart data)
  const [totalPayments, hmoPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { invoice: { clinicId } },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { invoice: { clinicId }, method: "PHILHEALTH" }, // Standard PH insurance check
      _sum: { amount: true }
    })
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

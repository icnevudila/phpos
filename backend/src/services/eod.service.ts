import { AppointmentStatus, InventoryTransactionType, PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export interface EodSummary {
  date: string;
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  revenue: {
    total: number;
    byMethod: Record<string, number>;
  };
  inventory: {
    transactionsCount: number;
    lowStockItems: number;
  };
  hmo: {
    claimsSubmitted: number;
    totalAmount: number;
  };
}

export async function getDailyEodSummary(clinicId: string, date: Date): Promise<EodSummary> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [
    appts,
    payments,
    invTransactions,
    hmoClaims,
    lowStockCount
  ] = await Promise.all([
    prisma.appointment.findMany({
      where: { clinicId, scheduledAt: { gte: startOfDay, lte: endOfDay } },
      select: { status: true }
    }),
    prisma.payment.findMany({
      where: { invoice: { clinicId }, paidAt: { gte: startOfDay, lte: endOfDay } },
      select: { amount: true, method: true }
    }),
    prisma.inventoryTransaction.count({
      where: { inventory: { clinicId }, createdAt: { gte: startOfDay, lte: endOfDay } }
    }),
    prisma.hmoClaim.findMany({
      where: { clinicId, createdAt: { gte: startOfDay, lte: endOfDay } },
      select: { totalAmount: true }
    }),
    prisma.inventory.count({
      where: { clinicId, quantity: { lte: prisma.inventory.fields.minimumStock } }
    })
  ]);

  const revenueByMethod: Record<string, number> = {};
  let totalRevenue = 0;
  payments.forEach(p => {
    const amt = Number(p.amount);
    revenueByMethod[p.method] = (revenueByMethod[p.method] || 0) + amt;
    totalRevenue += amt;
  });

  return {
    date: startOfDay.toISOString().split('T')[0],
    appointments: {
      total: appts.length,
      completed: appts.filter(a => a.status === AppointmentStatus.COMPLETED).length,
      cancelled: appts.filter(a => a.status === AppointmentStatus.CANCELLED).length,
      noShow: appts.filter(a => a.status === AppointmentStatus.NO_SHOW).length,
    },
    revenue: {
      total: totalRevenue,
      byMethod: revenueByMethod
    },
    inventory: {
      transactionsCount: invTransactions,
      lowStockItems: lowStockCount
    },
    hmo: {
      claimsSubmitted: hmoClaims.length,
      totalAmount: hmoClaims.reduce((sum, c) => sum + Number(c.totalAmount), 0)
    }
  };
}

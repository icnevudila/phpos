import { prisma } from "../lib/prisma.js";

export async function getLowStockAlerts(clinicId: string) {
  const items = await prisma.inventory.findMany({
    where: {
      clinicId,
      quantity: {
        lte: prisma.inventory.fields.minimumStock
      }
    },
    orderBy: { quantity: 'asc' }
  });

  return items.map(item => ({
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    minimumStock: item.minimumStock,
    severity: item.quantity === 0 ? 'CRITICAL' : 'LOW',
    suggestedOrder: item.minimumStock * 2 - item.quantity
  }));
}

export async function getExpiringItems(clinicId: string) {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const items = await prisma.inventory.findMany({
    where: {
      clinicId,
      expiryDate: {
        lte: thirtyDaysFromNow,
        not: null
      }
    },
    orderBy: { expiryDate: 'asc' }
  });

  return items.map(item => ({
    id: item.id,
    itemName: item.itemName,
    expiryDate: item.expiryDate,
    daysLeft: Math.ceil((item.expiryDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }));
}

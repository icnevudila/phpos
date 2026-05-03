import { InventoryTransactionType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function logInventoryTransaction(params: {
  inventoryId: string;
  userId?: string;
  type: InventoryTransactionType;
  quantity: number;
  reason?: string;
  referenceId?: string;
}) {
  const { inventoryId, userId, type, quantity, reason, referenceId } = params;

  // Use a transaction to ensure atomic update and log
  return await prisma.$transaction(async (tx) => {
    // 1. Log the transaction
    const transaction = await tx.inventoryTransaction.create({
      data: {
        inventoryId,
        userId,
        type,
        quantity,
        reason,
        referenceId,
      },
    });

    // 2. Update the inventory stock quantity
    const inventory = await tx.inventory.update({
      where: { id: inventoryId },
      data: {
        quantity: {
          increment: quantity, // quantity can be negative for OUT/ADJUSTMENT
        },
      },
    });

    return { transaction, inventory };
  });
}

export async function listInventoryHistory(inventoryId: string) {
  return await prisma.inventoryTransaction.findMany({
    where: { inventoryId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
  });
}

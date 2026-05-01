import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import type {
  AdjustInventoryBody,
  CreateInventoryBody,
  ListInventoryQuery,
  UpdateInventoryBody,
} from "../validation/inventory.schemas.js";

export type InventoryStatus = "OK" | "LOW" | "CRITICAL";

const selectFields = {
  id: true,
  clinicId: true,
  itemName: true,
  category: true,
  unit: true,
  quantity: true,
  minimumStock: true,
  unitCost: true,
  supplier: true,
  expiryDate: true,
  updatedAt: true,
} satisfies Prisma.InventorySelect;

type Row = Prisma.InventoryGetPayload<{ select: typeof selectFields }>;

export interface InventoryDto {
  id: string;
  clinicId: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
  minimumStock: number;
  unitCost: string;
  supplier: string | null;
  expiryDate: string | null;
  updatedAt: string;
  status: InventoryStatus;
  daysUntilExpiry: number | null;
}

export function computeStatus(row: Pick<Row, "quantity" | "minimumStock">): InventoryStatus {
  if (row.quantity === 0) return "CRITICAL";
  if (row.minimumStock > 0) {
    const criticalCutoff = Math.max(1, Math.floor(row.minimumStock / 2));
    if (row.quantity <= criticalCutoff) return "CRITICAL";
    if (row.quantity <= row.minimumStock) return "LOW";
  }
  return "OK";
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

function toDto(row: Row): InventoryDto {
  return {
    id: row.id,
    clinicId: row.clinicId,
    itemName: row.itemName,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    minimumStock: row.minimumStock,
    unitCost: row.unitCost.toFixed(2),
    supplier: row.supplier,
    expiryDate: row.expiryDate?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
    status: computeStatus(row),
    daysUntilExpiry: daysUntil(row.expiryDate),
  };
}

export async function listInventory(
  clinicId: string,
  query: ListInventoryQuery,
): Promise<InventoryDto[]> {
  const where: Prisma.InventoryWhereInput = { clinicId };
  if (query.category) where.category = query.category;
  const trimmed = query.q?.trim();
  if (trimmed) {
    where.OR = [
      { itemName: { contains: trimmed, mode: "insensitive" } },
      { supplier: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.inventory.findMany({
    where,
    orderBy: [{ itemName: "asc" }],
    select: selectFields,
  });

  const dtos = rows.map(toDto);
  return query.lowStock ? dtos.filter((d) => d.status !== "OK") : dtos;
}

export async function getInventoryItem(
  clinicId: string,
  id: string,
): Promise<InventoryDto> {
  const row = await prisma.inventory.findFirst({
    where: { id, clinicId },
    select: selectFields,
  });
  if (!row) throw new AppError("Inventory item not found", 404, "INVENTORY_NOT_FOUND");
  return toDto(row);
}

export async function createInventoryItem(
  clinicId: string,
  body: CreateInventoryBody,
): Promise<InventoryDto> {
  const row = await prisma.inventory.create({
    data: {
      clinicId,
      itemName: body.itemName.trim(),
      category: body.category,
      unit: body.unit.trim(),
      quantity: body.quantity,
      minimumStock: body.minimumStock,
      unitCost: new Prisma.Decimal(body.unitCost.toFixed(2)),
      supplier: body.supplier?.trim() || null,
      expiryDate: body.expiryDate ?? null,
    },
    select: selectFields,
  });
  return toDto(row);
}

export async function updateInventoryItem(
  clinicId: string,
  id: string,
  body: UpdateInventoryBody,
): Promise<InventoryDto> {
  const existing = await prisma.inventory.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) throw new AppError("Inventory item not found", 404, "INVENTORY_NOT_FOUND");

  const data: Prisma.InventoryUpdateInput = {};
  if (body.itemName !== undefined) data.itemName = body.itemName.trim();
  if (body.category !== undefined) data.category = body.category;
  if (body.unit !== undefined) data.unit = body.unit.trim();
  if (body.quantity !== undefined) data.quantity = body.quantity;
  if (body.minimumStock !== undefined) data.minimumStock = body.minimumStock;
  if (body.unitCost !== undefined) data.unitCost = new Prisma.Decimal(body.unitCost.toFixed(2));
  if (body.supplier !== undefined) data.supplier = body.supplier?.trim() || null;
  if (body.expiryDate !== undefined) data.expiryDate = body.expiryDate;

  const row = await prisma.inventory.update({
    where: { id },
    data,
    select: selectFields,
  });
  return toDto(row);
}

export async function deleteInventoryItem(clinicId: string, id: string): Promise<void> {
  const existing = await prisma.inventory.findFirst({
    where: { id, clinicId },
    select: { id: true },
  });
  if (!existing) throw new AppError("Inventory item not found", 404, "INVENTORY_NOT_FOUND");
  await prisma.inventory.delete({ where: { id } });
}

export async function adjustInventory(
  clinicId: string,
  id: string,
  body: AdjustInventoryBody,
): Promise<InventoryDto> {
  const existing = await prisma.inventory.findFirst({
    where: { id, clinicId },
    select: { id: true, quantity: true, itemName: true },
  });
  if (!existing) throw new AppError("Inventory item not found", 404, "INVENTORY_NOT_FOUND");

  const nextQty = existing.quantity + body.change;
  if (nextQty < 0) {
    throw new AppError(
      `Stock cannot go below zero (current ${existing.quantity}, change ${body.change})`,
      409,
      "INVENTORY_INSUFFICIENT",
    );
  }

  const row = await prisma.inventory.update({
    where: { id },
    data: { quantity: nextQty },
    select: selectFields,
  });
  return toDto(row);
}

export interface InventoryAlerts {
  lowStock: InventoryDto[];
  expiringSoon: InventoryDto[];
  counts: {
    low: number;
    critical: number;
    expiring: number;
  };
}

export async function getInventoryAlerts(clinicId: string): Promise<InventoryAlerts> {
  const rows = await prisma.inventory.findMany({
    where: { clinicId },
    orderBy: [{ itemName: "asc" }],
    select: selectFields,
  });
  const all = rows.map(toDto);

  const lowStock = all.filter((d) => d.status !== "OK");
  const expiringSoon = all.filter(
    (d) => d.daysUntilExpiry !== null && d.daysUntilExpiry >= 0 && d.daysUntilExpiry <= 30,
  );

  return {
    lowStock,
    expiringSoon,
    counts: {
      low: lowStock.filter((d) => d.status === "LOW").length,
      critical: lowStock.filter((d) => d.status === "CRITICAL").length,
      expiring: expiringSoon.length,
    },
  };
}

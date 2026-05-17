import type { Request, Response } from "express";
import { z } from "zod";

import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryAlerts,
  getInventoryItem,
  listInventory,
  updateInventoryItem,
} from "../services/inventory.service.js";
import { importInventoryFromCsv } from "../services/inventoryImport.service.js";
import { listInventoryHistory, logInventoryTransaction } from "../services/inventoryAudit.service.js";
import { AppError } from "../utils/errors.js";
import {
  adjustInventoryBodySchema,
  createInventoryBodySchema,
  listInventoryQuerySchema,
  updateInventoryBodySchema,
} from "../validation/inventory.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listInventoryHandler(req: Request, res: Response): Promise<void> {
  const q = listInventoryQuerySchema.parse(req.query);
  const items = await listInventory(clinicId(req), q);
  res.json({ success: true, data: items });
}

export async function getInventoryAlertsHandler(req: Request, res: Response): Promise<void> {
  const alerts = await getInventoryAlerts(clinicId(req));
  res.json({ success: true, data: alerts });
}

export async function getInventoryHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const item = await getInventoryItem(clinicId(req), id);
  res.json({ success: true, data: item });
}

export async function createInventoryHandler(req: Request, res: Response): Promise<void> {
  const body = createInventoryBodySchema.parse(req.body);
  const item = await createInventoryItem(clinicId(req), body);
  res.status(201).json({ success: true, data: item });
}

export async function importInventoryCsvHandler(req: Request, res: Response): Promise<void> {
  if (!req.file?.buffer?.length) {
    throw new AppError("CSV file required", 400, "FILE_REQUIRED");
  }
  const result = await importInventoryFromCsv(
    clinicId(req),
    req.file.buffer.toString("utf-8"),
  );
  res.json({ success: true, data: result });
}

export async function updateInventoryHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateInventoryBodySchema.parse(req.body);
  const item = await updateInventoryItem(clinicId(req), id, body);
  res.json({ success: true, data: item });
}

export async function deleteInventoryHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  await deleteInventoryItem(clinicId(req), id);
  res.json({ success: true, data: { id } });
}

export async function adjustInventoryHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = adjustInventoryBodySchema.parse(req.body);
  
  // Use auditing service instead of basic adjust
  const { inventory } = await logInventoryTransaction({
    inventoryId: id,
    userId: req.user?.id,
    type: body.change >= 0 ? "IN" : "OUT",
    quantity: body.change,
    reason: body.reason || "Manual Adjustment",
  });

  res.json({ success: true, data: inventory });
}

export async function getInventoryHistoryHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const history = await listInventoryHistory(id);
  res.json({ success: true, data: history });
}

import type { Request, Response } from "express";
import { z } from "zod";

import {
  createWaitlistEntry,
  listWaitlistEntries,
  patchWaitlistEntry,
} from "../services/waitlist.service.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import {
  createWaitlistBodySchema,
  listWaitlistQuerySchema,
  patchWaitlistBodySchema,
} from "../validation/waitlist.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listWaitlistHandler(req: Request, res: Response): Promise<void> {
  const query = listWaitlistQuerySchema.parse(req.query);
  const items = await listWaitlistEntries(clinicId(req), query);
  const payload: ApiSuccess<typeof items> = { success: true, data: items };
  res.json(payload);
}

export async function createWaitlistHandler(req: Request, res: Response): Promise<void> {
  const body = createWaitlistBodySchema.parse(req.body);
  const item = await createWaitlistEntry(clinicId(req), body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.status(201).json(payload);
}

export async function patchWaitlistHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = patchWaitlistBodySchema.parse(req.body);
  const item = await patchWaitlistEntry(clinicId(req), id, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

import type { Request, Response } from "express";
import { z } from "zod";

import {
  getMedicalHistory,
  upsertMedicalHistory,
} from "../services/medicalHistory.service.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import { medicalHistoryUpsertSchema } from "../validation/medicalHistory.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

function userId(req: Request): string {
  const id = req.user?.id;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function getMedicalHistoryHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const record = await getMedicalHistory(clinicId(req), patientId);
  const payload: ApiSuccess<typeof record> = { success: true, data: record };
  res.json(payload);
}

export async function upsertMedicalHistoryHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const body = medicalHistoryUpsertSchema.parse(req.body);
  const record = await upsertMedicalHistory(clinicId(req), patientId, userId(req), body);
  const payload: ApiSuccess<typeof record> = { success: true, data: record };
  res.status(201).json(payload);
}

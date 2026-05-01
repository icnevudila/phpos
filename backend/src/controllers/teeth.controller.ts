import type { Request, Response } from "express";
import { z } from "zod";

import { listTeeth, listToothHistory, upsertTooth } from "../services/teeth.service.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import { toothNumberParamSchema, upsertToothBodySchema } from "../validation/teeth.schemas.js";

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

export async function listTeethHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const teeth = await listTeeth(clinicId(req), patientId);
  const payload: ApiSuccess<typeof teeth> = { success: true, data: teeth };
  res.json(payload);
}

export async function upsertToothHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const toothNumber = toothNumberParamSchema.parse(req.params.toothNumber);
  const body = upsertToothBodySchema.parse(req.body);
  const tooth = await upsertTooth(clinicId(req), patientId, toothNumber, body, userId(req));
  const payload: ApiSuccess<typeof tooth> = { success: true, data: tooth };
  res.json(payload);
}

export async function listToothHistoryHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const history = await listToothHistory(clinicId(req), patientId);
  const payload: ApiSuccess<typeof history> = { success: true, data: history };
  res.json(payload);
}

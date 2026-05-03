import type { Request, Response } from "express";
import { getDailyEodSummary } from "../services/eod.service.js";
import { AppError } from "../utils/errors.js";

export async function getEodSummaryHandler(req: Request, res: Response): Promise<void> {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const dateStr = req.query.date as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  const data = await getDailyEodSummary(clinicId, date);
  res.json({ success: true, data });
}

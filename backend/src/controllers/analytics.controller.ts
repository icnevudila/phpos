import type { Request, Response } from "express";
import { getAnalyticsOverview } from "../services/analytics.service.js";
import { getLiveQueue } from "../services/reports.service.js";
import { AppError } from "../utils/errors.js";

export async function getAnalyticsOverviewHandler(req: Request, res: Response): Promise<void> {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const data = await getAnalyticsOverview(clinicId);
  res.json({ success: true, data });
}

export async function getQueueHandler(req: Request, res: Response): Promise<void> {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

  const data = await getLiveQueue(clinicId);
  res.json({ success: true, data });
}

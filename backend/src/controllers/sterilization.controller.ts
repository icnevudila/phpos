import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createSterilizationLog,
  listSterilizationLogs,
} from "../services/sterilization.service.js";
import { createSterilizationLogSchema } from "../validation/sterilization.schemas.js";

export const handleListSterilizationLogs = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const logs = await listSterilizationLogs(clinicId);
  res.json({ success: true, data: logs });
});

export const handleCreateSterilizationLog = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const body = createSterilizationLogSchema.parse(req.body);
  const log = await createSterilizationLog(clinicId, body);
  res.status(201).json({ success: true, data: log });
});

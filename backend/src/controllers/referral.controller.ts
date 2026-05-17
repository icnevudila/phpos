import type { Request, Response } from "express";
import {
  createPatientReferral,
  listPatientReferrals,
} from "../services/referral.service.js";
import { createPatientReferralSchema } from "../validation/referral.schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const handleListPatientReferrals = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { patientId } = req.params;
  const rows = await listPatientReferrals(clinicId, patientId);
  res.json(rows);
});

export const handleCreatePatientReferral = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId, id: userId } = req.user!;
  const data = createPatientReferralSchema.parse(req.body);
  const row = await createPatientReferral(clinicId, userId, data);
  res.status(201).json(row);
});

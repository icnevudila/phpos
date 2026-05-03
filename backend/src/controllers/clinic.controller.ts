import type { Request, Response } from "express";
import { z } from "zod";

import { getClinicById, updateClinic } from "../services/clinic.service.js";
import { AppError } from "../utils/errors.js";
import type { ApiSuccess } from "../types/auth.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  logoUrl: z.union([z.string().url().max(2000), z.literal("")]).nullable().optional(),
  tin: z.string().max(30).nullable().optional(),
  birPtuNo: z.string().max(50).nullable().optional(),
  birAccreditationNo: z.string().max(50).nullable().optional(),
});

export async function getClinicHandler(req: Request, res: Response): Promise<void> {
  const data = await getClinicById(clinicId(req));
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.json(payload);
}

export async function patchClinicHandler(req: Request, res: Response): Promise<void> {
  const body = patchSchema.parse(req.body);
  const normalized = {
    ...body,
    logoUrl: body.logoUrl === "" ? null : body.logoUrl,
  };
  const data = await updateClinic(clinicId(req), normalized);
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.json(payload);
}

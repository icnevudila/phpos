import type { Request, Response } from "express";
import { z } from "zod";

import {
  createFamilyForPatient,
  getPatientFamily,
  linkPatientToFamily,
  unlinkPatientFromFamily,
} from "../services/family.service.js";
import { AppError } from "../utils/errors.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const createFamilySchema = z.object({
  name: z.string().trim().max(120).optional(),
});

const linkMemberSchema = z.object({
  patientId: z.string().min(1),
});

export async function getPatientFamilyHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const data = await getPatientFamily(clinicId(req), patientId);
  res.json({ success: true, data });
}

export async function createPatientFamilyHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const body = createFamilySchema.parse(req.body ?? {});
  const data = await createFamilyForPatient(clinicId(req), patientId, body.name ?? "");
  res.status(201).json({ success: true, data });
}

export async function linkFamilyMemberHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const { patientId: memberId } = linkMemberSchema.parse(req.body);
  const data = await linkPatientToFamily(clinicId(req), patientId, memberId);
  res.json({ success: true, data });
}

export async function unlinkFamilyMemberHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const memberId = z.string().min(1).parse(req.params.memberId);
  const data = await unlinkPatientFromFamily(clinicId(req), patientId, memberId);
  res.json({ success: true, data });
}

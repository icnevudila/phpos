import type { Request, Response } from "express";
import { z } from "zod";

import {
  createTreatment,
  deleteTreatment,
  listTreatmentsByAppointment,
  listTreatmentsByPatient,
  updateTreatment,
} from "../services/treatment.service.js";
import { finalizeTreatmentsToInvoice } from "../services/invoice.service.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import {
  createTreatmentSchema,
  updateTreatmentSchema,
} from "../validation/treatment.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listByAppointmentHandler(req: Request, res: Response): Promise<void> {
  const apptId = z.string().min(1).parse(req.params.appointmentId);
  const items = await listTreatmentsByAppointment(clinicId(req), apptId);
  const payload: ApiSuccess<typeof items> = { success: true, data: items };
  res.json(payload);
}

export async function listByPatientHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const items = await listTreatmentsByPatient(clinicId(req), patientId);
  const payload: ApiSuccess<typeof items> = { success: true, data: items };
  res.json(payload);
}

export async function createTreatmentHandler(req: Request, res: Response): Promise<void> {
  const apptId = z.string().min(1).parse(req.params.appointmentId);
  const body = createTreatmentSchema.parse(req.body);
  const item = await createTreatment(clinicId(req), apptId, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.status(201).json(payload);
}

export async function updateTreatmentHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateTreatmentSchema.parse(req.body);
  const item = await updateTreatment(clinicId(req), id, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function deleteTreatmentHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  await deleteTreatment(clinicId(req), id);
  const payload: ApiSuccess<{ ok: true }> = { success: true, data: { ok: true } };
  res.json(payload);
}

export async function finalizeAppointmentTreatmentsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const apptId = z.string().min(1).parse(req.params.appointmentId);
  const item = await finalizeTreatmentsToInvoice(clinicId(req), apptId);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

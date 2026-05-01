import type { Request, Response } from "express";
import { z } from "zod";

import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  listAppointments,
  listDentists,
  patchAppointmentStatus,
  sendAppointmentQueueAlert,
  updateAppointment,
} from "../services/appointment.service.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import {
  createAppointmentBodySchema,
  listAppointmentsQuerySchema,
  patchAppointmentStatusBodySchema,
  sendAppointmentQueueAlertBodySchema,
  updateAppointmentBodySchema,
} from "../validation/appointment.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listAppointmentsHandler(req: Request, res: Response): Promise<void> {
  const query = listAppointmentsQuerySchema.parse(req.query);
  const items = await listAppointments(clinicId(req), query);
  const payload: ApiSuccess<typeof items> = { success: true, data: items };
  res.json(payload);
}

export async function getAppointmentHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const item = await getAppointment(clinicId(req), id);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function createAppointmentHandler(req: Request, res: Response): Promise<void> {
  const body = createAppointmentBodySchema.parse(req.body);
  const item = await createAppointment(clinicId(req), body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.status(201).json(payload);
}

export async function updateAppointmentHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updateAppointmentBodySchema.parse(req.body);
  const item = await updateAppointment(clinicId(req), id, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function patchAppointmentStatusHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = patchAppointmentStatusBodySchema.parse(req.body);
  const item = await patchAppointmentStatus(clinicId(req), id, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function deleteAppointmentHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  await deleteAppointment(clinicId(req), id);
  const payload: ApiSuccess<{ id: string }> = { success: true, data: { id } };
  res.json(payload);
}

export async function sendAppointmentQueueAlertHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = sendAppointmentQueueAlertBodySchema.parse(req.body);
  const item = await sendAppointmentQueueAlert(clinicId(req), id, body);
  const payload: ApiSuccess<typeof item> = { success: true, data: item };
  res.json(payload);
}

export async function listDentistsHandler(req: Request, res: Response): Promise<void> {
  const items = await listDentists(clinicId(req));
  const payload: ApiSuccess<typeof items> = { success: true, data: items };
  res.json(payload);
}

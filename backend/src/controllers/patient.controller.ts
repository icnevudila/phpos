import type { Request, Response } from "express";
import { z } from "zod";

import {
  addPatientFile,
  createPatient,
  getPatientById,
  getPatientFileDownload,
  listPatientFiles,
  listPatients,
  softDeletePatient,
  updatePatient,
  updatePatientFileAnnotations,
} from "../services/patient.service.js";
import type { ApiSuccess } from "../types/auth.js";
import {
  createPatientBodySchema,
  listPatientsQuerySchema,
  updatePatientBodySchema,
} from "../validation/patient.schemas.js";
import { AppError } from "../utils/errors.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
  return id;
}

export async function listPatientsHandler(req: Request, res: Response): Promise<void> {
  const query = listPatientsQuerySchema.parse(req.query);
  const result = await listPatients(clinicId(req), query);
  const payload: ApiSuccess<typeof result> = { success: true, data: result };
  res.json(payload);
}

export async function getPatientHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const patient = await getPatientById(clinicId(req), id);
  const payload: ApiSuccess<typeof patient> = { success: true, data: patient };
  res.json(payload);
}

export async function createPatientHandler(req: Request, res: Response): Promise<void> {
  const body = createPatientBodySchema.parse(req.body);
  const created = await createPatient(clinicId(req), body);
  const payload: ApiSuccess<typeof created> = { success: true, data: created };
  res.status(201).json(payload);
}

export async function updatePatientHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = updatePatientBodySchema.parse(req.body);
  const updated = await updatePatient(clinicId(req), id, body);
  const payload: ApiSuccess<typeof updated> = { success: true, data: updated };
  res.json(payload);
}

export async function deletePatientHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  await softDeletePatient(clinicId(req), id);
  const payload: ApiSuccess<{ ok: true }> = { success: true, data: { ok: true } };
  res.json(payload);
}

export async function listFilesHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const files = await listPatientFiles(clinicId(req), id);
  const payload: ApiSuccess<typeof files> = { success: true, data: files };
  res.json(payload);
}

/** JWT + clinic doğrulaması sonrası dosya içeriği (GAP-001 — artık public /files/patient-uploads yok) */
export async function downloadFileHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const fileId = z.string().min(1).parse(req.params.fileId);
  const { buffer, fileName, mimeType } = await getPatientFileDownload(clinicId(req), patientId, fileId);
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
  res.end(buffer);
}

export async function updatePatientFileAnnotationsHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const fileId = z.string().min(1).parse(req.params.fileId);
  const { annotations } = req.body;
  const updated = await updatePatientFileAnnotations(clinicId(req), patientId, fileId, annotations);
  const payload: ApiSuccess<typeof updated> = { success: true, data: updated };
  res.json(payload);
}

export async function uploadFileHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const file = req.file;
  if (!file?.buffer) {
    res.status(400).json({
      success: false,
      error: "File is required (field name: file)",
      code: "FILE_REQUIRED",
    });
    return;
  }
  const created = await addPatientFile(clinicId(req), id, {
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });
  const payload: ApiSuccess<typeof created> = { success: true, data: created };
  res.status(201).json(payload);
}

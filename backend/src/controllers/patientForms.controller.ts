import type { Request, Response } from "express";
import { z } from "zod";

import {
  generateDentalRecordPdf,
  generateInformedConsentPdf,
  generateMedicalHistoryPdf,
  generateOrthodonticRecordPdf,
  generateTreatmentRecordPdf,
} from "../services/patientFormsPdf.js";
import { AppError } from "../utils/errors.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

function patientIdParam(req: Request): string {
  return z.string().min(1).parse(req.params.id);
}

function sendPdf(res: Response, buffer: Buffer, filename: string): void {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Cache-Control", "private, no-store");
  res.send(buffer);
}

export async function dentalRecordPdfHandler(req: Request, res: Response): Promise<void> {
  const buf = await generateDentalRecordPdf(clinicId(req), patientIdParam(req));
  sendPdf(res, buf, `dental-record-${patientIdParam(req)}.pdf`);
}

export async function medicalHistoryPdfHandler(req: Request, res: Response): Promise<void> {
  const buf = await generateMedicalHistoryPdf(clinicId(req), patientIdParam(req));
  sendPdf(res, buf, `medical-history-${patientIdParam(req)}.pdf`);
}

export async function treatmentRecordPdfHandler(req: Request, res: Response): Promise<void> {
  const buf = await generateTreatmentRecordPdf(clinicId(req), patientIdParam(req));
  sendPdf(res, buf, `treatment-record-${patientIdParam(req)}.pdf`);
}

export async function informedConsentPdfHandler(req: Request, res: Response): Promise<void> {
  const buf = await generateInformedConsentPdf(clinicId(req), patientIdParam(req));
  sendPdf(res, buf, `informed-consent-${patientIdParam(req)}.pdf`);
}

export async function orthodonticRecordPdfHandler(req: Request, res: Response): Promise<void> {
  const buf = await generateOrthodonticRecordPdf(clinicId(req), patientIdParam(req));
  sendPdf(res, buf, `orthodontic-record-${patientIdParam(req)}.pdf`);
}

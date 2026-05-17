import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateDentalRecordPdf,
  generateMedicalHistoryPdf,
  generateTreatmentRecordPdf,
  generateInformedConsentPdf,
  generateOrthodonticRecordPdf,
  generateMedicalCertificatePdf,
  generateReferralLetterPdf,
  generateLabOrderPdf,
  generateSoaPdf,
  generateTreatmentPlanPdf,
} from "../services/patientFormsPdf.js";

export const dentalRecordPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const buffer = await generateDentalRecordPdf(clinicId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const medicalHistoryPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const buffer = await generateMedicalHistoryPdf(clinicId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const treatmentRecordPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const buffer = await generateTreatmentRecordPdf(clinicId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const informedConsentPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const buffer = await generateInformedConsentPdf(clinicId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const orthodonticRecordPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const buffer = await generateOrthodonticRecordPdf(clinicId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const medCertPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId, id: dentistId } = req.user!;
  const { id } = req.params;
  const { content } = req.query;
  const buffer = await generateMedicalCertificatePdf(clinicId, id, content as string, dentistId);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const referralPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const { to, reason } = req.query;
  const buffer = await generateReferralLetterPdf(clinicId, id, to as string, reason as string);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const labOrderPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { labOrderId } = req.params;
  const buffer = await generateLabOrderPdf(clinicId, labOrderId);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const soaPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const buffer = await generateSoaPdf(clinicId, id);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

export const treatmentPlanPdfHandler = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const { phases } = req.body; // Usually POST for complex plans
  const buffer = await generateTreatmentPlanPdf(clinicId, id, phases);
  res.setHeader("Content-Type", "application/pdf");
  res.end(buffer);
});

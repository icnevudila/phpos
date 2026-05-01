import { Request, Response } from "express";
import {
  createPrescription,
  getPrescriptionById,
  getPrescriptionsByPatient,
  updateDentistLicenses,
} from "../services/prescription.service.js";
import {
  createPrescriptionSchema,
  updateDentistLicenseSchema,
} from "../validation/prescription.schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generatePrescriptionPdf } from "../services/prescriptionPdf.js";

export const handleCreatePrescription = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId, id: userId } = req.user!;
  const data = createPrescriptionSchema.parse(req.body);

  const prescription = await createPrescription(clinicId, userId, data);
  res.status(201).json(prescription);
});

export const handleGetPatientPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { patientId } = req.params;

  const prescriptions = await getPrescriptionsByPatient(clinicId, patientId);
  res.json(prescriptions);
});

export const handleGetPrescription = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;

  const prescription = await getPrescriptionById(clinicId, id);
  res.json(prescription);
});

export const handleUpdateLicenses = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId, id: userId } = req.user!;
  const data = updateDentistLicenseSchema.parse(req.body);

  const user = await updateDentistLicenses(userId, clinicId, data);
  res.json({
    id: user.id,
    prcNumber: user.prcNumber,
    ptrNumber: user.ptrNumber,
    s2License: user.s2License,
    tinNumber: user.tinNumber,
  });
});

export const handleDownloadPrescriptionPdf = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;

  const prescription = await getPrescriptionById(clinicId, id);
  const pdfBuffer = await generatePrescriptionPdf(prescription);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="prescription-${prescription.id}.pdf"`);
  res.send(pdfBuffer);
});

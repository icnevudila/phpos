import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createConsentForm,
  getConsentFormById,
  getConsentFormsByPatient,
  signConsentForm,
} from "../services/consent.service.js";
import {
  createConsentFormSchema,
  signConsentFormSchema,
} from "../validation/consent.schemas.js";

export const handleCreateConsent = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const data = createConsentFormSchema.parse(req.body);

  const form = await createConsentForm(clinicId, data);
  res.status(201).json(form);
});

export const handleGetPatientConsents = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { patientId } = req.params;

  const forms = await getConsentFormsByPatient(clinicId, patientId);
  res.json(forms);
});

export const handleGetConsent = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;

  const form = await getConsentFormById(clinicId, id);
  res.json(form);
});

export const handleSignConsent = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const data = signConsentFormSchema.parse(req.body);
  const ip = req.ip || "";
  const ua = req.headers["user-agent"] || "";

  const form = await signConsentForm(clinicId, id, data, ip, ua);
  res.json(form);
});

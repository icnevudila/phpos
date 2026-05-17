import { z } from "zod";

export const createConsentFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const signConsentFormSchema = z.object({
  signatureUrl: z.string().min(1, "Signature is required"),
});

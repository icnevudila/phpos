import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  specialInstructions: z.string().optional(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().cuid("Invalid patient ID"),
  appointmentId: z.string().cuid("Invalid appointment ID").optional(),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine is required"),
});

export const updateDentistLicenseSchema = z.object({
  prcNumber: z.string().optional(),
  ptrNumber: z.string().optional(),
  s2License: z.string().optional(),
  tinNumber: z.string().optional(),
});

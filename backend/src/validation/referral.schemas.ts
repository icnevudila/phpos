import { z } from "zod";

export const createPatientReferralSchema = z.object({
  patientId: z.string().min(1),
  referredTo: z.string().optional(),
  specialty: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

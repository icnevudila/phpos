import { z } from "zod";

export const createSoapNoteSchema = z.object({
  patientId: z.string().min(1),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

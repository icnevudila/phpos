import { z } from "zod";
import { SterilizationStatus } from "@prisma/client";

export const createSterilizationLogSchema = z.object({
  autoclaveName: z.string().min(1),
  cycleNumber: z.number().int().positive(),
  temperature: z.number(),
  pressure: z.number(),
  durationMinutes: z.number().int().positive(),
  operatorId: z.string().min(1).max(64),
  status: z.nativeEnum(SterilizationStatus).optional(),
  biologicalIndicator: z.boolean().optional(),
  notes: z.string().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export type CreateSterilizationLogInput = z.infer<typeof createSterilizationLogSchema>;

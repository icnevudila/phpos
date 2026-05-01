import { z } from "zod";

export const listWaitlistQuerySchema = z.object({
  scope: z.enum(["active", "all"]).optional().default("active"),
});

export type ListWaitlistQuery = z.infer<typeof listWaitlistQuerySchema>;

export const createWaitlistBodySchema = z.object({
  patientId: z.string().min(1),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateWaitlistBody = z.infer<typeof createWaitlistBodySchema>;

export const patchWaitlistBodySchema = z.object({
  status: z.enum(["FULFILLED", "CANCELLED"]),
});

export type PatchWaitlistBody = z.infer<typeof patchWaitlistBodySchema>;

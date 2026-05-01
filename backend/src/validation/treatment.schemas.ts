import { z } from "zod";

export const PROCEDURE_CODES = [
  "EXTRACTION",
  "FILLING",
  "CLEANING",
  "ROOT_CANAL",
  "CROWN",
  "WHITENING",
  "CONSULTATION",
  "XRAY",
  "OTHER",
] as const;

export type ProcedureCode = (typeof PROCEDURE_CODES)[number];

const nonEmptyString = z.string().trim().min(1);

export const createTreatmentSchema = z.object({
  procedure: z.enum(PROCEDURE_CODES),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  toothIds: z.array(nonEmptyString).max(32).default([]),
  notes: z
    .preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().optional()),
});

export const updateTreatmentSchema = z
  .object({
    procedure: z.enum(PROCEDURE_CODES).optional(),
    quantity: z.coerce.number().int().min(1).optional(),
    unitPrice: z.coerce.number().min(0).optional(),
    toothIds: z.array(nonEmptyString).max(32).optional(),
    notes: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.string().optional(),
    ),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "At least one field required" });

export type CreateTreatmentInput = z.infer<typeof createTreatmentSchema>;
export type UpdateTreatmentInput = z.infer<typeof updateTreatmentSchema>;

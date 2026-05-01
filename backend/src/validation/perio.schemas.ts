import { PerioSiteCode } from "@prisma/client";
import { z } from "zod";

export const PERIO_SITE_CODES = [
  PerioSiteCode.MB,
  PerioSiteCode.B,
  PerioSiteCode.DB,
  PerioSiteCode.ML,
  PerioSiteCode.L,
  PerioSiteCode.DL,
] as const;

const perioSiteSchema = z.object({
  siteCode: z.nativeEnum(PerioSiteCode),
  pocketDepth: z.number().int().min(0).max(15),
  recession: z.number().int().min(0).max(15).default(0),
  bleeding: z.boolean().default(false),
  suppuration: z.boolean().default(false),
  plaque: z.boolean().default(false),
});

const perioToothSchema = z.object({
  toothNumber: z.number().int().min(1).max(32),
  mobility: z.number().int().min(0).max(3).nullable().optional(),
  furcation: z.number().int().min(0).max(3).nullable().optional(),
  missing: z.boolean().default(false),
  notes: z.string().max(500).nullable().optional(),
  sites: z.array(perioSiteSchema).max(6),
});

export const perioExamCreateSchema = z.object({
  examDate: z.coerce.date().optional(),
  notes: z.string().max(2000).nullable().optional(),
  teeth: z.array(perioToothSchema).min(1).max(32),
});

export const perioExamUpdateSchema = perioExamCreateSchema.partial().extend({
  teeth: z.array(perioToothSchema).max(32).optional(),
});

export type PerioExamCreateInput = z.infer<typeof perioExamCreateSchema>;
export type PerioExamUpdateInput = z.infer<typeof perioExamUpdateSchema>;
export type PerioToothInput = z.infer<typeof perioToothSchema>;
export type PerioSiteInput = z.infer<typeof perioSiteSchema>;

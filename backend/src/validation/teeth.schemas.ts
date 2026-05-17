import { ToothCondition } from "@prisma/client";
import { z } from "zod";

export const toothSurfaceEnum = z.enum(["MESIAL", "DISTAL", "BUCCAL", "LINGUAL", "OCCLUSAL"]);
export type ToothSurfaceValue = z.infer<typeof toothSurfaceEnum>;

export const upsertToothBodySchema = z.object({
  condition: z.nativeEnum(ToothCondition),
  surfaces: z.array(toothSurfaceEnum).default([]),
  notes: z.string().max(2000).optional(),
});

export type UpsertToothBody = z.infer<typeof upsertToothBodySchema>;

export const toothNumberParamSchema = z.coerce.number().int().min(1).max(32);

export const batchUpsertTeethBodySchema = z.object({
  updates: z
    .array(
      z.object({
        toothNumber: toothNumberParamSchema,
        condition: z.nativeEnum(ToothCondition),
        surfaces: z.array(toothSurfaceEnum).default([]),
        notes: z.string().max(2000).optional(),
      }),
    )
    .min(1)
    .max(32),
});

export type BatchUpsertTeethBody = z.infer<typeof batchUpsertTeethBodySchema>;

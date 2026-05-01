import { z } from "zod";

export const INVENTORY_CATEGORIES = [
  "Anesthetics",
  "Filling Materials",
  "Disposables",
  "Instruments",
  "Medications",
  "Other",
] as const;

export const inventoryCategoryEnum = z.enum(INVENTORY_CATEGORIES);

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid ISO date")
  .transform((v) => new Date(v));

export const listInventoryQuerySchema = z.object({
  category: inventoryCategoryEnum.optional(),
  lowStock: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  q: z.string().max(80).optional(),
});

export const createInventoryBodySchema = z.object({
  itemName: z.string().min(1).max(120),
  category: inventoryCategoryEnum,
  unit: z.string().min(1).max(20),
  quantity: z.number().int().nonnegative().default(0),
  minimumStock: z.number().int().nonnegative().default(0),
  unitCost: z.number().nonnegative().max(10_000_000),
  supplier: z.string().max(120).optional().nullable(),
  expiryDate: isoDate.optional().nullable(),
});

export const updateInventoryBodySchema = createInventoryBodySchema.partial().refine(
  (v) => Object.values(v).some((x) => x !== undefined),
  "At least one field required",
);

export const adjustInventoryBodySchema = z.object({
  change: z
    .number()
    .int()
    .refine((v) => v !== 0, "Change must be non-zero"),
  reason: z.string().min(1).max(200),
});

export type ListInventoryQuery = z.infer<typeof listInventoryQuerySchema>;
export type CreateInventoryBody = z.infer<typeof createInventoryBodySchema>;
export type UpdateInventoryBody = z.infer<typeof updateInventoryBodySchema>;
export type AdjustInventoryBody = z.infer<typeof adjustInventoryBodySchema>;
export type InventoryCategory = z.infer<typeof inventoryCategoryEnum>;

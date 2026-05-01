import { z } from "zod";

export const hmoClaimStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "PARTIAL_APPROVED",
  "REJECTED",
  "PAID",
]);

const cuid = z.string().min(1).max(64);

export const createHmoProviderSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(20),
  contactPhone: z.string().max(40).optional(),
  contactEmail: z.string().email().max(200).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export const updateHmoProviderSchema = createHmoProviderSchema.partial().refine(
  (v) => Object.values(v).some((x) => x !== undefined),
  "At least one field is required",
);

export const listHmoClaimsQuerySchema = z.object({
  status: hmoClaimStatusEnum.optional(),
  providerId: cuid.optional(),
  patientId: cuid.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const createHmoClaimSchema = z.object({
  patientId: cuid,
  invoiceId: cuid,
  providerId: cuid,
  /** Seçilen hasta üyelik kaydı (provider ile eşleşmeli) */
  patientHmoId: cuid.optional(),
  /** Fatura randevusundaki tedavi satırları; faturada satır varsa zorunlu */
  treatmentIds: z.array(cuid).optional().default([]),
  requestedAmount: z.number().min(0),
  approvedAmount: z.number().min(0).optional(),
  patientCopay: z.number().min(0).default(0),
  status: hmoClaimStatusEnum.default("DRAFT"),
  externalRef: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateHmoClaimSchema = z
  .object({
    status: hmoClaimStatusEnum.optional(),
    requestedAmount: z.number().min(0).optional(),
    approvedAmount: z.number().min(0).nullable().optional(),
    patientCopay: z.number().min(0).optional(),
    externalRef: z.string().max(120).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), "At least one field is required");

export const createPatientHmoSchema = z.object({
  providerId: cuid,
  memberNumber: z.string().min(2).max(120),
  cardholderName: z.string().max(120).optional(),
  sponsor: z.string().max(120).optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  isPrimary: z.boolean().default(true),
});

export const updatePatientHmoSchema = createPatientHmoSchema
  .partial()
  .refine((v) => Object.values(v).some((x) => x !== undefined), "At least one field is required");

export const hmoClaimAttachmentKindSchema = z.preprocess(
  (v) => (v === "LOA" || v === "PREAUTH" || v === "OTHER" ? v : "OTHER"),
  z.enum(["LOA", "PREAUTH", "OTHER"]),
);

export type CreateHmoProviderInput = z.infer<typeof createHmoProviderSchema>;
export type UpdateHmoProviderInput = z.infer<typeof updateHmoProviderSchema>;
export type ListHmoClaimsQuery = z.infer<typeof listHmoClaimsQuerySchema>;
export type CreateHmoClaimInput = z.infer<typeof createHmoClaimSchema>;
export type UpdateHmoClaimInput = z.infer<typeof updateHmoClaimSchema>;
export type CreatePatientHmoInput = z.infer<typeof createPatientHmoSchema>;
export type UpdatePatientHmoInput = z.infer<typeof updatePatientHmoSchema>;
export type HmoClaimAttachmentKind = z.infer<typeof hmoClaimAttachmentKindSchema>;

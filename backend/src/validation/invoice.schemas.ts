import { z } from "zod";

export const paymentMethodEnum = z.enum([
  "CASH",
  "GCASH",
  "MAYA",
  "CREDIT_CARD",
  "CHEQUE",
  "PHILHEALTH",
]);

export const invoiceStatusEnum = z.enum(["UNPAID", "PARTIAL", "PAID"]);

const cuid = z.string().min(1).max(64);

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid ISO date")
  .transform((v) => new Date(v));

export const listInvoicesQuerySchema = z.object({
  patientId: cuid.optional(),
  status: invoiceStatusEnum.optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q: z.string().max(80).optional(),
  /** `1` veya `true`: en az bir HMO talebi DRAFT / SUBMITTED / PARTIAL_APPROVED olan faturalar */
  openHmoClaim: z.enum(["1", "true"]).optional(),
});

export const createInvoiceBodySchema = z.object({
  appointmentId: cuid,
  discount: z.number().nonnegative().max(10_000_000).optional(),
  dueDate: isoDate.optional(),
  notes: z.string().max(2000).optional(),
});

export const updateInvoiceBodySchema = z
  .object({
    discount: z.number().nonnegative().max(10_000_000).optional(),
    dueDate: isoDate.optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), "At least one field required");

export const createPaymentBodySchema = z.object({
  amount: z.number().positive().max(10_000_000),
  method: paymentMethodEnum,
  referenceNo: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
});

export const paymongoBodySchema = z.object({
  method: z.enum(["GCASH", "MAYA"]).default("GCASH"),
  description: z.string().max(200).optional(),
  redirectUrl: z.string().url().optional(),
});

export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
export type CreateInvoiceBody = z.infer<typeof createInvoiceBodySchema>;
export type UpdateInvoiceBody = z.infer<typeof updateInvoiceBodySchema>;
export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>;
export type PaymongoBody = z.infer<typeof paymongoBodySchema>;

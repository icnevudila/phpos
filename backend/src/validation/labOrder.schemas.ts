import { z } from "zod";

export const labOrderStatusSchema = z.enum([
  "ORDERED",
  "SENT_TO_LAB",
  "RECEIVED",
  "COMPLETED",
  "CANCELLED",
]);

export const createLabOrderSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  labName: z.string().optional(),
  itemDescription: z.string().min(1, "Item description is required"),
  shade: z.string().optional(),
  mould: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  cost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const updateLabOrderStatusSchema = z.object({
  status: labOrderStatusSchema,
  notes: z.string().optional(),
  receivedDate: z.string().datetime().optional().nullable(),
});

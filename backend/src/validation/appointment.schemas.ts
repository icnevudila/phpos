import { z } from "zod";

export const appointmentTypeEnum = z.enum([
  "CHECKUP",
  "CLEANING",
  "EXTRACTION",
  "FILLING",
  "ROOT_CANAL",
  "ORTHODONTIC",
  "WHITENING",
  "CONSULTATION",
  "XRAY",
  "OTHER",
]);
export type AppointmentType = z.infer<typeof appointmentTypeEnum>;

export const appointmentStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);
export type AppointmentStatusInput = z.infer<typeof appointmentStatusEnum>;

const isoDateTime = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid ISO datetime")
  .transform((v) => new Date(v));

const cuid = z.string().min(1).max(64);

export const createAppointmentBodySchema = z.object({
  patientId: cuid,
  dentistId: cuid,
  scheduledAt: isoDateTime,
  duration: z.number().int().min(5).max(480).optional(),
  type: appointmentTypeEnum.default("CHECKUP"),
  chairNo: z.string().trim().min(1).max(40).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateAppointmentBodySchema = z
  .object({
    patientId: cuid.optional(),
    dentistId: cuid.optional(),
    scheduledAt: isoDateTime.optional(),
    duration: z.number().int().min(5).max(480).optional(),
    type: appointmentTypeEnum.optional(),
    chairNo: z.string().trim().min(1).max(40).nullable().optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (v) =>
      Object.values(v).some((x) => x !== undefined),
    "At least one field must be provided",
  );

export const patchAppointmentStatusBodySchema = z.object({
  status: appointmentStatusEnum,
  cancellationReason: z.string().max(500).optional(),
});

export const sendAppointmentQueueAlertBodySchema = z.object({
  message: z.string().min(1).max(160).optional(),
});

export const listAppointmentsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dentistId: cuid.optional(),
  patientId: cuid.optional(),
  status: appointmentStatusEnum.optional(),
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentBodySchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentBodySchema>;
export type PatchAppointmentStatusBody = z.infer<typeof patchAppointmentStatusBodySchema>;
export type SendAppointmentQueueAlertBody = z.infer<typeof sendAppointmentQueueAlertBodySchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

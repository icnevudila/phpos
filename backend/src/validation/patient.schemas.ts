import { BloodType, CivilStatus, Gender } from "@prisma/client";
import { z } from "zod";

/** Filipin cep: +63 ve ardından 10 rakam */
export const phPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+63[0-9]{10}$/, "Phone must be in +63XXXXXXXXXX format");

const optionalEmail = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.string().email().optional(),
);

const optionalPhone = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  phPhoneSchema.optional(),
);

const optionalString = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().trim().optional(),
);

const optionalInt = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number().int().optional(),
);

const optionalPastDate = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce
    .date()
    .refine((d) => d <= new Date(), "Date must not be in the future")
    .optional(),
);

/** Genişletilmiş Patient alanları (PDA intake formu uyumlu) */
const basePatientFields = {
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  middleName: optionalString,
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  nickname: optionalString,
  phone: phPhoneSchema,
  email: optionalEmail,
  birthDate: optionalPastDate,
  gender: z.nativeEnum(Gender).optional(),
  civilStatus: z.nativeEnum(CivilStatus).optional(),
  religion: optionalString,
  nationality: optionalString,
  occupation: optionalString,
  address: optionalString,
  city: optionalString,
  province: optionalString,
  guardianName: optionalString,
  guardianRelation: optionalString,
  guardianPhone: optionalPhone,
  referralSource: optionalString,
  previousDentist: optionalString,
  lastDentalVisit: optionalPastDate,
  reasonForVisit: optionalString,
  bloodPressureSystolic: optionalInt,
  bloodPressureDiastolic: optionalInt,
  pulseRate: optionalInt,
  bloodType: z.nativeEnum(BloodType).optional(),
  allergies: z.array(z.string().trim().min(1)).default([]),
  medicalHistory: optionalString,
  philhealthNo: optionalString,
  isSeniorCitizen: z.boolean().optional(),
  oscaIdNo: optionalString,
  pwdIdNo: optionalString,
  emergencyContactName: optionalString,
  emergencyContactPhone: optionalPhone,
};

export const createPatientBodySchema = z.object({
  ...basePatientFields,
});

/** Update: her alan opsiyonel */
const updateFields = Object.fromEntries(
  Object.entries(basePatientFields).map(([k, v]) => [
    k,
    v instanceof z.ZodOptional || v instanceof z.ZodDefault ? v : (v as z.ZodTypeAny).optional(),
  ]),
) as unknown as Record<keyof typeof basePatientFields, z.ZodTypeAny>;

export const updatePatientBodySchema = z
  .object(updateFields)
  .refine((data) => Object.keys(data).length > 0, { message: "At least one field required" });

export const listPatientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientBodySchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientBodySchema>;
export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;

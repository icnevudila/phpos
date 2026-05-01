import { z } from "zod";

export const phPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+63[0-9]{10}$/, "Use +63 followed by 10 digits");

const optionalEmail = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.string().email().optional(),
);

const optionalPhoneField = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  phPhoneSchema.optional(),
);

const optInt = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : val),
  z.coerce.number().int().min(0).optional(),
);

export const patientFormSchema = z
  .object({
    firstName: z.string().trim().min(2, "At least 2 characters"),
    middleName: z.string().optional(),
    lastName: z.string().trim().min(2, "At least 2 characters"),
    nickname: z.string().optional(),
    phone: phPhoneSchema,
    email: optionalEmail,
    birthDate: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
    civilStatus: z
      .enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED", "SEPARATED", "OTHER"])
      .optional()
      .or(z.literal("")),
    religion: z.string().optional(),
    nationality: z.string().optional(),
    occupation: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    guardianName: z.string().optional(),
    guardianRelation: z.string().optional(),
    guardianPhone: optionalPhoneField,
    referralSource: z.string().optional(),
    previousDentist: z.string().optional(),
    lastDentalVisit: z.string().optional(),
    reasonForVisit: z.string().optional(),
    bloodPressureSystolic: optInt,
    bloodPressureDiastolic: optInt,
    pulseRate: optInt,
    bloodType: z
      .enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG", "UNKNOWN"])
      .optional()
      .or(z.literal("")),
    allergies: z.array(z.string().min(1)).default([]),
    medicalHistory: z.string().optional(),
    philhealthNo: z.string().optional(),
    isSeniorCitizen: z.boolean(),
    oscaIdNo: z.string().optional(),
    pwdIdNo: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: optionalPhoneField,
  })
  .superRefine((data, ctx) => {
    if (data.birthDate) {
      const d = new Date(data.birthDate);
      if (!(d < new Date())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Birth date must be in the past",
          path: ["birthDate"],
        });
      }
    }
    if (data.lastDentalVisit) {
      const d = new Date(data.lastDentalVisit);
      if (!(d <= new Date())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last dental visit must be in the past",
          path: ["lastDentalVisit"],
        });
      }
    }
  });

export type PatientFormValues = z.infer<typeof patientFormSchema>;

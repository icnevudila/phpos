import { LifestyleFrequency } from "@prisma/client";
import { z } from "zod";

/** PDA Medical History Questionnaire standardı */
export const MEDICAL_CONDITION_CODES = [
  "HEART_DISEASE",
  "CONGENITAL_HEART",
  "RHEUMATIC_FEVER",
  "ANGINA",
  "HBP",
  "LBP",
  "DIABETES",
  "ASTHMA",
  "TB",
  "BRONCHITIS",
  "EMPHYSEMA",
  "SINUSITIS",
  "HAY_FEVER",
  "KIDNEY",
  "LIVER_HEPATITIS",
  "JAUNDICE",
  "ULCERS",
  "THYROID",
  "EPILEPSY",
  "FAINTING",
  "STROKE",
  "ANEMIA",
  "HEMOPHILIA",
  "HIV_AIDS",
  "CANCER",
  "ARTHRITIS",
  "PSYCHIATRIC",
  "VENEREAL",
] as const;

export type MedicalConditionCode = (typeof MEDICAL_CONDITION_CODES)[number];

const optionalString = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().trim().optional(),
);

const optionalInt = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number().int().min(0).optional(),
);

export const medicalHistoryUpsertSchema = z.object({
  underPhysicianCare: z.boolean().default(false),
  underPhysicianCareReason: optionalString,
  hospitalized: z.boolean().default(false),
  hospitalizedReason: optionalString,
  hospitalizedYear: optionalInt,
  takingMedications: z.boolean().default(false),
  medicationsList: optionalString,
  seriousIllness: z.boolean().default(false),
  seriousIllnessDetails: optionalString,

  conditions: z.array(z.enum(MEDICAL_CONDITION_CODES)).default([]),
  conditionsOther: optionalString,

  allergyAnesthetic: z.boolean().default(false),
  allergyPenicillin: z.boolean().default(false),
  allergySulfa: z.boolean().default(false),
  allergyAspirin: z.boolean().default(false),
  allergyLatex: z.boolean().default(false),
  allergyOther: optionalString,

  smoker: z.nativeEnum(LifestyleFrequency).default("NEVER"),
  alcohol: z.nativeEnum(LifestyleFrequency).default("NEVER"),
  recreationalDrug: z.nativeEnum(LifestyleFrequency).default("NEVER"),

  isPregnant: z.boolean().default(false),
  pregnancyMonths: optionalInt,
  isBreastfeeding: z.boolean().default(false),
  usesContraceptive: z.boolean().default(false),

  notes: optionalString,
});

export type MedicalHistoryUpsertInput = z.infer<typeof medicalHistoryUpsertSchema>;

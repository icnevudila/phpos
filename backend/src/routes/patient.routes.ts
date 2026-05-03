import { UserRole } from "@prisma/client";
import { Router } from "express";
import multer from "multer";

import {
  listTeethHandler,
  listToothHistoryHandler,
  upsertToothHandler,
} from "../controllers/teeth.controller.js";
import {
  createPatientHandler,
  deletePatientHandler,
  getPatientHandler,
  downloadFileHandler,
  listFilesHandler,
  listPatientsHandler,
  updatePatientHandler,
  uploadFileHandler,
  uploadFileSupabaseMetadataHandler,
  updatePatientFileAnnotationsHandler,
} from "../controllers/patient.controller.js";
import {
  getMedicalHistoryHandler,
  upsertMedicalHistoryHandler,
} from "../controllers/medicalHistory.controller.js";
import {
  dentalRecordPdfHandler,
  informedConsentPdfHandler,
  medicalHistoryPdfHandler,
  orthodonticRecordPdfHandler,
  treatmentRecordPdfHandler,
} from "../controllers/patientForms.controller.js";
import {
  createPerioExamHandler,
  listPerioExamsHandler,
} from "../controllers/perio.controller.js";
import { listByPatientHandler } from "../controllers/treatment.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { phiAccessLogMiddleware } from "../middleware/phiAccessLogMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const patientRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const dentalWriteRoles = [UserRole.ADMIN, UserRole.DENTIST];

export const patientRouter = Router();

patientRouter.use(authenticate);
patientRouter.use(roleGuard(patientRoles));
patientRouter.use(phiAccessLogMiddleware);

patientRouter.get("/", asyncHandler(listPatientsHandler));

/** `/:id/files` rotaları `/:id` öncesinde tanımlanmalı */
patientRouter.get("/:id/files/:fileId/download", asyncHandler(downloadFileHandler));
patientRouter.patch("/:id/files/:fileId/annotations", roleGuard(dentalWriteRoles), asyncHandler(updatePatientFileAnnotationsHandler));
patientRouter.get("/:id/files", asyncHandler(listFilesHandler));

patientRouter.get("/:id/treatments", asyncHandler(listByPatientHandler));
patientRouter.get("/:id/teeth/history", asyncHandler(listToothHistoryHandler));
patientRouter.get("/:id/teeth", asyncHandler(listTeethHandler));
patientRouter.put(
  "/:id/teeth/:toothNumber",
  roleGuard(dentalWriteRoles),
  asyncHandler(upsertToothHandler),
);

patientRouter.post("/:id/files/supabase", asyncHandler(uploadFileSupabaseMetadataHandler));
patientRouter.post("/:id/files", upload.single("file"), asyncHandler(uploadFileHandler));

patientRouter.get("/:id/medical-history", asyncHandler(getMedicalHistoryHandler));
patientRouter.put(
  "/:id/medical-history",
  roleGuard(dentalWriteRoles),
  asyncHandler(upsertMedicalHistoryHandler),
);

/** Periodontal muayeneler — hasta scope'lu list/create */
patientRouter.get("/:id/perio-exams", asyncHandler(listPerioExamsHandler));
patientRouter.post(
  "/:id/perio-exams",
  roleGuard(dentalWriteRoles),
  asyncHandler(createPerioExamHandler),
);

/** PDF çıktılar — 5 form. GET döner; tarayıcıda inline açılır. */
patientRouter.get("/:id/forms/dental-record.pdf", asyncHandler(dentalRecordPdfHandler));
patientRouter.get("/:id/forms/medical-history.pdf", asyncHandler(medicalHistoryPdfHandler));
patientRouter.get("/:id/forms/treatment-record.pdf", asyncHandler(treatmentRecordPdfHandler));
patientRouter.get("/:id/forms/informed-consent.pdf", asyncHandler(informedConsentPdfHandler));
patientRouter.get("/:id/forms/orthodontic-record.pdf", asyncHandler(orthodonticRecordPdfHandler));

patientRouter.get("/:id", asyncHandler(getPatientHandler));
patientRouter.post("/", asyncHandler(createPatientHandler));
patientRouter.put("/:id", asyncHandler(updatePatientHandler));
patientRouter.delete("/:id", asyncHandler(deletePatientHandler));

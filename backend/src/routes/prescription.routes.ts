import { Router } from "express";
import {
  handleCreatePrescription,
  handleDownloadPrescriptionPdf,
  handleGetPatientPrescriptions,
  handleGetPrescription,
  handleUpdateLicenses,
} from "../controllers/prescription.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";

export const prescriptionRouter = Router();

// Protect all routes
prescriptionRouter.use(authenticate);

// Dentist only for creating prescriptions and updating their own licenses
prescriptionRouter.post("/", roleGuard(["DENTIST"]), handleCreatePrescription);
prescriptionRouter.put("/licenses", roleGuard(["DENTIST"]), handleUpdateLicenses);

// Accessible by ADMIN, DENTIST, RECEPTIONIST
prescriptionRouter.get("/patient/:patientId", handleGetPatientPrescriptions);
prescriptionRouter.get("/:id", handleGetPrescription);
prescriptionRouter.get("/:id/pdf", handleDownloadPrescriptionPdf);

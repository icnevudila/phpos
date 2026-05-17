import { Router } from "express";
import {
  handleCreateConsent,
  handleGetConsent,
  handleGetPatientConsents,
  handleSignConsent,
} from "../controllers/consent.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";

export const consentRouter = Router();

consentRouter.use(authenticate);

// DENTIST or ADMIN can create templates/forms
consentRouter.post("/", roleGuard(["DENTIST", "ADMIN"]), handleCreateConsent);

// Everyone can view
consentRouter.get("/patient/:patientId", handleGetPatientConsents);
consentRouter.get("/:id", handleGetConsent);

// Signing is usually done by the patient via portal or staff device
consentRouter.put("/:id/sign", handleSignConsent);

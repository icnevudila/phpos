import { Router } from "express";
import {
  handleCreatePatientReferral,
  handleListPatientReferrals,
} from "../controllers/referral.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";

export const referralRouter = Router();

const clinicalRoles = ["ADMIN", "DENTIST", "RECEPTIONIST"] as const;

referralRouter.use(authenticate);

referralRouter.get(
  "/patient/:patientId",
  roleGuard([...clinicalRoles]),
  handleListPatientReferrals,
);
referralRouter.post(
  "/",
  roleGuard([...clinicalRoles]),
  handleCreatePatientReferral,
);

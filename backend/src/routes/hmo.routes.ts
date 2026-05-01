import { UserRole } from "@prisma/client";
import { Router } from "express";
import multer from "multer";

import {
  createHmoClaimHandler,
  createHmoProviderHandler,
  createPatientHmoHandler,
  deleteHmoClaimAttachmentHandler,
  deletePatientHmoHandler,
  downloadHmoClaimAttachmentHandler,
  downloadHmoClaimsReconciliationCsvHandler,
  getHmoClaimHandler,
  listHmoClaimsHandler,
  listHmoProvidersHandler,
  listPatientHmoHandler,
  updateHmoClaimHandler,
  updateHmoProviderHandler,
  updatePatientHmoHandler,
  uploadHmoClaimAttachmentHandler,
} from "../controllers/hmo.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const writeRoles = [UserRole.ADMIN, UserRole.DENTIST];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const hmoRouter = Router();
hmoRouter.use(authenticate);
hmoRouter.use(roleGuard(readRoles));

hmoRouter.get("/providers", asyncHandler(listHmoProvidersHandler));
hmoRouter.post("/providers", roleGuard([UserRole.ADMIN]), asyncHandler(createHmoProviderHandler));
hmoRouter.put("/providers/:id", roleGuard([UserRole.ADMIN]), asyncHandler(updateHmoProviderHandler));

hmoRouter.get("/claims", asyncHandler(listHmoClaimsHandler));
hmoRouter.get("/claims/reconciliation.csv", asyncHandler(downloadHmoClaimsReconciliationCsvHandler));
hmoRouter.get(
  "/claims/:id/attachments/:attachmentId/download",
  asyncHandler(downloadHmoClaimAttachmentHandler),
);
hmoRouter.post(
  "/claims/:id/attachments",
  roleGuard(writeRoles),
  upload.single("file"),
  asyncHandler(uploadHmoClaimAttachmentHandler),
);
hmoRouter.delete(
  "/claims/:id/attachments/:attachmentId",
  roleGuard(writeRoles),
  asyncHandler(deleteHmoClaimAttachmentHandler),
);
hmoRouter.get("/claims/:id", asyncHandler(getHmoClaimHandler));
hmoRouter.post("/claims", roleGuard(writeRoles), asyncHandler(createHmoClaimHandler));
hmoRouter.put("/claims/:id", roleGuard(writeRoles), asyncHandler(updateHmoClaimHandler));

// Patient scoped HMO memberships
hmoRouter.get("/patients/:id/memberships", asyncHandler(listPatientHmoHandler));
hmoRouter.post(
  "/patients/:id/memberships",
  roleGuard(writeRoles),
  asyncHandler(createPatientHmoHandler),
);
hmoRouter.put(
  "/patients/:id/memberships/:membershipId",
  roleGuard(writeRoles),
  asyncHandler(updatePatientHmoHandler),
);
hmoRouter.delete(
  "/patients/:id/memberships/:membershipId",
  roleGuard(writeRoles),
  asyncHandler(deletePatientHmoHandler),
);

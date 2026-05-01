import { UserRole } from "@prisma/client";
import { Router } from "express";

import { getClinicHandler, patchClinicHandler } from "../controllers/clinic.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const clinicRouter = Router();
clinicRouter.use(authenticate);
clinicRouter.use(roleGuard([UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST]));

clinicRouter.get("/", asyncHandler(getClinicHandler));
clinicRouter.patch("/", roleGuard([UserRole.ADMIN]), asyncHandler(patchClinicHandler));

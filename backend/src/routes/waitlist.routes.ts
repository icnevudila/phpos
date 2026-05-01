import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  createWaitlistHandler,
  listWaitlistHandler,
  patchWaitlistHandler,
} from "../controllers/waitlist.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const writeRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];

export const waitlistRouter = Router();
waitlistRouter.use(authenticate);
waitlistRouter.use(roleGuard(readRoles));

waitlistRouter.get("/", asyncHandler(listWaitlistHandler));
waitlistRouter.post("/", roleGuard(writeRoles), asyncHandler(createWaitlistHandler));
waitlistRouter.patch("/:id", roleGuard(writeRoles), asyncHandler(patchWaitlistHandler));

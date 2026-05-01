import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  deletePerioExamHandler,
  getPerioExamHandler,
  perioExamPdfHandler,
  updatePerioExamHandler,
} from "../controllers/perio.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const writeRoles = [UserRole.ADMIN, UserRole.DENTIST];
const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];

/**
 * `/api/perio-exams/:examId` — tekil muayene üzerinde işlemler.
 * Hasta-scoped listeleme & yaratma için patient.routes.ts içindeki
 * `/:id/perio-exams` endpoint'leri kullanılır.
 */
export const perioRouter = Router();
perioRouter.use(authenticate);

perioRouter.get("/:examId/pdf", roleGuard(readRoles), asyncHandler(perioExamPdfHandler));
perioRouter.get("/:examId", roleGuard(readRoles), asyncHandler(getPerioExamHandler));
perioRouter.put("/:examId", roleGuard(writeRoles), asyncHandler(updatePerioExamHandler));
perioRouter.delete("/:examId", roleGuard(writeRoles), asyncHandler(deletePerioExamHandler));

import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  createTreatmentHandler,
  deleteTreatmentHandler,
  finalizeAppointmentTreatmentsHandler,
  listByAppointmentHandler,
  updateTreatmentHandler,
} from "../controllers/treatment.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const writeRoles = [UserRole.ADMIN, UserRole.DENTIST];

/** Appointment-scoped treatment listeleme ve oluşturma */
export const appointmentTreatmentRouter = Router({ mergeParams: true });
appointmentTreatmentRouter.use(authenticate);
appointmentTreatmentRouter.get("/", roleGuard(readRoles), asyncHandler(listByAppointmentHandler));
appointmentTreatmentRouter.post("/", roleGuard(writeRoles), asyncHandler(createTreatmentHandler));
appointmentTreatmentRouter.post(
  "/finalize",
  roleGuard(writeRoles),
  asyncHandler(finalizeAppointmentTreatmentsHandler),
);

/** Treatment-id bazlı update/delete */
export const treatmentRouter = Router();
treatmentRouter.use(authenticate);
treatmentRouter.put("/:id", roleGuard(writeRoles), asyncHandler(updateTreatmentHandler));
treatmentRouter.delete("/:id", roleGuard(writeRoles), asyncHandler(deleteTreatmentHandler));

import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  createAppointmentHandler,
  deleteAppointmentHandler,
  getAppointmentHandler,
  listAppointmentsHandler,
  listDentistsHandler,
  patchAppointmentStatusHandler,
  sendAppointmentQueueAlertHandler,
  updateAppointmentHandler,
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const writeRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];

export const appointmentRouter = Router();

appointmentRouter.use(authenticate);
appointmentRouter.use(roleGuard(readRoles));

appointmentRouter.get("/", asyncHandler(listAppointmentsHandler));
appointmentRouter.get("/:id", asyncHandler(getAppointmentHandler));
appointmentRouter.post("/", roleGuard(writeRoles), asyncHandler(createAppointmentHandler));
appointmentRouter.put("/:id", roleGuard(writeRoles), asyncHandler(updateAppointmentHandler));
appointmentRouter.patch(
  "/:id/status",
  roleGuard(writeRoles),
  asyncHandler(patchAppointmentStatusHandler),
);
appointmentRouter.post(
  "/:id/send-alert",
  roleGuard(writeRoles),
  asyncHandler(sendAppointmentQueueAlertHandler),
);
appointmentRouter.delete("/:id", roleGuard(writeRoles), asyncHandler(deleteAppointmentHandler));

export const userRouter = Router();
userRouter.use(authenticate);
userRouter.use(roleGuard(readRoles));
userRouter.get("/dentists", asyncHandler(listDentistsHandler));

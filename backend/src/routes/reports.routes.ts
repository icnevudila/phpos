import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  agedReceivablesHandler,
  dashboardHandler,
  monthlyReportHandler,
  monthlyReportPdfHandler,
} from "../controllers/reports.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reportsRouter = Router();
reportsRouter.use(authenticate);
reportsRouter.use(roleGuard([UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST]));

reportsRouter.get("/dashboard", asyncHandler(dashboardHandler));
reportsRouter.get("/aged-receivables", asyncHandler(agedReceivablesHandler));
reportsRouter.get("/monthly", asyncHandler(monthlyReportHandler));
reportsRouter.get(
  "/monthly/pdf",
  roleGuard([UserRole.ADMIN, UserRole.DENTIST]),
  asyncHandler(monthlyReportPdfHandler),
);

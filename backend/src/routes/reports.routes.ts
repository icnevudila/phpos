import { UserRole } from "@prisma/client";

import { Router } from "express";



import {

  agedReceivablesHandler,

  birJournalCsvHandler,

  dashboardHandler,

  dashboardAlertsHandler,

  dashboardChartsHandler,

  dashboardQueueHandler,

  dashboardQueueStreamHandler,

  dashboardSummaryHandler,

  monthlyReportHandler,

  monthlyReportPdfHandler,

  orSerialGapAuditHandler,

} from "../controllers/reports.controller.js";

import { authenticate } from "../middleware/authMiddleware.js";

import { authenticateBearerQuery } from "../middleware/authenticateBearerQuery.js";

import { roleGuard } from "../middleware/roleGuard.js";

import { asyncHandler } from "../utils/asyncHandler.js";



const staffRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST] as const;



export const reportsRouter = Router();



/** SSE — EventSource cannot send Authorization; auth via query token. */

reportsRouter.get(

  "/dashboard/queue/stream",

  authenticateBearerQuery,

  roleGuard([...staffRoles]),

  asyncHandler(dashboardQueueStreamHandler),

);



reportsRouter.use(authenticate);

reportsRouter.use(roleGuard([...staffRoles]));



reportsRouter.get("/dashboard", asyncHandler(dashboardHandler));

reportsRouter.get("/dashboard/summary", asyncHandler(dashboardSummaryHandler));

reportsRouter.get("/dashboard/queue", asyncHandler(dashboardQueueHandler));

reportsRouter.get("/dashboard/charts", asyncHandler(dashboardChartsHandler));

reportsRouter.get("/dashboard/alerts", asyncHandler(dashboardAlertsHandler));

reportsRouter.get("/bir-journal.csv", asyncHandler(birJournalCsvHandler));

reportsRouter.get("/aged-receivables", asyncHandler(agedReceivablesHandler));

reportsRouter.get("/monthly", asyncHandler(monthlyReportHandler));

reportsRouter.get(

  "/monthly/pdf",

  roleGuard([UserRole.ADMIN, UserRole.DENTIST]),

  asyncHandler(monthlyReportPdfHandler),

);

reportsRouter.get(
  "/or-gap-audit",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(orSerialGapAuditHandler),
);



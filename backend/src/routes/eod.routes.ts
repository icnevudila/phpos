import { Router } from "express";
import { getEodSummaryHandler } from "../controllers/eod.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateXReportPdf, generateZReportPdf } from "../services/eodReportPdf.js";
import { getClinicId } from "../utils/getClinicId.js";

export const eodRouter = Router();

eodRouter.use(authenticate);
eodRouter.use(roleGuard([UserRole.ADMIN, UserRole.RECEPTIONIST]));

eodRouter.get("/summary", asyncHandler(getEodSummaryHandler));

/** GET /api/reports/eod/x-report?date=2026-05-11 */
eodRouter.get(
  "/x-report",
  asyncHandler(async (req, res) => {
    const clinicId = getClinicId(req);
    const date = req.query.date ? new Date(String(req.query.date)) : new Date();
    const pdf = await generateXReportPdf(clinicId, date);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="x-report-${date.toISOString().split("T")[0]}.pdf"`);
    res.end(pdf);
  }),
);

/** GET /api/reports/eod/z-report?date=2026-05-11 */
eodRouter.get(
  "/z-report",
  asyncHandler(async (req, res) => {
    const clinicId = getClinicId(req);
    const date = req.query.date ? new Date(String(req.query.date)) : new Date();
    const pdf = await generateZReportPdf(clinicId, date);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="z-report-${date.toISOString().split("T")[0]}.pdf"`);
    res.end(pdf);
  }),
);


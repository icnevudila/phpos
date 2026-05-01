import type { Request, Response } from "express";
import { z } from "zod";

import {
  buildAgedReceivables,
  buildDashboard,
  buildMonthlyReport,
} from "../services/reports.service.js";
import { generateMonthlyReportPdf } from "../services/reportsPdf.js";
import { AppError } from "../utils/errors.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const monthlyQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export async function dashboardHandler(req: Request, res: Response): Promise<void> {
  const data = await buildDashboard(clinicId(req));
  res.json({ success: true, data });
}

export async function monthlyReportHandler(req: Request, res: Response): Promise<void> {
  const q = monthlyQuerySchema.parse(req.query);
  const data = await buildMonthlyReport(clinicId(req), q.year, q.month);
  res.json({ success: true, data });
}

export async function agedReceivablesHandler(req: Request, res: Response): Promise<void> {
  const data = await buildAgedReceivables(clinicId(req));
  res.json({ success: true, data });
}

export async function monthlyReportPdfHandler(req: Request, res: Response): Promise<void> {
  const q = monthlyQuerySchema.parse(req.query);
  const buffer = await generateMonthlyReportPdf(clinicId(req), q.year, q.month);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="monthly-${q.year}-${String(q.month).padStart(2, "0")}.pdf"`,
  );
  res.end(buffer);
}

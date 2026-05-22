import type { Request, Response } from "express";
import { z } from "zod";

import {
  dashboardCacheKey,
  withDashboardCache,
} from "../lib/dashboardCache.js";
import {
  buildAgedReceivables,
  buildBirJournalCsv,
  buildDashboard,
  buildDashboardAlerts,
  buildDashboardCharts,
  buildDashboardQueue,
  buildDashboardSummary,
  buildMonthlyReport,
  buildOrSerialGapAudit,
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

export async function dashboardSummaryHandler(req: Request, res: Response): Promise<void> {
  const cid = clinicId(req);
  const data = await withDashboardCache(dashboardCacheKey(cid, "summary"), () =>
    buildDashboardSummary(cid),
  );
  res.setHeader("Cache-Control", "private, max-age=30");
  res.json({ success: true, data });
}

export async function dashboardQueueHandler(req: Request, res: Response): Promise<void> {
  const data = await buildDashboardQueue(clinicId(req));
  res.json({ success: true, data });
}

/** SSE — dashboard queue snapshot every ~12s (EventSource + `?access_token=`). */
export async function dashboardQueueStreamHandler(req: Request, res: Response): Promise<void> {
  const cid = clinicId(req);
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let closed = false;
  const onClose = (): void => {
    closed = true;
  };
  req.on("close", onClose);

  const push = async (): Promise<void> => {
    if (closed) return;
    const data = await buildDashboardQueue(cid);
    res.write(`event: queue\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await push();
  } catch {
    res.write(`event: error\ndata: ${JSON.stringify({ message: "queue_failed" })}\n\n`);
    res.end();
    return;
  }

  const intervalMs = Number(process.env.DASHBOARD_QUEUE_SSE_MS) || 12_000;
  const timer = setInterval(() => {
    void push().catch(() => {
      if (!closed) {
        res.write(`event: error\ndata: ${JSON.stringify({ message: "queue_failed" })}\n\n`);
      }
    });
  }, intervalMs);

  const heartbeat = setInterval(() => {
    if (!closed) res.write(": ping\n\n");
  }, 25_000);

  req.on("close", () => {
    clearInterval(timer);
    clearInterval(heartbeat);
  });
}

export async function dashboardChartsHandler(req: Request, res: Response): Promise<void> {
  const cid = clinicId(req);
  const data = await withDashboardCache(dashboardCacheKey(cid, "charts"), () =>
    buildDashboardCharts(cid),
  );
  res.setHeader("Cache-Control", "private, max-age=30");
  res.json({ success: true, data });
}

export async function dashboardAlertsHandler(req: Request, res: Response): Promise<void> {
  const cid = clinicId(req);
  const data = await withDashboardCache(dashboardCacheKey(cid, "alerts"), () =>
    buildDashboardAlerts(cid),
  );
  res.setHeader("Cache-Control", "private, max-age=30");
  res.json({ success: true, data });
}

export async function birJournalCsvHandler(req: Request, res: Response): Promise<void> {
  const q = monthlyQuerySchema.parse(req.query);
  const csv = await buildBirJournalCsv(clinicId(req), q.year, q.month);
  const mm = String(q.month).padStart(2, "0");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="bir-journal-${q.year}-${mm}.csv"`);
  res.send("\uFEFF" + csv);
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

export async function orSerialGapAuditHandler(req: Request, res: Response): Promise<void> {
  const year = z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .parse(req.query.year ?? new Date().getFullYear());
  const data = await buildOrSerialGapAudit(clinicId(req), year);
  res.json({ success: true, data });
}

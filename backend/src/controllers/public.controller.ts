import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { getLiveQueue, type QueueItem } from "../services/reports.service.js";
import { AppError } from "../utils/errors.js";

const publicQueueQuerySchema = z.object({
  token: z.string().min(8),
  clinicId: z.string().uuid().optional(),
  slug: z.string().min(2).max(64).optional(),
});

function maskPatientName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? "Patient";
  const last = parts[parts.length - 1]!;
  return `${parts[0]} ${last[0]}.`;
}

function maskQueueItems(items: QueueItem[]): QueueItem[] {
  return items.map((item) => ({
    ...item,
    patientName: maskPatientName(item.patientName),
  }));
}

/** Lobby TV — token + clinicId veya slug (auth yok). */
export async function publicQueueDisplayHandler(req: Request, res: Response): Promise<void> {
  const expected = process.env.PUBLIC_QUEUE_DISPLAY_TOKEN?.trim();
  if (!expected) {
    throw new AppError("Public queue display is not configured", 503, "PUBLIC_QUEUE_DISABLED");
  }

  const parsed = publicQueueQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError("Invalid query", 400, "VALIDATION_ERROR");
  }

  const { token, clinicId, slug } = parsed.data;
  if (token !== expected) {
    throw new AppError("Invalid display token", 403, "FORBIDDEN");
  }
  if (!clinicId && !slug) {
    throw new AppError("clinicId or slug required", 400, "VALIDATION_ERROR");
  }

  let resolvedClinicId = clinicId;
  if (!resolvedClinicId && slug) {
    const clinic = await prisma.clinic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clinic) throw new AppError("Clinic not found", 404, "NOT_FOUND");
    resolvedClinicId = clinic.id;
  }

  const data = maskQueueItems(await getLiveQueue(resolvedClinicId!));
  res.json({ success: true, data });
}

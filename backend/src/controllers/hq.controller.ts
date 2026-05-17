import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getOrganizationAnalytics } from "../services/hqAnalytics.service.js";
import { AppError } from "../utils/errors.js";

export async function getHqDashboardHandler(req: Request, res: Response) {
  const user = req.user;
  if (!user || user.role !== "ADMIN") {
    throw new AppError("Forbidden: HQ access required", 403, "FORBIDDEN");
  }

  // Find the organization this admin belongs to
  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { organizationId: true }
  });

  if (!clinic?.organizationId) {
    // If no organization, just return stats for this clinic but as an "HQ" of one
    // Single-clinic mode: no HQ rollup yet.
    // For now, let's assume they have an organizationId for demo purposes.
  }

  const organizationId = clinic?.organizationId || "demo-org-id";
  const data = await getOrganizationAnalytics(organizationId);

  res.json({
    success: true,
    data
  });
}

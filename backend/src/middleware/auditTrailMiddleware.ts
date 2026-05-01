import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** GAP-009: Kimliği doğrulanmış mutasyonları klinik denetim günlüğüne yazar (PNDP / iç iz). */
export function auditTrailMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING.has(req.method)) {
    next();
    return;
  }

  const pathOnly = req.originalUrl?.split("?")[0] ?? req.path;

  res.on("finish", () => {
    void (async () => {
      try {
        const user = req.user;
        if (!user) return;
        if (pathOnly.endsWith("/health")) return;

        await prisma.auditLog.create({
          data: {
            clinicId: user.clinicId,
            userId: user.id,
            method: req.method,
            path: pathOnly.slice(0, 512),
            action: `${req.method} ${pathOnly.slice(0, 480)}`,
            statusCode: res.statusCode,
            ip: typeof req.ip === "string" ? req.ip.slice(0, 64) : undefined,
            userAgent: req.get("user-agent")?.slice(0, 512) ?? undefined,
          },
        });
      } catch {
        // Asla yanıtı düşürme
      }
    })();
  });

  next();
}

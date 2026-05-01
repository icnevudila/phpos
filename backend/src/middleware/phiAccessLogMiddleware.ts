import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

/** GAP-010: Authenticated PHI okuma istekleri için DPA erişim izi (/patients… GET). */
export function phiAccessLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== "GET") {
    next();
    return;
  }

  const pathOnly = req.originalUrl?.split("?")[0] ?? req.path;
  const paramId = typeof req.params?.id === "string" ? req.params.id : undefined;

  res.on("finish", () => {
    void (async () => {
      try {
        const user = req.user;
        if (!user) return;

        await prisma.phiAccessLog.create({
          data: {
            clinicId: user.clinicId,
            userId: user.id,
            patientId: paramId ?? null,
            method: "GET",
            path: pathOnly.slice(0, 512),
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

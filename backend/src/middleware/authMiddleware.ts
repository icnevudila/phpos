import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, clinicId: true, role: true, isActive: true },
    });

    if (!user?.isActive || user.clinicId !== payload.clinicId || user.role !== payload.role) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    req.user = {
      id: user.id,
      clinicId: user.clinicId,
      role: user.role,
    };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      code: "TOKEN_EXPIRED",
    });
  }
}

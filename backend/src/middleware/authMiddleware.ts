import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt.js";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
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
    req.user = {
      id: payload.sub,
      clinicId: payload.clinicId,
      role: payload.role,
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

import type { NextFunction, Request, Response } from "express";

import { verifyPortalToken, type PortalTokenPayload } from "../utils/portalJwt.js";

declare module "express-serve-static-core" {
  interface Request {
    portal?: PortalTokenPayload;
  }
}

/** Bearer varsa doğrular; yoksa devam eder (token query ile indirme için). */
export function portalOptionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    next();
    return;
  }
  try {
    req.portal = verifyPortalToken(token);
    next();
  } catch {
    next();
  }
}

export function portalAuthenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized", code: "UNAUTHORIZED" });
    return;
  }
  try {
    req.portal = verifyPortalToken(token);
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired portal token",
      code: "PORTAL_TOKEN_EXPIRED",
    });
  }
}

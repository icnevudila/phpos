import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

export function roleGuard(allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      });
      return;
    }
    if (!allowed.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        code: "INSUFFICIENT_PERMISSIONS",
      });
      return;
    }
    next();
  };
}

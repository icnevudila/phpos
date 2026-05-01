import type { NextFunction, Request, Response } from "express";

export function notImplemented(_req: Request, res: Response, _next: NextFunction): void {
  res.status(501).json({
    success: false,
    error: "Not implemented",
    code: "NOT_IMPLEMENTED",
  });
}

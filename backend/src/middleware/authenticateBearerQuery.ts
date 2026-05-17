import type { NextFunction, Request, Response } from "express";

import { authenticate } from "./authMiddleware.js";

/** EventSource cannot send Authorization headers; allow `?access_token=` for stream routes. */
export function authenticateBearerQuery(req: Request, res: Response, next: NextFunction): void {
  const token = req.query.access_token;
  if (typeof token === "string" && token.trim() && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${token.trim()}`;
  }
  void authenticate(req, res, next);
}

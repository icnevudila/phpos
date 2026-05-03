import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

const PAYMONGO_IPS = ["13.229.206.108", "52.74.195.143", "54.179.231.144"];

/**
 * PayMongo webhook IP allowlist (GAP-002).
 * In production, we only accept requests from known PayMongo IPs.
 */
export function paymongoIpGuard(req: Request, _res: Response, next: NextFunction) {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  // Get IP (handles proxies like Vercel/Cloudflare if trust proxy is on)
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress;

  if (ip && PAYMONGO_IPS.includes(ip)) {
    return next();
  }

  console.warn(`[webhook] Rejected request from unauthorized IP: ${ip}`);
  throw new AppError("Unauthorized IP", 403, "WEBHOOK_UNAUTHORIZED_IP");
}

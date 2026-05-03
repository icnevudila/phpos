import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

/**
 * PayMongo Webhook Signature Verification Middleware
 * GAP-002: Signature verification is mandatory for production security.
 */
export function verifyPaymongoSignature(req: Request, _res: Response, next: NextFunction) {
  const signatureHeader = req.header("Paymongo-Signature");
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  // Development ortamında secret yoksa pas geç (isteğe bağlı, ama prod'da zorunlu)
  if (!webhookSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError("PAYMONGO_WEBHOOK_SECRET is not configured", 500, "CONFIG_ERROR");
    }
    return next();
  }

  if (!signatureHeader) {
    throw new AppError("Missing Paymongo-Signature header", 401, "UNAUTHORIZED");
  }

  if (!req.rawBody) {
    throw new AppError("Raw body not available for signature verification", 500, "INTERNAL_ERROR");
  }

  try {
    // Paymongo-Signature: t=123,v1=signature
    const parts = signatureHeader.split(",");
    const timestampPart = parts.find((p) => p.startsWith("t="));
    const signaturePart = parts.find((p) => p.startsWith("v1="));

    if (!timestampPart || !signaturePart) {
      throw new Error("Invalid signature format");
    }

    const timestamp = timestampPart.split("=")[1];
    const signature = signaturePart.split("=")[1];

    const bodyString = req.rawBody.toString("utf8");
    const payload = `${timestamp}.${bodyString}`;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new Error("Signature mismatch");
    }

    // Replay attack protection: 5 dakikadan eski istekleri reddet
    const now = Math.floor(Date.now() / 1000);
    const tsInt = parseInt(timestamp, 10);
    if (Math.abs(now - tsInt) > 300) {
      throw new Error("Timestamp expired");
    }

    next();
  } catch (error) {
    throw new AppError(`Invalid Paymongo signature: ${error instanceof Error ? error.message : "unknown"}`, 401, "UNAUTHORIZED");
  }
}

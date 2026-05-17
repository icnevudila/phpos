import { createHmac, timingSafeEqual } from "node:crypto";

import { AppError } from "./errors.js";

function secret(): string {
  const s =
    process.env.PORTAL_FILE_TOKEN_SECRET?.trim() ||
    process.env.PORTAL_JWT_SECRET?.trim() ||
    process.env.JWT_ACCESS_SECRET?.trim();
  if (!s) {
    throw new AppError("Portal file token secret not configured", 500, "PORTAL_TOKEN_NOT_CONFIGURED");
  }
  return s;
}

export function createPortalFileDownloadToken(
  patientId: string,
  fileId: string,
  ttlSec = 300,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = `${patientId}:${fileId}:${exp}`;
  const sig = createHmac("sha256", secret()).update(payload, "utf8").digest("base64url");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyPortalFileDownloadToken(token: string): {
  patientId: string;
  fileId: string;
} {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    throw new AppError("Invalid download token", 401, "PORTAL_FILE_TOKEN_INVALID");
  }
  const lastColon = decoded.lastIndexOf(":");
  if (lastColon === -1) {
    throw new AppError("Invalid download token", 401, "PORTAL_FILE_TOKEN_INVALID");
  }
  const payload = decoded.slice(0, lastColon);
  const sig = decoded.slice(lastColon + 1);
  const parts = payload.split(":");
  if (parts.length !== 3) {
    throw new AppError("Invalid download token", 401, "PORTAL_FILE_TOKEN_INVALID");
  }
  const [patientId, fileId, expStr] = parts;
  const exp = Number.parseInt(expStr!, 10);
  if (!patientId || !fileId || !Number.isFinite(exp)) {
    throw new AppError("Invalid download token", 401, "PORTAL_FILE_TOKEN_INVALID");
  }
  if (exp < Math.floor(Date.now() / 1000)) {
    throw new AppError("Download link expired", 401, "PORTAL_FILE_TOKEN_EXPIRED");
  }
  const expected = createHmac("sha256", secret()).update(payload, "utf8").digest("base64url");
  let ok = false;
  try {
    ok = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    ok = false;
  }
  if (!ok) {
    throw new AppError("Invalid download token", 401, "PORTAL_FILE_TOKEN_INVALID");
  }
  return { patientId, fileId };
}

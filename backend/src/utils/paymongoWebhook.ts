import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

import { AppError } from "./errors.js";

const TIMESTAMP_TOLERANCE_SEC = 300;

function parsePaymongoSignatureHeader(header: string): { t: string; te: string; li: string } | null {
  const parts = header.split(",").map((s) => s.trim());
  const map: Record<string, string> = {};
  for (const p of parts) {
    const eq = p.indexOf("=");
    if (eq === -1) continue;
    map[p.slice(0, eq)] = p.slice(eq + 1);
  }
  if (!map.t) return null;
  return { t: map.t, te: map.te ?? "", li: map.li ?? "" };
}

function verifySignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): void {
  if (!signatureHeader) {
    throw new AppError("Missing Paymongo-Signature", 401, "PAYMONGO_SIGNATURE_MISSING");
  }
  const parsed = parsePaymongoSignatureHeader(signatureHeader);
  if (!parsed) {
    throw new AppError("Invalid Paymongo-Signature", 401, "PAYMONGO_SIGNATURE_INVALID");
  }
  const ts = Number.parseInt(parsed.t, 10);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TIMESTAMP_TOLERANCE_SEC) {
    throw new AppError("Webhook timestamp outside tolerance", 401, "PAYMONGO_TIMESTAMP");
  }

  let livemode = true;
  try {
    const j = JSON.parse(rawBody.toString("utf8")) as { data?: { attributes?: { livemode?: boolean } } };
    if (typeof j?.data?.attributes?.livemode === "boolean") {
      livemode = j.data.attributes.livemode;
    }
  } catch {
    throw new AppError("Invalid webhook JSON", 400, "PAYMONGO_BODY");
  }

  const expectedHex = livemode ? parsed.li : parsed.te;
  if (!expectedHex) {
    throw new AppError("Missing signature for event mode", 401, "PAYMONGO_SIGNATURE_EMPTY");
  }

  const signedPayload = `${parsed.t}.${rawBody.toString("utf8")}`;
  const mac = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  let ok = false;
  try {
    ok = timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expectedHex, "hex"));
  } catch {
    ok = false;
  }
  if (!ok) {
    throw new AppError("Invalid webhook signature", 401, "PAYMONGO_SIGNATURE_MISMATCH");
  }
}

type ReqWithRaw = { rawBody?: Buffer; headers: IncomingHttpHeaders };

/**
 * GAP-002: PayMongo `Paymongo-Signature` (t, te, li).
 * Production: `PAYMONGO_WEBHOOK_SECRET` zorunlu.
 * Development: secret yoksa uyarı + doğrulama atlanır (yerel test).
 */
export function assertPaymongoWebhookRequest(req: ReqWithRaw): void {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new AppError("PayMongo webhook signing not configured", 503, "PAYMONGO_NOT_CONFIGURED");
  }
  if (!secret) {
    console.warn("[paymongo] PAYMONGO_WEBHOOK_SECRET missing; skipping signature check (development only)");
    return;
  }

  const raw = req.rawBody;
  if (!raw?.length) {
    throw new AppError("Missing raw body", 400, "MISSING_RAW_BODY");
  }
  const hdr = req.headers["paymongo-signature"];
  const sig = typeof hdr === "string" ? hdr : Array.isArray(hdr) ? hdr[0] : undefined;
  verifySignature(raw, sig, secret);
}

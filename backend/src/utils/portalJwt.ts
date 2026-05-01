import jwt, { type SignOptions } from "jsonwebtoken";

import { assertEnv } from "./env.js";

const PORTAL_EXPIRES = process.env.PORTAL_JWT_EXPIRES ?? "30d";

export interface PortalTokenPayload {
  sub: string; // patient id
  clinicId: string;
  phone: string;
  typ: "portal";
}

function secret(): string {
  // Portal için ayrı secret tercih edilir; yoksa access secret'a düşer.
  return process.env.PORTAL_JWT_SECRET ?? assertEnv("JWT_ACCESS_SECRET");
}

export function signPortalToken(payload: Omit<PortalTokenPayload, "typ">): string {
  const full: PortalTokenPayload = { ...payload, typ: "portal" };
  return jwt.sign(full, secret(), { expiresIn: PORTAL_EXPIRES as SignOptions["expiresIn"] });
}

export function verifyPortalToken(token: string): PortalTokenPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid portal token");
  }
  const p = decoded as Partial<PortalTokenPayload>;
  if (p.typ !== "portal" || !p.sub || !p.clinicId) {
    throw new Error("Invalid portal token payload");
  }
  return p as PortalTokenPayload;
}

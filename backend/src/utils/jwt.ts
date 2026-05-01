import jwt, { type SignOptions } from "jsonwebtoken";

import type { AccessTokenPayload, RefreshTokenPayload } from "../types/auth.js";
import { assertEnv } from "./env.js";

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? "7d";

function signOptions(expiresIn: string): SignOptions {
  return { expiresIn: expiresIn as SignOptions["expiresIn"] };
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "typ">): string {
  const secret = assertEnv("JWT_ACCESS_SECRET");
  const full: AccessTokenPayload = { ...payload, typ: "access" };
  return jwt.sign(full, secret, signOptions(ACCESS_EXPIRES));
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, "typ">): string {
  const secret = assertEnv("JWT_REFRESH_SECRET");
  const full: RefreshTokenPayload = { ...payload, typ: "refresh" };
  return jwt.sign(full, secret, signOptions(REFRESH_EXPIRES));
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = assertEnv("JWT_ACCESS_SECRET");
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const p = decoded as Partial<AccessTokenPayload>;
  if (p.typ !== "access" || !p.sub || !p.clinicId || !p.role) {
    throw new Error("Invalid access token");
  }
  return p as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = assertEnv("JWT_REFRESH_SECRET");
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const p = decoded as Partial<RefreshTokenPayload>;
  if (p.typ !== "refresh" || !p.sub || !p.sid) {
    throw new Error("Invalid refresh token");
  }
  return p as RefreshTokenPayload;
}

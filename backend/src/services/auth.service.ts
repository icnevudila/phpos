import { UserRole } from "@prisma/client";
import { randomUUID } from "node:crypto";

import { prisma } from "../lib/prisma.js";
import type { AuthTokensResponse, PublicUser } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { isLoginLocked, recordLoginFailure, resetLoginFailures } from "./loginLockout.js";

function slugifyClinicName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40) || "clinic";
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function toPublicUser(u: {
  id: string;
  clinicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
}): PublicUser {
  return {
    id: u.id,
    clinicId: u.clinicId,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: u.role,
  };
}

export async function registerClinicAdmin(input: {
  clinicName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<AuthTokensResponse> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already registered", 409, "EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);
  const refreshSid = randomUUID();

  const result = await prisma.$transaction(async (tx) => {
    const clinic = await tx.clinic.create({
      data: {
        name: input.clinicName.trim(),
        slug: slugifyClinicName(input.clinicName),
      },
    });
    const user = await tx.user.create({
      data: {
        clinicId: clinic.id,
        email,
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        role: UserRole.ADMIN,
        refreshSessionId: refreshSid,
      },
    });
    return user;
  });

  const accessToken = signAccessToken({
    sub: result.id,
    clinicId: result.clinicId,
    role: result.role,
  });
  const refreshToken = signRefreshToken({
    sub: result.id,
    sid: refreshSid,
  });

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(result),
  };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      clinicId: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
    },
  });
  if (!user || !user.isActive) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
  const { isActive: _, ...pub } = user;
  return toPublicUser(pub);
}

export async function login(input: { email: string; password: string }): Promise<AuthTokensResponse> {
  const email = input.email.trim().toLowerCase();

  if (isLoginLocked(email)) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    recordLoginFailure(email);
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    recordLoginFailure(email);
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  resetLoginFailures(email);

  const refreshSid = randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshSessionId: refreshSid },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    clinicId: user.clinicId,
    role: user.role,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    sid: refreshSid,
  });

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
}

export async function refreshSession(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "TOKEN_INVALID");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive || !user.refreshSessionId || user.refreshSessionId !== payload.sid) {
    throw new AppError("Invalid or expired refresh token", 401, "TOKEN_INVALID");
  }

  const newSid = randomUUID();
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshSessionId: newSid },
  });

  const accessToken = signAccessToken({
    sub: user.id,
    clinicId: user.clinicId,
    role: user.role,
  });
  const refreshTokenNext = signRefreshToken({
    sub: user.id,
    sid: newSid,
  });

  return { accessToken, refreshToken: refreshTokenNext };
}

export async function logout(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshSessionId: null },
  });
}

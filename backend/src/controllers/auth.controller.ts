import type { Request, Response } from "express";
import { z } from "zod";

import {
  getCurrentUser,
  login,
  logout,
  refreshSession,
  registerClinicAdmin,
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/auth.service.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";

const registerSchema = z.object({
  clinicName: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(5).max(32),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function registerHandler(req: Request, res: Response): Promise<void> {
  if (process.env.ALLOW_PUBLIC_REGISTER !== "true") {
    throw new AppError("Public registration is disabled", 403, "REGISTER_DISABLED");
  }
  const body = registerSchema.parse(req.body);
  const data = await registerClinicAdmin(body);
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.status(201).json(payload);
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  const { email } = forgotPasswordSchema.parse(req.body);
  await requestPasswordReset(email);
  const payload: ApiSuccess<{ message: string }> = {
    success: true,
    data: {
      message:
        "If an account exists for this email, you will receive password reset instructions shortly.",
    },
  };
  res.json(payload);
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await resetPasswordWithToken(token, password);
  const payload: ApiSuccess<{ message: string }> = {
    success: true,
    data: { message: "Password updated. You can sign in with your new password." },
  };
  res.json(payload);
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);
  const data = await login(body);
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.json(payload);
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const body = refreshSchema.parse(req.body);
  const tokens = await refreshSession(body.refreshToken);
  const payload: ApiSuccess<typeof tokens> = { success: true, data: tokens };
  res.json(payload);
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
  const user = await getCurrentUser(req.user.id);
  const payload: ApiSuccess<typeof user> = { success: true, data: user };
  res.json(payload);
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
    return;
  }
  await logout(req.user.id);
  const payload: ApiSuccess<{ ok: true }> = { success: true, data: { ok: true } };
  res.json(payload);
}

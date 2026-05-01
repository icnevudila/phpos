import type { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { z } from "zod";

import { createStaffUser, listStaffUsers, updateStaffUser } from "../services/staffUser.service.js";
import { AppError } from "../utils/errors.js";
import type { ApiSuccess } from "../types/auth.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

function userId(req: Request): string {
  const id = req.user?.id;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(32).nullable().optional(),
  role: z.nativeEnum(UserRole),
});

const patchSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export async function listStaffUsersHandler(req: Request, res: Response): Promise<void> {
  const data = await listStaffUsers(clinicId(req));
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.json(payload);
}

export async function createStaffUserHandler(req: Request, res: Response): Promise<void> {
  const body = createSchema.parse(req.body);
  const data = await createStaffUser(clinicId(req), body);
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.status(201).json(payload);
}

export async function patchStaffUserHandler(req: Request, res: Response): Promise<void> {
  const id = z.string().min(1).parse(req.params.id);
  const body = patchSchema.parse(req.body);
  const data = await updateStaffUser(clinicId(req), id, userId(req), body);
  const payload: ApiSuccess<typeof data> = { success: true, data };
  res.json(payload);
}

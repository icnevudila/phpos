import { UserRole } from "@prisma/client";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import { hashPassword } from "../utils/password.js";

export interface StaffUserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export async function listStaffUsers(clinicId: string): Promise<StaffUserRow[]> {
  return prisma.user.findMany({
    where: { clinicId },
    orderBy: [{ role: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createStaffUser(
  clinicId: string,
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: UserRole;
  },
): Promise<StaffUserRow> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already in use", 409, "EMAIL_IN_USE");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      clinicId,
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() || null,
      role: input.role,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function updateStaffUser(
  clinicId: string,
  userId: string,
  actorUserId: string,
  input: { role?: UserRole; isActive?: boolean },
): Promise<StaffUserRow> {
  const target = await prisma.user.findFirst({
    where: { id: userId, clinicId },
    select: { id: true },
  });
  if (!target) {
    throw new AppError("User not found", 404, "NOT_FOUND");
  }

  if (userId === actorUserId && input.isActive === false) {
    throw new AppError("You cannot deactivate your own account", 400, "SELF_DEACTIVATE");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

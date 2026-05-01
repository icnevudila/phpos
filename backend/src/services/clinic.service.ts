import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

export interface ClinicPublic {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  logoUrl: string | null;
  subscriptionPlan: string;
  createdAt: Date;
}

export async function getClinicById(clinicId: string): Promise<ClinicPublic> {
  const c = await prisma.clinic.findFirst({
    where: { id: clinicId },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      city: true,
      phone: true,
      logoUrl: true,
      subscriptionPlan: true,
      createdAt: true,
    },
  });
  if (!c) throw new AppError("Clinic not found", 404, "NOT_FOUND");
  return c;
}

export async function updateClinic(
  clinicId: string,
  data: {
    name?: string;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    logoUrl?: string | null;
  },
): Promise<ClinicPublic> {
  const c = await prisma.clinic.update({
    where: { id: clinicId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
      ...(data.city !== undefined ? { city: data.city?.trim() || null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone?.trim() || null } : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl?.trim() || null } : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      city: true,
      phone: true,
      logoUrl: true,
      subscriptionPlan: true,
      createdAt: true,
    },
  });
  return c;
}

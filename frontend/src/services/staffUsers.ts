import type { UserRole } from "../types/user";

import { apiFetch } from "./api";

export interface StaffUserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

interface ApiOk<T> {
  success: true;
  data: T;
}

export async function fetchStaffUsers(): Promise<StaffUserDto[]> {
  const res = await apiFetch<ApiOk<StaffUserDto[]>>("/staff/users");
  return res.data;
}

export async function createStaffUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
}): Promise<StaffUserDto> {
  const res = await apiFetch<ApiOk<StaffUserDto>>("/staff/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function patchStaffUser(
  id: string,
  input: { role?: UserRole; isActive?: boolean },
): Promise<StaffUserDto> {
  const res = await apiFetch<ApiOk<StaffUserDto>>(`/staff/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data;
}

import api from "./api";
import type { UserRole } from "../types/user";

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
  const res = await api.get<ApiOk<StaffUserDto[]>>("/staff/users") as any;
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
  const res = await api.post<ApiOk<StaffUserDto>>("/staff/users", input) as any;
  return res.data;
}

export async function patchStaffUser(
  id: string,
  input: { role?: UserRole; isActive?: boolean },
): Promise<StaffUserDto> {
  const res = await api.patch<ApiOk<StaffUserDto>>(`/staff/users/${id}`, input) as any;
  return res.data;
}

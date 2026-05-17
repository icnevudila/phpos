import api from "./api";
import type { UserRole } from "../types/user";

export interface LoginSuccessBody {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      clinicId: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      role: UserRole;
    };
  };
}

export interface RegisterSuccessBody {
  success: true;
  data: {
    clinicId: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
  };
}

export async function login(email: string, password: string): Promise<LoginSuccessBody> {
  return api.post<LoginSuccessBody>("/auth/login", { email, password }) as any;
}

export async function registerClinic(payload: any): Promise<RegisterSuccessBody> {
  return api.post<RegisterSuccessBody>("/auth/register-clinic", payload) as any;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPasswordWithToken(token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { token, password });
}

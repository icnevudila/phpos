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
  throw new Error("Use useAuth().signIn instead");
}

export async function registerClinic(payload: any): Promise<RegisterSuccessBody> {
  throw new Error("Demo Mode: Clinic registration requires backend trigger or RPC which is not yet deployed.");
}

export async function requestPasswordReset(email: string): Promise<void> {
  throw new Error("Demo Mode: Password reset not configured.");
}

export async function resetPasswordWithToken(token: string, password: string): Promise<void> {
  throw new Error("Demo Mode: Password reset not configured.");
}

import { jwtDecode } from "jwt-decode";

import { ACCESS_TOKEN_KEY, AUTH_PROFILE_KEY, REFRESH_TOKEN_KEY } from "../constants/auth";
import type { AuthUser, UserRole } from "../types/user";

export interface AuthProfile {
  id: string;
  clinicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
}

export function setAuthProfile(profile: AuthProfile): void {
  localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
}

export function getAuthProfile(): AuthProfile | null {
  const raw = localStorage.getItem(AUTH_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthProfile;
  } catch {
    return null;
  }
}

interface AccessJwtPayload {
  sub: string;
  clinicId: string;
  role: UserRole;
  typ?: string;
  exp?: number;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
}

export function getUser(): AuthUser | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = jwtDecode<AccessJwtPayload>(token);
    if (payload.typ !== "access" || !payload.sub || !payload.clinicId || !payload.role) {
      return null;
    }
    return {
      id: payload.sub,
      clinicId: payload.clinicId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const payload = jwtDecode<AccessJwtPayload>(token);
    if (payload.typ !== "access" || payload.exp === undefined) return false;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

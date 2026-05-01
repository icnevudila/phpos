import type { UserRole } from "@prisma/client";

export interface PublicUser {
  id: string;
  clinicId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export interface AccessTokenPayload {
  sub: string;
  clinicId: string;
  role: UserRole;
  typ: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  typ: "refresh";
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: string;
  code: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

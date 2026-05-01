export type UserRole = "ADMIN" | "DENTIST" | "RECEPTIONIST";

export interface AuthUser {
  id: string;
  clinicId: string;
  email?: string;
  role: UserRole;
}

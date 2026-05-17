import type { UserRole } from "@prisma/client";

export interface AuthUserPayload {
  id: string;
  clinicId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      /** express.json verify ile doldurulur (PayMongo webhook imzası vb.) */
      rawBody?: Buffer;
      requestId?: string;
    }
  }
}

export {};

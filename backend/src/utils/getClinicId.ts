import { Request } from "express";
import { AppError } from "./errors.js";

/**
 * Extracts clinicId from authenticated request.
 * Throws UNAUTHORIZED if not found.
 */
export function getClinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) {
    throw new AppError("Unauthorized - No clinic context", 401, "UNAUTHORIZED");
  }
  return id;
}

import { RecallStatus, UserRole } from "@prisma/client";
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";

import {
  createRecall,
  deleteRecall,
  getDueRecalls,
  listRecalls,
  markCompleted,
  updateRecall,
} from "../services/recall.service.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const recallStatuses = Object.values(RecallStatus) as [string, ...string[]];

const createBodySchema = z.object({
  patientId: z.string().min(1),
  recallType: z.string().min(1),
  intervalMonths: z.number().int().min(1).optional(),
  nextDueDate: z.coerce.date(),
  notes: z.string().optional(),
});

const updateBodySchema = z.object({
  recallType: z.string().min(1).optional(),
  intervalMonths: z.number().int().min(1).optional(),
  nextDueDate: z.coerce.date().optional(),
  status: z.enum(recallStatuses).optional(),
  notes: z.string().optional(),
});

const listQuerySchema = z.object({
  status: z.enum(recallStatuses).optional(),
  patientId: z.string().optional(),
  dueBefore: z.coerce.date().optional(),
});

/* ── Router ──────────────────────────────────────────────────────────── */

const allowedRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];

export const recallRouter = Router();
recallRouter.use(authenticate);
recallRouter.use(roleGuard(allowedRoles));

/* GET /due — must come before /:id to avoid route shadowing */
recallRouter.get(
  "/due",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const items = await getDueRecalls(clinicId(req));
    const payload: ApiSuccess<typeof items> = { success: true, data: items };
    res.json(payload);
  }),
);

/* GET / */
recallRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = listQuerySchema.parse(req.query);
    const filters = {
      status: query.status as RecallStatus | undefined,
      patientId: query.patientId,
      dueBefore: query.dueBefore,
    };
    const items = await listRecalls(clinicId(req), filters);
    const payload: ApiSuccess<typeof items> = { success: true, data: items };
    res.json(payload);
  }),
);

/* POST / */
recallRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = createBodySchema.parse(req.body);
    const item = await createRecall(clinicId(req), body);
    const payload: ApiSuccess<typeof item> = { success: true, data: item };
    res.status(201).json(payload);
  }),
);

/* PUT /:id */
recallRouter.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = z.string().min(1).parse(req.params.id);
    const body = updateBodySchema.parse(req.body);
    const item = await updateRecall(id, clinicId(req), {
      ...body,
      status: body.status as RecallStatus | undefined,
    });
    const payload: ApiSuccess<typeof item> = { success: true, data: item };
    res.json(payload);
  }),
);

/* DELETE /:id */
recallRouter.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = z.string().min(1).parse(req.params.id);
    await deleteRecall(id, clinicId(req));
    res.status(204).send();
  }),
);

/* POST /:id/complete */
recallRouter.post(
  "/:id/complete",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = z.string().min(1).parse(req.params.id);
    const item = await markCompleted(id, clinicId(req));
    const payload: ApiSuccess<typeof item> = { success: true, data: item };
    res.json(payload);
  }),
);

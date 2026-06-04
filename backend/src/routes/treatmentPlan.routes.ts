import { TreatmentPlanStatus, UserRole } from "@prisma/client";
import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";

import {
  createTreatmentPlan,
  deleteTreatmentPlan,
  listTreatmentPlans,
  updateTreatmentPlan,
} from "../services/treatmentPlan.service.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const treatmentPlanStatuses = Object.values(TreatmentPlanStatus) as [string, ...string[]];

const createBodySchema = z.object({
  patientId: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  treatmentIds: z.array(z.string()).optional(),
});

const updateBodySchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().optional(),
  status: z.enum(treatmentPlanStatuses).optional(),
  treatmentIds: z.array(z.string()).optional(),
});

const listQuerySchema = z.object({
  patientId: z.string().optional(),
});

const allowedRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];

export const treatmentPlanRouter = Router();
treatmentPlanRouter.use(authenticate);
treatmentPlanRouter.use(roleGuard(allowedRoles));

/* GET / */
treatmentPlanRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = listQuerySchema.parse(req.query);
    const items = await listTreatmentPlans(clinicId(req), query.patientId);
    const payload: ApiSuccess<typeof items> = { success: true, data: items };
    res.json(payload);
  }),
);

/* POST / */
treatmentPlanRouter.post(
  "/",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const body = createBodySchema.parse(req.body);
    const item = await createTreatmentPlan(clinicId(req), body);
    const payload: ApiSuccess<typeof item> = { success: true, data: item };
    res.status(201).json(payload);
  }),
);

/* PUT /:id */
treatmentPlanRouter.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = z.string().min(1).parse(req.params.id);
    const body = updateBodySchema.parse(req.body);
    const item = await updateTreatmentPlan(id, clinicId(req), {
      ...body,
      status: body.status as TreatmentPlanStatus | undefined,
    });
    const payload: ApiSuccess<typeof item> = { success: true, data: item };
    res.json(payload);
  }),
);

/* DELETE /:id */
treatmentPlanRouter.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = z.string().min(1).parse(req.params.id);
    await deleteTreatmentPlan(id, clinicId(req));
    res.status(204).send();
  }),
);

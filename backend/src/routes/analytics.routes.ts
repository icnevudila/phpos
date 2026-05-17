import { Router } from "express";
import { getAnalyticsOverviewHandler, getQueueHandler, getArAgingHandler } from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

export const analyticsRouter = Router();

analyticsRouter.use(authenticate);

analyticsRouter.get(
  "/overview",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(getAnalyticsOverviewHandler),
);

analyticsRouter.get(
  "/queue",
  roleGuard([UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST]),
  asyncHandler(getQueueHandler),
);

analyticsRouter.get(
  "/aging",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(getArAgingHandler),
);

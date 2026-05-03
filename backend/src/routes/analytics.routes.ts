import { Router } from "express";
import { getAnalyticsOverviewHandler, getQueueHandler } from "../controllers/analytics.controller.js";
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

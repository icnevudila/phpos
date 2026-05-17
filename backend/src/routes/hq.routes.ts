import { Router } from "express";
import { getHqDashboardHandler } from "../controllers/hq.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

export const hqRouter = Router();

hqRouter.use(authenticate);
hqRouter.use(roleGuard([UserRole.ADMIN]));

hqRouter.get("/dashboard", asyncHandler(getHqDashboardHandler));

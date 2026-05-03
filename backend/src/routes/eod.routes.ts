import { Router } from "express";
import { getEodSummaryHandler } from "../controllers/eod.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

export const eodRouter = Router();

eodRouter.use(authenticate);
eodRouter.use(roleGuard([UserRole.ADMIN, UserRole.RECEPTIONIST]));

eodRouter.get("/summary", asyncHandler(getEodSummaryHandler));

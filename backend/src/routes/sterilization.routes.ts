import { Router } from "express";
import {
  handleCreateSterilizationLog,
  handleListSterilizationLogs,
} from "../controllers/sterilization.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(roleGuard([UserRole.ADMIN, UserRole.DENTIST]));

router.get("/", handleListSterilizationLogs);
router.post("/", handleCreateSterilizationLog);

export { router as sterilizationRouter };

import { UserRole } from "@prisma/client";
import { Router } from "express";

import {
  createStaffUserHandler,
  listStaffUsersHandler,
  patchStaffUserHandler,
} from "../controllers/staffUser.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const adminOnly = [UserRole.ADMIN];

export const staffUserRouter = Router();
staffUserRouter.use(authenticate);
staffUserRouter.use(roleGuard(adminOnly));

staffUserRouter.get("/", asyncHandler(listStaffUsersHandler));
staffUserRouter.post("/", asyncHandler(createStaffUserHandler));
staffUserRouter.patch("/:id", asyncHandler(patchStaffUserHandler));

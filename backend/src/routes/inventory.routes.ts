import { UserRole } from "@prisma/client";
import { Router } from "express";
import multer from "multer";

import {
  adjustInventoryHandler,
  createInventoryHandler,
  importInventoryCsvHandler,
  deleteInventoryHandler,
  getInventoryAlertsHandler,
  getInventoryHandler,
  listInventoryHandler,
  updateInventoryHandler,
  getInventoryHistoryHandler,
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const readRoles = [UserRole.ADMIN, UserRole.DENTIST, UserRole.RECEPTIONIST];
const writeRoles = [UserRole.ADMIN, UserRole.DENTIST];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const inventoryRouter = Router();
inventoryRouter.use(authenticate);
inventoryRouter.use(roleGuard(readRoles));

inventoryRouter.get("/alerts", asyncHandler(getInventoryAlertsHandler));
inventoryRouter.get("/", asyncHandler(listInventoryHandler));
inventoryRouter.post(
  "/import/csv",
  roleGuard(writeRoles),
  upload.single("file"),
  asyncHandler(importInventoryCsvHandler),
);
inventoryRouter.post("/", roleGuard(writeRoles), asyncHandler(createInventoryHandler));
inventoryRouter.get("/:id", asyncHandler(getInventoryHandler));
inventoryRouter.put("/:id", roleGuard(writeRoles), asyncHandler(updateInventoryHandler));
inventoryRouter.delete(
  "/:id",
  roleGuard([UserRole.ADMIN]),
  asyncHandler(deleteInventoryHandler),
);
inventoryRouter.post(
  "/:id/adjust",
  roleGuard(writeRoles),
  asyncHandler(adjustInventoryHandler),
);
inventoryRouter.get("/:id/history", asyncHandler(getInventoryHistoryHandler));

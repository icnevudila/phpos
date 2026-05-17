import { Router } from "express";
import {
  handleCreateLabOrder,
  handleGetLabOrder,
  handleGetPatientLabOrders,
  handleUpdateLabOrder,
  handleDeleteLabOrder,
} from "../controllers/labOrder.controller.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { roleGuard } from "../middleware/roleGuard.js";

export const labOrderRouter = Router();

labOrderRouter.use(authenticate);

// DENTIST or ADMIN can create/delete
labOrderRouter.post("/", roleGuard(["DENTIST", "ADMIN"]), handleCreateLabOrder);
labOrderRouter.delete("/:id", roleGuard(["DENTIST", "ADMIN"]), handleDeleteLabOrder);

// Everyone can view
labOrderRouter.get("/patient/:patientId", handleGetPatientLabOrders);
labOrderRouter.get("/:id", handleGetLabOrder);

// Everyone can update status (Receptionist might receive the order)
labOrderRouter.put("/:id", handleUpdateLabOrder);

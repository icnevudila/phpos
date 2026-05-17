import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createLabOrder,
  getLabOrderById,
  getLabOrdersByPatient,
  updateLabOrder,
  deleteLabOrder,
} from "../services/labOrder.service.js";
import {
  createLabOrderSchema,
  updateLabOrderStatusSchema,
} from "../validation/labOrder.schemas.js";

export const handleCreateLabOrder = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId, id: userId } = req.user!;
  const data = createLabOrderSchema.parse(req.body);

  const order = await createLabOrder(clinicId, userId, data);
  res.status(201).json(order);
});

export const handleGetPatientLabOrders = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { patientId } = req.params;

  const orders = await getLabOrdersByPatient(clinicId, patientId);
  res.json(orders);
});

export const handleGetLabOrder = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;

  const order = await getLabOrderById(clinicId, id);
  res.json(order);
});

export const handleUpdateLabOrder = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;
  const data = updateLabOrderStatusSchema.parse(req.body);

  const order = await updateLabOrder(clinicId, id, data);
  res.json(order);
});

export const handleDeleteLabOrder = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.user!;
  const { id } = req.params;

  await deleteLabOrder(clinicId, id);
  res.status(204).end();
});

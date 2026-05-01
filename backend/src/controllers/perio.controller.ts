import type { Request, Response } from "express";
import { z } from "zod";

import {
  createPerioExam,
  deletePerioExam,
  getPerioExam,
  listPerioExams,
  updatePerioExam,
} from "../services/perio.service.js";
import { generatePerioExamPdf } from "../services/perioPdf.js";
import type { ApiSuccess } from "../types/auth.js";
import { AppError } from "../utils/errors.js";
import {
  perioExamCreateSchema,
  perioExamUpdateSchema,
} from "../validation/perio.schemas.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

function userId(req: Request): string {
  const id = req.user?.id;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

export async function listPerioExamsHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const exams = await listPerioExams(clinicId(req), patientId);
  const payload: ApiSuccess<typeof exams> = { success: true, data: exams };
  res.json(payload);
}

export async function createPerioExamHandler(req: Request, res: Response): Promise<void> {
  const patientId = z.string().min(1).parse(req.params.id);
  const body = perioExamCreateSchema.parse(req.body);
  const exam = await createPerioExam(clinicId(req), patientId, userId(req), body);
  const payload: ApiSuccess<typeof exam> = { success: true, data: exam };
  res.status(201).json(payload);
}

export async function getPerioExamHandler(req: Request, res: Response): Promise<void> {
  const examId = z.string().min(1).parse(req.params.examId);
  const exam = await getPerioExam(clinicId(req), examId);
  const payload: ApiSuccess<typeof exam> = { success: true, data: exam };
  res.json(payload);
}

export async function updatePerioExamHandler(req: Request, res: Response): Promise<void> {
  const examId = z.string().min(1).parse(req.params.examId);
  const body = perioExamUpdateSchema.parse(req.body);
  const exam = await updatePerioExam(clinicId(req), examId, body);
  const payload: ApiSuccess<typeof exam> = { success: true, data: exam };
  res.json(payload);
}

export async function deletePerioExamHandler(req: Request, res: Response): Promise<void> {
  const examId = z.string().min(1).parse(req.params.examId);
  await deletePerioExam(clinicId(req), examId);
  res.status(204).end();
}

export async function perioExamPdfHandler(req: Request, res: Response): Promise<void> {
  const examId = z.string().min(1).parse(req.params.examId);
  const { buffer, filename } = await generatePerioExamPdf(clinicId(req), examId);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Content-Length", buffer.length.toString());
  res.end(buffer);
}

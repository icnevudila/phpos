import type { Request, Response } from "express";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { sendSMS } from "../services/notification/smsService.js";
import { runDailyEodEmailNow } from "../services/notification/eodEmailJob.js";
import {
  runDailyReminderNow,
  runSoonReminderNow,
} from "../services/notification/scheduler.js";
import { sendBulkSms } from "../services/notification/bulkSms.service.js";
import { AppError } from "../utils/errors.js";

function clinicId(req: Request): string {
  const id = req.user?.clinicId;
  if (!id) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  return id;
}

const listQuerySchema = z.object({
  patientId: z.string().optional(),
  appointmentId: z.string().optional(),
  status: z.enum(["PENDING", "SENT", "FAILED"]).optional(),
  kind: z
    .enum([
      "APPOINTMENT_REMINDER",
      "APPOINTMENT_REMINDER_SOON",
      "APPOINTMENT_CONFIRMED",
      "APPOINTMENT_CANCELLED",
      "APPOINTMENT_RESCHEDULED",
      "PAYMENT_RECEIVED",
      "BALANCE_DUE",
      "GENERIC",
      "MARKETING",
      "BROADCAST",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function listNotificationsHandler(req: Request, res: Response): Promise<void> {
  const q = listQuerySchema.parse(req.query);
  const rows = await prisma.notification.findMany({
    where: {
      clinicId: clinicId(req),
      ...(q.patientId ? { patientId: q.patientId } : {}),
      ...(q.appointmentId ? { appointmentId: q.appointmentId } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.kind ? { kind: q.kind } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: q.limit,
    select: {
      id: true,
      channel: true,
      kind: true,
      status: true,
      recipient: true,
      message: true,
      errorMessage: true,
      providerRef: true,
      sentAt: true,
      createdAt: true,
      appointmentId: true,
      patientId: true,
      invoiceId: true,
    },
  });
  res.json({ success: true, data: rows });
}

const sendTestSchema = z.object({
  to: z.string().min(6),
  message: z.string().min(1).max(480),
});

export async function sendTestSmsHandler(req: Request, res: Response): Promise<void> {
  const body = sendTestSchema.parse(req.body);
  const result = await sendSMS({
    clinicId: clinicId(req),
    userId: req.user?.id ?? null,
    kind: "GENERIC",
    to: body.to,
    message: body.message,
  });
  res.json({ success: true, data: result });
}

export async function triggerDailyReminderHandler(req: Request, res: Response): Promise<void> {
  void clinicId(req); // auth gate
  const summary = await runDailyReminderNow();
  res.json({ success: true, data: summary });
}

export async function triggerSoonReminderHandler(req: Request, res: Response): Promise<void> {
  void clinicId(req);
  const summary = await runSoonReminderNow();
  res.json({ success: true, data: summary });
}

export async function triggerEodEmailHandler(req: Request, res: Response): Promise<void> {
  void clinicId(req);
  const summary = await runDailyEodEmailNow();
  res.json({ success: true, data: summary });
}

const sendBulkSchema = z.object({
  message: z.string().min(1).max(1000),
  patientIds: z.array(z.string()).optional(),
  kind: z.enum(["MARKETING", "BROADCAST"]).default("MARKETING"),
});

export async function sendBulkSmsHandler(req: Request, res: Response): Promise<void> {
  const body = sendBulkSchema.parse(req.body);
  const result = await sendBulkSms({
    clinicId: clinicId(req),
    message: body.message,
    patientIds: body.patientIds,
    kind: body.kind as any,
  });
  res.json({ success: true, data: result });
}

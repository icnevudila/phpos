import { NotificationKind } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { sendSMS } from "./smsService.js";

export interface BulkSmsOptions {
  clinicId: string;
  message: string;
  patientIds?: string[]; // If empty, send to ALL active patients in clinic
  kind?: NotificationKind;
}

/**
 * Bulk SMS Engine for Marketing and Clinical Announcements
 */
export async function sendBulkSms(options: BulkSmsOptions): Promise<{ total: number; queued: number }> {
  const { clinicId, message, patientIds, kind = NotificationKind.MARKETING } = options;

  const where: any = { clinicId };
  if (patientIds && patientIds.length > 0) {
    where.id = { in: patientIds };
  } else {
    // Default to active patients with phone numbers
    where.phone = { not: "" };
  }

  const patients = await prisma.patient.findMany({
    where,
    select: { id: true, phone: true }
  });

  if (patients.length === 0) return { total: 0, queued: 0 };

  // In a real production system, we would use a proper task queue (BullMQ/RabbitMQ).
  // For this MVP transition, we fire-and-forget or process in background.
  // Using Promise.allSettled for a middle ground.
  const jobs = patients.map(p => 
    sendSMS({
      clinicId,
      patientId: p.id,
      kind,
      to: p.phone!,
      message
    }).catch(e => {
      console.error(`[bulk-sms] Failed for patient ${p.id}:`, e);
      return null;
    })
  );

  // We don't await all of them if the list is huge, but let's await for smaller batches
  await Promise.allSettled(jobs);

  return { total: patients.length, queued: patients.length };
}

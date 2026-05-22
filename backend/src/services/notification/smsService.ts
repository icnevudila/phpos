import type { NotificationKind } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";

import { normalizePhPhone } from "./phone.js";
import { semaphoreSend } from "./semaphoreClient.js";

const MAX_RETRIES = 2; // toplam deneme = 1 + 2 = 3
const BACKOFF_BASE_MS = 500;

export interface SendSmsParams {
  clinicId?: string | null;
  patientId?: string | null;
  userId?: string | null;
  appointmentId?: string | null;
  invoiceId?: string | null;
  kind: NotificationKind;
  to: string;
  message: string;
  /** Aynı appointment + kind için daha önce SENT varsa tekrar göndermez. */
  dedupeByAppointment?: boolean;
}

export interface SendSmsResult {
  id: string;
  status: "SENT" | "FAILED";
  providerRef?: string | null;
  errorMessage?: string | null;
  dryRun?: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveSender(clinicId?: string | null): Promise<string | undefined> {
  if (!clinicId) return undefined;
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { name: true },
  });
  if (!clinic?.name) return undefined;
  // Sender name sadece alfanumerik olabilir, 11 karakterle sınırlıdır.
  return clinic.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 11) || undefined;
}

/**
 * SMS gönderir ve Notification tablosuna loglar.
 *
 * Akış:
 *  1. Telefonu normalize et; geçersizse FAILED kaydı oluştur ve dön.
 *  2. (opsiyonel) dedup kontrolü: aynı appointment+kind için SENT varsa skip.
 *  3. PENDING Notification oluştur.
 *  4. Semaphore'a gönder; başarısızsa exponential backoff ile 2 kez retry.
 *  5. Sonuca göre SENT/FAILED'e çevir ve kayıt döndür.
 */
export async function sendSMS(params: SendSmsParams): Promise<SendSmsResult> {
  const normalized = normalizePhPhone(params.to);

  if (!normalized) {
    const log = await prisma.notification.create({
      data: {
        clinicId: params.clinicId ?? null,
        patientId: params.patientId ?? null,
        userId: params.userId ?? null,
        appointmentId: params.appointmentId ?? null,
        invoiceId: params.invoiceId ?? null,
        channel: "SMS",
        kind: params.kind,
        recipient: params.to,
        message: params.message,
        status: "FAILED",
        errorMessage: "Invalid PH mobile number",
      },
    });
    return { id: log.id, status: "FAILED", errorMessage: log.errorMessage };
  }

  // Enforce quiet hours (9:00 PM to 8:00 AM Manila Time)
  const manilaHourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  const hour = parseInt(manilaHourStr, 10);

  if ((hour >= 21 || hour < 8) && params.kind !== "GENERIC") {
    const log = await prisma.notification.create({
      data: {
        clinicId: params.clinicId ?? null,
        patientId: params.patientId ?? null,
        userId: params.userId ?? null,
        appointmentId: params.appointmentId ?? null,
        invoiceId: params.invoiceId ?? null,
        channel: "SMS",
        kind: params.kind,
        recipient: normalized.e164,
        message: params.message,
        status: "FAILED",
        errorMessage: "Blocked by Quiet Hours (9:00 PM - 8:00 AM Manila Time)",
      },
    });
    return { id: log.id, status: "FAILED", errorMessage: log.errorMessage };
  }

  if (params.dedupeByAppointment && params.appointmentId) {
    const existing = await prisma.notification.findFirst({
      where: {
        appointmentId: params.appointmentId,
        kind: params.kind,
        status: "SENT",
      },
      select: { id: true },
    });
    if (existing) {
      return { id: existing.id, status: "SENT", errorMessage: null };
    }
  }

  if (params.message.length > 160) {
    console.warn(
      `[sms] message exceeds 160 chars (len=${params.message.length}) kind=${params.kind}`,
    );
  }

  const pending = await prisma.notification.create({
    data: {
      clinicId: params.clinicId ?? null,
      patientId: params.patientId ?? null,
      userId: params.userId ?? null,
      appointmentId: params.appointmentId ?? null,
      invoiceId: params.invoiceId ?? null,
      channel: "SMS",
      kind: params.kind,
      recipient: normalized.e164,
      message: params.message,
      status: "PENDING",
    },
  });

  const senderName = await resolveSender(params.clinicId);
  let lastError: string | undefined;
  let providerRef: string | undefined;
  let dryRun = false;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await semaphoreSend({
      localPhone: normalized.local,
      message: params.message,
      senderName,
    });
    if (res.ok) {
      providerRef = res.providerRef;
      dryRun = res.dryRun;
      lastError = undefined;
      break;
    }
    lastError = res.error;
    if (attempt < MAX_RETRIES) {
      await delay(BACKOFF_BASE_MS * 2 ** attempt);
    }
  }

  if (lastError) {
    await prisma.notification.update({
      where: { id: pending.id },
      data: {
        status: "FAILED",
        errorMessage: lastError.slice(0, 500),
        retryCount: MAX_RETRIES,
      },
    });
    return { id: pending.id, status: "FAILED", errorMessage: lastError };
  }

  await prisma.notification.update({
    where: { id: pending.id },
    data: {
      status: "SENT",
      providerRef: providerRef ?? null,
      sentAt: new Date(),
    },
  });
  return { id: pending.id, status: "SENT", providerRef, dryRun };
}

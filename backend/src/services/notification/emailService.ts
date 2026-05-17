import type { NotificationKind } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";

const MAX_RETRIES = 2;
const BACKOFF_BASE_MS = 500;

export interface SendEmailParams {
  clinicId?: string | null;
  patientId?: string | null;
  userId?: string | null;
  appointmentId?: string | null;
  invoiceId?: string | null;
  kind: NotificationKind;
  /** Recipient e-posta adresi */
  to: string;
  subject: string;
  /** HTML body */
  html: string;
  /** Plain-text fallback (zorunlu değil; html'den otomatik üretilir) */
  text?: string;
  /** Aynı appointment + kind için daha önce SENT varsa tekrar göndermez. */
  dedupeByAppointment?: boolean;
  /** Log + dedupe anahtarı (örn. EOD_Z_REPORT:2026-05-16); yoksa subject kullanılır. */
  messageDedupeKey?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

export interface SendEmailResult {
  id: string;
  status: "SENT" | "FAILED";
  providerRef?: string | null;
  errorMessage?: string | null;
  dryRun?: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function resolveFromName(clinicId?: string | null): Promise<string> {
  if (!clinicId) return "DentEase PH";
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { name: true },
  });
  return clinic?.name ?? "DentEase PH";
}

/**
 * Resend API üzerinden e-posta gönderir.
 *
 * Çevre değişkenleri:
 *  - RESEND_API_KEY   → Resend gizli anahtarı (yoksa dry-run modu)
 *  - RESEND_FROM_EMAIL → Gönderici adres (örn: noreply@dentease.ph)
 *
 * Akış: SMS servisiyle aynı — PENDING log → gönder → SENT/FAILED güncelle.
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const logMessage = params.messageDedupeKey ?? params.subject;

  if (!isValidEmail(params.to)) {
    const log = await prisma.notification.create({
      data: {
        clinicId: params.clinicId ?? null,
        patientId: params.patientId ?? null,
        userId: params.userId ?? null,
        appointmentId: params.appointmentId ?? null,
        invoiceId: params.invoiceId ?? null,
        channel: "EMAIL",
        kind: params.kind,
        recipient: params.to,
        message: logMessage,
        status: "FAILED",
        errorMessage: "Invalid email address",
      },
    });
    return { id: log.id, status: "FAILED", errorMessage: "Invalid email address" };
  }

  if (params.dedupeByAppointment && params.appointmentId) {
    const existing = await prisma.notification.findFirst({
      where: {
        appointmentId: params.appointmentId,
        kind: params.kind,
        channel: "EMAIL",
        status: "SENT",
      },
      select: { id: true },
    });
    if (existing) {
      return { id: existing.id, status: "SENT", errorMessage: null };
    }
  }

  const pending = await prisma.notification.create({
    data: {
      clinicId: params.clinicId ?? null,
      patientId: params.patientId ?? null,
      userId: params.userId ?? null,
      appointmentId: params.appointmentId ?? null,
      invoiceId: params.invoiceId ?? null,
      channel: "EMAIL",
      kind: params.kind,
      recipient: params.to,
      message: logMessage,
      status: "PENDING",
    },
  });

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? "noreply@dentease.ph";
  const fromName = await resolveFromName(params.clinicId);

  // Dry-run modu: API key yoksa log'a yaz, SENT olarak işaretle
  if (!apiKey) {
    console.log(`[email:dry-run] To: ${params.to} | Subject: ${params.subject}`);
    await prisma.notification.update({
      where: { id: pending.id },
      data: { status: "SENT", sentAt: new Date(), providerRef: "dry-run" },
    });
    return { id: pending.id, status: "SENT", providerRef: "dry-run", dryRun: true };
  }

  let lastError: string | undefined;
  let providerRef: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [params.to],
          subject: params.subject,
          html: params.html,
          ...(params.text ? { text: params.text } : {}),
          ...(params.attachments?.length
            ? {
                attachments: params.attachments.map((a) => ({
                  filename: a.filename,
                  content: a.content.toString("base64"),
                })),
              }
            : {}),
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as { id?: string };
        providerRef = json.id;
        lastError = undefined;
        break;
      }

      const errText = await res.text();
      lastError = `HTTP ${res.status}: ${errText.slice(0, 300)}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }

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
    data: { status: "SENT", providerRef: providerRef ?? null, sentAt: new Date() },
  });
  return { id: pending.id, status: "SENT", providerRef };
}

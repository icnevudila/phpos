import { AppointmentStatus, type NotificationKind } from "@prisma/client";
import cron, { type ScheduledTask } from "node-cron";

import { prisma } from "../../lib/prisma.js";

import * as T from "./smsTemplates.js";
import { runDailyEodEmailNow } from "./eodEmailJob.js";
import { runBirthdayCampaignNow, runRecallCampaignNow, runReviewInviteCampaignNow } from "./campaignService.js";
import { sendSMS } from "./smsService.js";

const tz = "Asia/Manila";
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
}
function fmtTime(d: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Manila'da "yarın" gününün UTC sınırlarını döndürür.
 * Örn: 2026-04-18 13:00 UTC çağrısı → Manila gün = 2026-04-18 (UTC+8 ile 21:00)
 * tomorrow = 2026-04-19 Manila → UTC [2026-04-18T16:00Z, 2026-04-19T16:00Z]
 */
function manilaTomorrowUtcRange(now: Date): { gte: Date; lt: Date } {
  const nowMs = now.getTime() + MANILA_OFFSET_MS;
  const manila = new Date(nowMs);
  manila.setUTCHours(0, 0, 0, 0);
  const tomorrowStartManila = new Date(manila.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowEndManila = new Date(tomorrowStartManila.getTime() + 24 * 60 * 60 * 1000);
  return {
    gte: new Date(tomorrowStartManila.getTime() - MANILA_OFFSET_MS),
    lt: new Date(tomorrowEndManila.getTime() - MANILA_OFFSET_MS),
  };
}

async function sendRemindersForRange(params: {
  gte: Date;
  lt: Date;
  kind: NotificationKind;
  template: (args: {
    patientName: string;
    dentistName: string;
    date: string;
    time: string;
    clinicPhone: string;
  }) => string;
}): Promise<{ found: number; sent: number }> {
  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: params.gte, lt: params.lt },
      status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
    },
    select: {
      id: true,
      clinicId: true,
      patientId: true,
      scheduledAt: true,
      patient: { select: { firstName: true, lastName: true, phone: true } },
      dentist: { select: { firstName: true, lastName: true } },
      clinic: { select: { phone: true } },
    },
  });

  let sent = 0;
  for (const appt of appointments) {
    const patientName = `${appt.patient.firstName} ${appt.patient.lastName}`.trim();
    const dentistName = appt.dentist.lastName || appt.dentist.firstName;
    const message = params.template({
      patientName,
      dentistName,
      date: fmtDate(appt.scheduledAt),
      time: fmtTime(appt.scheduledAt),
      clinicPhone: appt.clinic.phone ?? "the clinic",
    });
    const res = await sendSMS({
      clinicId: appt.clinicId,
      patientId: appt.patientId,
      appointmentId: appt.id,
      kind: params.kind,
      to: appt.patient.phone,
      message,
      dedupeByAppointment: true,
    });
    if (res.status === "SENT") sent += 1;
  }
  return { found: appointments.length, sent };
}

export async function runDailyReminderNow(now: Date = new Date()): Promise<{
  found: number;
  sent: number;
}> {
  const range = manilaTomorrowUtcRange(now);
  return sendRemindersForRange({
    ...range,
    kind: "APPOINTMENT_REMINDER",
    template: T.appointmentReminder,
  });
}

export async function runSoonReminderNow(now: Date = new Date()): Promise<{
  found: number;
  sent: number;
}> {
  // "2 saat sonra" penceresi: +1h45m ile +2h15m arası
  const start = new Date(now.getTime() + 105 * 60 * 1000);
  const end = new Date(now.getTime() + 135 * 60 * 1000);
  return sendRemindersForRange({
    gte: start,
    lt: end,
    kind: "APPOINTMENT_REMINDER_SOON",
    template: T.appointmentReminderSoon,
  });
}

const tasks: ScheduledTask[] = [];

export function startNotificationScheduler(): void {
  const smsDisabled = process.env.DISABLE_SMS_CRON === "1";
  const eodDisabled = process.env.DISABLE_EOD_EMAIL_CRON === "1";

  if (smsDisabled) {
    console.info("[cron] SMS scheduler disabled via DISABLE_SMS_CRON");
  }
  if (eodDisabled) {
    console.info("[cron] EOD email scheduler disabled via DISABLE_EOD_EMAIL_CRON");
  }
  if (smsDisabled && eodDisabled) {
    return;
  }

  if (!smsDisabled) {
    const daily = cron.schedule(
      "0 9 * * *",
      () => {
        void runDailyReminderNow()
          .then((r) => console.info("[cron] daily reminder", r))
          .catch((e: unknown) => console.error("[cron] daily reminder error", e));
      },
      { timezone: tz },
    );

    const soon = cron.schedule(
      "0 14 * * *",
      () => {
        void runSoonReminderNow()
          .then((r) => console.info("[cron] soon reminder", r))
          .catch((e: unknown) => console.error("[cron] soon reminder error", e));
      },
      { timezone: tz },
    );

    tasks.push(daily, soon);
    console.info("[cron] SMS scheduler started (09:00 + 14:00 Asia/Manila)");
  }

  if (!eodDisabled) {
    const eod = cron.schedule(
      "0 20 * * *",
      () => {
        void runDailyEodEmailNow()
          .then((r) => console.info("[cron] EOD Z-report email", r))
          .catch((e: unknown) => console.error("[cron] EOD email error", e));
      },
      { timezone: tz },
    );

    const birthday = cron.schedule(
      "0 10 * * *",
      () => {
        void runBirthdayCampaignNow()
          .then((r) => console.info("[cron] birthday campaign", r))
          .catch((e: unknown) => console.error("[cron] birthday campaign error", e));
      },
      { timezone: tz },
    );

    const recall = cron.schedule(
      "0 11 * * *",
      () => {
        void runRecallCampaignNow()
          .then((r) => console.info("[cron] recall campaign", r))
          .catch((e: unknown) => console.error("[cron] recall campaign error", e));
      },
      { timezone: tz },
    );

    const reviewInvite = cron.schedule(
      "0 12 * * *",
      () => {
        void runReviewInviteCampaignNow()
          .then((r) => console.info("[cron] Google review invite campaign", r))
          .catch((e: unknown) => console.error("[cron] Google review invite campaign error", e));
      },
      { timezone: tz },
    );

    tasks.push(eod, birthday, recall, reviewInvite);
    console.info("[cron] EOD & Campaigns email scheduler started (10:00 birthday, 11:00 recall, 12:00 review invite, 20:05 EOD Asia/Manila)");
  }
}

export function stopNotificationScheduler(): void {
  for (const t of tasks) t.stop();
  tasks.length = 0;
}

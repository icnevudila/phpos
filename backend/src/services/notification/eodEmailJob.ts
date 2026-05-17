import { UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { generateZReportPdf } from "../eodReportPdf.js";
import { eodZReportEmail } from "./emailTemplates.js";
import { sendEmail } from "./emailService.js";

const tz = "Asia/Manila";
const DEDUPE_PREFIX = "EOD_Z_REPORT:";

function manilaDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function manilaTodayUtc(now = new Date()): Date {
  const key = manilaDateKey(now);
  const [y, m, day] = key.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, day!, 0, 0, 0));
}

export async function runDailyEodEmailNow(now: Date = new Date()): Promise<{
  clinics: number;
  sent: number;
  skipped: number;
}> {
  const reportDate = manilaTodayUtc(now);
  const dateKey = manilaDateKey(reportDate);
  const dedupeSubject = `${DEDUPE_PREFIX}${dateKey}`;

  const clinics = await prisma.clinic.findMany({
    select: { id: true, name: true },
  });

  let sent = 0;
  let skipped = 0;

  for (const clinic of clinics) {
    const admins = await prisma.user.findMany({
      where: {
        clinicId: clinic.id,
        role: UserRole.ADMIN,
        isActive: true,
      },
      select: { id: true, email: true },
    });

    const override = process.env.EOD_EMAIL_OVERRIDE?.trim();
    const recipients = override
      ? [{ id: "override", email: override }]
      : admins.filter((u) => u.email && u.email.includes("@"));

    if (!recipients.length) {
      skipped += 1;
      continue;
    }

    const already = await prisma.notification.findFirst({
      where: {
        clinicId: clinic.id,
        channel: "EMAIL",
        kind: "GENERIC",
        status: "SENT",
        message: dedupeSubject,
      },
      select: { id: true },
    });
    if (already) {
      skipped += 1;
      continue;
    }

    let pdf: Buffer;
    try {
      pdf = await generateZReportPdf(clinic.id, reportDate);
    } catch (e) {
      console.error("[cron] EOD PDF failed", clinic.id, e);
      skipped += 1;
      continue;
    }

    const tpl = eodZReportEmail({
      clinicName: clinic.name,
      reportDateLabel: new Intl.DateTimeFormat("en-PH", {
        timeZone: tz,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(reportDate),
    });

    for (const admin of recipients) {
      const res = await sendEmail({
        clinicId: clinic.id,
        userId: admin.id === "override" ? null : admin.id,
        kind: "GENERIC",
        to: admin.email!,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
        messageDedupeKey: dedupeSubject,
        attachments: [
          {
            filename: `z-report-${dateKey}.pdf`,
            content: pdf,
          },
        ],
      });
      if (res.status === "SENT") sent += 1;
    }
  }

  return { clinics: clinics.length, sent, skipped };
}

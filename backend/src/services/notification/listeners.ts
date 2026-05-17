import { subscribeAppointmentEvents } from "../../events/notifications.js";
import { subscribeInvoiceEvents } from "../../events/invoiceEvents.js";
import { prisma } from "../../lib/prisma.js";

import * as T from "./smsTemplates.js";
import * as ET from "./emailTemplates.js";
import { sendSMS } from "./smsService.js";
import { sendEmail } from "./emailService.js";

const tz = "Asia/Manila";

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
function money(v: string | number): string {
  return Number(v).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function fetchAppointmentForNotif(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      clinicId: true,
      patientId: true,
      scheduledAt: true,
      patient: { select: { firstName: true, lastName: true, phone: true, email: true } },
      dentist: { select: { firstName: true, lastName: true } },
      clinic: { select: { phone: true, name: true } },
    },
  });
}

/**
 * Uygulama startup'ında bir kez çağrılır. Olay abonelerini kurar.
 * Her olay için hem SMS (Semaphore) hem Email (Resend) paralel gönderilir.
 * Herhangi birinin başarısız olması diğerini bloke etmez.
 */
export function registerNotificationListeners(): void {
  subscribeAppointmentEvents(async (event) => {
    const appointment = await fetchAppointmentForNotif(event.appointmentId);
    if (!appointment) return;
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim();
    const date = fmtDate(appointment.scheduledAt);
    const time = fmtTime(appointment.scheduledAt);
    const dentistName = `${appointment.dentist.firstName} ${appointment.dentist.lastName}`.trim();
    const clinicName = appointment.clinic.name;
    const clinicPhone = appointment.clinic.phone ?? undefined;
    const patientEmail = appointment.patient.email ?? null;

    if (event.type === "appointment.created") {
      const sends: Promise<unknown>[] = [
        sendSMS({
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          kind: "APPOINTMENT_CONFIRMED",
          to: appointment.patient.phone,
          message: T.appointmentConfirmed({ patientName, date, time }),
        }),
      ];
      if (patientEmail) {
        const tpl = ET.appointmentConfirmedEmail({ patientName, dentistName, date, time, clinicName });
        sends.push(
          sendEmail({
            clinicId: appointment.clinicId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            kind: "APPOINTMENT_CONFIRMED",
            to: patientEmail,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
          }),
        );
      }
      await Promise.allSettled(sends);
      return;
    }

    if (event.type === "appointment.cancelled") {
      const sends: Promise<unknown>[] = [
        sendSMS({
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          kind: "APPOINTMENT_CANCELLED",
          to: appointment.patient.phone,
          message: T.appointmentCancelled({ patientName, date, time }),
        }),
      ];
      if (patientEmail) {
        const tpl = ET.appointmentCancelledEmail({ patientName, date, time, clinicName, clinicPhone });
        sends.push(
          sendEmail({
            clinicId: appointment.clinicId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            kind: "APPOINTMENT_CANCELLED",
            to: patientEmail,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
          }),
        );
      }
      await Promise.allSettled(sends);
      return;
    }

    if (event.type === "appointment.rescheduled") {
      const sends: Promise<unknown>[] = [
        sendSMS({
          clinicId: appointment.clinicId,
          patientId: appointment.patientId,
          appointmentId: appointment.id,
          kind: "APPOINTMENT_RESCHEDULED",
          to: appointment.patient.phone,
          message: T.appointmentRescheduled({ patientName, date, time }),
        }),
      ];
      if (patientEmail) {
        const tpl = ET.appointmentConfirmedEmail({ patientName, dentistName, date, time, clinicName });
        sends.push(
          sendEmail({
            clinicId: appointment.clinicId,
            patientId: appointment.patientId,
            appointmentId: appointment.id,
            kind: "APPOINTMENT_RESCHEDULED",
            to: patientEmail,
            subject: `Appointment Rescheduled — ${date}`,
            html: tpl.html,
            text: tpl.text,
          }),
        );
      }
      await Promise.allSettled(sends);
      return;
    }
  });

  subscribeInvoiceEvents(async (event) => {
    if (event.type !== "invoice.payment_received") return;
    const invoice = await prisma.invoice.findUnique({
      where: { id: event.invoiceId },
      select: {
        id: true,
        clinicId: true,
        patientId: true,
        orNumber: true,
        patient: { select: { firstName: true, lastName: true, phone: true, email: true } },
        clinic: { select: { name: true, phone: true } },
      },
    });
    if (!invoice) return;
    const patientName = `${invoice.patient.firstName} ${invoice.patient.lastName}`.trim();
    const clinicName = invoice.clinic.name;
    const patientEmail = invoice.patient.email ?? null;
    const amountStr = money(event.amount);

    const sends: Promise<unknown>[] = [
      sendSMS({
        clinicId: invoice.clinicId,
        patientId: invoice.patientId,
        invoiceId: invoice.id,
        kind: "PAYMENT_RECEIVED",
        to: invoice.patient.phone,
        message: T.paymentReceived({ patientName, amount: amountStr, orNumber: invoice.orNumber }),
      }),
    ];

    if (patientEmail) {
      const tpl = ET.paymentReceivedEmail({
        patientName,
        amount: amountStr,
        orNumber: invoice.orNumber,
        clinicName,
      });
      sends.push(
        sendEmail({
          clinicId: invoice.clinicId,
          patientId: invoice.patientId,
          invoiceId: invoice.id,
          kind: "PAYMENT_RECEIVED",
          to: patientEmail,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        }),
      );
    }

    await Promise.allSettled(sends);
  });
}

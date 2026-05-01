import { subscribeAppointmentEvents } from "../../events/notifications.js";
import { subscribeInvoiceEvents } from "../../events/invoiceEvents.js";
import { prisma } from "../../lib/prisma.js";

import * as T from "./smsTemplates.js";
import { sendSMS } from "./smsService.js";

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

async function fetchAppointmentForSms(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      id: true,
      clinicId: true,
      patientId: true,
      scheduledAt: true,
      patient: { select: { firstName: true, lastName: true, phone: true } },
      dentist: { select: { firstName: true, lastName: true } },
      clinic: { select: { phone: true, name: true } },
    },
  });
}

/**
 * Uygulama startup'ında bir kez çağrılır. Olay abonelerini kurar.
 */
export function registerNotificationListeners(): void {
  subscribeAppointmentEvents(async (event) => {
    const appointment = await fetchAppointmentForSms(event.appointmentId);
    if (!appointment) return;
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim();
    const date = fmtDate(appointment.scheduledAt);
    const time = fmtTime(appointment.scheduledAt);

    if (event.type === "appointment.created") {
      await sendSMS({
        clinicId: appointment.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        kind: "APPOINTMENT_CONFIRMED",
        to: appointment.patient.phone,
        message: T.appointmentConfirmed({ patientName, date, time }),
      });
      return;
    }

    if (event.type === "appointment.cancelled") {
      await sendSMS({
        clinicId: appointment.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        kind: "APPOINTMENT_CANCELLED",
        to: appointment.patient.phone,
        message: T.appointmentCancelled({ patientName, date, time }),
      });
      return;
    }

    if (event.type === "appointment.rescheduled") {
      await sendSMS({
        clinicId: appointment.clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        kind: "APPOINTMENT_RESCHEDULED",
        to: appointment.patient.phone,
        message: T.appointmentRescheduled({ patientName, date, time }),
      });
      return;
    }

    // status_changed — no default SMS; cancellations cancelled event ile gelir
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
        patient: { select: { firstName: true, lastName: true, phone: true } },
      },
    });
    if (!invoice) return;
    const patientName = `${invoice.patient.firstName} ${invoice.patient.lastName}`.trim();
    await sendSMS({
      clinicId: invoice.clinicId,
      patientId: invoice.patientId,
      invoiceId: invoice.id,
      kind: "PAYMENT_RECEIVED",
      to: invoice.patient.phone,
      message: T.paymentReceived({
        patientName,
        amount: money(event.amount),
        orNumber: invoice.orNumber,
      }),
    });
  });
}

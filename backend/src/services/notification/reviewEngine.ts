import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { sendSMS } from "./smsService.js";

/**
 * Checks for appointments completed 24h ago and sends a review invitation.
 */
export async function runReviewEngineNow() {
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);
  
  const start = new Date(yesterday.getTime() - 30 * 60 * 1000);
  const end = new Date(yesterday.getTime() + 30 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: AppointmentStatus.COMPLETED,
      completedAt: { gte: start, lt: end },
    },
    include: {
      patient: { select: { firstName: true, phone: true } },
      clinic: { select: { name: true } }
    }
  });

  let sent = 0;
  for (const appt of appointments) {
    const reviewLink = "https://g.page/review";
    const message = `Hi ${appt.patient.firstName}! Thank you for choosing ${appt.clinic.name}. We'd love to hear your feedback! Please leave us a review here: ${reviewLink}`;

    await sendSMS({
      clinicId: appt.clinicId,
      patientId: appt.patientId,
      appointmentId: appt.id,
      kind: "MARKETING",
      to: appt.patient.phone,
      message,
      dedupeByAppointment: true
    });
    sent++;
  }

  return { found: appointments.length, sent };
}

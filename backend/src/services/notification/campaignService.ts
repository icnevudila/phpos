import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "./emailService.js";

const MANILA_TZ = "Asia/Manila";

/**
 * Runs the daily birthday campaign.
 * Finds patients with birthday today in Manila Time and sends greeting email.
 */
export async function runBirthdayCampaignNow(now: Date = new Date()): Promise<{ found: number; sent: number }> {
  // Convert now to Manila Time parts
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: MANILA_TZ,
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
  
  const parts = formatter.formatToParts(now);
  const month = parseInt(parts.find(p => p.type === "month")?.value ?? "0", 10);
  const day = parseInt(parts.find(p => p.type === "day")?.value ?? "0", 10);
  const currentYear = parts.find(p => p.type === "year")?.value ?? new Date().getFullYear().toString();

  if (month === 0 || day === 0) {
    return { found: 0, sent: 0 };
  }

  // Get all patients with birthdays
  const patients = await prisma.patient.findMany({
    where: {
      isActive: true,
      email: { not: null },
      birthDate: { not: null }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      birthDate: true,
      clinicId: true,
      clinic: { select: { name: true } }
    }
  });

  // Filter patients whose birthDate month and day match today
  const birthdayPatients = patients.filter((p) => {
    if (!p.birthDate) return false;
    const bDate = new Date(p.birthDate);
    // Since birthDate is stored in UTC/Local, compare month (0-indexed) and date
    // Adjusting for raw date extraction
    return (bDate.getUTCMonth() + 1 === month && bDate.getUTCDate() === day) ||
           (bDate.getMonth() + 1 === month && bDate.getDate() === day);
  });

  let sent = 0;
  for (const patient of birthdayPatients) {
    if (!patient.email) continue;
    
    const dedupeKey = `birthday_campaign:${patient.id}:${currentYear}`;
    const subject = `Happy Birthday from ${patient.clinic.name ?? "DentEase PH"}! 🎉`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; color: #334155;">
        <h1 style="color: #0d9488;">Happy Birthday, ${patient.firstName}! 🎂🎈</h1>
        <p>Wishing you a wonderful day filled with joy, laughter, and beautiful smiles!</p>
        <p>Warmest regards,</p>
        <p><strong>The Team at ${patient.clinic.name ?? "DentEase PH"}</strong></p>
      </div>
    `;

    try {
      const result = await sendEmail({
        clinicId: patient.clinicId,
        patientId: patient.id,
        kind: "GENERIC",
        to: patient.email,
        subject,
        html,
        messageDedupeKey: dedupeKey,
      });

      if (result.status === "SENT") {
        sent += 1;
      }
    } catch (err) {
      console.error(`Failed to send birthday email to ${patient.email}:`, err);
    }
  }

  return { found: birthdayPatients.length, sent };
}

/**
 * Runs the daily recall campaign.
 * Finds patients whose last visit was > 6 months ago and who have no upcoming appointments,
 * then sends a dentist recall invitation email.
 */
export async function runRecallCampaignNow(now: Date = new Date()): Promise<{ found: number; sent: number }> {
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  // Format current year-month for deduplication
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: MANILA_TZ,
    month: "numeric",
    year: "numeric"
  });
  const parts = formatter.formatToParts(now);
  const m = parts.find(p => p.type === "month")?.value ?? "0";
  const y = parts.find(p => p.type === "year")?.value ?? "0";
  const yearMonthStr = `${y}-${m}`;

  // Find all patients who had a visit > 6 months ago (or registration date > 6 months ago)
  // And whose last visit was before sixMonthsAgo
  const patients = await prisma.patient.findMany({
    where: {
      isActive: true,
      email: { not: null },
      OR: [
        { lastDentalVisit: { lt: sixMonthsAgo } },
        {
          AND: [
            { lastDentalVisit: null },
            { createdAt: { lt: sixMonthsAgo } }
          ]
        }
      ]
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      clinicId: true,
      lastDentalVisit: true,
      clinic: { select: { name: true } },
      appointments: {
        where: {
          scheduledAt: { gte: now },
          status: { in: ["PENDING", "CONFIRMED"] }
        },
        select: { id: true }
      }
    }
  });

  // Filter out patients who have an upcoming appointment
  const recallPatients = patients.filter((p) => p.appointments.length === 0);

  let sent = 0;
  for (const patient of recallPatients) {
    if (!patient.email) continue;

    const dedupeKey = `recall_campaign:${patient.id}:${yearMonthStr}`;
    const subject = `Time for your routine dental check-up at ${patient.clinic.name ?? "DentEase PH"}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; color: #334155;">
        <h1 style="color: #0d9488;">Hello ${patient.firstName},</h1>
        <p>We noticed it has been over 6 months since your last dental visit. Routine cleanings and dental examinations are essential to keep your teeth and gums healthy and prevent future problems.</p>
        <p>Let's get your next check-up scheduled! You can reply to this email, or call us directly to book your appointment.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>The Team at ${patient.clinic.name ?? "DentEase PH"}</strong></p>
      </div>
    `;

    try {
      const result = await sendEmail({
        clinicId: patient.clinicId,
        patientId: patient.id,
        kind: "GENERIC",
        to: patient.email,
        subject,
        html,
        messageDedupeKey: dedupeKey,
      });

      if (result.status === "SENT") {
        sent += 1;
      }
    } catch (err) {
      console.error(`Failed to send recall email to ${patient.email}:`, err);
    }
  }

  return { found: recallPatients.length, sent };
}

/**
 * Runs the Google Review Invite system.
 * Finds appointments COMPLETED 24-48 hours ago for clinics that have googleReviewLink configured,
 * and sends an automated invite to leave a review.
 */
export async function runReviewInviteCampaignNow(now: Date = new Date()): Promise<{ found: number; sent: number }> {
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Find appointments completed 24-48h ago
  const appointments = await prisma.appointment.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: twoDaysAgo, lte: oneDayAgo },
      clinic: { googleReviewLink: { not: null } }
    },
    select: {
      id: true,
      clinicId: true,
      patientId: true,
      patient: { select: { firstName: true, email: true } },
      dentist: { select: { lastName: true } },
      clinic: { select: { name: true, googleReviewLink: true } }
    }
  });

  let sent = 0;
  for (const appt of appointments) {
    if (!appt.patient.email || !appt.clinic.googleReviewLink) continue;

    // Use a unique deduplication key for this specific completed appointment review invite
    const dedupeKey = `review_invite:${appt.id}`;
    const subject = `How was your visit to ${appt.clinic.name}?`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; color: #334155;">
        <h1 style="color: #0d9488;">Thank you, ${appt.patient.firstName}!</h1>
        <p>We hope you had a pleasant experience during your visit yesterday with Dr. ${appt.dentist.lastName || "Santos"}.</p>
        <p>Our team is dedicated to providing high-quality care to all our patients. We would greatly appreciate it if you could spare 30 seconds to share your feedback and leave us a review on Google:</p>
        <p style="margin: 30px 0;">
          <a href="${appt.clinic.googleReviewLink}" target="_blank" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Leave a Google Review</a>
        </p>
        <p>Thank you for choosing ${appt.clinic.name}!</p>
      </div>
    `;

    try {
      const result = await sendEmail({
        clinicId: appt.clinicId,
        patientId: appt.patientId,
        appointmentId: appt.id,
        kind: "GENERIC",
        to: appt.patient.email,
        subject,
        html,
        messageDedupeKey: dedupeKey,
      });

      if (result.status === "SENT") {
        sent += 1;
      }
    } catch (err) {
      console.error(`Failed to send review invite to ${appt.patient.email}:`, err);
    }
  }

  return { found: appointments.length, sent };
}

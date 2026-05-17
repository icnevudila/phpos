/**
 * Email şablonları — Resend/HTML formatında.
 *
 * Her fonksiyon { subject, html, text } döndürür.
 * Tasarım: Clinic markasıyla uyumlu, sade, mobil-dostu HTML.
 * Renk paleti: emerald (#10b981) ana, slate metin.
 */

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc; color: #0f172a; margin: 0; padding: 0;
`;

const CARD_STYLE = `
  max-width: 600px; margin: 32px auto; background: #ffffff;
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
`;

const HEADER_STYLE = `
  background: #0f172a; padding: 32px 40px; text-align: center;
`;

const BODY_STYLE = `padding: 40px;`;

const FOOTER_STYLE = `
  background: #f8fafc; border-top: 1px solid #e2e8f0;
  padding: 24px 40px; text-align: center;
  font-size: 12px; color: #94a3b8;
`;

const BADGE_STYLE = (color = "#10b981") => `
  display: inline-block; background: ${color}1a; color: ${color};
  border: 1px solid ${color}33; border-radius: 999px;
  padding: 4px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
`;

const BTN_STYLE = `
  display: inline-block; background: #10b981; color: #fff;
  text-decoration: none; padding: 14px 32px; border-radius: 12px;
  font-weight: 700; font-size: 14px; letter-spacing: 0.04em; margin-top: 24px;
`;

function wrap(body: string, clinicName: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      <p style="color:#10b981;font-size:10px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px">DentEase PH</p>
      <p style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.02em">${clinicName}</p>
    </div>
    <div style="${BODY_STYLE}">${body}</div>
    <div style="${FOOTER_STYLE}">
      <p>This message was sent by DentEase PH on behalf of ${clinicName}.</p>
      <p style="margin-top:4px">© ${new Date().getFullYear()} DentEase PH — All rights reserved.</p>
    </div>
  </div>
</body></html>`;
}

function h2(text: string) {
  return `<h2 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#0f172a;letter-spacing:-0.02em">${text}</h2>`;
}
function p(text: string) {
  return `<p style="margin:0 0 12px;font-size:15px;color:#475569;line-height:1.6">${text}</p>`;
}
function infoRow(label: string, value: string) {
  return `<tr><td style="padding:10px 16px;font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #f1f5f9">${label}</td><td style="padding:10px 16px;font-size:14px;font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9">${value}</td></tr>`;
}
function table(rows: string) {
  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;background:#f8fafc;border-radius:12px;overflow:hidden">${rows}</table>`;
}

// ─── Şablonlar ───────────────────────────────────────────────────────────────

export function appointmentReminderEmail(args: {
  patientName: string;
  dentistName: string;
  date: string;
  time: string;
  clinicName: string;
  clinicPhone?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Appointment Reminder — ${args.date} at ${args.time}`;
  const body = `
    ${h2("Appointment Reminder")}
    ${p(`Hi <strong>${args.patientName}</strong>, this is a friendly reminder about your upcoming dental appointment.`)}
    ${table(
      infoRow("Date", args.date) +
      infoRow("Time", args.time) +
      infoRow("Dentist", `Dr. ${args.dentistName}`) +
      infoRow("Clinic", args.clinicName) +
      (args.clinicPhone ? infoRow("Phone", args.clinicPhone) : "")
    )}
    ${p("Please arrive 10 minutes early. If you need to reschedule, contact us as soon as possible.")}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Hi ${args.patientName}! Reminder: dental appt on ${args.date} at ${args.time} with Dr.${args.dentistName}. Call ${args.clinicPhone ?? args.clinicName} to reschedule.`,
  };
}

export function appointmentConfirmedEmail(args: {
  patientName: string;
  dentistName: string;
  date: string;
  time: string;
  clinicName: string;
}): { subject: string; html: string; text: string } {
  const subject = `Appointment Confirmed — ${args.date}`;
  const body = `
    <div style="text-align:center;margin-bottom:24px"><span style="${BADGE_STYLE()}">Confirmed ✓</span></div>
    ${h2("Your appointment is confirmed!")}
    ${p(`Hi <strong>${args.patientName}</strong>, your appointment has been successfully booked.`)}
    ${table(
      infoRow("Date", args.date) +
      infoRow("Time", args.time) +
      infoRow("Dentist", `Dr. ${args.dentistName}`)
    )}
    ${p("See you soon! 😊")}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Hi ${args.patientName}! Confirmed: appt on ${args.date} at ${args.time} with Dr.${args.dentistName}.`,
  };
}

export function paymentReceivedEmail(args: {
  patientName: string;
  amount: string;
  orNumber?: string | null;
  clinicName: string;
  pdfUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Payment Received — PHP ${args.amount}`;
  const or = args.orNumber ? ` (${args.orNumber})` : "";
  const body = `
    <div style="text-align:center;margin-bottom:24px"><span style="${BADGE_STYLE("#0ea5e9")}">Payment Received</span></div>
    ${h2("Thank you for your payment!")}
    ${p(`Hi <strong>${args.patientName}</strong>, we have received your payment.`)}
    ${table(
      infoRow("Amount", `PHP ${args.amount}`) +
      (args.orNumber ? infoRow("OR Number", args.orNumber) : "") +
      infoRow("Clinic", args.clinicName)
    )}
    ${args.pdfUrl ? `<div style="text-align:center"><a href="${args.pdfUrl}" style="${BTN_STYLE}">Download Official Receipt</a></div>` : ""}
    ${p("Keep this email for your records.")}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Hi ${args.patientName}! Payment of PHP ${args.amount} received${or}. Thank you! -${args.clinicName}`,
  };
}

export function balanceDueEmail(args: {
  patientName: string;
  amount: string;
  orNumber?: string | null;
  clinicName: string;
  clinicPhone?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Balance Due — PHP ${args.amount}`;
  const or = args.orNumber ? ` ${args.orNumber}` : "";
  const body = `
    <div style="text-align:center;margin-bottom:24px"><span style="${BADGE_STYLE("#f59e0b")}">Balance Due</span></div>
    ${h2("Friendly payment reminder")}
    ${p(`Hi <strong>${args.patientName}</strong>, this is a gentle reminder that you have an outstanding balance.`)}
    ${table(
      infoRow("Balance Due", `PHP ${args.amount}`) +
      (args.orNumber ? infoRow("Invoice", args.orNumber) : "") +
      (args.clinicPhone ? infoRow("Contact", args.clinicPhone) : "")
    )}
    ${p("Please contact us at your earliest convenience to settle the balance.")}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Hi ${args.patientName}, reminder: balance of PHP ${args.amount} on invoice${or}. Contact ${args.clinicPhone ?? args.clinicName}.`,
  };
}

export function appointmentCancelledEmail(args: {
  patientName: string;
  date: string;
  time: string;
  clinicName: string;
  clinicPhone?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Appointment Cancelled — ${args.date}`;
  const body = `
    <div style="text-align:center;margin-bottom:24px"><span style="${BADGE_STYLE("#ef4444")}">Cancelled</span></div>
    ${h2("Your appointment has been cancelled")}
    ${p(`Hi <strong>${args.patientName}</strong>, your appointment on ${args.date} at ${args.time} has been cancelled.`)}
    ${p("Please contact us to rebook at a time that works for you.")}
    ${args.clinicPhone ? `<div style="text-align:center;margin-top:24px"><a href="tel:${args.clinicPhone}" style="${BTN_STYLE}">Call Us to Rebook</a></div>` : ""}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Hi ${args.patientName}, your appt on ${args.date} at ${args.time} was cancelled. Call ${args.clinicPhone ?? args.clinicName} to rebook.`,
  };
}

export function birthdayGreetingEmail(args: {
  patientName: string;
  clinicName: string;
}): { subject: string; html: string; text: string } {
  const subject = `Happy Birthday from ${args.clinicName}! 🎂`;
  const body = `
    <div style="text-align:center;margin-bottom:24px;font-size:40px">🎂</div>
    ${h2(`Happy Birthday, ${args.patientName}!`)}
    ${p("Wishing you a wonderful day filled with joy and smiles. We're so happy to have you as part of our clinic family.")}
    ${p("Have an extra reason to smile today!")}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Happy Birthday, ${args.patientName}! Wishing you a wonderful day from ${args.clinicName}.`,
  };
}

export function eodZReportEmail(args: {
  clinicName: string;
  reportDateLabel: string;
}): { subject: string; html: string; text: string } {
  const subject = `End-of-day Z-Report — ${args.reportDateLabel}`;
  const body = `
    <div style="text-align:center;margin-bottom:24px"><span style="${BADGE_STYLE()}">Daily close</span></div>
    ${h2("Z-Report attached")}
    ${p(`Your clinic <strong>${args.clinicName}</strong> daily cash summary for <strong>${args.reportDateLabel}</strong> is attached as a PDF.`)}
    ${p("Review collections, payment methods, and appointment activity before closing the books.")}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Z-Report for ${args.reportDateLabel} is attached (${args.clinicName}).`,
  };
}

export function postOpCheckInEmail(args: {
  patientName: string;
  procedure: string;
  clinicName: string;
  clinicPhone?: string;
}): { subject: string; html: string; text: string } {
  const subject = `How are you feeling? — ${args.clinicName}`;
  const body = `
    <div style="text-align:center;margin-bottom:24px"><span style="${BADGE_STYLE("#8b5cf6")}">Check-in</span></div>
    ${h2("Checking in on your recovery")}
    ${p(`Hi <strong>${args.patientName}</strong>, we're just checking in to see how you're feeling after your <strong>${args.procedure}</strong> today.`)}
    ${p("It's normal to feel some discomfort, but if you have any questions or concerns, please don't hesitate to reach out.")}
    ${args.clinicPhone ? `<div style="text-align:center;margin-top:24px"><a href="tel:${args.clinicPhone}" style="${BTN_STYLE}">Call Us if Needed</a></div>` : ""}
  `;
  return {
    subject,
    html: wrap(body, args.clinicName),
    text: `Hi ${args.patientName}, checking in after your ${args.procedure}. Call ${args.clinicPhone ?? args.clinicName} if you need anything.`,
  };
}

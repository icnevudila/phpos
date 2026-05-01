/**
 * SMS şablonları — Modül 7.
 *
 * Her şablon saf fonksiyondur; yan etkisi yoktur, sadece string üretir.
 * Gönderim/loglama `smsService.ts` içinde yapılır.
 *
 * Not: Tek bir SMS segmenti (GSM-7) 160 karakter; daha uzun mesajlar çoklu
 * segmente bölünür ve ek ücretlendirilir. Şablonlar bu sınırı koruyacak
 * şekilde yazılmıştır. Çalışma zamanında `message.length > 160` ise uyarı
 * loglanır.
 */

interface AppointmentReminderArgs {
  patientName: string;
  dentistName: string;
  date: string; // "Mon 21 Apr"
  time: string; // "10:30 AM"
  clinicPhone: string;
}

interface AppointmentSimpleArgs {
  patientName: string;
  date: string;
  time: string;
}

function firstName(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

export function appointmentReminder(args: AppointmentReminderArgs): string {
  const name = firstName(args.patientName);
  // 160-char hedefi; dentist ve tarih uzunsa otomatik sığar
  return `Hi ${name}! Reminder: your dental appt with Dr.${args.dentistName} is on ${args.date} at ${args.time}. To reschedule call ${args.clinicPhone}. -DentEase`;
}

export function appointmentReminderSoon(args: AppointmentReminderArgs): string {
  const name = firstName(args.patientName);
  return `Hi ${name}! Your appt with Dr.${args.dentistName} is in ~2 hours (${args.time}). See you soon! -DentEase`;
}

export function appointmentConfirmed(args: AppointmentSimpleArgs): string {
  const name = firstName(args.patientName);
  return `Hi ${name}! Confirmed: your appt on ${args.date} at ${args.time} is booked. See you soon! -DentEase`;
}

export function appointmentCancelled(args: AppointmentSimpleArgs): string {
  const name = firstName(args.patientName);
  return `Hi ${name}, your appt on ${args.date} at ${args.time} has been cancelled. Call us to rebook. -DentEase`;
}

export function appointmentRescheduled(args: AppointmentSimpleArgs): string {
  const name = firstName(args.patientName);
  return `Hi ${name}, your appt was moved to ${args.date} at ${args.time}. Reply or call if this doesn't work. -DentEase`;
}

export function paymentReceived(args: {
  patientName: string;
  amount: string; // already formatted e.g. "1,500.00"
  orNumber?: string | null;
}): string {
  const name = firstName(args.patientName);
  const or = args.orNumber ? ` (${args.orNumber})` : "";
  return `Hi ${name}! Payment of PHP ${args.amount} received${or}. Thank you! -DentEase`;
}

export function balanceDue(args: {
  patientName: string;
  amount: string;
  orNumber?: string | null;
}): string {
  const name = firstName(args.patientName);
  const or = args.orNumber ? ` ${args.orNumber}` : "";
  return `Hi ${name}, friendly reminder: balance of PHP ${args.amount} on invoice${or}. Thanks! -DentEase`;
}

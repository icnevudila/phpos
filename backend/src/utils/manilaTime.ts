/**
 * Asia/Manila (UTC+08:00, DST yok) için yardımcılar.
 *
 * `scheduledAt` DB'de UTC olarak saklanır; iş saati / Pazar kontrolü Manila
 * saatine göre yap\u0131l\u0131r.
 */

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

export interface ManilaParts {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
  hour: number; // 0..23
  minute: number; // 0..59
  dayOfWeek: number; // 0=Sun..6=Sat
}

export function getManilaParts(date: Date): ManilaParts {
  const d = new Date(date.getTime() + MANILA_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    dayOfWeek: d.getUTCDay(),
  };
}

export function isSundayInManila(date: Date): boolean {
  return getManilaParts(date).dayOfWeek === 0;
}

/**
 * Manila saati ile [startHour:00, endHour:00) iş saatleri aralığında mı?
 * Hem başlangıç hem bitiş (start + durationMin) aynı takvim günü ve aralıkta olmalı.
 */
export function isWithinBusinessHours(
  startUtc: Date,
  durationMinutes: number,
  startHour = 8,
  endHour = 18,
): boolean {
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60_000);
  const s = getManilaParts(startUtc);
  const e = getManilaParts(endUtc);
  if (s.year !== e.year || s.month !== e.month || s.day !== e.day) return false;
  const sMin = s.hour * 60 + s.minute;
  const eMin = e.hour * 60 + e.minute;
  return sMin >= startHour * 60 && eMin <= endHour * 60;
}

/** YYYY-MM-DD (Manila) → o gün Manila 00:00 ve 24:00 için UTC Date çifti. */
export function manilaDayRangeUtc(isoDate: string): { gte: Date; lt: Date } {
  const gte = new Date(`${isoDate}T00:00:00.000+08:00`);
  const lt = new Date(`${isoDate}T00:00:00.000+08:00`);
  lt.setUTCDate(lt.getUTCDate() + 1);
  return { gte, lt };
}

/**
 * Manila saatine göre formatlı saat ("HH:mm") döndürür.
 */
export function formatManilaTime(date: Date): string {
  const p = getManilaParts(date);
  const hh = String(p.hour).padStart(2, "0");
  const mm = String(p.minute).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const MANILA_BUSINESS_START_HOUR = 8;
export const MANILA_BUSINESS_END_HOUR = 18;

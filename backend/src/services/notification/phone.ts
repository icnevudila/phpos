/**
 * Filipin telefon numarası normalizasyonu.
 *
 * Dönüşler:
 *   e164  = +63XXXXXXXXXX  (DB / UI için)
 *   local = 09XXXXXXXXX    (Semaphore API'si bunu ister)
 *
 * Kabul edilen girdi formatları:
 *   09171234567   → +639171234567
 *   9171234567    → +639171234567
 *   +639171234567 → +639171234567
 *   639171234567  → +639171234567
 *   +63 917 123 4567 (boşluk/tire temizlenir)
 */
export interface NormalizedPhone {
  e164: string;
  local: string;
}

export function normalizePhPhone(raw: string | null | undefined): NormalizedPhone | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d+]/g, "");
  let digits = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;

  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("63")) digits = digits.slice(2);

  // Filipin mobil: 10 haneli ve 9 ile başlamalı
  if (digits.length !== 10 || !digits.startsWith("9")) return null;

  return {
    e164: `+63${digits}`,
    local: `0${digits}`,
  };
}

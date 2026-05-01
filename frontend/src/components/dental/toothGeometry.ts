import type { ToothSurface } from "../../types/dentalChart";

/**
 * Universal (ABD) numaralandırma:
 *   Üst sıra 1..16  — sağ molarden sola molare
 *   Alt sıra 17..32 — sol molardan sağa molare
 *
 * Orta hat: 8↔9 (üst), 24↔25 (alt). Mesial = orta hatta yakın yüz.
 */
export function isUpper(toothNumber: number): boolean {
  return toothNumber >= 1 && toothNumber <= 16;
}

/**
 * Chart'ta dişi sol-sağ yansıtmak için kullanılan sütun (0..15, soldan sağa ekranda).
 */
export function columnIndex(toothNumber: number): number {
  if (isUpper(toothNumber)) {
    return toothNumber - 1; // 1..16 → 0..15
  }
  return 32 - toothNumber; // 17..32 → 15..0
}

export function isMolar(toothNumber: number): boolean {
  const col = columnIndex(toothNumber);
  return col <= 2 || col >= 13;
}

export function isPremolar(toothNumber: number): boolean {
  const col = columnIndex(toothNumber);
  return col === 3 || col === 4 || col === 11 || col === 12;
}

export function isAnterior(toothNumber: number): boolean {
  const col = columnIndex(toothNumber);
  return col >= 5 && col <= 10;
}

export function isCanine(toothNumber: number): boolean {
  const col = columnIndex(toothNumber);
  return col === 5 || col === 10;
}

export function isIncisor(toothNumber: number): boolean {
  const col = columnIndex(toothNumber);
  return col >= 6 && col <= 9;
}

export type ToothKind = "molar" | "premolar" | "canine" | "incisor";

export function toothKind(toothNumber: number): ToothKind {
  if (isMolar(toothNumber)) return "molar";
  if (isPremolar(toothNumber)) return "premolar";
  if (isCanine(toothNumber)) return "canine";
  return "incisor";
}

export function rootCount(toothNumber: number): number {
  const kind = toothKind(toothNumber);
  if (kind === "molar") return isUpper(toothNumber) ? 3 : 2;
  if (kind === "premolar") return isUpper(toothNumber) && isMolar(toothNumber) ? 2 : 1;
  return 1;
}

/** Ön dişlerde oklüzal yerine insizal kenar kullanılır — etiketleme için. */
export function centerSurfaceLabel(toothNumber: number): "Occlusal" | "Incisal" {
  return isAnterior(toothNumber) ? "Incisal" : "Occlusal";
}

/**
 * Üstte bukkalin chart'ta üstte olduğunu varsayıyoruz (arka üst, ön üst dudak tarafı).
 * Altta da bukkali üstte (chart bakış açısında diş kronunu kameraya çeviriyormuş gibi) tutuyoruz.
 * Lingual: altta / Buccal: üstte — üst ve alt çenede tutarlı.
 */
export function surfaceSides(toothNumber: number): {
  top: ToothSurface;
  bottom: ToothSurface;
  left: ToothSurface;
  right: ToothSurface;
  center: ToothSurface;
} {
  const col = columnIndex(toothNumber);
  const leftIsMesial = col >= 8; // sağ yarı (kullanıcının bakışında sol): mesial soldadır
  return {
    top: "BUCCAL",
    bottom: "LINGUAL",
    left: leftIsMesial ? "MESIAL" : "DISTAL",
    right: leftIsMesial ? "DISTAL" : "MESIAL",
    center: "OCCLUSAL",
  };
}

import type { HmoClaimStatus } from "../services/hmo";

/**
 * İş kuralı: `backend/src/services/hmo.service.ts` içindeki geçiş doğrulaması ile aynı kalmalı.
 * PAID yalnızca APPROVED veya PARTIAL_APPROVED sonrası.
 */
const ALLOWED_NEXT: Record<HmoClaimStatus, readonly HmoClaimStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["DRAFT", "APPROVED", "PARTIAL_APPROVED", "REJECTED"],
  APPROVED: ["PAID"],
  PARTIAL_APPROVED: ["PAID", "APPROVED"],
  REJECTED: ["SUBMITTED"],
  PAID: [],
};

/** Sunucu ile aynı kurallar; `from === to` “işlem yok” için geçerlidir (API). */
export function canTransitionHmoClaimStatus(from: HmoClaimStatus, to: HmoClaimStatus): boolean {
  if (from === to) return true;
  return (ALLOWED_NEXT[from] as readonly HmoClaimStatus[]).includes(to);
}

/** Liste / buton: aynı duruma geçiş gösterilmez. */
export function canSetHmoClaimStatus(from: HmoClaimStatus, to: HmoClaimStatus): boolean {
  if (from === to) return false;
  return (ALLOWED_NEXT[from] as readonly HmoClaimStatus[]).includes(to);
}

/** Detay sayfası: mevcut durum + izin verilen sonraki durumlar (aynı duruma “yeniden” basmayı göstermez). */
export function hmoClaimStatusActionTargets(from: HmoClaimStatus): HmoClaimStatus[] {
  return [...ALLOWED_NEXT[from]];
}

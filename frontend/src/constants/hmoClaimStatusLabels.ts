import type { HmoClaimStatus } from "../services/hmo";

/** i18n anahtarı: `t(key)` — pages.hmoClaims altında tanımlı */
export const HMO_CLAIM_STATUS_I18N_KEY: Record<HmoClaimStatus, string> = {
  DRAFT: "pages.hmoClaims.statusDraft",
  SUBMITTED: "pages.hmoClaims.statusSubmitted",
  APPROVED: "pages.hmoClaims.statusApproved",
  PARTIAL_APPROVED: "pages.hmoClaims.statusPartial",
  REJECTED: "pages.hmoClaims.statusRejected",
  PAID: "pages.hmoClaims.statusPaid",
};

/** RA 9994 (Senior 20%) / RA 10754 (PWD 20%) — fatura ve PDF için tek kaynak. */

export type PatientDiscountFlags = {
  isSeniorCitizen: boolean;
  pwdIdNo: string | null | undefined;
};

export type PhStatutoryDiscountResult = {
  seniorDiscountCents: number;
  pwdDiscountCents: number;
  /** Uygulanan yasal indirim (ikisi birden değil, yüksek olan) */
  statutoryDiscountCents: number;
  vatExempt: boolean;
};

const SENIOR_RATE = 0.2;
const PWD_RATE = 0.2;

export function computePhStatutoryDiscounts(
  subtotalCents: number,
  flags: PatientDiscountFlags,
): PhStatutoryDiscountResult {
  const seniorDiscountCents = flags.isSeniorCitizen ? Math.floor(subtotalCents * SENIOR_RATE) : 0;
  const pwdDiscountCents = (flags.pwdIdNo?.trim().length ?? 0) > 0 ? Math.floor(subtotalCents * PWD_RATE) : 0;
  const statutoryDiscountCents = Math.max(seniorDiscountCents, pwdDiscountCents);
  const vatExempt = flags.isSeniorCitizen || !!(flags.pwdIdNo?.trim().length);
  return { seniorDiscountCents, pwdDiscountCents, statutoryDiscountCents, vatExempt };
}

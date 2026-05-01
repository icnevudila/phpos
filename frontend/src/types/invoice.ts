export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID";

export type HmoClaimStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PARTIAL_APPROVED"
  | "REJECTED"
  | "PAID";

export interface InvoiceHmoClaimBrief {
  id: string;
  status: HmoClaimStatus;
  claimNumber: string;
  providerName: string;
  providerCode: string;
}
export type PaymentMethod =
  | "CASH"
  | "GCASH"
  | "MAYA"
  | "CREDIT_CARD"
  | "CHEQUE"
  | "PHILHEALTH";

export interface InvoiceTreatment {
  id: string;
  procedure: string;
  toothIds: string[];
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  notes: string | null;
}

export interface InvoicePayment {
  id: string;
  amount: string;
  method: PaymentMethod;
  referenceNo: string | null;
  notes: string | null;
  paidAt: string;
}

export interface InvoicePatient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  philhealthNo: string | null;
  /** RA 9994 — backend applies min 20% discount floor vs subtotal when set */
  isSeniorCitizen: boolean;
  oscaIdNo: string | null;
  /** RA 10754 — PWD ID present triggers same statutory discount floor */
  pwdIdNo: string | null;
}

export interface InvoiceAppointment {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string | null;
  status: string;
  dentist: { id: string; fullName: string };
}

export interface InvoiceDto {
  id: string;
  clinicId: string;
  patientId: string;
  appointmentId: string | null;
  orNumber: string | null;
  subtotal: string;
  discount: string;
  total: string;
  paid: string;
  balance: string;
  status: InvoiceStatus;
  notes: string | null;
  dueDate: string | null;
  paidAt: string | null;
  externalRef: string | null;
  createdAt: string;
  patient: InvoicePatient;
  appointment: InvoiceAppointment | null;
  treatments: InvoiceTreatment[];
  payments: InvoicePayment[];
  hmoClaims: InvoiceHmoClaimBrief[];
}

export const INVOICE_STATUS_STYLES: Record<
  InvoiceStatus,
  { label: string; pillBg: string; pillText: string; ring: string; dot: string }
> = {
  UNPAID: {
    label: "Unpaid",
    pillBg: "bg-rose-100",
    pillText: "text-rose-700",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
  PARTIAL: {
    label: "Partial",
    pillBg: "bg-amber-100",
    pillText: "text-amber-800",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  PAID: {
    label: "Paid",
    pillBg: "bg-emerald-100",
    pillText: "text-emerald-800",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; needsRef: boolean }[] = [
  { value: "CASH", label: "Cash", needsRef: false },
  { value: "GCASH", label: "GCash", needsRef: true },
  { value: "MAYA", label: "Maya", needsRef: true },
  { value: "CREDIT_CARD", label: "Credit Card", needsRef: true },
  { value: "CHEQUE", label: "Cheque", needsRef: true },
  { value: "PHILHEALTH", label: "PhilHealth", needsRef: false },
];

export function formatPHP(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

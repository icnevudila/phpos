import { downloadAuthedFile } from "./api";

export type HmoClaimStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "PARTIAL_APPROVED"
  | "REJECTED"
  | "PAID";

export interface HmoProvider {
  id: string;
  clinicId: string;
  name: string;
  code: string;
  contactPhone: string | null;
  contactEmail: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface HmoClaimTreatmentSummary {
  id: string;
  procedure: string;
  toothIds: string[];
  quantity: number;
  unitPrice: string;
  notes: string | null;
}

export interface HmoClaimLine {
  id: string;
  lineAmount: string;
  createdAt: string;
  treatment: HmoClaimTreatmentSummary;
}

export type HmoClaimAttachmentKind = "LOA" | "PREAUTH" | "OTHER";

export interface HmoClaimAttachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  kind: HmoClaimAttachmentKind;
  createdAt: string;
}

export interface HmoClaim {
  id: string;
  clinicId: string;
  patientId: string;
  invoiceId: string;
  providerId: string;
  patientHmoId: string | null;
  claimNumber: string;
  status: HmoClaimStatus;
  requestedAmount: string;
  approvedAmount: string | null;
  patientCopay: string;
  externalRef: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  provider: { id: string; name: string; code: string };
  patient: { id: string; firstName: string; lastName: string };
  invoice: { id: string; total: string; status: string };
  lineCount: number;
}

export interface HmoClaimDetail extends HmoClaim {
  lines: HmoClaimLine[];
  attachments: HmoClaimAttachment[];
}

export interface PatientHmoMembership {
  id: string;
  patientId: string;
  providerId: string;
  memberNumber: string;
  cardholderName: string | null;
  sponsor: string | null;
  validFrom: string | null;
  validUntil: string | null;
  isPrimary: boolean;
  createdAt: string;
  provider: { id: string; name: string; code: string };
}

export async function fetchHmoProviders(): Promise<HmoProvider[]> {
  return []; // Demo Mode
}

export async function createHmoProvider(payload: any): Promise<HmoProvider> {
  throw new Error("Demo Mode: HMO Providers not configured yet.");
}

export async function updateHmoProvider(id: string, payload: any): Promise<HmoProvider> {
  throw new Error("Demo Mode: HMO Providers not configured yet.");
}

export async function fetchHmoClaims(params?: any): Promise<HmoClaim[]> {
  return []; // Demo Mode
}

export async function downloadHmoClaimsReconciliationCsv(params: any): Promise<void> {
  throw new Error("Demo Mode: HMO CSV Export not configured yet.");
}

export async function fetchHmoClaim(id: string): Promise<HmoClaimDetail> {
  throw new Error("Demo Mode: Claim " + id + " not found or not configured.");
}

export async function updateHmoClaim(id: string, payload: any): Promise<HmoClaimDetail> {
  throw new Error("Demo Mode: HMO Claims not configured yet.");
}

export async function updateHmoClaimStatus(id: string, status: HmoClaimStatus): Promise<HmoClaimDetail> {
  return updateHmoClaim(id, { status });
}

export async function uploadHmoClaimAttachment(claimId: string, file: File, kind: HmoClaimAttachmentKind): Promise<HmoClaimAttachment> {
  throw new Error("Demo Mode: HMO Attachment upload not configured yet.");
}

export async function deleteHmoClaimAttachment(claimId: string, attachmentId: string): Promise<void> {
  throw new Error("Demo Mode: HMO Attachment delete not configured yet.");
}

export async function createHmoClaim(payload: any): Promise<HmoClaimDetail> {
  throw new Error("Demo Mode: HMO Claims not configured yet.");
}

export async function fetchPatientHmoMemberships(patientId: string): Promise<PatientHmoMembership[]> {
  return []; // Demo Mode
}

export async function createPatientHmoMembership(patientId: string, payload: any): Promise<PatientHmoMembership> {
  throw new Error("Demo Mode: Patient HMO membership not configured yet.");
}

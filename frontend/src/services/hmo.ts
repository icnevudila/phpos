import api, { downloadAuthedFile } from "./api";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

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

/** Liste API yanıtı — satır sayısı dahil */
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

/** GET /hmo/claims/:id — tedavi satırları dahil */
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
  const res = await api.get<ApiEnvelope<HmoProvider[]>>("/hmo/providers") as any;
  return res.data;
}

export async function createHmoProvider(payload: {
  name: string;
  code: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  isActive?: boolean;
}): Promise<HmoProvider> {
  const res = await api.post<ApiEnvelope<HmoProvider>>("/hmo/providers", payload) as any;
  return res.data;
}

export async function updateHmoProvider(
  id: string,
  payload: Partial<{
    name: string;
    code: string;
    contactPhone: string | null;
    contactEmail: string | null;
    notes: string | null;
    isActive: boolean;
  }>,
): Promise<HmoProvider> {
  const res = await api.put<ApiEnvelope<HmoProvider>>(`/hmo/providers/${id}`, payload) as any;
  return res.data;
}

export async function fetchHmoClaims(params?: {
  status?: HmoClaimStatus;
  providerId?: string;
  patientId?: string;
  limit?: number;
}): Promise<HmoClaim[]> {
  const res = await api.get<ApiEnvelope<HmoClaim[]>>(`/hmo/claims`, { params }) as any;
  return res.data;
}

export async function downloadHmoClaimsReconciliationCsv(params: {
  year: number;
  month: number;
  providerId?: string;
}): Promise<void> {
  const q = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
  });
  if (params.providerId) q.set("providerId", params.providerId);
  const mm = String(params.month).padStart(2, "0");
  await downloadAuthedFile(
    `/hmo/claims/reconciliation.csv?${q.toString()}`,
    `hmo-reconciliation-${params.year}-${mm}.csv`,
  );
}

export async function fetchHmoClaim(id: string): Promise<HmoClaimDetail> {
  const res = await api.get<ApiEnvelope<HmoClaimDetail>>(`/hmo/claims/${id}`) as any;
  return res.data;
}

export async function updateHmoClaim(
  id: string,
  payload: Partial<{
    status: HmoClaimStatus;
    requestedAmount: number;
    approvedAmount: number | null;
    patientCopay: number;
    externalRef: string | null;
    notes: string | null;
  }>,
): Promise<HmoClaimDetail> {
  const res = await api.put<ApiEnvelope<HmoClaimDetail>>(`/hmo/claims/${id}`, payload) as any;
  return res.data;
}

/** @deprecated use updateHmoClaim */
export async function updateHmoClaimStatus(id: string, status: HmoClaimStatus): Promise<HmoClaimDetail> {
  return updateHmoClaim(id, { status });
}

export async function uploadHmoClaimAttachment(
  claimId: string,
  file: File,
  kind: HmoClaimAttachmentKind,
): Promise<HmoClaimAttachment> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await api.post<ApiEnvelope<HmoClaimAttachment>>(
    `/hmo/claims/${claimId}/attachments`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  ) as any;
  return res.data;
}

export async function deleteHmoClaimAttachment(claimId: string, attachmentId: string): Promise<void> {
  await api.delete(`/hmo/claims/${claimId}/attachments/${attachmentId}`);
}

export async function createHmoClaim(payload: {
  patientId: string;
  invoiceId: string;
  providerId: string;
  patientHmoId?: string;
  treatmentIds?: string[];
  requestedAmount: number;
  approvedAmount?: number;
  patientCopay?: number;
  status?: HmoClaimStatus;
  externalRef?: string;
  notes?: string;
}): Promise<HmoClaimDetail> {
  const res = await api.post<ApiEnvelope<HmoClaimDetail>>("/hmo/claims", payload) as any;
  return res.data;
}

export async function fetchPatientHmoMemberships(patientId: string): Promise<PatientHmoMembership[]> {
  const res = await api.get<ApiEnvelope<PatientHmoMembership[]>>(`/hmo/patients/${patientId}/memberships`) as any;
  return res.data;
}

export async function createPatientHmoMembership(
  patientId: string,
  payload: {
    providerId: string;
    memberNumber: string;
    cardholderName?: string;
    sponsor?: string;
    validFrom?: string;
    validUntil?: string;
    isPrimary?: boolean;
  },
): Promise<PatientHmoMembership> {
  const res = await api.post<ApiEnvelope<PatientHmoMembership>>(`/hmo/patients/${patientId}/memberships`, payload) as any;
  return res.data;
}

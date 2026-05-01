import { apiFetch, apiPostFormData, downloadAuthedFile } from "./api";

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
  const res = await apiFetch<ApiEnvelope<HmoProvider[]>>("/hmo/providers");
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
  const res = await apiFetch<ApiEnvelope<HmoProvider>>("/hmo/providers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
  const res = await apiFetch<ApiEnvelope<HmoProvider>>(`/hmo/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function fetchHmoClaims(params?: {
  status?: HmoClaimStatus;
  providerId?: string;
  patientId?: string;
  limit?: number;
}): Promise<HmoClaim[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.providerId) q.set("providerId", params.providerId);
  if (params?.patientId) q.set("patientId", params.patientId);
  if (params?.limit) q.set("limit", String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  const res = await apiFetch<ApiEnvelope<HmoClaim[]>>(`/hmo/claims${suffix}`);
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
  const res = await apiFetch<ApiEnvelope<HmoClaimDetail>>(`/hmo/claims/${id}`);
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
  const res = await apiFetch<ApiEnvelope<HmoClaimDetail>>(`/hmo/claims/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
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
  const res = await apiPostFormData<ApiEnvelope<HmoClaimAttachment>>(
    `/hmo/claims/${claimId}/attachments`,
    fd,
  );
  return res.data;
}

export async function deleteHmoClaimAttachment(claimId: string, attachmentId: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ id: string }>>(`/hmo/claims/${claimId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });
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
  const res = await apiFetch<ApiEnvelope<HmoClaimDetail>>("/hmo/claims", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function fetchPatientHmoMemberships(patientId: string): Promise<PatientHmoMembership[]> {
  const res = await apiFetch<ApiEnvelope<PatientHmoMembership[]>>(`/hmo/patients/${patientId}/memberships`);
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
  const res = await apiFetch<ApiEnvelope<PatientHmoMembership>>(`/hmo/patients/${patientId}/memberships`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

import api from "./api";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export type WaitlistStatus = "WAITING" | "FULFILLED" | "CANCELLED";

export interface WaitlistEntryDto {
  id: string;
  clinicId: string;
  patientId: string;
  notes: string | null;
  status: WaitlistStatus;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string;
  };
}

export async function fetchWaitlist(scope: "active" | "all"): Promise<WaitlistEntryDto[]> {
  const res = await api.get<ApiEnvelope<WaitlistEntryDto[]>>(`/waitlist`, { params: { scope } }) as any;
  return res.data;
}

export async function createWaitlistEntry(payload: {
  patientId: string;
  notes?: string | null;
}): Promise<WaitlistEntryDto> {
  const res = await api.post<ApiEnvelope<WaitlistEntryDto>>(`/waitlist`, payload) as any;
  return res.data;
}

export async function patchWaitlistEntry(
  id: string,
  status: "FULFILLED" | "CANCELLED",
): Promise<WaitlistEntryDto> {
  const res = await api.patch<ApiEnvelope<WaitlistEntryDto>>(`/waitlist/${id}`, { status }) as any;
  return res.data;
}

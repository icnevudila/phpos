import { apiFetch } from "./api";

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
  const search = new URLSearchParams({ scope });
  const res = await apiFetch<ApiEnvelope<WaitlistEntryDto[]>>(`/waitlist?${search.toString()}`);
  return res.data;
}

export async function createWaitlistEntry(payload: {
  patientId: string;
  notes?: string | null;
}): Promise<WaitlistEntryDto> {
  const res = await apiFetch<ApiEnvelope<WaitlistEntryDto>>(`/waitlist`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function patchWaitlistEntry(
  id: string,
  status: "FULFILLED" | "CANCELLED",
): Promise<WaitlistEntryDto> {
  const res = await apiFetch<ApiEnvelope<WaitlistEntryDto>>(`/waitlist/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

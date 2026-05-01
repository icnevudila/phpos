import type { InvoiceDto } from "../types/invoice";

import { apiFetch } from "./api";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface TreatmentRow {
  id: string;
  appointmentId: string;
  patientId: string;
  dentistId: string;
  procedure: string;
  quantity: number;
  unitPrice: string;
  toothIds: string[];
  notes: string | null;
  createdAt: string;
  dentist: { firstName: string; lastName: string };
}

export interface CreateTreatmentPayload {
  procedure: string;
  quantity: number;
  unitPrice: number;
  toothIds: string[];
  notes?: string;
}

export interface UpdateTreatmentPayload {
  procedure?: string;
  quantity?: number;
  unitPrice?: number;
  toothIds?: string[];
  notes?: string;
}

export async function fetchAppointmentTreatments(appointmentId: string): Promise<TreatmentRow[]> {
  const res = await apiFetch<ApiEnvelope<TreatmentRow[]>>(
    `/appointments/${appointmentId}/treatments`,
  );
  return res.data;
}

export async function createAppointmentTreatment(
  appointmentId: string,
  body: CreateTreatmentPayload,
): Promise<TreatmentRow> {
  const res = await apiFetch<ApiEnvelope<TreatmentRow>>(
    `/appointments/${appointmentId}/treatments`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
  return res.data;
}

export async function updateTreatment(
  treatmentId: string,
  body: UpdateTreatmentPayload,
): Promise<TreatmentRow> {
  const res = await apiFetch<ApiEnvelope<TreatmentRow>>(`/treatments/${treatmentId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteTreatment(treatmentId: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ ok: true }>>(`/treatments/${treatmentId}`, {
    method: "DELETE",
  });
}

export async function finalizeAppointmentTreatments(
  appointmentId: string,
): Promise<InvoiceDto> {
  const res = await apiFetch<ApiEnvelope<InvoiceDto>>(
    `/appointments/${appointmentId}/treatments/finalize`,
    {
      method: "POST",
      body: "{}",
    },
  );
  return res.data;
}

export async function fetchAppointmentInvoiceMeta(
  appointmentId: string,
): Promise<{ id: string; status: string; orNumber: string | null } | null> {
  const res = await apiFetch<
    ApiEnvelope<{ id: string; status: string; orNumber: string | null } | null>
  >(`/appointments/${appointmentId}/invoice`);
  return res.data;
}

import api from "./api";
import type { InvoiceDto } from "../types/invoice";

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
  phase?: string | null;
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
  const res = await api.get<ApiEnvelope<TreatmentRow[]>>(
    `/appointments/${appointmentId}/treatments`,
  ) as any;
  return res.data;
}

export async function createAppointmentTreatment(
  appointmentId: string,
  body: CreateTreatmentPayload,
): Promise<TreatmentRow> {
  const res = await api.post<ApiEnvelope<TreatmentRow>>(
    `/appointments/${appointmentId}/treatments`,
    body
  ) as any;
  return res.data;
}

export async function updateTreatment(
  treatmentId: string,
  body: UpdateTreatmentPayload,
): Promise<TreatmentRow> {
  const res = await api.put<ApiEnvelope<TreatmentRow>>(`/treatments/${treatmentId}`, body) as any;
  return res.data;
}

export async function deleteTreatment(treatmentId: string): Promise<void> {
  await api.delete(`/treatments/${treatmentId}`);
}

export async function finalizeAppointmentTreatments(
  appointmentId: string,
): Promise<InvoiceDto> {
  const res = await api.post<ApiEnvelope<InvoiceDto>>(
    `/appointments/${appointmentId}/treatments/finalize`,
    {}
  ) as any;
  return res.data;
}

export async function fetchAppointmentInvoiceMeta(
  appointmentId: string,
): Promise<{ id: string; status: string; orNumber: string | null } | null> {
  const res = await api.get<
    ApiEnvelope<{ id: string; status: string; orNumber: string | null } | null>
  >(`/appointments/${appointmentId}/invoice`) as any;
  return res.data;
}

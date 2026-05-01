import type {
  AppointmentDto,
  AppointmentStatus,
  AppointmentType,
  DentistRow,
  PatientSearchRow,
} from "../types/appointment";

import { apiFetch } from "./api";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface ListAppointmentsParams {
  date?: string;
  from?: string;
  to?: string;
  dentistId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

export interface CreateAppointmentPayload {
  patientId: string;
  dentistId: string;
  scheduledAt: string;
  duration?: number;
  type?: AppointmentType;
  chairNo?: string;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  patientId?: string;
  dentistId?: string;
  scheduledAt?: string;
  duration?: number;
  type?: AppointmentType;
  chairNo?: string | null;
  notes?: string;
}

export async function fetchAppointments(
  params: ListAppointmentsParams = {},
): Promise<AppointmentDto[]> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") search.set(k, v);
  }
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const res = await apiFetch<ApiEnvelope<AppointmentDto[]>>(`/appointments${suffix}`);
  return res.data;
}

export async function fetchAppointment(id: string): Promise<AppointmentDto> {
  const res = await apiFetch<ApiEnvelope<AppointmentDto>>(`/appointments/${id}`);
  return res.data;
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<AppointmentDto> {
  const res = await apiFetch<ApiEnvelope<AppointmentDto>>(`/appointments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateAppointment(
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<AppointmentDto> {
  const res = await apiFetch<ApiEnvelope<AppointmentDto>>(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function patchAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  cancellationReason?: string,
): Promise<AppointmentDto> {
  const res = await apiFetch<ApiEnvelope<AppointmentDto>>(`/appointments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, cancellationReason }),
  });
  return res.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await apiFetch<ApiEnvelope<{ id: string }>>(`/appointments/${id}`, { method: "DELETE" });
}

export async function sendAppointmentQueueAlert(
  id: string,
  message?: string,
): Promise<{
  appointmentId: string;
  recipient: string;
  notification: { id: string; status: "SENT" | "FAILED"; errorMessage?: string | null };
}> {
  const res = await apiFetch<
    ApiEnvelope<{
      appointmentId: string;
      recipient: string;
      notification: { id: string; status: "SENT" | "FAILED"; errorMessage?: string | null };
    }>
  >(`/appointments/${id}/send-alert`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
  return res.data;
}

export async function fetchDentists(): Promise<DentistRow[]> {
  const res = await apiFetch<ApiEnvelope<DentistRow[]>>(`/users/dentists`);
  return res.data;
}

export async function searchPatients(q: string): Promise<PatientSearchRow[]> {
  const search = new URLSearchParams({ q, page: "1", limit: "10" });
  const res = await apiFetch<
    ApiEnvelope<{
      data: PatientSearchRow[];
      total: number;
      page: number;
      totalPages: number;
    }>
  >(`/patients?${search.toString()}`);
  return res.data.data;
}

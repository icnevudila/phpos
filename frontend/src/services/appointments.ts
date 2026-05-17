import api from "./api";
import type {
  AppointmentDto,
  AppointmentStatus,
  AppointmentType,
  DentistRow,
  PatientSearchRow,
} from "../types/appointment";

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
  const res = await api.get<ApiEnvelope<AppointmentDto[]>>(`/appointments`, { params }) as any;
  return res.data;
}

export async function fetchAppointment(id: string): Promise<AppointmentDto> {
  const res = await api.get<ApiEnvelope<AppointmentDto>>(`/appointments/${id}`) as any;
  return res.data;
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<AppointmentDto> {
  const res = await api.post<ApiEnvelope<AppointmentDto>>(`/appointments`, payload) as any;
  return res.data;
}

export async function updateAppointment(
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<AppointmentDto> {
  const res = await api.put<ApiEnvelope<AppointmentDto>>(`/appointments/${id}`, payload) as any;
  return res.data;
}

export async function patchAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  cancellationReason?: string,
): Promise<AppointmentDto> {
  const res = await api.patch<ApiEnvelope<AppointmentDto>>(`/appointments/${id}/status`, { status, cancellationReason }) as any;
  return res.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/appointments/${id}`);
}

export async function sendAppointmentQueueAlert(
  id: string,
  message?: string,
): Promise<{
  appointmentId: string;
  recipient: string;
  notification: { id: string; status: "SENT" | "FAILED"; errorMessage?: string | null };
}> {
  const res = await api.post<
    ApiEnvelope<{
      appointmentId: string;
      recipient: string;
      notification: { id: string; status: "SENT" | "FAILED"; errorMessage?: string | null };
    }>
  >(`/appointments/${id}/send-alert`, { message }) as any;
  return res.data;
}

export async function fetchDentists(): Promise<DentistRow[]> {
  const res = await api.get<ApiEnvelope<DentistRow[]>>(`/users/dentists`) as any;
  return res.data;
}

export async function searchPatients(q: string): Promise<PatientSearchRow[]> {
  const res = await api.get<
    ApiEnvelope<{
      data: PatientSearchRow[];
      total: number;
      page: number;
      totalPages: number;
    }>
  >(`/patients`, { params: { q, page: 1, limit: 10 } }) as any;
  return res.data.data;
}

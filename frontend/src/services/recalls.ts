import api from "./api";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export type RecallStatus = "PENDING" | "SENT" | "COMPLETED" | "CANCELLED";

export interface RecallDto {
  id: string;
  clinicId: string;
  patientId: string;
  recallType: string;
  dueDate: string;
  status: RecallStatus;
  lastCompleted: string | null;
  notes: string | null;
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

export async function fetchRecalls(status?: RecallStatus): Promise<RecallDto[]> {
  const res = await api.get<ApiEnvelope<RecallDto[]>>(`/recalls`, {
    params: status ? { status } : undefined,
  }) as any;
  return res.data;
}

export async function createRecall(payload: {
  patientId: string;
  recallType: string;
  dueDate: string;
  notes?: string | null;
}): Promise<RecallDto> {
  const res = await api.post<ApiEnvelope<RecallDto>>(`/recalls`, payload) as any;
  return res.data;
}

export async function updateRecall(
  id: string,
  payload: Partial<{ status: RecallStatus; dueDate: string; notes: string }>,
): Promise<RecallDto> {
  const res = await api.put<ApiEnvelope<RecallDto>>(`/recalls/${id}`, payload) as any;
  return res.data;
}

export async function completeRecall(id: string): Promise<RecallDto> {
  const res = await api.post<ApiEnvelope<RecallDto>>(`/recalls/${id}/complete`) as any;
  return res.data;
}

export async function sendRecallReminder(id: string): Promise<void> {
  await api.post(`/recalls/${id}/remind`);
}

import api from "./api";
import type { Tooth, ToothCondition, ToothSurface } from "../types/dentalChart";

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

export interface ToothBatchUpdate {
  toothNumber: number;
  condition: ToothCondition;
  surfaces: ToothSurface[];
  notes?: string | null;
}

export async function batchUpsertTeeth(
  patientId: string,
  updates: ToothBatchUpdate[],
): Promise<Tooth[]> {
  const res = (await api.put(`/patients/${patientId}/teeth/batch`, { updates })) as ApiEnvelope<Tooth[]>;
  return res.data;
}

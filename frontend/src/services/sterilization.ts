export interface SterilizationLog {
  id: string;
  clinicId: string;
  operatorId: string;
  autoclaveName: string;
  cycleNumber: number;
  temperature: string;
  pressure: string;
  durationMinutes: number;
  status: "SUCCESS" | "FAILED" | "ABORTED";
  biologicalIndicator: boolean;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  operator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

import api from "./api";

export async function getSterilizationLogs(): Promise<SterilizationLog[]> {
  const res = await api.get<any, { data: SterilizationLog[] }>("/sterilization");
  return res.data;
}

export async function createSterilizationLog(body: any): Promise<SterilizationLog> {
  const res = await api.post<any, { data: SterilizationLog }>("/sterilization", body);
  return res.data;
}

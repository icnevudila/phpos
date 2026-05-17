import api from "./api";
import { unpackApiData } from "../utils/unpackApiData";

export interface PatientReferral {
  id: string;
  patientId: string;
  referredTo: string;
  specialty: string;
  reason: string;
  notes: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}

export async function listPatientReferrals(patientId: string): Promise<PatientReferral[]> {
  const res = await api.get(`/referrals/patient/${patientId}`);
  return unpackApiData<PatientReferral[]>(res);
}

export async function createPatientReferral(data: {
  patientId: string;
  referredTo?: string;
  specialty?: string;
  reason?: string;
  notes?: string;
}): Promise<PatientReferral> {
  const res = await api.post("/referrals", data);
  return unpackApiData<PatientReferral>(res);
}

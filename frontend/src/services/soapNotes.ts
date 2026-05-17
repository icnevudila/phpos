import api from "./api";
import { unpackApiData } from "../utils/unpackApiData";

export interface SoapNote {
  id: string;
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}

export async function listSoapNotes(patientId: string): Promise<SoapNote[]> {
  const res = await api.get(`/soap-notes/patient/${patientId}`);
  return unpackApiData<SoapNote[]>(res);
}

export async function createSoapNote(data: {
  patientId: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}): Promise<SoapNote> {
  const res = await api.post("/soap-notes", data);
  return unpackApiData<SoapNote>(res);
}

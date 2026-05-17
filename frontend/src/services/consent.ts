import api from "./api";

export interface ConsentForm {
  id: string;
  title: string;
  content: string;
  signatureUrl: string | null;
  signedAt: string | null;
  createdAt: string;
}

export async function listConsentForms(patientId: string): Promise<ConsentForm[]> {
  const res = await api.get<ConsentForm[]>(`/consent-forms/patient/${patientId}`);
  return res.data;
}

export async function getConsentForm(id: string): Promise<ConsentForm & { patient: any }> {
  const res = await api.get<ConsentForm & { patient: any }>(`/consent-forms/${id}`);
  return res.data;
}

export async function createConsentForm(data: any): Promise<ConsentForm> {
  const res = await api.post<ConsentForm>("/consent-forms", data);
  return res.data;
}

export async function signConsentForm(id: string, signatureUrl: string): Promise<ConsentForm> {
  const res = await api.put<ConsentForm>(`/consent-forms/${id}/sign`, { signatureUrl });
  return res.data;
}

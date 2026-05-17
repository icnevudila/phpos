import api from "./api";

export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PatientFamily {
  id: string;
  name: string;
  patients: FamilyMember[];
}

export async function fetchPatientFamily(patientId: string): Promise<PatientFamily | null> {
  const res = await api.get<{ data: PatientFamily | null }>(`/patients/${patientId}/family`);
  return res.data.data;
}

export async function createPatientFamily(patientId: string, name?: string): Promise<PatientFamily> {
  const res = await api.post<{ data: PatientFamily }>(`/patients/${patientId}/family`, { name });
  return res.data.data;
}

export async function linkFamilyMember(patientId: string, memberPatientId: string): Promise<PatientFamily> {
  const res = await api.post<{ data: PatientFamily }>(`/patients/${patientId}/family/members`, {
    patientId: memberPatientId,
  });
  return res.data.data;
}

export async function unlinkFamilyMember(
  patientId: string,
  memberPatientId: string,
): Promise<PatientFamily | null> {
  const res = await api.delete<{ data: PatientFamily | null }>(
    `/patients/${patientId}/family/members/${memberPatientId}`,
  );
  return res.data.data;
}

import api from "./api";
import { apiBaseUrl } from "./index";
import { ACCESS_TOKEN_KEY } from "../constants/auth";
import { unpackApiData } from "../utils/unpackApiData";

export interface XrayDrawingsPayload {
  annotations: unknown[];
  adjustments?: { brightness: number; contrast: number; invert: number };
}

export interface PatientFileAnnotations {
  category?: string;
  caption?: string;
  xrayDrawings?: XrayDrawingsPayload;
}

export interface PatientFileDto {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  createdAt: string;
  annotations?: PatientFileAnnotations | null;
}

export async function patchPatientFileAnnotations(
  patientId: string,
  fileId: string,
  annotations: PatientFileAnnotations,
): Promise<void> {
  await api.patch(`/patients/${patientId}/files/${fileId}/annotations`, { annotations });
}

export async function saveXrayDrawings(
  patientId: string,
  file: PatientFileDto,
  drawings: XrayDrawingsPayload,
): Promise<PatientFileDto> {
  const merged: PatientFileAnnotations = {
    ...(file.annotations ?? {}),
    category: file.annotations?.category ?? "XRAY",
    xrayDrawings: drawings,
  };
  await patchPatientFileAnnotations(patientId, file.id, merged);
  return { ...file, annotations: merged };
}

export async function listPatientFiles(patientId: string): Promise<PatientFileDto[]> {
  const res = await api.get(`/patients/${patientId}/files`);
  return unpackApiData<PatientFileDto[]>(res);
}

export function isIntraoralPhoto(file: PatientFileDto): boolean {
  return file.mimeType.startsWith("image/") && file.annotations?.category === "INTRAORAL";
}

export function isXrayFile(file: PatientFileDto): boolean {
  if (file.annotations?.category === "INTRAORAL") return false;
  return file.annotations?.category === "XRAY";
}

export function isAvatarPhoto(file: PatientFileDto): boolean {
  return file.mimeType.startsWith("image/") && file.annotations?.category === "AVATAR";
}

export async function findLatestAvatar(patientId: string): Promise<PatientFileDto | null> {
  const all = await listPatientFiles(patientId);
  const avatars = all
    .filter(isAvatarPhoto)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return avatars[0] ?? null;
}

export async function uploadPatientAvatar(patientId: string, file: File): Promise<PatientFileDto> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/patients/${patientId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const uploaded = unpackApiData<PatientFileDto>(res);
  await api.patch(`/patients/${patientId}/files/${uploaded.id}/annotations`, {
    annotations: { category: "AVATAR", caption: file.name },
  });
  return { ...uploaded, annotations: { category: "AVATAR", caption: file.name } };
}

export async function uploadXrayFile(patientId: string, file: File): Promise<PatientFileDto> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/patients/${patientId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const uploaded = unpackApiData<PatientFileDto>(res);
  await api.patch(`/patients/${patientId}/files/${uploaded.id}/annotations`, {
    annotations: { category: "XRAY", caption: file.name },
  });
  return { ...uploaded, annotations: { category: "XRAY", caption: file.name } };
}

export async function uploadIntraoralPhoto(patientId: string, file: File): Promise<PatientFileDto> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/patients/${patientId}/files`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const uploaded = unpackApiData<PatientFileDto>(res);
  await api.patch(`/patients/${patientId}/files/${uploaded.id}/annotations`, {
    annotations: { category: "INTRAORAL", caption: file.name },
  });
  return { ...uploaded, annotations: { category: "INTRAORAL", caption: file.name } };
}

export async function fetchPatientFileBlob(patientId: string, fileId: string): Promise<Blob> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const res = await fetch(`${apiBaseUrl}/patients/${patientId}/files/${fileId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  return res.blob();
}

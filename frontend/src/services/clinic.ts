import api from "./api";

export interface ClinicDto {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  logoUrl: string | null;
  subscriptionPlan: string;
  createdAt: string;
}

interface ApiOk<T> {
  success: true;
  data: T;
}

export async function fetchClinic(): Promise<ClinicDto> {
  const res = await api.get<ApiOk<ClinicDto>>("/clinic") as any;
  return res.data;
}

export async function patchClinic(input: {
  name?: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
}): Promise<ClinicDto> {
  const res = await api.patch<ApiOk<ClinicDto>>("/clinic", input) as any;
  return res.data;
}

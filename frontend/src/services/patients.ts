import api from "./api";

export interface PatientListRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string | null;
  lastVisitAt: string | null;
  hmoMemberships: Array<{
    id: string;
    isPrimary: boolean;
    providerCode: string;
    providerName: string;
  }>;
}

interface ListPayload {
  data: PatientListRow[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchPatientsPage(
  page: number,
  limit: number,
  q?: string,
): Promise<ListPayload> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q?.trim()) params.set("q", q.trim());
  const res = await api.get<{ data: ListPayload }>(`/patients?${params.toString()}`);
  return res.data.data;
}

/** Tüm sayfaları dolaşarak arama filtresine uyan hastaları döndürür (CSV export). */
export async function fetchAllPatientsForExport(q?: string): Promise<PatientListRow[]> {
  const limit = 100;
  const first = await fetchPatientsPage(1, limit, q);
  const rows = [...first.data];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchPatientsPage(page, limit, q);
    rows.push(...next.data);
  }
  return rows;
}

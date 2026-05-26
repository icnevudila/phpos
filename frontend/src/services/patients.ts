import { supabase } from "../lib/supabase";

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
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("patients")
    .select("*", { count: "exact" })
    .eq("status", "ACTIVE");

  if (q && q.trim() !== "") {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count || 0;

  const rows: PatientListRow[] = (data || []).map((p: any) => {
    const parts = p.name ? p.name.split(" ") : [];
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return {
      id: p.id,
      firstName,
      lastName,
      phone: p.phone || "",
      birthDate: p.dob || null,
      lastVisitAt: null,
      hmoMemberships: [],
    };
  });

  return {
    data: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

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

export async function getPatient(id: string): Promise<any> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  const parts = data.name ? data.name.split(" ") : [];
  return {
    ...data,
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    birthDate: data.dob,
  };
}

export async function createPatient(payload: any): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get clinic_id from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) throw new Error("No clinic assigned");

  const { data, error } = await supabase
    .from("patients")
    .insert({
      clinic_id: profile.clinic_id,
      name: `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
      phone: payload.phone || null,
      email: payload.email || null,
      dob: payload.birthDate || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updatePatient(id: string, payload: any): Promise<any> {
  const updates: any = {};
  if (payload.firstName || payload.lastName) {
    updates.name = `${payload.firstName || ""} ${payload.lastName || ""}`.trim();
  }
  if (payload.phone !== undefined) updates.phone = payload.phone;
  if (payload.email !== undefined) updates.email = payload.email;
  if (payload.birthDate !== undefined) updates.dob = payload.birthDate;

  const { data, error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

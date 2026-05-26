import { supabase } from "../lib/supabase";
import type {
  AppointmentDto,
  AppointmentStatus,
  AppointmentType,
  DentistRow,
  PatientSearchRow,
} from "../types/appointment";

export interface ListAppointmentsParams {
  date?: string;
  from?: string;
  to?: string;
  dentistId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

export interface CreateAppointmentPayload {
  patientId: string;
  dentistId: string;
  scheduledAt: string;
  duration?: number;
  type?: AppointmentType;
  chairNo?: string;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  patientId?: string;
  dentistId?: string;
  scheduledAt?: string;
  duration?: number;
  type?: AppointmentType;
  chairNo?: string | null;
  notes?: string;
}

export async function fetchAppointments(
  params: ListAppointmentsParams = {},
): Promise<AppointmentDto[]> {
  let query = supabase
    .from("appointments")
    .select("*, patients(name, phone), profiles(name)");

  if (params.date) {
    query = query.eq("appointment_date", params.date);
  }
  if (params.from) {
    query = query.gte("appointment_date", params.from.split("T")[0]);
  }
  if (params.to) {
    query = query.lte("appointment_date", params.to.split("T")[0]);
  }
  if (params.dentistId) {
    query = query.eq("provider_id", params.dentistId);
  }
  if (params.patientId) {
    query = query.eq("patient_id", params.patientId);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    dentistId: row.provider_id,
    scheduledAt: `${row.appointment_date}T${row.start_time}`,
    duration: row.duration_minutes,
    type: row.type || "CONSULTATION",
    status: row.status,
    notes: row.notes,
    patient: row.patients ? {
      id: row.patient_id,
      firstName: row.patients.name?.split(" ")[0] || "",
      lastName: row.patients.name?.split(" ").slice(1).join(" ") || "",
      phone: row.patients.phone || ""
    } : undefined,
    dentist: row.profiles ? {
      id: row.provider_id,
      name: row.profiles.name || ""
    } : undefined
  }));
}

export async function fetchAppointment(id: string): Promise<AppointmentDto> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*, patients(name, phone), profiles(name)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    patientId: data.patient_id,
    dentistId: data.provider_id,
    scheduledAt: `${data.appointment_date}T${data.start_time}`,
    duration: data.duration_minutes,
    type: data.type || "CONSULTATION",
    status: data.status,
    notes: data.notes,
    patient: data.patients ? {
      id: data.patient_id,
      firstName: data.patients.name?.split(" ")[0] || "",
      lastName: data.patients.name?.split(" ").slice(1).join(" ") || "",
      phone: data.patients.phone || ""
    } : undefined,
    dentist: data.profiles ? {
      id: data.provider_id,
      name: data.profiles.name || ""
    } : undefined
  };
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<AppointmentDto> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) throw new Error("No clinic assigned");

  const dateObj = new Date(payload.scheduledAt);
  const appointment_date = dateObj.toISOString().split("T")[0];
  const start_time = dateObj.toISOString().split("T")[1].substring(0, 8);

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      clinic_id: profile.clinic_id,
      patient_id: payload.patientId,
      provider_id: payload.dentistId || null,
      appointment_date,
      start_time,
      duration_minutes: payload.duration || 30,
      type: payload.type || "CONSULTATION",
      notes: payload.notes || null,
      status: "BOOKED"
    })
    .select("*, patients(name, phone), profiles(name)")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    patientId: data.patient_id,
    dentistId: data.provider_id,
    scheduledAt: `${data.appointment_date}T${data.start_time}`,
    duration: data.duration_minutes,
    type: data.type || "CONSULTATION",
    status: data.status,
    notes: data.notes,
    patient: data.patients ? {
      id: data.patient_id,
      firstName: data.patients.name?.split(" ")[0] || "",
      lastName: data.patients.name?.split(" ").slice(1).join(" ") || "",
      phone: data.patients.phone || ""
    } : undefined,
    dentist: data.profiles ? {
      id: data.provider_id,
      name: data.profiles.name || ""
    } : undefined
  };
}

export async function updateAppointment(
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<AppointmentDto> {
  const updates: any = {};
  
  if (payload.scheduledAt) {
    const dateObj = new Date(payload.scheduledAt);
    updates.appointment_date = dateObj.toISOString().split("T")[0];
    updates.start_time = dateObj.toISOString().split("T")[1].substring(0, 8);
  }
  if (payload.dentistId !== undefined) updates.provider_id = payload.dentistId;
  if (payload.duration !== undefined) updates.duration_minutes = payload.duration;
  if (payload.type !== undefined) updates.type = payload.type;
  if (payload.notes !== undefined) updates.notes = payload.notes;

  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select("*, patients(name, phone), profiles(name)")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    patientId: data.patient_id,
    dentistId: data.provider_id,
    scheduledAt: `${data.appointment_date}T${data.start_time}`,
    duration: data.duration_minutes,
    type: data.type || "CONSULTATION",
    status: data.status,
    notes: data.notes,
    patient: data.patients ? {
      id: data.patient_id,
      firstName: data.patients.name?.split(" ")[0] || "",
      lastName: data.patients.name?.split(" ").slice(1).join(" ") || "",
      phone: data.patients.phone || ""
    } : undefined,
    dentist: data.profiles ? {
      id: data.provider_id,
      name: data.profiles.name || ""
    } : undefined
  };
}

export async function patchAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  cancellationReason?: string,
): Promise<AppointmentDto> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("*, patients(name, phone), profiles(name)")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    patientId: data.patient_id,
    dentistId: data.provider_id,
    scheduledAt: `${data.appointment_date}T${data.start_time}`,
    duration: data.duration_minutes,
    type: data.type || "CONSULTATION",
    status: data.status,
    notes: data.notes,
    patient: data.patients ? {
      id: data.patient_id,
      firstName: data.patients.name?.split(" ")[0] || "",
      lastName: data.patients.name?.split(" ").slice(1).join(" ") || "",
      phone: data.patients.phone || ""
    } : undefined,
    dentist: data.profiles ? {
      id: data.provider_id,
      name: data.profiles.name || ""
    } : undefined
  };
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function sendAppointmentQueueAlert(
  id: string,
  message?: string,
): Promise<any> {
  // Not supported by Supabase schema natively yet. Using Demo return.
  console.log("Mock queue alert sent for", id, message);
  return {
    appointmentId: id,
    recipient: "+639999999",
    notification: { id: "mock", status: "SENT" },
  };
}

export async function fetchDentists(): Promise<DentistRow[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "DENTIST");

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    specialty: "General Dentistry",
    avatarUrl: null
  }));
}

export async function searchPatients(q: string): Promise<PatientSearchRow[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("id, name, phone, dob")
    .ilike("name", `%${q}%`)
    .limit(10);

  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => {
    const parts = row.name ? row.name.split(" ") : [];
    return {
      id: row.id,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      phone: row.phone || "",
      birthDate: row.dob || null
    };
  });
}

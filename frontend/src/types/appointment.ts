export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentType =
  | "CHECKUP"
  | "CLEANING"
  | "EXTRACTION"
  | "FILLING"
  | "ROOT_CANAL"
  | "ORTHODONTIC"
  | "WHITENING"
  | "CONSULTATION"
  | "XRAY"
  | "OTHER";

export const APPOINTMENT_TYPES: AppointmentType[] = [
  "CHECKUP",
  "CLEANING",
  "CONSULTATION",
  "FILLING",
  "EXTRACTION",
  "ROOT_CANAL",
  "WHITENING",
  "ORTHODONTIC",
  "XRAY",
  "OTHER",
];

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export interface AppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
}

export interface AppointmentDentist {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

export interface AppointmentDto {
  id: string;
  clinicId: string;
  scheduledAt: string;
  endsAt: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType | null;
  chairNo: string | null;
  notes: string | null;
  arrivedAt: string | null;
  inProgressAt: string | null;
  completedAt: string | null;
  createdAt: string;
  patient: AppointmentPatient;
  dentist: AppointmentDentist;
}

export interface DentistRow {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
}

export interface PatientSearchRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const APPOINTMENT_STATUS_STYLES: Record<
  AppointmentStatus,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-100",
    border: "border-amber-300",
    text: "text-amber-900",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-sky-100",
    border: "border-sky-300",
    text: "text-sky-900",
    dot: "bg-sky-500",
  },
  CHECKED_IN: {
    label: "Checked-in",
    bg: "bg-indigo-100",
    border: "border-indigo-300",
    text: "text-indigo-900",
    dot: "bg-indigo-500",
  },
  IN_PROGRESS: {
    label: "In progress",
    bg: "bg-fuchsia-100",
    border: "border-fuchsia-300",
    text: "text-fuchsia-900",
    dot: "bg-fuchsia-500",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-100",
    border: "border-emerald-300",
    text: "text-emerald-900",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },
  NO_SHOW: {
    label: "No-show",
    bg: "bg-rose-100",
    border: "border-rose-300",
    text: "text-rose-900",
    dot: "bg-rose-500",
  },
};

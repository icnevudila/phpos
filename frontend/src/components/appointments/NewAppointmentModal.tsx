import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  createAppointment,
  updateAppointment,
} from "../../services/appointments";
import type {
  AppointmentDto,
  AppointmentType,
  DentistRow,
  PatientSearchRow,
} from "../../types/appointment";
import { APPOINTMENT_TYPES } from "../../types/appointment";

import { DentistSelect } from "./DentistSelect";
import { PatientAutocomplete } from "./PatientAutocomplete";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (a: AppointmentDto) => void;
  dentists: DentistRow[];
  initial?: {
    scheduledAt?: string;
    dentistId?: string;
  };
  editing?: AppointmentDto | null;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewAppointmentModal({
  open,
  onClose,
  onSaved,
  dentists,
  initial,
  editing,
}: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [patient, setPatient] = useState<PatientSearchRow | null>(null);
  const [dentistId, setDentistId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState<AppointmentType>("CHECKUP");
  const [chairNo, setChairNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setPatient(editing.patient ? {
        id: editing.patient.id,
        firstName: editing.patient.firstName,
        lastName: editing.patient.lastName,
        phone: editing.patient.phone,
      } : null);
      setDentistId(editing.dentist?.id || "");
      setScheduledAt(toLocalInputValue(editing.scheduledAt));
      setDuration(editing.duration);
      setType((editing.type as AppointmentType) ?? "CHECKUP");
      setChairNo(editing.chairNo ?? "");
      setNotes(editing.notes ?? "");
    } else {
      setPatient(null);
      setDentistId(initial?.dentistId ?? "");
      setScheduledAt(initial?.scheduledAt ? toLocalInputValue(initial.scheduledAt) : "");
      setDuration(30);
      setType("CHECKUP");
      setChairNo("");
      setNotes("");
    }
  }, [open, editing, initial?.dentistId, initial?.scheduledAt]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);

    if (!patient) {
      setError(t("pages.appointments.modal.selectPatient", { defaultValue: "Select Patient" }));
      return;
    }
    if (!dentistId) {
      setError(t("pages.appointments.modal.selectDentist", { defaultValue: "Select Dentist" }));
      return;
    }
    if (!scheduledAt) {
      setError(t("pages.appointments.modal.selectDateTime", { defaultValue: "Select Date Time" }));
      return;
    }

    const iso = new Date(scheduledAt).toISOString();
    setSubmitting(true);
    try {
      const saved = editing
        ? await updateAppointment(editing.id, {
            patientId: patient.id,
            dentistId,
            scheduledAt: iso,
            duration,
            type,
            chairNo: chairNo.trim() || null,
            notes: notes || undefined,
          })
        : await createAppointment({
            patientId: patient.id,
            dentistId,
            scheduledAt: iso,
            duration,
            type,
            chairNo: chairNo.trim() || undefined,
            notes: notes || undefined,
          });
      onSaved(saved);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("pages.appointments.modal.saveFailed", { defaultValue: "Save Failed" });
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? t("pages.appointments.modal.editTitle", { defaultValue: "Edit Title" }) : t("pages.appointments.modal.newTitle", { defaultValue: "New Title" })}
            </h2>
            <p className="text-xs text-slate-500">{t("pages.appointments.modal.hoursHint", { defaultValue: "Hours Hint" })}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] p-1 text-brand-muted hover:bg-brand-surface-soft hover:text-brand-text transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
              {t("pages.appointments.modal.patient", { defaultValue: "Patient" })}
            </label>
            <PatientAutocomplete
              value={patient}
              onChange={setPatient}
              autoFocus={!editing && patient === null}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                {t("pages.appointments.modal.dentist", { defaultValue: "Dentist" })}
              </label>
              <DentistSelect
                dentists={dentists}
                value={dentistId}
                onChange={setDentistId}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                {t("pages.appointments.modal.type", { defaultValue: "Type" })}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow"
              >
                {APPOINTMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                {t("pages.appointments.modal.dateTime", { defaultValue: "Date & time" })}
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                {t("pages.appointments.modal.duration", { defaultValue: "Duration" })}
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-brand-muted">
              {t("pages.appointments.modal.notes", { defaultValue: "Chief complaint / notes" })}
            </label>
            <input
              value={chairNo}
              onChange={(e) => setChairNo(e.target.value)}
              placeholder={t("pages.appointments.modal.chairPlaceholder", { defaultValue: "Chair Placeholder" })}
              className="mb-2 w-full h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow resize-none"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              {t("pages.appointments.modal.cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting
                ? t("pages.appointments.modal.saving", { defaultValue: "Saving" })
                : editing
                  ? t("pages.appointments.modal.saveChanges", { defaultValue: "Save Changes" })
                  : t("pages.appointments.modal.create", { defaultValue: "Create" })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

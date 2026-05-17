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
      setPatient({
        id: editing.patient.id,
        firstName: editing.patient.firstName,
        lastName: editing.patient.lastName,
        phone: editing.patient.phone,
      });
      setDentistId(editing.dentist.id);
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
      setError(t("pages.appointments.modal.selectPatient"));
      return;
    }
    if (!dentistId) {
      setError(t("pages.appointments.modal.selectDentist"));
      return;
    }
    if (!scheduledAt) {
      setError(t("pages.appointments.modal.selectDateTime"));
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
      const msg = err instanceof Error ? err.message : t("pages.appointments.modal.saveFailed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? t("pages.appointments.modal.editTitle") : t("pages.appointments.modal.newTitle")}
            </h2>
            <p className="text-xs text-slate-500">{t("pages.appointments.modal.hoursHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Patient
            </label>
            <PatientAutocomplete
              value={patient}
              onChange={setPatient}
              autoFocus={!editing && patient === null}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Dentist
              </label>
              <DentistSelect
                dentists={dentists}
                value={dentistId}
                onChange={setDentistId}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chief complaint / notes
            </label>
            <input
              value={chairNo}
              onChange={(e) => setChairNo(e.target.value)}
              placeholder={t("pages.appointments.modal.chairPlaceholder")}
              className="mb-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting
                ? t("pages.appointments.modal.saving")
                : editing
                  ? t("pages.appointments.modal.saveChanges")
                  : t("pages.appointments.modal.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

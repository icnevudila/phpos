import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  deleteAppointment as deleteAppointmentApi,
  fetchAppointment,
  patchAppointmentStatus,
} from "../../services/appointments";
import { finalizeAppointmentTreatments } from "../../services/treatments";
import type { AppointmentDto, AppointmentStatus } from "../../types/appointment";
import { APPOINTMENT_STATUS_STYLES } from "../../types/appointment";
import { TreatmentEditorPanel } from "./TreatmentEditorPanel";

interface Props {
  appointment: AppointmentDto;
  onClose: () => void;
  onChanged: (a: AppointmentDto) => void;
  onEdit: (a: AppointmentDto) => void;
  onDeleted: (id: string) => void;
}

function formatManila(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "full",
    timeStyle: "short",
  }).format(d);
}

const STATUS_ACTIONS: { from: AppointmentStatus[]; to: AppointmentStatus; label: string; cls: string }[] = [
  {
    from: ["PENDING"],
    to: "CONFIRMED",
    label: "Confirm",
    cls: "bg-sky-600 hover:bg-sky-700 text-white",
  },
  {
    from: ["CONFIRMED", "PENDING"],
    to: "CHECKED_IN",
    label: "Check-in",
    cls: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  {
    from: ["CHECKED_IN"],
    to: "IN_PROGRESS",
    label: "Start treatment",
    cls: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white",
  },
  {
    from: ["CONFIRMED", "PENDING", "CHECKED_IN", "IN_PROGRESS"],
    to: "COMPLETED",
    label: "Mark completed",
    cls: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    from: ["PENDING", "CONFIRMED"],
    to: "NO_SHOW",
    label: "Mark no-show",
    cls: "bg-rose-600 hover:bg-rose-700 text-white",
  },
];

export function AppointmentDetailSidebar({
  appointment,
  onClose,
  onChanged,
  onEdit,
  onDeleted,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<AppointmentStatus | "DELETE" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [autoFinalize, setAutoFinalize] = useState<boolean>(() => {
    return localStorage.getItem("appointments:autoFinalizeOnComplete") === "1";
  });
  const [treatRefreshKey, setTreatRefreshKey] = useState(0);
  const style = APPOINTMENT_STATUS_STYLES[appointment.status];
  const isLocked =
    appointment.status === "COMPLETED" || appointment.status === "CANCELLED";

  async function changeStatus(status: AppointmentStatus, cancellationReason?: string): Promise<void> {
    setBusy(status);
    setError(null);
    try {
      const updated = await patchAppointmentStatus(appointment.id, status, cancellationReason);
      if (status === "COMPLETED" && autoFinalize) {
        await finalizeAppointmentTreatments(appointment.id);
      }
      onChanged(updated);
      setTreatRefreshKey((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setBusy(null);
    }
  }

  async function removeAppointment(): Promise<void> {
    if (!confirm(t("pages.appointments.deleteConfirm"))) return;
    setBusy("DELETE");
    setError(null);
    try {
      await deleteAppointmentApi(appointment.id);
      onDeleted(appointment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusy(null);
    }
  }

  function toggleAutoFinalize(next: boolean): void {
    setAutoFinalize(next);
    localStorage.setItem("appointments:autoFinalizeOnComplete", next ? "1" : "0");
  }

  async function refreshCurrentAppointment(): Promise<void> {
    try {
      const latest = await fetchAppointment(appointment.id);
      onChanged(latest);
      setTreatRefreshKey((v) => v + 1);
    } catch {
      // noop
    }
  }

  return (
    <aside className="flex h-full w-[360px] flex-col border-l border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-sm font-bold text-slate-900">Appointment</h3>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className={`rounded-xl border ${style.border} ${style.bg} px-3 py-2`}>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${style.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>
              {style.label}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patient</p>
          <p className="mt-1 text-base font-bold text-slate-900">{appointment.patient.fullName}</p>
          <p className="text-xs text-slate-500">{appointment.patient.phone}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dentist</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">Dr. {appointment.dentist.fullName}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">When</p>
          <p className="mt-1 text-sm text-slate-800">{formatManila(appointment.scheduledAt)}</p>
          <p className="text-xs text-slate-500">
            {appointment.duration} min · ends {formatManila(appointment.endsAt)}
          </p>
        </div>

        {appointment.type ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Type</p>
            <p className="mt-1 text-sm text-slate-800">
              {appointment.type.replace(/_/g, " ")}
            </p>
          </div>
        ) : null}

        {appointment.chairNo ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chair / station</p>
            <p className="mt-1 text-sm text-slate-800">{appointment.chairNo}</p>
          </div>
        ) : null}

        {appointment.notes ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{appointment.notes}</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLocked ? (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Change status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.filter((a) => a.from.includes(appointment.status)).map((a) => (
                <button
                  key={a.to}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => changeStatus(a.to)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${a.cls} disabled:opacity-60`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cancellation reason
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
              />
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => changeStatus("CANCELLED", reason || undefined)}
                className="mt-2 w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                Cancel appointment
              </button>
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-100 pt-4">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={autoFinalize}
              onChange={(e) => toggleAutoFinalize(e.target.checked)}
            />
            Auto-finalize when marked completed
          </label>
        </div>

        <TreatmentEditorPanel
          key={`${appointment.id}-${treatRefreshKey}`}
          appointmentId={appointment.id}
          disabled={appointment.status === "CANCELLED"}
        />
      </div>

      <div className="border-t border-slate-200 px-5 py-3">
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => onEdit(appointment)}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => void refreshCurrentAppointment()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            disabled={isLocked || busy !== null}
            onClick={removeAppointment}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </aside>
  );
}

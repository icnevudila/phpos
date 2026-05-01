import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { PatientAutocomplete } from "../components/appointments/PatientAutocomplete";
import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  createWaitlistEntry,
  fetchWaitlist,
  patchWaitlistEntry,
  type WaitlistEntryDto,
  type WaitlistStatus,
} from "../services/waitlist";
import type { PatientSearchRow } from "../types/appointment";

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

function fmtWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_BADGE: Record<WaitlistStatus, string> = {
  WAITING: "bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900",
  FULFILLED: "bg-emerald-100 text-emerald-900 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900",
  CANCELLED: "bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
};

export function WaitlistPage(): JSX.Element {
  const { t } = useTranslation();
  const [scope, setScope] = useState<"active" | "all">("active");
  const [rows, setRows] = useState<WaitlistEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientSearchRow | null>(null);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [tableQInput, setTableQInput] = useState("");
  const tableQ = useDebouncedValue(tableQInput, 300);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWaitlist(scope);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.waitlist.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [scope, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(): Promise<void> {
    if (!patient) {
      toast.error(t("pages.waitlist.toastSelectPatient"));
      return;
    }
    setAdding(true);
    try {
      await createWaitlistEntry({
        patientId: patient.id,
        notes: notes.trim() || null,
      });
      toast.success(t("pages.waitlist.toastAdded"));
      setNotes("");
      setPatient(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.toLowerCase().includes("already") || msg.includes("WAITLIST")) {
        toast.error(t("pages.waitlist.toastDuplicate"));
      } else {
        toast.error(msg || t("pages.waitlist.loadFailed"));
      }
    } finally {
      setAdding(false);
    }
  }

  async function onPatch(id: string, status: "FULFILLED" | "CANCELLED"): Promise<void> {
    if (status === "CANCELLED") {
      const ok = window.confirm(t("pages.waitlist.confirmCancel"));
      if (!ok) return;
    }
    try {
      await patchWaitlistEntry(id, status);
      toast.success(t("pages.waitlist.toastUpdated"));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.waitlist.toastUpdateFailed"));
    }
  }

  const emptyWaiting = !loading && scope === "active" && rows.length === 0;

  const filteredRows = useMemo(() => {
    const needle = tableQ.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const name = r.patient.fullName.toLowerCase();
      const phone = (r.patient.phone ?? "").toLowerCase();
      const note = (r.notes ?? "").toLowerCase();
      return name.includes(needle) || phone.includes(needle) || note.includes(needle);
    });
  }, [rows, tableQ]);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("pages.waitlist.title")}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("pages.waitlist.subtitle")}</p>
        </div>
        <Link
          to="/appointments"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100 dark:hover:bg-sky-900/50 dark:focus-visible:ring-offset-slate-950"
        >
          {t("pages.waitlist.linkCalendar")}
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {t("pages.waitlist.addToWaitlist")}
        </h2>
        <div className="mt-3 grid max-w-2xl gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("pages.waitlist.patientLabel")}
            </label>
            <PatientAutocomplete
              value={patient}
              onChange={setPatient}
              placeholder={t("pages.waitlist.patientPlaceholder")}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("pages.waitlist.notesLabel")}
            </label>
            <textarea
              className={`mt-1 min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${fieldFocus}`}
              placeholder={t("pages.waitlist.notesPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
          </div>
          <button
            type="button"
            disabled={adding || !patient}
            onClick={() => void onAdd()}
            className="min-h-11 w-fit rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
          >
            {adding ? t("pages.waitlist.adding") : t("pages.waitlist.addToWaitlist")}
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("pages.notifications.filterStatus")}:</span>
        <button
          type="button"
          onClick={() => setScope("active")}
          className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
            scope === "active"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {t("pages.waitlist.scopeActive")}
        </button>
        <button
          type="button"
          onClick={() => setScope("all")}
          className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
            scope === "all"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
              : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {t("pages.waitlist.scopeAll")}
        </button>
      </div>

      {!loading && rows.length > 0 ? (
        <div className="flex max-w-xl flex-wrap items-stretch gap-2">
          <input
            type="search"
            value={tableQInput}
            onChange={(e) => setTableQInput(e.target.value)}
            placeholder={t("pages.waitlist.tableSearchPlaceholder")}
            className={`min-h-11 min-w-[200px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${fieldFocus}`}
          />
          {tableQInput.trim() ? (
            <button
              type="button"
              onClick={() => setTableQInput("")}
              className={`min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${fieldFocus}`}
            >
              {t("pages.waitlist.clearSearch")}
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-slate-500">{t("pages.waitlist.loading")}</p>
      ) : emptyWaiting ? (
        <ListEmptyState
          icon="users"
          title={t("pages.waitlist.emptyTitle")}
          description={t("pages.waitlist.emptyHint")}
          primary={{ kind: "link", to: "/appointments", label: t("pages.waitlist.emptyCtaCalendar") }}
        />
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">{t("pages.waitlist.emptyTitle")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">{t("pages.waitlist.colPatient")}</th>
                <th className="px-3 py-2">{t("pages.waitlist.colPhone")}</th>
                <th className="px-3 py-2">{t("pages.waitlist.colNotes")}</th>
                <th className="px-3 py-2">{t("pages.waitlist.colSince")}</th>
                <th className="px-3 py-2">{t("pages.waitlist.colStatus")}</th>
                <th className="px-3 py-2">{t("pages.waitlist.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                    <Link
                      to={`/patients/${r.patient.id}`}
                      className="text-sky-700 underline-offset-2 hover:underline dark:text-sky-400"
                    >
                      {r.patient.fullName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.patient.phone}</td>
                  <td className="max-w-[14rem] truncate px-3 py-2 text-slate-600 dark:text-slate-400" title={r.notes ?? ""}>
                    {r.notes ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">{fmtWhen(r.createdAt)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE[r.status]}`}
                    >
                      {t(`pages.waitlist.status${r.status}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.status === "WAITING" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void onPatch(r.id, "FULFILLED")}
                            className="rounded border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
                          >
                            {t("pages.waitlist.actionFulfilled")}
                          </button>
                          <button
                            type="button"
                            onClick={() => void onPatch(r.id, "CANCELLED")}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            {t("pages.waitlist.actionCancel")}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

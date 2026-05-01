import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ListEmptyState } from "../components/ListEmptyState";
import { PatientForm } from "../components/PatientForm";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { apiFetch } from "../services/api";

interface PatientHmoBrief {
  id: string;
  isPrimary: boolean;
  providerCode: string;
  providerName: string;
}

interface PatientRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string | null;
  lastVisitAt: string | null;
  hmoMemberships: PatientHmoBrief[];
}

interface ListPayload {
  data: PatientRow[];
  total: number;
  page: number;
  totalPages: number;
}

function PatientHmoBadges({
  memberships,
  noneLabel,
}: {
  memberships: PatientHmoBrief[];
  noneLabel: string;
}): JSX.Element {
  if (!memberships.length) {
    return <span className="text-xs text-slate-400">{noneLabel}</span>;
  }
  const sorted = [...memberships].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return a.providerCode.localeCompare(b.providerCode);
    return a.isPrimary ? -1 : 1;
  });
  const show = sorted.slice(0, 2);
  return (
    <div className="flex max-w-[200px] flex-wrap items-center gap-1">
      {show.map((m) => (
        <span
          key={m.id}
          title={m.providerName}
          className="truncate rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-900"
        >
          {m.providerCode}
        </span>
      ))}
      {memberships.length > 2 ? (
        <span className="text-[10px] font-semibold text-slate-500">+{memberships.length - 2}</span>
      ) : null}
    </div>
  );
}

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

function formatDisplayDate(iso: string | null, empty: string): string {
  if (!iso) return empty;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return empty;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export function PatientList(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const empty = t("pages.common.empty");
  const [qInput, setQInput] = useState("");
  const q = useDebouncedValue(qInput, 300);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const limit = 20;

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (q.trim()) params.set("q", q.trim());
      const res = await apiFetch<{ success: true; data: ListPayload }>(`/patients?${params.toString()}`);
      setRows(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("pages.patients.loadFailed");
      setLoadError(msg);
      setRows([]);
      setTotal(0);
      setTotalPages(0);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, q, t]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
                <path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" strokeLinecap="round" />
                <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">Patient Desk</p>
              <h1 className="text-xl font-semibold text-slate-900">{t("pages.patients.title")}</h1>
              <p className="text-xs text-slate-500">{t("pages.patients.total", { count: total })}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:ring-offset-slate-950"
        >
          {t("pages.patients.newPatient")}
        </button>
      </div>
      </div>

      {loadError ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100"
        >
          <p className="font-semibold">{t("pages.patients.loadFailedTitle")}</p>
          <p className="mt-1 text-rose-800 dark:text-rose-200/90">{loadError}</p>
          <p className="mt-2 text-xs text-rose-700/90 dark:text-rose-300/80">{t("pages.patients.loadFailedHint")}</p>
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t("pages.patients.searchLabel")}
        </label>
        <div className="mt-1 flex flex-wrap items-stretch gap-2">
          <input
            type="search"
            placeholder={t("pages.patients.searchPlaceholder")}
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            className={`min-h-11 min-w-[200px] w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 ${fieldFocus}`}
            aria-describedby="patient-search-hint"
          />
          {qInput.trim() ? (
            <button
              type="button"
              onClick={() => setQInput("")}
              className={`min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${fieldFocus}`}
            >
              {t("pages.patients.clearSearch")}
            </button>
          ) : null}
        </div>
        <p id="patient-search-hint" className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t("pages.patients.searchHint")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-4 py-8 text-center text-slate-500 md:hidden">{t("pages.patients.loading")}</div>
        ) : null}
        {!loading && loadError ? (
          <div className="px-4 py-8 text-center text-slate-500 md:hidden">
            {t("pages.patients.loadFailedTableHint")}
          </div>
        ) : null}
        {!loading && !loadError && rows.length === 0 ? (
          <div className="md:hidden">
            <ListEmptyState
              icon="users"
              title={t("pages.patients.emptyTitle")}
              description={t("pages.patients.emptyHint")}
              primary={{
                kind: "button",
                onClick: () => setModalOpen(true),
                label: t("pages.patients.newPatient"),
              }}
              secondary={{
                kind: "link",
                to: "/appointments",
                label: t("pages.patients.emptyCtaAppointments"),
              }}
            />
          </div>
        ) : null}
        {!loading && !loadError && rows.length > 0 ? (
          <div className="space-y-3 p-3 md:hidden">
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => void navigate(`/patients/${r.id}`)}
                className="w-full min-h-[64px] rounded-xl border border-slate-200 p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {r.firstName} {r.lastName}
                </p>
                <p className="mt-0.5 text-xs text-slate-600">{r.phone}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t("pages.patients.colBirth")}: {formatDisplayDate(r.birthDate, empty)}
                </p>
                <p className="text-xs text-slate-500">
                  {t("pages.patients.colLastVisit")}: {formatDisplayDate(r.lastVisitAt, empty)}
                </p>
                <div className="mt-2">
                  <PatientHmoBadges memberships={r.hmoMemberships ?? []} noneLabel={t("pages.patients.hmoNone")} />
                </div>
              </button>
            ))}
          </div>
        ) : null}
        <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">{t("pages.patients.colName")}</th>
              <th className="px-4 py-3 font-medium">{t("pages.patients.colPhone")}</th>
              <th className="px-4 py-3 font-medium">{t("pages.patients.colBirth")}</th>
              <th className="px-4 py-3 font-medium">{t("pages.patients.colLastVisit")}</th>
              <th className="px-4 py-3 font-medium">{t("pages.patients.colHmo")}</th>
              <th className="px-4 py-3 font-medium">{t("pages.patients.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {t("pages.patients.loading")}
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  {t("pages.patients.loadFailedTableHint")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0 align-top">
                  <ListEmptyState
                    icon="users"
                    title={t("pages.patients.emptyTitle")}
                    description={t("pages.patients.emptyHint")}
                    primary={{
                      kind: "button",
                      onClick: () => setModalOpen(true),
                      label: t("pages.patients.newPatient"),
                    }}
                    secondary={{
                      kind: "link",
                      to: "/appointments",
                      label: t("pages.patients.emptyCtaAppointments"),
                    }}
                  />
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                  onClick={() => void navigate(`/patients/${r.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {r.firstName} {r.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.phone}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDisplayDate(r.birthDate, empty)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDisplayDate(r.lastVisitAt, empty)}</td>
                  <td className="px-4 py-3 align-top">
                    <PatientHmoBadges memberships={r.hmoMemberships ?? []} noneLabel={t("pages.patients.hmoNone")} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex min-h-9 items-center rounded px-2 py-1 text-sky-600 hover:bg-sky-50 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        void navigate(`/patients/${r.id}`);
                      }}
                    >
                      {t("pages.patients.view")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {t("pages.patients.pagination", {
            page,
            totalPages: Math.max(totalPages, 1),
            total,
          })}
        </span>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40 sm:flex-none"
          >
            {t("pages.patients.previous")}
          </button>
          <button
            type="button"
            disabled={totalPages === 0 || page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-40 sm:flex-none"
          >
            {t("pages.patients.next")}
          </button>
        </div>
      </div>

      <PatientForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => void load()}
      />
    </div>
  );
}

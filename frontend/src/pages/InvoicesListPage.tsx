import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { ListEmptyState } from "../components/ListEmptyState";
import { InvoiceHmoClaimChips } from "../components/invoices/InvoiceHmoClaimChips";
import { InvoiceStatusBadge } from "../components/invoices/InvoiceStatusBadge";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchInvoices } from "../services/invoices";
import type { InvoiceDto, InvoiceStatus } from "../types/invoice";
import { formatPHP } from "../types/invoice";

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
  }).format(new Date(iso));
}

export function InvoicesListPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const empty = t("pages.common.empty");
  const [rows, setRows] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const q = useDebouncedValue(qInput, 300);
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openHmoOnly, setOpenHmoOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchInvoices({
        q: q || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        ...(openHmoOnly ? { openHmoClaim: "1" as const } : {}),
      });
      setRows(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.invoicesList.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [q, status, from, to, openHmoOnly, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const sum = (f: (i: InvoiceDto) => number) => rows.reduce((a, r) => a + f(r), 0);
    return {
      count: rows.length,
      billed: sum((r) => Number(r.total)),
      collected: sum((r) => Number(r.paid)),
      outstanding: sum((r) => Number(r.balance)),
    };
  }, [rows]);

  const stats = useMemo(
    () => [
      { label: t("pages.invoicesList.statInvoices"), value: totals.count.toString(), color: "text-slate-900" },
      { label: t("pages.invoicesList.statBilled"), value: formatPHP(totals.billed), color: "text-slate-900" },
      { label: t("pages.invoicesList.statCollected"), value: formatPHP(totals.collected), color: "text-emerald-700" },
      { label: t("pages.invoicesList.statOutstanding"), value: formatPHP(totals.outstanding), color: "text-amber-800" },
    ],
    [t, totals],
  );

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
              <path d="M7 4h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 4v5h5M9 13h6M9 17h6" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{t("pages.invoicesList.title")}</h1>
            <p className="text-xs text-slate-500">{t("pages.invoicesList.subtitle")}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="grid gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="min-w-[200px] flex-1 basis-full lg:basis-auto">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.invoicesList.searchLabel")}
            </label>
            <input
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t("pages.invoicesList.searchPlaceholder")}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${fieldFocus}`}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.invoicesList.statusLabel")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus | "")}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto ${fieldFocus}`}
            >
              <option value="">{t("pages.invoicesList.all")}</option>
              <option value="UNPAID">{t("pages.invoicesList.statusUnpaid")}</option>
              <option value="PARTIAL">{t("pages.invoicesList.statusPartial")}</option>
              <option value="PAID">{t("pages.invoicesList.statusPaid")}</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.invoicesList.from")}
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={`w-full rounded-lg border border-slate-300 px-2 py-2 text-sm sm:w-auto ${fieldFocus}`}
            />
          </div>
          <div className="w-full sm:w-auto">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.invoicesList.to")}
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={`w-full rounded-lg border border-slate-300 px-2 py-2 text-sm sm:w-auto ${fieldFocus}`}
            />
          </div>
          <label className="flex min-h-11 w-full cursor-pointer items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950 focus-within:ring-2 focus-within:ring-amber-400 focus-within:ring-offset-2 sm:max-w-[260px] dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-amber-100 dark:focus-within:ring-offset-slate-950">
            <input
              type="checkbox"
              checked={openHmoOnly}
              onChange={(e) => setOpenHmoOnly(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-amber-300 text-amber-700 focus:ring-amber-500"
            />
            <span>
              <span className="font-bold">{t("pages.invoicesList.openHmoFilter")}</span>
              <span className="mt-0.5 block text-[10px] font-normal text-amber-900/90">
                {t("pages.invoicesList.openHmoHint")}
              </span>
            </span>
          </label>
        </div>

        {loading ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            {t("pages.invoicesList.loading")}
          </div>
        ) : error ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <ListEmptyState
              icon="receipt"
              title={t("pages.invoicesList.emptyTitle")}
              description={t("pages.invoicesList.emptyHint")}
              primary={{
                kind: "link",
                to: "/patients",
                label: t("pages.invoicesList.emptyCtaPatients"),
              }}
              secondary={{
                kind: "link",
                to: "/appointments",
                label: t("pages.invoicesList.emptyCtaAppointments"),
              }}
            />
          </div>
        ) : (
          <>
            <p className="mt-3 text-[11px] text-slate-500 md:hidden">{t("pages.invoicesList.mobileCardHint")}</p>
            <div className="mt-2 space-y-3 md:hidden">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(`/invoices/${r.id}`)}
                  className="w-full min-h-[64px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-emerald-700 dark:focus-visible:ring-offset-slate-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-slate-900">{r.orNumber ?? empty}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{r.patient.fullName}</p>
                      <p className="text-xs text-slate-500">{r.patient.phone}</p>
                      <p className="mt-2 text-xs text-slate-600">{fmtDate(r.createdAt)}</p>
                    </div>
                    <InvoiceStatusBadge status={r.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-slate-400">{t("pages.invoicesList.colTotal")}</p>
                      <p className="font-bold text-slate-800">{formatPHP(r.total)}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-slate-400">{t("pages.invoicesList.colPaid")}</p>
                      <p className="font-bold text-emerald-700">{formatPHP(r.paid)}</p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-wider text-slate-400">{t("pages.invoicesList.colBalance")}</p>
                      <p className="font-bold text-amber-800">{formatPHP(r.balance)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex min-h-9 flex-wrap items-center justify-between gap-2">
                    <InvoiceHmoClaimChips claims={r.hmoClaims ?? []} />
                    <span className="text-xs font-bold text-emerald-700">{t("pages.invoicesList.open")}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
              <table className="min-w-[880px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">{t("pages.invoicesList.colOr")}</th>
                    <th className="px-4 py-3">{t("pages.invoicesList.colPatient")}</th>
                    <th className="px-4 py-3">{t("pages.invoicesList.colDate")}</th>
                    <th className="px-4 py-3 text-right">{t("pages.invoicesList.colTotal")}</th>
                    <th className="px-4 py-3 text-right">{t("pages.invoicesList.colPaid")}</th>
                    <th className="px-4 py-3 text-right">{t("pages.invoicesList.colBalance")}</th>
                    <th className="px-4 py-3">{t("pages.invoicesList.colStatus")}</th>
                    <th className="px-4 py-3">{t("pages.invoicesList.colHmo")}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-b border-slate-100 hover:bg-emerald-50/40"
                      onClick={() => navigate(`/invoices/${r.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-900">
                        {r.orNumber ?? empty}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{r.patient.fullName}</div>
                        <div className="text-xs text-slate-500">{r.patient.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPHP(r.total)}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">{formatPHP(r.paid)}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-800">
                        {formatPHP(r.balance)}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <InvoiceHmoClaimChips claims={r.hmoClaims ?? []} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/invoices/${r.id}`}
                          className="inline-flex min-h-9 items-center text-xs font-bold text-emerald-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:text-emerald-400 dark:focus-visible:ring-offset-slate-950"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {t("pages.invoicesList.open")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

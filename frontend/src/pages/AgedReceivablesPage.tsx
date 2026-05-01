import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ListEmptyState } from "../components/ListEmptyState";
import {
  fetchAgedReceivables,
  type AgedBucketKey,
  type AgedReceivablesResponse,
} from "../services/reports";
import { formatPHP } from "../types/invoice";

export function AgedReceivablesPage(): JSX.Element {
  const { t } = useTranslation();
  const [data, setData] = useState<AgedReceivablesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bucketLabel = useCallback(
    (key: AgedBucketKey) => t(`pages.agedReceivables.bucket.${key}`),
    [t],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchAgedReceivables();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.agedReceivables.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <div className="p-10 text-center text-slate-500">{t("pages.agedReceivables.loading")}</div>;
  }
  if (error || !data) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-700">{error ?? t("pages.agedReceivables.noData")}</p>
      </div>
    );
  }

  const empty = t("pages.common.empty");

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("pages.agedReceivables.title")}</h1>
          <p className="text-xs text-slate-500">
            {t("pages.agedReceivables.subtitle", { asOf: data.asOf })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-900 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
        >
          {t("pages.agedReceivables.refresh")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t("pages.agedReceivables.totalOutstanding")}
          </p>
          <p className="mt-1 text-xl font-extrabold text-amber-800">{formatPHP(data.totalOutstanding)}</p>
        </div>
        {data.buckets.map((b) => (
          <div key={b.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{bucketLabel(b.key)}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatPHP(b.balance)}</p>
            <p className="text-xs text-slate-500">
              {t("pages.agedReceivables.invoiceCount", { count: b.invoiceCount })}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">{t("pages.agedReceivables.colPatient")}</th>
              <th className="px-4 py-3">{t("pages.agedReceivables.colOr")}</th>
              <th className="px-4 py-3">{t("pages.agedReceivables.colDays")}</th>
              <th className="px-4 py-3">{t("pages.agedReceivables.colBucket")}</th>
              <th className="px-4 py-3 text-right">{t("pages.agedReceivables.colBalance")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0 align-top">
                  <ListEmptyState
                    icon="chart"
                    title={t("pages.agedReceivables.emptyTitle")}
                    description={t("pages.agedReceivables.emptyHint")}
                    primary={{
                      kind: "link",
                      to: "/invoices",
                      label: t("pages.agedReceivables.emptyCtaInvoices"),
                    }}
                  />
                </td>
              </tr>
            ) : (
              data.rows.map((r) => (
                <tr key={r.invoiceId} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.patientName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.orNumber ?? empty}</td>
                  <td className="px-4 py-3 text-slate-700">{r.daysOutstanding}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{bucketLabel(r.bucket)}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-800">
                    {formatPHP(r.balance)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/invoices/${r.invoiceId}`}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      {t("pages.agedReceivables.open")}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

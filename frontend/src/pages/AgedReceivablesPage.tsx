import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingDown, 
  Clock, 
  Search, 
  RefreshCw,
  ChevronRight,
  User,
  Hash,
  AlertCircle,
  FileText,
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import {
  fetchAgedReceivables,
  type AgedBucketKey,
  type AgedReceivablesResponse,
} from "../services/reports";
import { formatPHP } from "../types/invoice";
import { exportToExcel, exportToWord, exportToPdf } from "../utils/exportHelpers";

export function AgedReceivablesPage(): JSX.Element {
  const { t } = useTranslation();
  const [data, setData] = useState<AgedReceivablesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const bucketLabel = useCallback(
    (key: AgedBucketKey) => t(`pages.agedReceivables.bucket.${key}`),
    [t],
  );

  const handleExport = (type: 'pdf' | 'excel' | 'word') => {
    if (!data || filteredRows.length === 0) return;
    const title = `Aged Receivables Report (As of ${data.asOf})`;
    const headers = ["Patient", "OR Number", "Days Outstanding", "Bucket", "Balance"];
    const rows = filteredRows.map(r => [
      r.patientName,
      r.orNumber || "N/A",
      `${r.daysOutstanding} Days`,
      bucketLabel(r.bucket),
      `PHP ${r.balance.toLocaleString()}`
    ]);
    const fileName = `aged_receivables_${data.asOf.replace(/[^a-zA-Z0-9]/g, "_")}`;

    if (type === 'excel') {
      exportToExcel(headers, rows, fileName);
    } else if (type === 'word') {
      exportToWord(title, headers, rows, fileName);
    } else if (type === 'pdf') {
      exportToPdf(title, headers, rows, fileName);
    }
  };


  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const d = await fetchAgedReceivables();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.agedReceivables.loadFailed", { defaultValue: "Load Failed" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = data?.rows.filter(row => 
    row.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.orNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertCircle size={32} />
        </div>
        <p className="text-base font-semibold text-slate-800">{error ?? t("pages.agedReceivables.noData", { defaultValue: "No Data" })}</p>
        <button
          onClick={() => void load()}
          className="btn-primary"
        >
          {t("pages.agedReceivables.refresh", { defaultValue: "Refresh" })}
        </button>
      </div>
    );
  }

  const empty = t("pages.common.empty", { defaultValue: "Empty" });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">{t("pages.agedReceivables.title", { defaultValue: "Title" })}</h1>
          <p className="page-header-sub">{t("pages.agedReceivables.subtitle", { asOf: data.asOf })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={t("pages.invoicesList.searchPlaceholder", { defaultValue: "Search Placeholder" })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-[260px] rounded-xl bg-white pl-10 pr-4 text-sm font-medium shadow-sm ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={() => void load()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={filteredRows.length === 0}
            className="btn-secondary flex items-center gap-1 text-xs h-10 px-3 bg-white hover:bg-teal-50"
          >
            PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={filteredRows.length === 0}
            className="btn-secondary flex items-center gap-1 text-xs h-10 px-3 bg-white hover:bg-teal-50"
          >
            Excel
          </button>
          <button
            onClick={() => handleExport('word')}
            disabled={filteredRows.length === 0}
            className="btn-secondary flex items-center gap-1 text-xs h-10 px-3 bg-white hover:bg-teal-50"
          >
            Word
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card bg-teal-600 text-white ring-0"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-100 mb-2">
            {t("pages.agedReceivables.totalOutstanding", { defaultValue: "Total Outstanding" })}
          </p>
          <p className="text-2xl font-bold tabular-nums">
            {formatPHP(data.totalOutstanding)}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-teal-200 bg-white/10 w-fit px-2 py-1 rounded-lg">
            <AlertCircle size={10} /> RECONCILED
          </div>
        </motion.div>

        {data.buckets.map((b, idx) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx + 1) * 0.05 }}
            className="stat-card"
          >
            <p className="stat-card-label">{bucketLabel(b.key)}</p>
            <p className="stat-card-value">{formatPHP(b.balance)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
              <FileText size={12} className="opacity-40" />
              {t("pages.agedReceivables.invoiceCount", { count: b.invoiceCount })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[800px]">
            <thead>
              <tr>
                <th>{t("pages.agedReceivables.colPatient", { defaultValue: "Col Patient" })}</th>
                <th>{t("pages.agedReceivables.colOr", { defaultValue: "Col Or" })}</th>
                <th>{t("pages.agedReceivables.colDays", { defaultValue: "Col Days" })}</th>
                <th>{t("pages.agedReceivables.colBucket", { defaultValue: "Col Bucket" })}</th>
                <th className="text-right">{t("pages.agedReceivables.colBalance", { defaultValue: "Col Balance" })}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRows.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="py-12">
                      <ListEmptyState
                        icon="chart"
                        title={
                          searchQuery
                            ? t("pages.invoicesList.noTableMatches", { defaultValue: "No Table Matches" })
                            : t("pages.agedReceivables.emptyTitle", { defaultValue: "Empty Title" })
                        }
                        description={
                          searchQuery
                            ? t("pages.invoicesList.searchHint", { defaultValue: "Search Hint" })
                            : t("pages.agedReceivables.emptyHint", { defaultValue: "Empty Hint" })
                        }
                        primary={
                          !searchQuery
                            ? {
                                kind: "link",
                                to: "/invoices",
                                label: t("pages.agedReceivables.emptyCtaInvoices", { defaultValue: "Empty Cta Invoices" }),
                              }
                            : undefined
                        }
                      />
                    </td>
                  </motion.tr>
                ) : (
                  filteredRows.map((r, idx) => (
                    <motion.tr
                      key={r.invoiceId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group cursor-pointer hover:bg-teal-50/30 transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                            <User size={18} />
                          </div>
                          <span className="text-sm font-semibold text-slate-800">{r.patientName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
                          <Hash size={11} className="opacity-40" />
                          {r.orNumber ?? empty}
                        </div>
                      </td>
                      <td>
                        <div className={`flex items-center gap-2 text-sm font-semibold ${r.daysOutstanding > 60 ? 'text-rose-500' : 'text-slate-600'}`}>
                          <Clock size={14} className="opacity-40" />
                          {r.daysOutstanding} <span className="text-[10px] font-medium text-slate-400">DAYS</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {bucketLabel(r.bucket)}
                        </span>
                      </td>
                      <td className="text-right">
                        <p className="text-sm font-semibold text-slate-800 tabular-nums">
                          {formatPHP(r.balance)}
                        </p>
                      </td>
                      <td className="text-right">
                        <Link
                          to={`/invoices/${r.invoiceId}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all hover:bg-teal-500 hover:text-white"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

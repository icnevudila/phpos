import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  RefreshCw,
  Wallet,
  Phone,
  FileDown,
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";
// InvoiceHmoClaimChips removed
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { fetchInvoices } from "../services/invoices";
import type { InvoiceDto, InvoiceStatus } from "../types/invoice";
import { formatPHP } from "../types/invoice";

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<string, { badgeClass: string }> = {
  UNPAID: { badgeClass: "badge badge-rose" },
  PARTIAL: { badgeClass: "badge badge-amber" },
  PAID:   { badgeClass: "badge badge-teal" },
};

export function InvoicesListPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  useEffect(() => { void load(); }, [load]);

  const totals = useMemo(() => {
    const sum = (f: (i: InvoiceDto) => number) => rows.reduce((a, r) => a + f(r), 0);
    return {
      count: rows.length,
      billed: sum((r) => Number(r.total)),
      collected: sum((r) => Number(r.paid)),
      outstanding: sum((r) => Number(r.balance)),
    };
  }, [rows]);

  const stats = [
    { label: t("pages.invoicesList.statInvoices"), value: totals.count.toString(), icon: FileText, iconBg: "bg-sky-50 text-sky-500" },
    { label: t("pages.invoicesList.statBilled"), value: formatPHP(totals.billed), icon: TrendingUp, iconBg: "bg-teal-50 text-teal-500" },
    { label: t("pages.invoicesList.statCollected"), value: formatPHP(totals.collected), icon: CheckCircle2, iconBg: "bg-teal-50 text-teal-600", valueClass: "text-teal-700" },
    { label: t("pages.invoicesList.statOutstanding"), value: formatPHP(totals.outstanding), icon: Wallet, iconBg: "bg-rose-50 text-rose-500", valueClass: "text-rose-700" },
  ];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">{t("nav.invoices") || "Invoices"}</h1>
          <p className="page-header-sub">{t("pages.invoicesList.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {t("common.refresh") || "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="stat-card-label">{s.label}</p>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className={`stat-card-value ${s.valueClass ?? "text-slate-800"}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card flex flex-wrap items-center gap-3">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder={t("pages.invoicesList.searchPlaceholder")}
            className="h-11 w-full pl-10 pr-4 rounded-xl bg-slate-50 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 h-11 ring-1 ring-slate-100">
          <Filter size={14} className="text-slate-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | "")}
            className="bg-transparent text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="">{t("pages.invoicesList.all")}</option>
            <option value="UNPAID">{t("pages.invoicesList.statusUnpaid")}</option>
            <option value="PARTIAL">{t("pages.invoicesList.statusPartial")}</option>
            <option value="PAID">{t("pages.invoicesList.statusPaid")}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 h-11 ring-1 ring-slate-100">
          <Calendar size={14} className="text-slate-400" />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent text-xs font-medium text-slate-600 outline-none" />
          <span className="text-slate-300">—</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-transparent text-xs font-medium text-slate-600 outline-none" />
        </div>

        <button
          type="button"
          disabled={rows.length === 0}
          onClick={() => {
            const headers = [
              t("pages.invoicesList.colOr"),
              t("pages.invoicesList.colPatient"),
              t("pages.invoicesList.colTotal"),
              t("pages.invoicesList.colPaid"),
              t("pages.invoicesList.colBalance"),
              t("pages.invoicesList.colStatus"),
            ];
            const body = rows.map((r) => [
              r.orNumber ?? "",
              r.patient.fullName,
              String(r.total),
              String(r.paid),
              String(r.balance),
              r.status,
            ]);
            downloadCsv(
              `invoices-${new Date().toISOString().slice(0, 10)}.csv`,
              rowsToCsv(headers, body),
            );
          }}
          className="btn-secondary flex items-center gap-2 disabled:opacity-40"
        >
          <FileDown size={16} />
          CSV
        </button>

        <button
          onClick={() => setOpenHmoOnly(!openHmoOnly)}
          className={`h-11 px-4 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${openHmoOnly ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100'}`}
        >
          {t("pages.invoicesList.openHmoFilter")}
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>{t("pages.invoicesList.colOr")}</th>
                <th>{t("pages.invoicesList.colPatient")}</th>
                <th className="text-right">{t("pages.invoicesList.colTotal")}</th>
                <th className="text-right">{t("pages.invoicesList.colPaid")}</th>
                <th className="text-right">{t("pages.invoicesList.colBalance")}</th>
                <th>{t("pages.invoicesList.colStatus")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr><td colSpan={7} className="py-20 text-center text-rose-500 font-medium text-sm">{error}</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="py-20"><ListEmptyState icon="receipt" title={t("pages.invoicesList.emptyTitle")} description={t("pages.invoicesList.emptyHint")} /></td></tr>
                ) : rows.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => navigate(`/invoices/${r.id}`)}
                    className="cursor-pointer hover:bg-teal-50/30 transition-colors"
                  >
                    <td>
                      <div className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-tight">
                        {r.orNumber || "PENDING"}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-800 uppercase leading-none">{r.patient.fullName}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Phone size={10} className="opacity-40" />
                          {r.patient.phone}
                          <span className="h-1 w-1 rounded-full bg-slate-200 mx-0.5" />
                          {fmtDate(r.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-sm font-semibold text-slate-800 tabular-nums">
                      {formatPHP(r.total)}
                    </td>
                    <td className="text-right text-sm font-semibold text-teal-600 tabular-nums">
                      {formatPHP(r.paid)}
                    </td>
                    <td className="text-right text-sm font-semibold text-rose-500 tabular-nums">
                      {formatPHP(r.balance)}
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className={STATUS_CONFIG[r.status]?.badgeClass ?? "badge badge-slate"}>
                          {r.status}
                        </span>
                        {r.hmoClaims && r.hmoClaims.length > 0 && (
                          <div className="flex gap-1">
                            <div className="px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-600 uppercase tracking-tight">HMO</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end">
                        <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
      setError(e instanceof Error ? e.message : t("pages.invoicesList.loadFailed", { defaultValue: "Load Failed" }));
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
    { label: t("pages.invoicesList.statInvoices", { defaultValue: "Stat Invoices" }), value: totals.count.toString(), icon: FileText, iconBg: "bg-sky-50 text-sky-500" },
    { label: t("pages.invoicesList.statBilled", { defaultValue: "Stat Billed" }), value: formatPHP(totals.billed), icon: TrendingUp, iconBg: "bg-teal-50 text-teal-500" },
    { label: t("pages.invoicesList.statCollected", { defaultValue: "Stat Collected" }), value: formatPHP(totals.collected), icon: CheckCircle2, iconBg: "bg-teal-50 text-teal-600", valueClass: "text-teal-700" },
    { label: t("pages.invoicesList.statOutstanding", { defaultValue: "Stat Outstanding" }), value: formatPHP(totals.outstanding), icon: Wallet, iconBg: "bg-rose-50 text-rose-500", valueClass: "text-rose-700" },
  ];

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">{t("nav.invoices", { defaultValue: "Invoices" }) || "Invoices"}</h1>
          <p className="page-header-sub">{t("pages.invoicesList.subtitle", { defaultValue: "Subtitle" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void load()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {t("common.refresh", { defaultValue: "Refresh" }) || "Refresh"}
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
              <div className={`h-9 w-9 rounded-[var(--radius-md)] flex items-center justify-center ${s.iconBg.replace('bg-sky-50', 'bg-brand-info-soft').replace('text-sky-500', 'text-brand-info').replace('bg-teal-50', 'bg-brand-primary-soft').replace('text-teal-500', 'text-brand-primary').replace('text-teal-600', 'text-brand-primary').replace('bg-rose-50', 'bg-brand-danger-soft').replace('text-rose-500', 'text-brand-danger')}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className={`stat-card-value ${s.valueClass ? s.valueClass.replace('text-teal-700', 'text-brand-primary').replace('text-rose-700', 'text-brand-danger') : "text-brand-text"}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card py-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <input
            type="text"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder={t("pages.invoicesList.searchPlaceholder", { defaultValue: "Search Placeholder" })}
            className="h-11 w-full pl-10 pr-4 rounded-[var(--radius-md)] bg-brand-surface border border-brand-border text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-brand-surface-soft rounded-[var(--radius-md)] px-3 h-11 border border-brand-border">
          <Filter size={14} className="text-brand-muted" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | "")}
            className="bg-transparent text-xs font-semibold text-brand-text-soft outline-none cursor-pointer"
          >
            <option value="">{t("pages.invoicesList.all", { defaultValue: "All" })}</option>
            <option value="UNPAID">{t("pages.invoicesList.statusUnpaid", { defaultValue: "Status Unpaid" })}</option>
            <option value="PARTIAL">{t("pages.invoicesList.statusPartial", { defaultValue: "Status Partial" })}</option>
            <option value="PAID">{t("pages.invoicesList.statusPaid", { defaultValue: "Status Paid" })}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-brand-surface-soft rounded-[var(--radius-md)] px-4 h-11 border border-brand-border">
          <Calendar size={14} className="text-brand-muted" />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent text-xs font-medium text-brand-text-soft outline-none" />
          <span className="text-brand-muted">—</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="bg-transparent text-xs font-medium text-brand-text-soft outline-none" />
        </div>

        <button
          type="button"
          disabled={rows.length === 0}
          onClick={() => {
            const headers = [
              t("pages.invoicesList.colOr", { defaultValue: "Col Or" }),
              t("pages.invoicesList.colPatient", { defaultValue: "Col Patient" }),
              t("pages.invoicesList.colTotal", { defaultValue: "Col Total" }),
              t("pages.invoicesList.colPaid", { defaultValue: "Col Paid" }),
              t("pages.invoicesList.colBalance", { defaultValue: "Col Balance" }),
              t("pages.invoicesList.colStatus", { defaultValue: "Col Status" }),
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
          className={`h-11 px-4 rounded-[var(--radius-md)] text-xs font-semibold uppercase tracking-widest transition-colors ${openHmoOnly ? 'bg-brand-warning text-white shadow-sm' : 'bg-brand-surface-soft text-brand-muted border border-brand-border'}`}
        >
          {t("pages.invoicesList.openHmoFilter", { defaultValue: "Open Hmo Filter" })}
        </button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>{t("pages.invoicesList.colOr", { defaultValue: "Col Or" })}</th>
                <th>{t("pages.invoicesList.colPatient", { defaultValue: "Col Patient" })}</th>
                <th className="text-right">{t("pages.invoicesList.colTotal", { defaultValue: "Col Total" })}</th>
                <th className="text-right">{t("pages.invoicesList.colPaid", { defaultValue: "Col Paid" })}</th>
                <th className="text-right">{t("pages.invoicesList.colBalance", { defaultValue: "Col Balance" })}</th>
                <th>{t("pages.invoicesList.colStatus", { defaultValue: "Col Status" })}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 rounded-[var(--radius-md)] bg-brand-primary-soft flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr><td colSpan={7} className="py-20 text-center text-brand-danger font-bold text-sm">{error}</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="py-20"><ListEmptyState icon="receipt" title={t("pages.invoicesList.emptyTitle", { defaultValue: "Empty Title" })} description={t("pages.invoicesList.emptyHint", { defaultValue: "Empty Hint" })} /></td></tr>
                ) : rows.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => navigate(`/invoices/${r.id}`)}
                    className="cursor-pointer hover:bg-brand-surface-soft transition-colors"
                  >
                    <td>
                      <div className="inline-flex items-center justify-center h-8 px-3 rounded-[var(--radius-sm)] bg-brand-surface-muted border border-brand-border text-[11px] font-bold text-brand-muted uppercase tracking-tight">
                        {r.orNumber || "PENDING"}
                      </div>
                    </td>
                    <td>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-brand-text uppercase leading-none">{r.patient.fullName}</p>
                        <div className="flex items-center gap-2 text-[11px] text-brand-muted font-medium">
                          <Phone size={10} className="opacity-40" />
                          {r.patient.phone}
                          <span className="h-1 w-1 rounded-full bg-brand-border mx-0.5" />
                          {fmtDate(r.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="text-right text-sm font-bold text-brand-text tabular-nums">
                      {formatPHP(r.total)}
                    </td>
                    <td className="text-right text-sm font-bold text-brand-primary tabular-nums">
                      {formatPHP(r.paid)}
                    </td>
                    <td className="text-right text-sm font-bold text-brand-danger tabular-nums">
                      {formatPHP(r.balance)}
                    </td>
                    <td>
                      <div className="space-y-1">
                        <span className={STATUS_CONFIG[r.status]?.badgeClass ?? "badge badge-slate"}>
                          {r.status}
                        </span>
                        {r.hmoClaims && r.hmoClaims.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            <div className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-brand-primary-soft text-[10px] font-bold text-brand-primary uppercase tracking-tight">HMO</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end">
                        <div className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted hover:bg-brand-primary hover:text-white transition-colors">
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

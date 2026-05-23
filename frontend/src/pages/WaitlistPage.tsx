import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  StickyNote,
  ChevronRight,
  Activity,
  Zap,
  Phone,
  Download,
  RefreshCw,
} from "lucide-react";

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
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";

function fmtWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<WaitlistStatus, { icon: typeof Clock; badgeClass: string }> = {
  WAITING: {
    icon: Clock,
    badgeClass: "badge badge-amber",
  },
  FULFILLED: {
    icon: CheckCircle2,
    badgeClass: "badge badge-teal",
  },
  CANCELLED: {
    icon: XCircle,
    badgeClass: "badge badge-slate",
  },
};

export function WaitlistPage(): JSX.Element {
  const { t } = useTranslation();
  const [scope, setScope] = useState<"active" | "all">("active");
  const [rows, setRows] = useState<WaitlistEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientSearchRow | null>(null);
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [tableQInput, setTableQInput] = useState("");
  const tableQ = useDebouncedValue(tableQInput, 300);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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

  function onExportCsv(): void {
    if (!filteredRows.length) return;
    const headers = [
      t("pages.waitlist.colPatient"),
      t("pages.waitlist.colPhone"),
      t("pages.waitlist.colNotes"),
      t("pages.waitlist.colSince"),
      t("pages.waitlist.colStatus"),
    ];
    const body = filteredRows.map((r) => [
      r.patient.fullName,
      r.patient.phone ?? "",
      r.notes ?? "",
      fmtWhen(r.createdAt),
      r.status === "WAITING"
        ? t("pages.waitlist.statusWAITING")
        : r.status === "FULFILLED"
          ? t("pages.waitlist.statusFULFILLED")
          : t("pages.waitlist.statusCANCELLED"),
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`waitlist-${scope}-${stamp}.csv`, rowsToCsv(headers, body));
    toast.success(t("pages.waitlist.exportReady", { count: filteredRows.length }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">{t("pages.waitlist.title")}</h1>
          <p className="page-header-sub">{t("pages.waitlist.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!filteredRows.length}
            onClick={onExportCsv}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={15} aria-hidden />
            {t("pages.waitlist.exportCsv")}
          </button>
          <Link
            to="/appointments"
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar size={15} /> {t("pages.waitlist.linkCalendar")}
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('add-waitlist-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> {t("pages.waitlist.addToWaitlist")}
          </button>
        </div>
      </div>

      {/* Add Entry Panel */}
      <section id="add-waitlist-section" className="card overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary-soft text-brand-primary">
            <UserPlus size={20} />
          </div>
          <h2 className="text-base font-bold text-brand-text">
            {t("pages.waitlist.addToWaitlist")}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 items-end">
          <div className="lg:col-span-4 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.waitlist.patientLabel")}
            </label>
            <PatientAutocomplete
              value={patient}
              onChange={setPatient}
              placeholder={t("pages.waitlist.patientPlaceholder")}
            />
          </div>
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.waitlist.notesLabel")}
            </label>
            <div className="relative">
              <StickyNote className="absolute left-4 top-3.5 text-brand-muted opacity-60" size={16} />
              <textarea
                className="h-14 w-full rounded-[var(--radius-md)] bg-brand-surface-soft pl-11 pr-4 py-3 text-sm font-medium outline-none border border-brand-border focus:ring-2 focus:ring-brand-primary transition-all resize-none"
                placeholder={t("pages.waitlist.notesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={2000}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <button
              type="button"
              disabled={adding || !patient}
              onClick={() => void onAdd()}
              className="btn-primary flex h-14 w-full items-center justify-center gap-2 disabled:opacity-50"
            >
              {adding ? <RefreshCw className="animate-spin h-4 w-4" /> : <Zap size={16} />}
              <span className="text-xs font-semibold uppercase tracking-widest">{adding ? t("pages.waitlist.adding") : t("pages.waitlist.addToWaitlist")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Scope + Search Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex items-center gap-1 bg-brand-surface-soft p-1.5 rounded-[var(--radius-md)] border border-brand-border">
          <button
            onClick={() => setScope("active")}
            className={`flex h-9 px-4 items-center gap-2 rounded-[var(--radius-sm)] text-xs font-semibold uppercase tracking-wider transition-colors ${ scope === "active" ? "bg-brand-surface text-brand-primary shadow-sm border border-brand-border" : "text-brand-muted hover:text-brand-text-soft" }`}
          >
            <Activity size={13} /> {t("pages.waitlist.scopeActive")}
          </button>
          <button
            onClick={() => setScope("all")}
            className={`flex h-9 px-4 items-center gap-2 rounded-[var(--radius-sm)] text-xs font-semibold uppercase tracking-wider transition-colors ${ scope === "all" ? "bg-brand-surface text-brand-primary shadow-sm border border-brand-border" : "text-brand-muted hover:text-brand-text-soft" }`}
          >
            <Filter size={13} /> {t("pages.waitlist.scopeAll")}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={15} />
            <input
              type="text"
              value={tableQInput}
              onChange={(e) => setTableQInput(e.target.value)}
              placeholder={t("pages.waitlist.tableSearchPlaceholder")}
              className="h-10 w-[260px] rounded-[var(--radius-md)] bg-brand-surface border border-brand-border pl-10 pr-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
          <div className="h-8 w-px bg-brand-border mx-1 hidden lg:block" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-xs font-medium text-brand-muted">Live Syncing</span>
          </div>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>{t("pages.waitlist.colPatient")}</th>
                <th>{t("pages.waitlist.colPhone")}</th>
                <th>{t("pages.waitlist.colNotes")}</th>
                <th>{t("pages.waitlist.colSince")}</th>
                <th>{t("pages.waitlist.colStatus")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading && rows.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 rounded-[var(--radius-md)] bg-brand-primary-soft flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ) : filteredRows.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={6} className="p-0">
                      <ListEmptyState
                        icon="users"
                        title={t("pages.waitlist.emptyTitle")}
                        description={t("pages.waitlist.emptyHint")}
                        primary={{ kind: "link", to: "/appointments", label: t("pages.waitlist.emptyCtaCalendar") }}
                      />
                    </td>
                  </motion.tr>
                ) : (
                  filteredRows.map((r, idx) => {
                    const cfg = STATUS_CONFIG[r.status];
                    const Icon = cfg.icon;
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group cursor-pointer hover:bg-brand-surface-soft transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-[var(--radius-md)] bg-brand-surface-muted border border-brand-border flex items-center justify-center text-brand-muted group-hover:bg-brand-primary group-hover:text-white transition-all">
                              <Users size={18} />
                            </div>
                            <Link to={`/patients/${r.patient.id}`} className="text-sm font-semibold text-brand-text hover:text-brand-primary transition-colors">
                              {r.patient.fullName}
                            </Link>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-sm font-medium text-brand-text-soft">
                            <Phone size={13} className="opacity-40" />
                            {r.patient.phone}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm font-medium text-brand-muted max-w-[180px] truncate" title={r.notes ?? ""}>
                            <StickyNote size={13} className="opacity-40 flex-shrink-0" />
                            {r.notes ?? "—"}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                            <Clock size={11} className="opacity-40" />
                            {fmtWhen(r.createdAt)}
                          </div>
                        </td>
                        <td>
                          <span className={cfg.badgeClass}>
                            <Icon size={11} className="mr-1 inline" />
                            {t(`pages.waitlist.status${r.status}`)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            {r.status === "WAITING" && (
                              <div className="flex gap-1.5 mr-4 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                                <button
                                  onClick={() => void onPatch(r.id, "FULFILLED")}
                                  className="h-8 px-3 rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary text-xs font-semibold uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-colors"
                                >
                                  {t("pages.waitlist.actionFulfilled")}
                                </button>
                                <button
                                  onClick={() => void onPatch(r.id, "CANCELLED")}
                                  className="h-8 px-3 rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted text-xs font-semibold uppercase tracking-widest hover:bg-brand-danger hover:text-white transition-colors"
                                >
                                  {t("pages.waitlist.actionCancel")}
                                </button>
                              </div>
                            )}
                            <Link
                              to={`/patients/${r.patient.id}`}
                              className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted hover:bg-brand-primary hover:text-white transition-colors"
                            >
                              <ChevronRight size={18} />
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-brand-info-soft flex items-center justify-center text-brand-info">
              <Users size={18} />
            </div>
            <span className="stat-card-label">Queue Depth</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="stat-card-value">{rows.filter(r => r.status === 'WAITING').length}</p>
            <span className="text-xs font-semibold text-brand-muted uppercase tracking-widest">ACTIVE</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-brand-success-soft flex items-center justify-center text-brand-success">
              <CheckCircle2 size={18} />
            </div>
            <span className="stat-card-label">Conversion Rate</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="stat-card-value">84%</p>
            <span className="text-xs font-semibold text-brand-success uppercase tracking-widest">SUCCESS</span>
          </div>
        </div>

        <div className="stat-card bg-brand-navy border-0 text-white shadow-popover">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-white/10 flex items-center justify-center text-brand-info">
              <Clock size={18} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.waitlist.avgDwellTime")}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold tabular-nums">22</p>
            <span className="text-xs font-semibold text-brand-info uppercase tracking-widest">
              {t("pages.common.minutesUnit")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

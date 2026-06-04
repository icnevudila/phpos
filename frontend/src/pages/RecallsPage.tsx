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
  RefreshCw,
  Download,
  Bell,
  Check,
  Ban,
} from "lucide-react";

import { PatientAutocomplete } from "../components/appointments/PatientAutocomplete";
import { ListEmptyState } from "../components/ListEmptyState";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  fetchRecalls,
  createRecall,
  updateRecall,
  completeRecall,
  sendRecallReminder,
  type RecallDto,
  type RecallStatus,
} from "../services/recalls";
import type { PatientSearchRow } from "../types/appointment";
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";

function fmtWhen(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
  }).format(new Date(iso));
}

const STATUS_CONFIG: Record<RecallStatus, { icon: typeof Clock; badgeClass: string }> = {
  PENDING: {
    icon: Clock,
    badgeClass: "badge badge-amber",
  },
  SENT: {
    icon: Bell,
    badgeClass: "badge badge-info",
  },
  COMPLETED: {
    icon: CheckCircle2,
    badgeClass: "badge badge-teal",
  },
  CANCELLED: {
    icon: XCircle,
    badgeClass: "badge badge-slate",
  },
};

export function RecallsPage(): JSX.Element {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<RecallStatus | "ALL">("ALL");
  const [rows, setRows] = useState<RecallDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  
  // Add Recall Form State
  const [patient, setPatient] = useState<PatientSearchRow | null>(null);
  const [recallType, setRecallType] = useState("ROUTINE_CHECKUP");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  
  const [tableQInput, setTableQInput] = useState("");
  const tableQ = useDebouncedValue(tableQInput, 300);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchRecalls(statusFilter === "ALL" ? undefined : statusFilter);
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.recalls.loadFailed", { defaultValue: "Load Failed" }));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(): Promise<void> {
    if (!patient) {
      toast.error(t("pages.recalls.toastSelectPatient", { defaultValue: "Please select a patient" }));
      return;
    }
    if (!dueDate) {
      toast.error(t("pages.recalls.toastSelectDate", { defaultValue: "Please select a due date" }));
      return;
    }
    setAdding(true);
    try {
      await createRecall({
        patientId: patient.id,
        recallType,
        dueDate: new Date(dueDate).toISOString(),
        notes: notes.trim() || null,
      });
      toast.success(t("pages.recalls.toastAdded", { defaultValue: "Recall scheduled successfully!" }));
      setNotes("");
      setPatient(null);
      setDueDate("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.recalls.addFailed", { defaultValue: "Failed to add recall" }));
    } finally {
      setAdding(false);
    }
  }

  async function onComplete(id: string): Promise<void> {
    try {
      await completeRecall(id);
      toast.success(t("pages.recalls.toastCompleted", { defaultValue: "Recall marked as completed" }));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.recalls.completeFailed", { defaultValue: "Failed to complete recall" }));
    }
  }

  async function onSendReminder(id: string): Promise<void> {
    try {
      await sendRecallReminder(id);
      toast.success(t("pages.recalls.toastReminderSent", { defaultValue: "Reminder notification dispatched successfully" }));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.recalls.reminderFailed", { defaultValue: "Failed to send reminder" }));
    }
  }

  async function onCancel(id: string): Promise<void> {
    const ok = window.confirm(t("pages.recalls.confirmCancel", { defaultValue: "Are you sure you want to cancel this recall?" }));
    if (!ok) return;
    try {
      await updateRecall(id, { status: "CANCELLED" });
      toast.success(t("pages.recalls.toastCancelled", { defaultValue: "Recall cancelled" }));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.recalls.cancelFailed", { defaultValue: "Failed to cancel recall" }));
    }
  }

  const filteredRows = useMemo(() => {
    const needle = tableQ.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => {
      const name = r.patient.fullName.toLowerCase();
      const phone = (r.patient.phone ?? "").toLowerCase();
      const note = (r.notes ?? "").toLowerCase();
      const type = r.recallType.toLowerCase();
      return name.includes(needle) || phone.includes(needle) || note.includes(needle) || type.includes(needle);
    });
  }, [rows, tableQ]);

  function onExportCsv(): void {
    if (!filteredRows.length) return;
    const headers = [
      t("pages.recalls.colPatient", { defaultValue: "Patient" }),
      t("pages.recalls.colPhone", { defaultValue: "Phone" }),
      t("pages.recalls.colType", { defaultValue: "Type" }),
      t("pages.recalls.colDueDate", { defaultValue: "Due Date" }),
      t("pages.recalls.colStatus", { defaultValue: "Status" }),
      t("pages.recalls.colNotes", { defaultValue: "Notes" }),
    ];
    const body = filteredRows.map((r) => [
      r.patient.fullName,
      r.patient.phone ?? "",
      r.recallType,
      fmtWhen(r.dueDate),
      r.status,
      r.notes ?? "",
    ]);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`recalls-${statusFilter}-${stamp}.csv`, rowsToCsv(headers, body));
    toast.success(t("pages.recalls.exportReady", { count: filteredRows.length }));
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">{t("pages.recalls.title", { defaultValue: "Patient Recalls & Reminders" })}</h1>
          <p className="page-header-sub">{t("pages.recalls.subtitle", { defaultValue: "Schedule, track and send check-up reminders to patients." })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!filteredRows.length}
            onClick={onExportCsv}
            className="btn-secondary flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={15} aria-hidden />
            {t("pages.recalls.exportCsv", { defaultValue: "Export CSV" })}
          </button>
          <Link
            to="/appointments"
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar size={15} /> {t("pages.recalls.linkCalendar", { defaultValue: "Calendar" })}
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('add-recall-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> {t("pages.recalls.addNewRecall", { defaultValue: "New Recall" })}
          </button>
        </div>
      </div>

      {/* Add Entry Panel */}
      <section id="add-recall-section" className="card overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary-soft text-brand-primary">
            <UserPlus size={20} />
          </div>
          <h2 className="text-base font-bold text-brand-text">
            {t("pages.recalls.addNewRecall", { defaultValue: "Schedule New Recall" })}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 items-end">
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.recalls.patientLabel", { defaultValue: "Patient" })}
            </label>
            <PatientAutocomplete
              value={patient}
              onChange={setPatient}
              placeholder={t("pages.recalls.patientPlaceholder", { defaultValue: "Select patient..." })}
            />
          </div>
          <div className="lg:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.recalls.typeLabel", { defaultValue: "Recall Type" })}
            </label>
            <select
              className="h-10 w-full rounded-[var(--radius-md)] bg-brand-surface-soft px-3 text-sm font-medium outline-none border border-brand-border focus:ring-2 focus:ring-brand-primary transition-all"
              value={recallType}
              onChange={(e) => setRecallType(e.target.value)}
            >
              <option value="ROUTINE_CHECKUP">{t("pages.recalls.types.routine", { defaultValue: "Routine Checkup" })}</option>
              <option value="CLEANING">{t("pages.recalls.types.cleaning", { defaultValue: "Dental Cleaning" })}</option>
              <option value="FOLLOW_UP">{t("pages.recalls.types.followUp", { defaultValue: "Follow-up Treatment" })}</option>
              <option value="PROSTHESIS_MAINTENANCE">{t("pages.recalls.types.prosthesis", { defaultValue: "Prosthesis Maintenance" })}</option>
            </select>
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.recalls.dueDateLabel", { defaultValue: "Due Date" })}
            </label>
            <input
              type="date"
              className="h-10 w-full rounded-[var(--radius-md)] bg-brand-surface-soft px-3 text-sm font-medium outline-none border border-brand-border focus:ring-2 focus:ring-brand-primary transition-all"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.recalls.notesLabel", { defaultValue: "Notes" })}
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 text-brand-muted opacity-60" size={15} />
              <input
                type="text"
                className="h-10 w-full rounded-[var(--radius-md)] bg-brand-surface-soft pl-9 pr-3 text-sm font-medium outline-none border border-brand-border focus:ring-2 focus:ring-brand-primary transition-all"
                placeholder={t("pages.recalls.notesPlaceholder", { defaultValue: "Additional instructions..." })}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <button
              type="button"
              disabled={adding || !patient}
              onClick={() => void onAdd()}
              className="btn-primary flex h-10 w-full items-center justify-center gap-2 disabled:opacity-50"
            >
              {adding ? <RefreshCw className="animate-spin h-4 w-4" /> : <Plus size={16} />}
              <span className="text-xs font-semibold uppercase tracking-widest">{adding ? t("pages.recalls.saving", { defaultValue: "Saving" }) : t("pages.recalls.save", { defaultValue: "Schedule" })}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Scope + Search Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1 bg-brand-surface-soft p-1.5 rounded-[var(--radius-md)] border border-brand-border">
          {(["ALL", "PENDING", "SENT", "COMPLETED", "CANCELLED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex h-9 px-4 items-center gap-2 rounded-[var(--radius-sm)] text-xs font-semibold uppercase tracking-wider transition-colors ${ statusFilter === status ? "bg-brand-surface text-brand-primary shadow-sm border border-brand-border" : "text-brand-muted hover:text-brand-text-soft" }`}
            >
              {status === "ALL" ? t("pages.recalls.filterAll", { defaultValue: "All" }) : t(`pages.recalls.status${status}`, { defaultValue: status })}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={15} />
            <input
              type="text"
              value={tableQInput}
              onChange={(e) => setTableQInput(e.target.value)}
              placeholder={t("pages.recalls.tableSearchPlaceholder", { defaultValue: "Search recalls..." })}
              className="h-10 w-[260px] rounded-[var(--radius-md)] bg-brand-surface border border-brand-border pl-10 pr-4 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
            />
          </div>
        </div>
      </div>

      {/* Recalls Table */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                <th>{t("pages.recalls.colPatient", { defaultValue: "Patient" })}</th>
                <th>{t("pages.recalls.colPhone", { defaultValue: "Phone" })}</th>
                <th>{t("pages.recalls.colType", { defaultValue: "Type" })}</th>
                <th>{t("pages.recalls.colDueDate", { defaultValue: "Due Date" })}</th>
                <th>{t("pages.recalls.colStatus", { defaultValue: "Status" })}</th>
                <th>{t("pages.recalls.colNotes", { defaultValue: "Notes" })}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading && rows.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 rounded-[var(--radius-md)] bg-brand-primary-soft flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin text-brand-primary" />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ) : filteredRows.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={7} className="p-0">
                      <ListEmptyState
                        icon="users"
                        title={t("pages.recalls.emptyTitle", { defaultValue: "No Recalls Found" })}
                        description={t("pages.recalls.emptyHint", { defaultValue: "Schedule check-ups for patients who haven't visited in a while." })}
                        primary={{ kind: "button", onClick: () => document.getElementById("add-recall-section")?.scrollIntoView({ behavior: "smooth" }), label: t("pages.recalls.emptyCta", { defaultValue: "Schedule Recall" }) }}
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
                          <span className="text-sm font-medium text-brand-text-soft">
                            {r.patient.phone || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm font-semibold text-brand-text capitalize">
                            {r.recallType.replace(/_/g, " ").toLowerCase()}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                            <Calendar size={12} className="opacity-40" />
                            {fmtWhen(r.dueDate)}
                          </div>
                        </td>
                        <td>
                          <span className={cfg.badgeClass}>
                            <Icon size={11} className="mr-1 inline" />
                            {t(`pages.recalls.status${r.status}`, { defaultValue: r.status })}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2 text-sm font-medium text-brand-muted max-w-[180px] truncate" title={r.notes ?? ""}>
                            {r.notes ?? "—"}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            {(r.status === "PENDING" || r.status === "SENT") && (
                              <div className="flex gap-1.5 mr-4 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                                <button
                                  onClick={() => void onSendReminder(r.id)}
                                  title={t("pages.recalls.sendReminder", { defaultValue: "Send Reminder" })}
                                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-info-soft text-brand-info hover:bg-brand-info hover:text-white transition-colors"
                                >
                                  <Bell size={14} />
                                </button>
                                <button
                                  onClick={() => void onComplete(r.id)}
                                  title={t("pages.recalls.markCompleted", { defaultValue: "Mark Completed" })}
                                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => void onCancel(r.id)}
                                  title={t("pages.recalls.cancelRecall", { defaultValue: "Cancel Recall" })}
                                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted hover:bg-brand-danger hover:text-white transition-colors"
                                >
                                  <Ban size={14} />
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
    </div>
  );
}

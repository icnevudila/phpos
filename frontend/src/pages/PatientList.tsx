import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, User, Phone, Calendar, ArrowRight, Filter, ChevronLeft, ChevronRight, Hash, Download, Upload } from "lucide-react";
import { downloadCsv, rowsToCsv } from "../utils/downloadCsv";

import { ListEmptyState } from "../components/ListEmptyState";
import { PatientForm } from "../components/PatientForm";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import api from "../services/api";
import { fetchAllPatientsForExport } from "../services/patients";

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
    return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{noneLabel}</span>;
  }
  const sorted = [...memberships].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return a.providerCode.localeCompare(b.providerCode);
    return a.isPrimary ? -1 : 1;
  });
  const show = sorted.slice(0, 2);
  return (
    <div className="flex max-w-[200px] flex-wrap items-center gap-1.5">
      {show.map((m) => (
        <span
          key={m.id}
          title={m.providerName}
          className="truncate rounded-lg bg-sky-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-sky-700 dark:bg-sky-950/40 dark:text-sky-400"
        >
          {m.providerCode}
        </span>
      ))}
      {memberships.length > 2 ? (
        <span className="text-[10px] font-black text-slate-400">+{memberships.length - 2}</span>
      ) : null}
    </div>
  );
}

function formatDisplayDate(iso: string | null, empty: string): string {
  if (!iso) return empty;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return empty;
  return new Intl.DateTimeFormat("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

export function PatientList(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const empty = t("common.empty");
  const [qInput, setQInput] = useState("");
  const q = useDebouncedValue(qInput, 300);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);

  const limit = 20;

  async function onExportCsv(): Promise<void> {
    setExportBusy(true);
    try {
      const rows = await fetchAllPatientsForExport(q);
      const headers = [
        t("pages.patients.csvHeaders.name"),
        t("pages.patients.csvHeaders.birthDate"),
        t("pages.patients.csvHeaders.hmo"),
        t("pages.patients.csvHeaders.phone"),
        t("pages.patients.csvHeaders.lastVisit"),
      ];
      const body = rows.map((p) => [
        `${p.firstName} ${p.lastName}`.trim(),
        formatDisplayDate(p.birthDate, ""),
        p.hmoMemberships.map((m) => m.providerCode).join("; "),
        p.phone,
        formatDisplayDate(p.lastVisitAt, ""),
      ]);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadCsv(`patients-${stamp}.csv`, rowsToCsv(headers, body));
      toast.success(t("pages.patients.exportReady", { count: rows.length }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patients.exportFailed"));
    } finally {
      setExportBusy(false);
    }
  }

  async function onImportCsv(file: File): Promise<void> {
    setImportBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{
        data: { created: number; skipped: number; errors: Array<{ row: number; message: string }> };
      }>("/patients/import/csv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { created, skipped, errors } = res.data.data;
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success(
        t("pages.patients.importResult", { created, skipped, defaultValue: `Imported ${created}, skipped ${skipped}` }),
      );
      if (errors.length) {
        toast.message(t("pages.patients.importErrors", { count: errors.length, defaultValue: `${errors.length} row errors` }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patients.importFailed"));
    } finally {
      setImportBusy(false);
    }
  }

  const { data, isLoading: loading, error: rowsError } = useQuery({
    queryKey: ["patients", page, q],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (q.trim()) params.set("q", q.trim());
      const res = await api.get<{ data: ListPayload }>(`/patients?${params.toString()}`);
      return res.data.data;
    },
  });

  useEffect(() => {
    if (rowsError) {
      toast.error(t("pages.patients.loadFailed"));
    }
  }, [rowsError, t]);

  const totalPages = data?.totalPages ?? 1;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
      {/* Header Area */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              {t("nav.section.clinical")}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("nav.patients")}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {data?.total ?? 0} {t("pages.patients.totalCountLabel") || "patients registered"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label
            className={`inline-flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black uppercase tracking-widest text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 ${importBusy ? "pointer-events-none opacity-50" : ""}`}
          >
            <Upload size={16} />
            {t("pages.patients.importCsv", { defaultValue: "Import CSV" })}
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={importBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void onImportCsv(file);
              }}
            />
          </label>
          <button
            type="button"
            disabled={exportBusy || (data?.total ?? 0) === 0}
            onClick={() => void onExportCsv()}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black uppercase tracking-widest text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50 disabled:opacity-40 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800"
          >
            <Download size={16} />
            {exportBusy ? t("pages.patients.exporting") : t("pages.patients.exportCsv")}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-6 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/40 active:scale-95"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            {t("pages.patients.newPatient")}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t("pages.patients.searchPlaceholder")}
            value={qInput}
            onChange={(e) => {
              setQInput(e.target.value);
              setPage(1);
            }}
            className="h-12 w-full rounded-2xl border-none bg-slate-50 pl-12 pr-4 text-sm font-bold text-slate-900 transition-all focus:ring-4 focus:ring-sky-500/10 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-slate-50 px-5 text-sm font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700">
            <Filter size={16} />
            {t("common.filter") || "Filters"}
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="px-8 py-5">{t("pages.patients.colPatient")}</th>
                <th className="px-8 py-5">{t("pages.patients.colBirthDate")}</th>
                <th className="px-8 py-5">{t("pages.patients.colHmo")}</th>
                <th className="px-8 py-5">{t("pages.patients.colLastVisit")}</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <motion.tbody
                key={page + q}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-50 dark:divide-slate-800"
              >
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-8">
                        <div className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20">
                      <ListEmptyState
                        icon="users"
                        title={t("pages.patients.emptyTitle")}
                        description={t("pages.patients.emptyHint")}
                      />
                    </td>
                  </tr>
                ) : (
                  data?.data.map((p) => (
                    <motion.tr
                      key={p.id}
                      variants={itemVariants}
                      onClick={() => navigate(`/patients/${p.id}`)}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-transform group-hover:scale-110 dark:bg-sky-950/40 dark:text-sky-400">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-black tracking-tight text-slate-900 dark:text-white">
                              {p.lastName}, {p.firstName}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                              <span className="flex items-center gap-1 font-mono uppercase tracking-widest">
                                <Hash size={10} />
                                {p.id.slice(-8)}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="flex items-center gap-1">
                                <Phone size={10} />
                                {p.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                          <Calendar size={14} className="text-slate-400" />
                          {formatDisplayDate(p.birthDate, empty)}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <PatientHmoBadges memberships={p.hmoMemberships} noneLabel={empty} />
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                          {formatDisplayDate(p.lastVisitAt, empty)}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 opacity-0 transition-all group-hover:opacity-100 dark:bg-slate-800">
                            <ArrowRight size={18} />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-8 py-6 dark:border-slate-800 dark:bg-slate-800/50">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("pages.patients.pagination", {
              page,
              totalPages,
              total: data?.total ?? 0,
            })}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-30 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <PatientForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["patients"] });
        }}
      />
    </div>
  );
}

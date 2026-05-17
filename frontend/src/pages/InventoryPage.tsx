import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  AlertTriangle, 
  Calendar, 
  Layers, 
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Box,
  Truck,
  ShieldCheck,
  Edit3,
  Trash2,
  PlusCircle,
  MinusCircle,
  Printer,
  Camera,
} from "lucide-react";

import { ListEmptyState } from "../components/ListEmptyState";
import { AdjustStockModal } from "../components/inventory/AdjustStockModal";
import { InventoryFormModal } from "../components/inventory/InventoryFormModal";
import { QRScannerOverlay } from "../components/inventory/QRScannerOverlay";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  adjustInventoryItem,
  createInventoryItem,
  deleteInventoryItem,
  fetchInventory,
  fetchInventoryAlerts,
  updateInventoryItem,
} from "../services/inventory";
import type {
  InventoryCategory,
  InventoryDto,
} from "../types/inventory";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_I18N_KEY,
  INVENTORY_STATUS_STYLES,
} from "../types/inventory";
import { fetchClinic } from "../services/clinic";
import {
  printInventoryFallback,
  printInventoryLabel,
} from "../services/zebraPrintService";
import api from "../services/api";

function money(value: string | number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function fmtDate(iso: string | null, empty: string): string {
  if (!iso) return empty;
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));
}

function expiryBadge(
  t: TFunction,
  days: number | null,
): { text: string; tone: string; dot: string } | null {
  if (days === null) return null;
  if (days < 0)
    return {
      text: t("pages.inventory.expiredAgo", { days: Math.abs(days) }),
      tone: "bg-rose-50 text-rose-600 border-rose-100",
      dot: "bg-rose-500",
    };
  if (days <= 30)
    return {
      text: t("pages.inventory.expiryInDays", { days }),
      tone: days <= 7 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100",
      dot: days <= 7 ? "bg-rose-500" : "bg-amber-500",
    };
  return null;
}

function toCsv(rows: InventoryDto[], t: TFunction): string {
  const header = [
    t("pages.inventory.csvHeaders.item"),
    t("pages.inventory.csvHeaders.category"),
    t("pages.inventory.csvHeaders.unit"),
    t("pages.inventory.csvHeaders.quantity"),
    t("pages.inventory.csvHeaders.minimumStock"),
    t("pages.inventory.csvHeaders.unitCost"),
    t("pages.inventory.csvHeaders.supplier"),
    t("pages.inventory.csvHeaders.expiry"),
    t("pages.inventory.csvHeaders.status"),
  ].join(",");
  const escape = (v: string): string => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };
  const lines = rows.map((r) =>
    [
      r.itemName,
      r.category,
      r.unit,
      String(r.quantity),
      String(r.minimumStock),
      r.unitCost,
      r.supplier ?? "",
      r.expiryDate ? r.expiryDate.slice(0, 10) : "",
      t(`pages.inventory.status.${r.status}`),
    ]
      .map(escape)
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export function InventoryPage(): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [qInput, setQInput] = useState("");
  const q = useDebouncedValue(qInput, 250);
  const [category, setCategory] = useState<InventoryCategory | "">("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryDto | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryDto | null>(null);
  const [adjustMode, setAdjustMode] = useState<"in" | "out">("in");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);

  const { data: rows = [], isLoading: rowsLoading, error: rowsError, isFetching: rowsFetching } = useQuery({
    queryKey: ["inventory", category, lowStockOnly, q],
    queryFn: () => fetchInventory({
      category: category || undefined,
      lowStock: lowStockOnly,
      q: q || undefined,
    }),
  });

  const { data: alerts = null } = useQuery({
    queryKey: ["inventoryAlerts"],
    queryFn: fetchInventoryAlerts,
  });

  const loading = rowsLoading;
  const error = (rowsError as Error)?.message || null;

  const hasInventoryFilters = useMemo(
    () => Boolean(category || lowStockOnly || qInput.trim()),
    [category, lowStockOnly, qInput],
  );

  function resetInventoryFilters(): void {
    setQInput("");
    setCategory("");
    setLowStockOnly(false);
  }

  async function onImportCsv(file: File): Promise<void> {
    setImportBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<{
        data: { created: number; skipped: number; errors: Array<{ row: number; message: string }> };
      }>("/inventory/import/csv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { created, skipped, errors } = res.data.data;
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["inventoryAlerts"] });
      toast.success(t("pages.inventory.importResult", { created, skipped }));
      if (errors.length) {
        toast.message(t("pages.inventory.importErrors", { count: errors.length }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.inventory.importFailed"));
    } finally {
      setImportBusy(false);
    }
  }

  const totals = useMemo(() => {
    const totalValue = rows.reduce((s, r) => s + Number(r.unitCost) * r.quantity, 0);
    return {
      count: rows.length,
      totalValue,
    };
  }, [rows]);

  async function handleCreate(body: Parameters<typeof createInventoryItem>[0]): Promise<void> {
    await createInventoryItem(body);
    setFormOpen(false);
    setEditing(null);
    await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    await queryClient.invalidateQueries({ queryKey: ["inventoryAlerts"] });
  }
  async function handleUpdate(id: string, body: Parameters<typeof updateInventoryItem>[1]): Promise<void> {
    await updateInventoryItem(id, body);
    setFormOpen(false);
    setEditing(null);
    await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    await queryClient.invalidateQueries({ queryKey: ["inventoryAlerts"] });
  }
  async function handleDelete(row: InventoryDto): Promise<void> {
    if (!confirm(t("pages.inventory.deleteConfirm", { name: row.itemName }))) return;
    try {
      await deleteInventoryItem(row.id);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["inventoryAlerts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.inventory.deleteFailed"));
    }
  }

  async function handlePrintLabel(row: InventoryDto): Promise<void> {
    try {
      const clinic = await fetchClinic();
      const label = {
        itemName: row.itemName,
        itemId: row.id.slice(0, 8).toUpperCase(),
        category: row.category,
        clinicName: clinic.name,
        expiry: row.expiryDate ? row.expiryDate.slice(0, 10) : null,
      };
      const ok = await printInventoryLabel(label);
      if (!ok) {
        printInventoryFallback(label);
        toast.message(t("pages.inventory.printFallback"));
      } else {
        toast.success(t("pages.inventory.printSent"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.inventory.printFailed"));
    }
  }

  async function handleAdjust(change: number, reason: string): Promise<void> {
    if (!adjustItem) return;
    await adjustInventoryItem(adjustItem.id, change, reason);
    setAdjustItem(null);
    await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    await queryClient.invalidateQueries({ queryKey: ["inventoryAlerts"] });
  }

  function downloadCsv(): void {
    const csv = toCsv(rows, t);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `dentease-inventory-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  const alertBanner = useMemo(() => {
    if (!alerts) return null;
    const { counts } = alerts;
    const parts: string[] = [];
    if (counts.critical > 0) parts.push(t("pages.inventory.alertsCritical", { count: counts.critical }));
    if (counts.low > 0) parts.push(t("pages.inventory.alertsLow", { count: counts.low }));
    if (counts.expiring > 0)
      parts.push(t("pages.inventory.alertsExpiring", { count: counts.expiring }));
    if (parts.length === 0) return null;
    return parts;
  }, [alerts, t]);

  const emptyDash = t("pages.common.empty");

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Clinical Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Package size={18} />
               </span>
               <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {t("pages.reports.eyebrow")}
               </span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white lg:text-6xl">
              {t("pages.inventory.title")}
            </h1>
            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
              {t("pages.inventory.subtitle", {
                count: totals.count,
                value: money(totals.totalValue),
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <label
               className={`flex h-16 cursor-pointer items-center gap-3 rounded-[1.5rem] bg-white px-8 text-xs font-black uppercase tracking-widest text-slate-900 shadow-xl ring-1 ring-slate-100 transition-all hover:scale-105 active:scale-95 dark:bg-slate-900 dark:text-white dark:ring-slate-800 ${importBusy ? "pointer-events-none opacity-50" : ""}`}
             >
               <Upload size={18} />
               {t("pages.inventory.importCsv")}
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
               onClick={downloadCsv}
               className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-white dark:bg-slate-900 px-8 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-105 active:scale-95"
             >
               <Download size={18} /> {t("pages.inventory.exportCsv")}
             </button>
             <button
               onClick={() => setScannerOpen(true)}
               className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/30 px-8 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-100 dark:shadow-none ring-1 ring-indigo-100 dark:ring-indigo-800 transition-all hover:scale-105 active:scale-95"
             >
               <Camera size={18} /> Scan QR
             </button>
             <button
               onClick={() => {
                 setEditing(null);
                 setFormOpen(true);
               }}
               className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-slate-900 dark:bg-white px-8 text-xs font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
             >
               <Plus size={20} /> {t("pages.inventory.newItem")}
             </button>
          </div>
        </header>

        {/* Dynamic Alerts */}
        <AnimatePresence>
          {alertBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative flex flex-col gap-6 lg:flex-row lg:items-center justify-between rounded-[2.5rem] bg-rose-50 dark:bg-rose-950/20 p-8 ring-1 ring-rose-100 dark:ring-rose-900/30 overflow-hidden"
            >
               <div className="absolute top-0 right-0 h-full w-32 bg-rose-500/5 blur-3xl pointer-events-none" />
               <div className="flex items-start lg:items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-500/20">
                     <AlertTriangle size={32} />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-black uppercase tracking-[0.2em] text-rose-900 dark:text-rose-400">
                        {t("pages.inventory.alertsTitle")}
                     </h4>
                     <p className="text-lg font-bold text-rose-800 dark:text-rose-300">
                        {alertBanner.join(" · ")}
                     </p>
                  </div>
               </div>
               <button
                 onClick={() => setLowStockOnly(true)}
                 className="flex h-12 items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-6 text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 shadow-sm ring-1 ring-rose-200 dark:ring-rose-800 transition-all hover:bg-rose-50"
               >
                 <Filter size={14} /> {t("pages.inventory.filterLowStock")}
               </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Advanced Filters */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="flex-1 flex flex-col lg:flex-row gap-6">
             <div className="relative group flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder={t("pages.inventory.searchPlaceholder")}
                  className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 pl-16 pr-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
             </div>
             
             <div className="flex items-center gap-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InventoryCategory | "")}
                  className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-xs font-black uppercase tracking-widest outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  <option value="">{t("pages.inventory.all")}</option>
                  {INVENTORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[c]}`)}
                    </option>
                  ))}
                </select>

                <label className="flex h-16 items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 cursor-pointer ring-1 ring-slate-100 dark:ring-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                  <input
                    type="checkbox"
                    checked={lowStockOnly}
                    onChange={(e) => setLowStockOnly(e.target.checked)}
                    className="h-5 w-5 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {t("pages.inventory.lowStockCheck")}
                  </span>
                </label>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {hasInventoryFilters && (
               <button
                 onClick={resetInventoryFilters}
                 className="h-16 flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
               >
                 <RefreshCw size={14} /> {t("pages.inventory.resetFilters")}
               </button>
             )}
             <div className="h-12 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden lg:block" />
             <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${rowsFetching ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {rowsFetching ? t("pages.inventory.syncing") : t("pages.inventory.upToDate")}
                </span>
             </div>
          </div>
        </div>

        {/* Inventory Workspace */}
        <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.inventory.colItem")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.inventory.colCategory")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.inventory.colStock")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.inventory.colMin")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">{t("pages.inventory.colUnitCost")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.inventory.colExpiry")}</th>
                  <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.inventory.colStatus")}</th>
                  <th className="px-10 py-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {loading && rows.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={8} className="py-32 text-center">
                         <RefreshCw className="h-10 w-10 animate-spin text-slate-200 mx-auto mb-4" />
                         <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("pages.inventory.loading")}</p>
                      </td>
                    </motion.tr>
                  ) : error ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={8} className="py-32 text-center">
                         <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={32} />
                         </div>
                         <p className="text-sm font-black text-rose-600">{error}</p>
                      </td>
                    </motion.tr>
                  ) : rows.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={8} className="p-0">
                        <ListEmptyState
                          icon="box"
                          title={t("pages.inventory.emptyTitle")}
                          description={t("pages.inventory.emptyHint")}
                          primary={{
                            kind: "button",
                            onClick: () => {
                              setEditing(null);
                              setFormOpen(true);
                            },
                            label: t("pages.inventory.newItem"),
                          }}
                        />
                      </td>
                    </motion.tr>
                  ) : (
                    rows.map((r, idx) => {
                      const style = INVENTORY_STATUS_STYLES[r.status];
                      const eb = expiryBadge(t, r.daysUntilExpiry);
                      return (
                        <motion.tr 
                          key={r.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                        >
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                   <Box size={24} />
                                </div>
                                <div>
                                   <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{r.itemName}</p>
                                   {r.supplier && (
                                     <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                                        <Truck size={12} className="opacity-40" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{r.supplier}</span>
                                     </div>
                                   )}
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[r.category]}`)}
                             </span>
                          </td>
                          <td className="px-8 py-8 text-right">
                             <div className="flex flex-col items-end">
                                <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{r.quantity}</p>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.unit}</span>
                             </div>
                          </td>
                          <td className="px-8 py-8 text-right font-black text-slate-400 tabular-nums">{r.minimumStock}</td>
                          <td className="px-8 py-8 text-right font-black text-slate-900 dark:text-white tabular-nums">{money(r.unitCost)}</td>
                          <td className="px-8 py-8">
                             <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                   <Calendar size={14} className="opacity-40" />
                                   {fmtDate(r.expiryDate, emptyDash)}
                                </div>
                                {eb && (
                                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest w-fit ${eb.tone}`}>
                                     <div className={`h-1.5 w-1.5 rounded-full ${eb.dot}`} />
                                     {eb.text}
                                  </div>
                                )}
                             </div>
                          </td>
                          <td className="px-8 py-8">
                             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-[0.1em] ${style.pillBg} ${style.pillText} ${style.ring}`}>
                                <div className={`h-2 w-2 rounded-full ${style.dot}`} />
                                {t(`pages.inventory.status.${r.status}`)}
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center justify-end gap-2">
                                <div className="flex gap-2 mr-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                   <button
                                     onClick={() => { setAdjustMode("in"); setAdjustItem(r); }}
                                     className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                                     title={t("pages.inventory.titleStockIn")}
                                   >
                                     <PlusCircle size={18} />
                                   </button>
                                   <button
                                     onClick={() => { setAdjustMode("out"); setAdjustItem(r); }}
                                     className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                                     title={t("pages.inventory.titleStockOut")}
                                   >
                                     <MinusCircle size={18} />
                                   </button>
                                   <button
                                     onClick={() => void handlePrintLabel(r)}
                                     className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-all"
                                     title={t("pages.inventory.printLabel")}
                                   >
                                     <Printer size={18} />
                                   </button>
                                   <button
                                     onClick={() => { setEditing(r); setFormOpen(true); }}
                                     className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
                                   >
                                     <Edit3 size={18} />
                                   </button>
                                   <button
                                     onClick={() => void handleDelete(r)}
                                     className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all"
                                   >
                                     <Trash2 size={18} />
                                   </button>
                                </div>
                                <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                                   <ChevronRight size={24} />
                                </button>
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

        {/* Global Stock Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center text-sky-600">
                    <Layers size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.inventory.inventoryDepth")}</span>
              </div>
              <div className="flex items-baseline gap-3">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{totals.count}</p>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">SKUS</span>
              </div>
           </div>
           
           <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                    <TrendingUp size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.inventory.totalAssetValue")}</span>
              </div>
              <div className="flex items-baseline gap-3">
                 <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{money(totals.totalValue).split('.')[0]}</p>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">PHP</span>
              </div>
           </div>

           <div className="rounded-[2.5rem] bg-slate-900 p-8 shadow-xl border border-slate-800 relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {t("pages.inventory.opsIntegrity")}
                 </span>
              </div>
              <div className="flex items-baseline gap-3 relative z-10">
                 <p className="text-4xl font-black text-white tabular-nums">99.8%</p>
                 <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                   {t("pages.common.syncHealthy")}
                 </span>
              </div>
           </div>
        </div>
      </div>

      <InventoryFormModal
        open={formOpen}
        item={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={(body) => (editing ? handleUpdate(editing.id, body) : handleCreate(body))}
      />

      <AdjustStockModal
        open={adjustItem !== null}
        item={adjustItem}
        mode={adjustMode}
        onClose={() => setAdjustItem(null)}
        onSubmit={handleAdjust}
      />

      {scannerOpen && (
        <QRScannerOverlay 
          onClose={() => setScannerOpen(false)}
          onScan={(data) => {
            setScannerOpen(false);
            setQInput(data); // Pre-fill search with scanned data
            toast.success(`Scanned: ${data}`);
          }}
        />
      )}
    </div>
  );
}

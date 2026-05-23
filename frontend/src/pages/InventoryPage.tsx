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
  const [expiringSoonOnly, setExpiringSoonOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryDto | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryDto | null>(null);
  const [adjustMode, setAdjustMode] = useState<"in" | "out">("in");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);

  const { data: rawRows = [], isLoading: rowsLoading, error: rowsError, isFetching: rowsFetching } = useQuery({
    queryKey: ["inventory", category, lowStockOnly, q],
    queryFn: () => fetchInventory({
      category: category || undefined,
      lowStock: lowStockOnly,
      q: q || undefined,
    }),
  });

  const rows = useMemo(() => {
    if (!expiringSoonOnly) return rawRows;
    return rawRows.filter(r => r.daysUntilExpiry !== null && r.daysUntilExpiry <= 30);
  }, [rawRows, expiringSoonOnly]);

  const { data: alerts = null } = useQuery({
    queryKey: ["inventoryAlerts"],
    queryFn: fetchInventoryAlerts,
  });

  const loading = rowsLoading;
  const error = (rowsError as Error)?.message || null;

  const hasInventoryFilters = useMemo(
    () => Boolean(category || lowStockOnly || expiringSoonOnly || qInput.trim()),
    [category, lowStockOnly, expiringSoonOnly, qInput],
  );

  function resetInventoryFilters(): void {
    setQInput("");
    setCategory("");
    setLowStockOnly(false);
    setExpiringSoonOnly(false);
  }

  async function onImportCsv(file: File): Promise<void> {
    setImportBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post<any, {
        data: { created: number; skipped: number; errors: Array<{ row: number; message: string }> };
      }>("/inventory/import/csv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { created, skipped, errors } = res.data;
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
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Package size={15} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t("pages.reports.eyebrow")}
            </span>
          </div>
          <h1 className="page-header-title">{t("pages.inventory.title")}</h1>
          <p className="page-header-sub">
            {t("pages.inventory.subtitle", {
              count: totals.count,
              value: money(totals.totalValue),
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`btn-secondary inline-flex items-center gap-2 cursor-pointer ${importBusy ? "pointer-events-none opacity-50" : ""}`}
          >
            <Upload size={15} />
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
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={15} /> {t("pages.inventory.exportCsv")}
          </button>
          <button
            onClick={() => setScannerOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Camera size={15} /> Scan QR
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> {t("pages.inventory.newItem")}
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm">
                <AlertTriangle size={16} />
              </div>
              <p className="text-sm font-semibold text-rose-800">
                {alertBanner.join(" · ")}
              </p>
            </div>
            <button
              onClick={() => setLowStockOnly(true)}
              className="flex h-8 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold uppercase tracking-widest text-rose-600 shadow-sm ring-1 ring-rose-200 transition-all hover:bg-rose-50"
            >
              <Filter size={13} /> {t("pages.inventory.filterLowStock")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="card flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
        <div className="flex-1 flex flex-col lg:flex-row gap-3">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
            <input
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t("pages.inventory.searchPlaceholder")}
              className="h-11 w-full rounded-xl bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryCategory | "")}
              className="h-11 rounded-xl bg-slate-50 px-4 text-xs font-semibold uppercase tracking-widest outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
            >
              <option value="">{t("pages.inventory.all")}</option>
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[c]}`)}
                </option>
              ))}
            </select>
            <label className="flex h-11 items-center gap-3 rounded-xl bg-slate-50 px-4 cursor-pointer ring-1 ring-slate-100 hover:bg-slate-100 transition-all">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t("pages.inventory.lowStockCheck")}
              </span>
            </label>
            <label className="flex h-11 items-center gap-3 rounded-xl bg-slate-50 px-4 cursor-pointer ring-1 ring-slate-100 hover:bg-slate-100 transition-all">
              <input
                type="checkbox"
                checked={expiringSoonOnly}
                onChange={(e) => setExpiringSoonOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {t("pages.inventory.expiringSoonCheck", "Expiring Soon")}
              </span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasInventoryFilters && (
            <button
              onClick={resetInventoryFilters}
              className="btn-secondary flex items-center gap-2 text-rose-500"
            >
              <RefreshCw size={13} /> {t("pages.inventory.resetFilters")}
            </button>
          )}
          <div className="h-10 w-px bg-slate-100 mx-1 hidden lg:block" />
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${rowsFetching ? 'bg-teal-500 animate-pulse' : 'bg-slate-200'}`} />
            <span className="text-xs font-medium text-slate-400">
              {rowsFetching ? t("pages.inventory.syncing") : t("pages.inventory.upToDate")}
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[1100px]">
            <thead>
              <tr>
                <th>{t("pages.inventory.colItem")}</th>
                <th>{t("pages.inventory.colCategory")}</th>
                <th className="text-right">{t("pages.inventory.colStock")}</th>
                <th className="text-right">{t("pages.inventory.colMin")}</th>
                <th className="text-right">{t("pages.inventory.colUnitCost")}</th>
                <th>{t("pages.inventory.colExpiry")}</th>
                <th>{t("pages.inventory.colStatus")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading && rows.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ) : error ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                          <AlertTriangle className="h-6 w-6 text-rose-400" />
                        </div>
                        <p className="text-sm font-medium text-rose-600">{error}</p>
                      </div>
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
                    const isCritical = r.status === "CRITICAL";
                    
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`group hover:bg-teal-50/30 transition-colors ${isCritical ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-transparent"}`}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                              <Box size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 leading-tight">{r.itemName}</p>
                              {r.supplier && (
                                <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                                  <Truck size={10} className="opacity-40" />
                                  <span className="text-[10px] font-medium uppercase tracking-widest">{r.supplier}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[r.category]}`)}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex flex-col items-end">
                            <p className="text-lg font-bold text-slate-800 tabular-nums">{r.quantity}</p>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{r.unit}</span>
                          </div>
                        </td>
                        <td className="text-right font-semibold text-slate-400 tabular-nums">{r.minimumStock}</td>
                        <td className="text-right font-semibold text-slate-800 tabular-nums">{money(r.unitCost)}</td>
                        <td>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                              <Calendar size={13} className="opacity-40" />
                              {fmtDate(r.expiryDate, emptyDash)}
                            </div>
                            {eb && (
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-widest w-fit ${eb.tone}`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${eb.dot}`} />
                                {eb.text}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-semibold uppercase tracking-wider ${style.pillBg} ${style.pillText} ${style.ring}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                            {t(`pages.inventory.status.${r.status}`)}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="flex gap-1.5 mr-4 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                              <button
                                onClick={() => { setAdjustMode("in"); setAdjustItem(r); }}
                                className="h-9 w-9 flex items-center justify-center rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white transition-all"
                                title={t("pages.inventory.titleStockIn")}
                              >
                                <PlusCircle size={16} />
                              </button>
                              <button
                                onClick={() => { setAdjustMode("out"); setAdjustItem(r); }}
                                className="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                title={t("pages.inventory.titleStockOut")}
                              >
                                <MinusCircle size={16} />
                              </button>
                              <button
                                onClick={() => void handlePrintLabel(r)}
                                className="h-9 w-9 flex items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white transition-all"
                                title={t("pages.inventory.printLabel")}
                              >
                                <Printer size={16} />
                              </button>
                              <button
                                onClick={() => { setEditing(r); setFormOpen(true); }}
                                className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white transition-all"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => void handleDelete(r)}
                                className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-teal-500 hover:text-white transition-all">
                              <ChevronRight size={18} />
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

      {/* Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Layers size={18} />
            </div>
            <span className="stat-card-label">{t("pages.inventory.inventoryDepth")}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800 tabular-nums">{totals.count}</p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">SKUS</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
              <TrendingUp size={18} />
            </div>
            <span className="stat-card-label">{t("pages.inventory.totalAssetValue")}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-800 tabular-nums">{money(totals.totalValue).split('.')[0]}</p>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">PHP</span>
          </div>
        </div>

        <div className="stat-card bg-slate-800 ring-0 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {t("pages.inventory.opsIntegrity")}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white tabular-nums">99.8%</p>
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
              {t("pages.common.syncHealthy")}
            </span>
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

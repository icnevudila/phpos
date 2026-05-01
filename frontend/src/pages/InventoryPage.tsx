import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { ListEmptyState } from "../components/ListEmptyState";
import { AdjustStockModal } from "../components/inventory/AdjustStockModal";
import { InventoryFormModal } from "../components/inventory/InventoryFormModal";
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
  InventoryAlerts,
  InventoryCategory,
  InventoryDto,
} from "../types/inventory";
import {
  INVENTORY_CATEGORIES,
  INVENTORY_CATEGORY_I18N_KEY,
  INVENTORY_STATUS_STYLES,
} from "../types/inventory";

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

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
): { text: string; tone: string } | null {
  if (days === null) return null;
  if (days < 0)
    return {
      text: t("pages.inventory.expiredAgo", { days: Math.abs(days) }),
      tone: "bg-rose-100 text-rose-700",
    };
  if (days <= 30)
    return {
      text: t("pages.inventory.expiryInDays", { days }),
      tone: days <= 7 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800",
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
  const [rows, setRows] = useState<InventoryDto[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const q = useDebouncedValue(qInput, 250);
  const [category, setCategory] = useState<InventoryCategory | "">("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryDto | null>(null);
  const [adjustItem, setAdjustItem] = useState<InventoryDto | null>(null);
  const [adjustMode, setAdjustMode] = useState<"in" | "out">("in");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [items, alertsData] = await Promise.all([
        fetchInventory({
          category: category || undefined,
          lowStock: lowStockOnly,
          q: q || undefined,
        }),
        fetchInventoryAlerts(),
      ]);
      setRows(items);
      setAlerts(alertsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.inventory.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [category, lowStockOnly, q, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasInventoryFilters = useMemo(
    () => Boolean(category || lowStockOnly || qInput.trim()),
    [category, lowStockOnly, qInput],
  );

  function resetInventoryFilters(): void {
    setQInput("");
    setCategory("");
    setLowStockOnly(false);
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
    await load();
  }
  async function handleUpdate(id: string, body: Parameters<typeof updateInventoryItem>[1]): Promise<void> {
    await updateInventoryItem(id, body);
    setFormOpen(false);
    setEditing(null);
    await load();
  }
  async function handleDelete(row: InventoryDto): Promise<void> {
    if (!confirm(t("pages.inventory.deleteConfirm", { name: row.itemName }))) return;
    try {
      await deleteInventoryItem(row.id);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.inventory.deleteFailed"));
    }
  }
  async function handleAdjust(change: number, reason: string): Promise<void> {
    if (!adjustItem) return;
    await adjustInventoryItem(adjustItem.id, change, reason);
    setAdjustItem(null);
    await load();
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
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("pages.inventory.title")}</h1>
          <p className="text-xs text-slate-500">
            {t("pages.inventory.subtitle", {
              count: totals.count,
              value: money(totals.totalValue),
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadCsv}
            className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${fieldFocus}`}
          >
            {t("pages.inventory.exportCsv")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className={`rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 px-4 py-2 text-sm font-bold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950`}
          >
            {t("pages.inventory.newItem")}
          </button>
        </div>
      </div>

      <div>
        {alertBanner ? (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 2 1 21h22L12 2Zm0 5.3L19 19H5l7-11.7ZM11 14v3h2v-3h-2Zm0-5v4h2V9h-2Z" />
              </svg>
            </div>
            <div className="flex-1 text-sm text-amber-900">
              <p className="font-bold">{t("pages.inventory.alertsTitle")}</p>
              <p>{alertBanner.join(" · ")}</p>
            </div>
            <button
              type="button"
              onClick={() => setLowStockOnly(true)}
              className="self-center rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              {t("pages.inventory.filterLowStock")}
            </button>
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.inventory.searchLabel")}
            </label>
            <input
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t("pages.inventory.searchPlaceholder")}
              className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm ${fieldFocus}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {t("pages.inventory.categoryLabel")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryCategory | "")}
              className={`rounded-lg border border-slate-300 px-3 py-2 text-sm ${fieldFocus}`}
            >
              <option value="">{t("pages.inventory.all")}</option>
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[c]}`)}
                </option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600"
            />
            {t("pages.inventory.lowStockCheck")}
          </label>
          {hasInventoryFilters ? (
            <button
              type="button"
              onClick={resetInventoryFilters}
              className={`min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 ${fieldFocus}`}
            >
              {t("pages.inventory.resetFilters")}
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("pages.inventory.searchHint")}</p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">{t("pages.inventory.colItem")}</th>
                <th className="px-4 py-3">{t("pages.inventory.colCategory")}</th>
                <th className="px-4 py-3 text-right">{t("pages.inventory.colStock")}</th>
                <th className="px-4 py-3 text-right">{t("pages.inventory.colMin")}</th>
                <th className="px-4 py-3 text-right">{t("pages.inventory.colUnitCost")}</th>
                <th className="px-4 py-3">{t("pages.inventory.colExpiry")}</th>
                <th className="px-4 py-3">{t("pages.inventory.colStatus")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                    {t("pages.inventory.loading")}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-rose-700">
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-0 align-top">
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
                </tr>
              ) : (
                rows.map((r) => {
                  const style = INVENTORY_STATUS_STYLES[r.status];
                  const eb = expiryBadge(t, r.daysUntilExpiry);
                  return (
                    <tr key={r.id} className="border-b border-slate-100 align-middle">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{r.itemName}</div>
                        {r.supplier ? (
                          <div className="text-xs text-slate-500">{r.supplier}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[r.category]}`)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {r.quantity}
                        <span className="ml-1 text-[10px] font-semibold text-slate-500">
                          {r.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{r.minimumStock}</td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {money(r.unitCost)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-700">{fmtDate(r.expiryDate, emptyDash)}</div>
                        {eb ? (
                          <span
                            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${eb.tone}`}
                          >
                            {eb.text}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${style.pillBg} ${style.pillText} ${style.ring}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                          {t(`pages.inventory.status.${r.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustMode("in");
                              setAdjustItem(r);
                            }}
                            className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                            title={t("pages.inventory.titleStockIn")}
                            aria-label={t("pages.inventory.titleStockIn")}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustMode("out");
                              setAdjustItem(r);
                            }}
                            className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                            title={t("pages.inventory.titleStockOut")}
                            aria-label={t("pages.inventory.titleStockOut")}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(r);
                              setFormOpen(true);
                            }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            {t("pages.inventory.edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(r)}
                            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                            aria-label={t("common.delete")}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
    </div>
  );
}

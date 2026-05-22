import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { InventoryCategory, InventoryDto } from "../../types/inventory";
import { INVENTORY_CATEGORIES, INVENTORY_CATEGORY_I18N_KEY } from "../../types/inventory";

interface FormState {
  itemName: string;
  category: InventoryCategory;
  unit: string;
  quantity: string;
  minimumStock: string;
  unitCost: string;
  supplier: string;
  expiryDate: string;
}

const empty: FormState = {
  itemName: "",
  category: "Disposables",
  unit: "pc",
  quantity: "0",
  minimumStock: "0",
  unitCost: "0",
  supplier: "",
  expiryDate: "",
};

interface Props {
  open: boolean;
  item: InventoryDto | null;
  onClose: () => void;
  onSubmit: (body: {
    itemName: string;
    category: InventoryCategory;
    unit: string;
    quantity: number;
    minimumStock: number;
    unitCost: number;
    supplier?: string | null;
    expiryDate?: string | null;
  }) => Promise<void>;
}

export function InventoryFormModal({ open, item, onClose, onSubmit }: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        itemName: item.itemName,
        category: item.category,
        unit: item.unit,
        quantity: String(item.quantity),
        minimumStock: String(item.minimumStock),
        unitCost: item.unitCost,
        supplier: item.supplier ?? "",
        expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
      });
    } else {
      setForm(empty);
    }
    setError(null);
  }, [open, item]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!form.itemName.trim()) {
      setError(t("pages.inventory.form.itemNameRequired"));
      return;
    }
    setBusy(true);
    try {
      await onSubmit({
        itemName: form.itemName.trim(),
        category: form.category,
        unit: form.unit.trim() || "pc",
        quantity: Math.max(0, Math.floor(Number(form.quantity) || 0)),
        minimumStock: Math.max(0, Math.floor(Number(form.minimumStock) || 0)),
        unitCost: Math.max(0, Number(form.unitCost) || 0),
        supplier: form.supplier.trim() || null,
        expiryDate: form.expiryDate ? `${form.expiryDate}T00:00:00.000Z` : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.inventory.form.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {item ? t("pages.inventory.form.titleEdit") : t("pages.inventory.form.titleNew")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 px-6 py-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("pages.inventory.form.itemName")}
            </span>
            <input
              type="text"
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.category")}
              </span>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as InventoryCategory })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`pages.inventory.categories.${INVENTORY_CATEGORY_I18N_KEY[c]}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.unit")}
              </span>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder={t("pages.inventory.form.unitPlaceholder")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.quantity")}
              </span>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.minStock")}
              </span>
              <input
                type="number"
                min="0"
                value={form.minimumStock}
                onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.unitCost")}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.supplier")}
              </span>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.inventory.form.expiry")}
              </span>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {t("pages.inventory.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-gradient-to-br from-teal-500 to-sky-500 px-5 py-2 text-sm font-bold text-white shadow disabled:opacity-60"
            >
              {busy
                ? t("pages.inventory.form.saving")
                : item
                  ? t("pages.inventory.form.saveChanges")
                  : t("pages.inventory.form.createItem")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

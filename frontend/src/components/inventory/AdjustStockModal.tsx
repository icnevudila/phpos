import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { InventoryDto } from "../../types/inventory";

interface Props {
  open: boolean;
  item: InventoryDto | null;
  mode: "in" | "out";
  onClose: () => void;
  onSubmit: (change: number, reason: string) => Promise<void>;
}

export function AdjustStockModal({ open, item, mode, onClose, onSubmit }: Props): JSX.Element | null {
  const { t } = useTranslation();
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIn = mode === "in";

  useEffect(() => {
    if (!open) return;
    setQty("1");
    const list = t(
      isIn ? "pages.inventory.adjust.reasonsIn" : "pages.inventory.adjust.reasonsOut",
      { returnObjects: true },
    ) as string[];
    setReason(list[0] ?? "");
    setError(null);
  }, [open, mode, isIn, t]);

  if (!open || !item) return null;

  const amount = Math.max(1, Math.floor(Number(qty) || 0));
  const change = mode === "in" ? amount : -amount;
  const nextQty = item.quantity + change;

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!item) return;
    setError(null);
    if (mode === "out" && nextQty < 0) {
      setError(t("pages.inventory.adjust.overAvailable", { count: item.quantity, unit: item.unit }));
      return;
    }
    setBusy(true);
    try {
      await onSubmit(change, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.inventory.adjust.failed"));
    } finally {
      setBusy(false);
    }
  }

  const palette = isIn
    ? "from-emerald-500 to-sky-500"
    : "from-rose-500 to-amber-500";

  const reasonOptions = t(
    isIn ? "pages.inventory.adjust.reasonsIn" : "pages.inventory.adjust.reasonsOut",
    { returnObjects: true },
  ) as string[];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {isIn ? t("pages.inventory.adjust.titleIn") : t("pages.inventory.adjust.titleOut")}
            </p>
            <h2 className="text-base font-bold text-slate-900">{item.itemName}</h2>
            <p className="text-xs text-slate-500">
              {t("pages.inventory.adjust.current", { qty: item.quantity, unit: item.unit })}
            </p>
          </div>
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
        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("pages.inventory.adjust.qtyLabel", { unit: item.unit })}
            </span>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-bold"
            />
            <p className="mt-1 text-xs text-slate-500">
              {t("pages.inventory.adjust.newStockHint", {
                qty: Math.max(0, nextQty),
                unit: item.unit,
              })}
            </p>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("pages.inventory.adjust.reasonLabel")}
            </span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {reasonOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
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
              className={`rounded-lg bg-gradient-to-br ${palette} px-5 py-2 text-sm font-bold text-white shadow disabled:opacity-60`}
            >
              {busy
                ? t("pages.inventory.form.saving")
                : isIn
                  ? t("pages.inventory.adjust.submitIn")
                  : t("pages.inventory.adjust.submitOut")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

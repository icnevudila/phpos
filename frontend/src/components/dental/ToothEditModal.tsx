import { useEffect, useState } from "react";

import type { Tooth, ToothCondition, ToothSurface } from "../../types/dentalChart";
import { CONDITION_META, CONDITION_ORDER } from "./conditions";
import { centerSurfaceLabel, surfaceSides } from "./toothGeometry";
import { ToothSvg } from "./ToothSvg";

export interface ToothEditModalProps {
  open: boolean;
  toothNumber: number | null;
  existing: Tooth | null;
  onClose: () => void;
  onSave: (data: { condition: ToothCondition; surfaces: ToothSurface[]; notes: string }) => Promise<void>;
}

const ALL_SURFACES: ToothSurface[] = ["MESIAL", "DISTAL", "BUCCAL", "LINGUAL", "OCCLUSAL"];

function surfaceLabel(s: ToothSurface, toothNumber: number): string {
  if (s === "OCCLUSAL") return centerSurfaceLabel(toothNumber);
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function ToothEditModal({
  open,
  toothNumber,
  existing,
  onClose,
  onSave,
}: ToothEditModalProps): JSX.Element | null {
  const [condition, setCondition] = useState<ToothCondition>("HEALTHY");
  const [surfaces, setSurfaces] = useState<ToothSurface[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCondition(existing?.condition ?? "HEALTHY");
    setSurfaces(existing?.surfaces ?? []);
    setNotes(existing?.notes ?? "");
    setError(null);
  }, [open, existing]);

  if (!open || toothNumber === null) return null;

  const sides = surfaceSides(toothNumber);
  const preview: Tooth = {
    toothNumber,
    condition,
    surfaces,
    notes,
  };

  function toggleSurface(s: ToothSurface): void {
    setSurfaces((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await onSave({ condition, surfaces, notes: notes.trim() });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tooth #{toothNumber}</h2>
            <p className="text-xs text-slate-500">Update condition, surfaces and notes.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col items-center">
            <ToothSvg tooth={preview} size={80} readOnly />
            <span className="mt-1 text-xs font-medium text-slate-600">#{toothNumber}</span>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ToothCondition)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {CONDITION_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CONDITION_META[c].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-xs font-medium text-slate-600">Surfaces</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {ALL_SURFACES.map((s) => {
              const active = surfaces.includes(s);
              const isSideMesial = sides.left === "MESIAL" && s === "MESIAL";
              const isSideDistal = sides.left === "DISTAL" && s === "DISTAL";
              const hint = isSideMesial || isSideDistal ? "" : "";
              return (
                <label
                  key={s}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    active ? "border-sky-500 bg-sky-50 text-sky-900" : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-sky-600"
                    checked={active}
                    onChange={() => toggleSurface(s)}
                  />
                  {surfaceLabel(s, toothNumber)}
                  {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-600">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Clinical notes (optional)"
          />
        </div>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

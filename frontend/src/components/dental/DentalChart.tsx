import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { apiFetch } from "../../services/api";
import type {
  DentalChartProps,
  Tooth,
  ToothCondition,
  ToothSurface,
} from "../../types/dentalChart";
import { CONDITION_META } from "./conditions";
import { DentalChartLegend } from "./DentalChartLegend";
import { ToothEditModal } from "./ToothEditModal";
import { ToothSvg } from "./ToothSvg";
import { centerSurfaceLabel, columnIndex, toothKind } from "./toothGeometry";

const KIND_LABEL: Record<ReturnType<typeof toothKind>, string> = {
  molar: "Molar",
  premolar: "Premolar",
  canine: "Canine",
  incisor: "Incisor",
};

interface ToothHistoryEntry {
  id: string;
  toothNumber: number;
  oldCondition: ToothCondition | null;
  newCondition: ToothCondition;
  oldSurfaces: string | null;
  newSurfaces: string | null;
  changedAt: string;
  dentist: { id: string; firstName: string; lastName: string; fullName: string };
}

const UPPER = Array.from({ length: 16 }, (_, i) => i + 1);
const LOWER = Array.from({ length: 16 }, (_, i) => 32 - i); // 32..17 from left to right

function sortByColumn(numbers: number[]): number[] {
  return [...numbers].sort((a, b) => columnIndex(a) - columnIndex(b));
}

function toothToRecord(tooth: Tooth | undefined, toothNumber: number): Tooth {
  return (
    tooth ?? {
      toothNumber,
      condition: "HEALTHY",
      surfaces: [],
      notes: null,
    }
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function DentalChart({
  patientId,
  teeth,
  onUpdate,
  readOnly,
}: DentalChartProps): JSX.Element {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<ToothHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const byNumber = useMemo(() => {
    const map = new Map<number, Tooth>();
    for (const t of teeth) map.set(t.toothNumber, t);
    return map;
  }, [teeth]);

  const upperSorted = sortByColumn(UPPER);
  const lowerSorted = sortByColumn(LOWER);

  const summary = useMemo(() => {
    const counts: Record<ToothCondition, number> = {
      HEALTHY: 0,
      DECAY: 0,
      FILLED: 0,
      CROWN: 0,
      EXTRACTED: 0,
      MISSING: 0,
      ROOT_CANAL: 0,
    };
    for (let n = 1; n <= 32; n++) {
      const t = byNumber.get(n);
      counts[t?.condition ?? "HEALTHY"]++;
    }
    return counts;
  }, [byNumber]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await apiFetch<{ success: true; data: ToothHistoryEntry[] }>(
        `/patients/${patientId}/teeth/history`,
      );
      setHistory(res.data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (showHistory) void loadHistory();
  }, [showHistory, loadHistory]);

  async function handleSave(
    toothNumber: number,
    payload: { condition: ToothCondition; surfaces: ToothSurface[]; notes: string },
  ): Promise<void> {
    await apiFetch<{ success: true; data: Tooth }>(
      `/patients/${patientId}/teeth/${toothNumber}`,
      {
        method: "PUT",
        body: JSON.stringify({
          condition: payload.condition,
          surfaces: payload.surfaces,
          notes: payload.notes.length > 0 ? payload.notes : null,
        }),
      },
    );
    toast.success(t("pages.patientDetail.dentalToastSaved", { n: toothNumber }));
    onUpdate();
    if (showHistory) void loadHistory();
  }

  const handleToothClick = (n: number): void => {
    if (readOnly) return;
    setSelected(n);
  };

  const renderTooth = (n: number, jaw: "upper" | "lower"): JSX.Element => {
    const t = toothToRecord(byNumber.get(n), n);
    const meta = CONDITION_META[t.condition];
    const numberEl = (
      <span className="text-[10px] font-semibold text-slate-500">{n}</span>
    );
    return (
      <div
        key={n}
        className={`flex flex-col items-center ${jaw === "upper" ? "" : "flex-col-reverse"}`}
      >
        {jaw === "upper" ? <span className="mb-0.5">{numberEl}</span> : <span className="mt-0.5">{numberEl}</span>}
        <div
          className="rounded-md p-0.5 transition-transform hover:-translate-y-0.5"
          style={{
            filter:
              t.surfaces.length > 0
                ? `drop-shadow(0 0 3px ${meta.fill}aa)`
                : "drop-shadow(0 1px 1px rgba(15,23,42,0.08))",
          }}
          title={`#${n} · ${KIND_LABEL[toothKind(n)]} — ${meta.label}${
            t.surfaces.length > 0
              ? ` (${t.surfaces
                  .map((s) => (s === "OCCLUSAL" ? centerSurfaceLabel(n) : s[0] + s.slice(1).toLowerCase()))
                  .join(", ")})`
              : ""
          }${t.notes ? ` · ${t.notes}` : ""}`}
        >
          <ToothSvg
            tooth={t}
            size={38}
            readOnly={readOnly}
            onClickTooth={() => handleToothClick(n)}
            onClickSurface={() => handleToothClick(n)}
          />
        </div>
      </div>
    );
  };

  const renderQuadrant = (
    nums: number[],
    side: "L" | "R",
    jaw: "upper" | "lower",
  ): JSX.Element => (
    <div className={`flex ${jaw === "upper" ? "items-end" : "items-start"} gap-1`}>
      {nums.map((n) => renderTooth(n, jaw))}
      {side === "L" ? (
        <div
          className={`mx-1 w-px bg-slate-300 ${jaw === "upper" ? "self-end h-16" : "self-start h-16"}`}
          aria-hidden
        />
      ) : null}
    </div>
  );

  const upperLeft = upperSorted.slice(0, 8);
  const upperRight = upperSorted.slice(8, 16);
  const lowerLeft = lowerSorted.slice(0, 8);
  const lowerRight = lowerSorted.slice(8, 16);

  const selectedTooth = selected !== null ? byNumber.get(selected) ?? null : null;

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Dental chart</h2>
          <p className="text-xs text-slate-500">
            Universal numbering (1–32) · anatomical view with roots
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Click a tooth to set condition (healthy, decay, filled, crown, root canal…) and affected surfaces.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {showHistory ? "Hide history" : "Show history"}
          </button>
        </div>
      </header>

      <div className="mt-6 max-w-full overflow-x-auto">
        <div className="mx-auto inline-block min-w-0 max-w-none rounded-xl bg-gradient-to-b from-slate-50 to-white p-5 ring-1 ring-slate-200 dark:from-slate-800/80 dark:to-slate-900 dark:ring-slate-600">
          <div className="mb-1 flex justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Patient's right</span>
            <span>Upper</span>
            <span>Patient's left</span>
          </div>
          <div className="flex items-end gap-2">
            {renderQuadrant(upperLeft, "L", "upper")}
            {renderQuadrant(upperRight, "R", "upper")}
          </div>
          <div className="relative my-2 h-px w-full bg-gradient-to-r from-transparent via-rose-200 to-transparent">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2 text-[9px] font-semibold uppercase tracking-widest text-rose-400">
              gingiva
            </span>
          </div>
          <div className="flex items-start gap-2">
            {renderQuadrant(lowerLeft, "L", "lower")}
            {renderQuadrant(lowerRight, "R", "lower")}
          </div>
          <div className="mt-2 flex justify-between px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Patient's right</span>
            <span>Lower</span>
            <span>Patient's left</span>
          </div>
        </div>
      </div>

      <DentalChartLegend />

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
        {(Object.keys(summary) as ToothCondition[]).map((c) => (
          <div
            key={c}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
          >
            <span className="text-slate-600">{CONDITION_META[c].label}</span>
            <span className="font-semibold text-slate-900">{summary[c]}</span>
          </div>
        ))}
      </div>

      {showHistory ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-800">{t("pages.patientDetail.chartHistoryTitle")}</h3>
          {historyLoading ? (
            <p className="mt-2 text-xs text-slate-500">{t("pages.patientDetail.dentalHistoryLoading")}</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">{t("pages.patientDetail.dentalHistoryNoChanges")}</p>
          ) : (
            <ul className="mt-2 max-h-80 space-y-2 overflow-y-auto text-sm">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {t("pages.patientDetail.dentalHistoryTooth", { n: h.toothNumber })}
                    </span>
                    <span className="text-slate-500">{formatDate(h.changedAt)}</span>
                  </div>
                  <div className="mt-1 text-slate-600">
                    {h.oldCondition ? (
                      <>
                        <span className="font-medium">
                          {CONDITION_META[h.oldCondition].label}
                        </span>{" "}
                        →{" "}
                      </>
                    ) : null}
                    <span className="font-semibold text-slate-800">
                      {CONDITION_META[h.newCondition].label}
                    </span>
                    {h.newSurfaces ? (
                      <span className="ml-2 text-slate-500">
                        (
                        {h.newSurfaces
                          .split(",")
                          .map((s) =>
                            s === "OCCLUSAL" ? centerSurfaceLabel(h.toothNumber) : s,
                          )
                          .join(", ")}
                        )
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    by {h.dentist.fullName}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      <ToothEditModal
        open={selected !== null}
        toothNumber={selected}
        existing={selectedTooth}
        onClose={() => setSelected(null)}
        onSave={async (payload) => {
          if (selected === null) return;
          await handleSave(selected, payload);
        }}
      />
    </section>
  );
}

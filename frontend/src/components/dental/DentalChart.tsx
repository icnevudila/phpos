import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  MousePointer2, 
  Info, 
  CheckCircle2, 
  ChevronRight,
  Activity,
  User,
  Calendar
} from "lucide-react";

import api from "../../services/api";
import { batchUpsertTeeth, type ToothBatchUpdate } from "../../services/teeth";
import type {
  DentalChartProps,
  Tooth,
  ToothCondition,
  ToothSurface,
} from "../../types/dentalChart";
import { CONDITION_META, CONDITION_ORDER } from "./conditions";
import { ToothEditModal } from "./ToothEditModal";
import { ToothSvg } from "./ToothSvg";
import { centerSurfaceLabel, columnIndex, toothKind } from "./toothGeometry";

const DENTAL_NS = "pages.patientDetail.dentalChart";

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
const LOWER = Array.from({ length: 16 }, (_, i) => 32 - i);

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
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function DentalChart({
  patientId,
  teeth,
  onUpdate,
  readOnly,
}: DentalChartProps): JSX.Element {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToothCondition | null>(null);
  const [history, setHistory] = useState<ToothHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savingTooth, setSavingTooth] = useState<number | null>(null);
  const pendingBatch = useRef<Map<number, ToothBatchUpdate>>(new Map());
  const batchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const res = await api.get<{ data: ToothHistoryEntry[] }>(
        `/patients/${patientId}/teeth/history`,
      );
      setHistory(res.data.data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (showHistory) void loadHistory();
  }, [showHistory, loadHistory]);

  const flushBatch = useCallback(async (): Promise<void> => {
    const updates = [...pendingBatch.current.values()];
    pendingBatch.current.clear();
    if (updates.length === 0) return;
    try {
      await batchUpsertTeeth(patientId, updates);
      onUpdate();
      if (showHistory) void loadHistory();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : t("pages.patientDetail.dentalToastFailed");
      toast.error(msg ?? t("pages.patientDetail.dentalToastFailed"));
    }
  }, [patientId, onUpdate, showHistory, loadHistory, t]);

  const handleSave = async (
    toothNumber: number,
    payload: { condition: ToothCondition; surfaces: ToothSurface[]; notes: string | null },
  ): Promise<void> => {
    setSavingTooth(toothNumber);
    pendingBatch.current.set(toothNumber, {
      toothNumber,
      condition: payload.condition,
      surfaces: payload.surfaces,
      notes: payload.notes,
    });
    if (batchTimer.current) clearTimeout(batchTimer.current);
    batchTimer.current = setTimeout(() => {
      void flushBatch().finally(() => setSavingTooth(null));
    }, 400);
  };

  const handleToothInteraction = async (n: number, surface?: ToothSurface): Promise<void> => {
    if (readOnly) return;

    if (!selectedTool) {
      setSelected(n);
      return;
    }

    const current = toothToRecord(byNumber.get(n), n);
    let nextCondition = selectedTool;
    let nextSurfaces = [...current.surfaces];

    if (surface) {
      if (selectedTool === "FILLED" || selectedTool === "DECAY") {
        if (nextSurfaces.includes(surface)) {
          nextSurfaces = nextSurfaces.filter((s) => s !== surface);
          if (nextSurfaces.length === 0) nextCondition = "HEALTHY";
        } else {
          nextSurfaces.push(surface);
          nextCondition = selectedTool;
        }
      } else {
        nextCondition = selectedTool;
        nextSurfaces = [];
      }
    } else {
      if (selectedTool === "HEALTHY") {
        nextSurfaces = [];
      }
      nextCondition = selectedTool;
    }

    await handleSave(n, {
      condition: nextCondition,
      surfaces: nextSurfaces,
      notes: current.notes ?? null,
    });
  };

  const renderTooth = (n: number, jaw: "upper" | "lower"): JSX.Element => {
    const tRecord = toothToRecord(byNumber.get(n), n);
    const meta = CONDITION_META[tRecord.condition];
    const isSaving = savingTooth === n;

    return (
      <div
        key={n}
        className={`flex flex-col items-center group ${jaw === "upper" ? "" : "flex-col-reverse"}`}
      >
        <span className={`text-[9px] font-black tracking-tighter transition-colors ${selected === n ? "text-sky-600 scale-110" : "text-slate-400"}`}>
          {n}
        </span>
        <div
          className={`relative rounded-xl p-1 transition-all duration-300 ${
            selectedTool ? "cursor-crosshair" : "cursor-pointer"
          } ${selected === n ? "bg-sky-50 ring-2 ring-sky-200 dark:bg-sky-950 dark:ring-sky-900/50" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          style={{
            filter:
              tRecord.surfaces.length > 0
                ? `drop-shadow(0 0 4px ${meta.fill}88)`
                : "none",
          }}
        >
          <ToothSvg
            tooth={tRecord}
            size={38}
            readOnly={readOnly}
            onClickTooth={() => void handleToothInteraction(n)}
            onClickSurface={(s) => void handleToothInteraction(n, s)}
          />
          {isSaving && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-950/60 backdrop-blur-[1px] rounded-xl">
               <div className="h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuadrant = (
    nums: number[],
    side: "L" | "R",
    jaw: "upper" | "lower",
  ): JSX.Element => (
    <div className={`flex ${jaw === "upper" ? "items-end" : "items-start"} gap-1.5`}>
      {nums.map((n) => renderTooth(n, jaw))}
      {side === "L" ? (
        <div
          className={`mx-2 w-px bg-slate-200/60 dark:bg-slate-700/60 ${jaw === "upper" ? "self-end h-16" : "self-start h-16"}`}
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
    <div className="space-y-8">
      {/* Chart Main Interface */}
      <section className="rounded-[3rem] border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <header className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500" />
               <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-wider">{t(`${DENTAL_NS}.title`)}</h2>
            </div>
            <p className="text-sm font-medium text-slate-400">
              {t(`${DENTAL_NS}.subtitle`)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className={`group inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
              showHistory 
                ? "bg-slate-900 text-white shadow-xl dark:bg-white dark:text-slate-900" 
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            <History size={16} className={showHistory ? "animate-pulse" : ""} />
            {showHistory ? t(`${DENTAL_NS}.closeAudit`) : t(`${DENTAL_NS}.viewAudit`)}
          </button>
        </header>

        {/* Diagnostic Toolbar */}
        {!readOnly && (
          <div className="mb-10 rounded-[2rem] border border-slate-50 bg-slate-50/50 p-6 dark:border-slate-800/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-4">
               <MousePointer2 size={14} className="text-sky-500" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Diagnostic Brush Selection</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setSelectedTool(null)}
                className={`relative h-12 px-6 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  selectedTool === null 
                    ? "bg-white text-sky-600 shadow-xl ring-1 ring-slate-100 dark:bg-slate-950 dark:text-sky-400 dark:ring-slate-800" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {t(`${DENTAL_NS}.inspect`)}
                {selectedTool === null && (
                  <motion.div layoutId="toolActive" className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-sky-500" />
                )}
              </button>
              {CONDITION_ORDER.map((c) => {
                const m = CONDITION_META[c];
                const active = selectedTool === c;
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedTool(c)}
                    className={`relative group flex h-12 items-center gap-3 px-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      active 
                        ? "bg-white text-slate-900 shadow-xl ring-1 ring-slate-100 dark:bg-slate-950 dark:text-white dark:ring-slate-800" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                  >
                    <div 
                      className="h-3.5 w-3.5 rounded-md border shadow-sm transition-transform group-hover:scale-110" 
                      style={{ 
                        backgroundColor: m.fill, 
                        borderColor: m.stroke ?? "transparent",
                        borderStyle: m.strokePattern === "dashed" ? "dashed" : "solid"
                      }} 
                    />
                    {m.label}
                    {active && (
                      <motion.div layoutId="toolActive" className="absolute -bottom-1 left-1/2 h-1 w-4 -translate-x-1/2 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50/50 p-8 ring-1 ring-slate-100 dark:bg-slate-950/20 dark:ring-slate-800">
          <div className="flex flex-col items-center gap-12">
            {/* Maxillary */}
            <div className="space-y-4 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">{t(`${DENTAL_NS}.maxillaryArch`)}</span>
              <div className="flex items-end gap-4">
                {renderQuadrant(upperLeft, "L", "upper")}
                {renderQuadrant(upperRight, "R", "upper")}
              </div>
            </div>

            {/* Occlusal Plane */}
            <div className="flex w-full items-center gap-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
              <div className="rounded-full bg-white px-6 py-2 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Occlusal Alignment</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800" />
            </div>

            {/* Mandibular */}
            <div className="space-y-4 text-center">
              <div className="flex items-start gap-4">
                {renderQuadrant(lowerLeft, "L", "lower")}
                {renderQuadrant(lowerRight, "R", "lower")}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">{t(`${DENTAL_NS}.mandibularArch`)}</span>
            </div>
          </div>
        </div>

        {/* Legend / Statistics */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {(Object.keys(summary) as ToothCondition[]).map((c) => (
            <div
              key={c}
              className="flex flex-col gap-2 rounded-[1.5rem] border border-slate-50 bg-slate-50/30 p-5 transition-all hover:bg-slate-50 dark:border-slate-800/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center justify-between">
                <div 
                  className="h-2.5 w-2.5 rounded-sm" 
                  style={{ backgroundColor: CONDITION_META[c].fill }} 
                />
                {summary[c] > 0 && <CheckCircle2 size={12} className="text-emerald-500" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{CONDITION_META[c].label}</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{summary[c]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Audit Trail Section */}
      <AnimatePresence>
        {showHistory && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-[3rem] border border-slate-100 bg-slate-50/40 p-10 dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex items-center gap-4 mb-8">
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl">
                  <Activity size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-800 dark:text-white uppercase tracking-widest">Clinical Audit Trail</h3>
                  <p className="text-sm font-medium text-slate-400">Chronological record of all anatomical updates</p>
               </div>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center py-20 gap-6">
                 <div className="h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                 <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t(`${DENTAL_NS}.syncingLedger`)}</p>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center py-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                 <Info className="text-slate-300 mb-3" size={32} />
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t(`${DENTAL_NS}.noChanges`)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((h) => (
                  <motion.div
                    key={h.id}
                    layout
                    className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 font-black text-sm">
                           #{h.toothNumber}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{t(`${DENTAL_NS}.anatomyUpdate`)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400 line-through">
                              {h.oldCondition ? CONDITION_META[h.oldCondition].label : t(`${DENTAL_NS}.healthyFallback`)}
                            </span>
                            <ChevronRight size={12} className="text-slate-300" />
                            <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                              {CONDITION_META[h.newCondition].label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 dark:bg-slate-800/50">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase">
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                       <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                             <User size={12} />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Dr. {h.dentist.fullName}</span>
                       </div>
                       
                       {h.newSurfaces && (
                          <div className="flex gap-1.5">
                             {h.newSurfaces.split(",").map(s => (
                                <span key={s} className="flex h-5 items-center justify-center rounded-md bg-sky-50 px-2 text-[8px] font-black text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 uppercase tracking-tighter">
                                   {s === "OCCLUSAL" ? centerSurfaceLabel(h.toothNumber)[0] : s[0]}
                                </span>
                             ))}
                          </div>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

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
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Plus } from "lucide-react";

import { PeriodontalChart } from "./PeriodontalChart";
import { PerioMeasurementEditor } from "./PerioMeasurementEditor";
import {
  PERIO_SITE_CODES,
  createPerioExam,
  getPerioExam,
  listPerioExams,
  updatePerioExam,
  type PerioExamDetail,
  type PerioSiteCode,
  type PerioToothDto,
} from "../../services/perio";
import { validatePerioTeeth } from "../../utils/validatePerioExam";

function emptySite(code: PerioSiteCode) {
  return {
    siteCode: code,
    pocketDepth: 0,
    recession: 0,
    bleeding: false,
    suppuration: false,
    plaque: false,
  };
}

function defaultTooth(n: number): Omit<PerioToothDto, "id"> {
  return {
    toothNumber: n,
    mobility: null,
    furcation: null,
    missing: false,
    sites: PERIO_SITE_CODES.map(emptySite),
  };
}

interface PerioExamWorkspaceProps {
  patientId: string;
}

export function PerioExamWorkspace({ patientId }: PerioExamWorkspaceProps): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [examId, setExamId] = useState<string | null>(null);
  const [teeth, setTeeth] = useState<PerioToothDto[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const { data: exams = [], isLoading: listLoading } = useQuery({
    queryKey: ["perioExams", patientId],
    queryFn: () => listPerioExams(patientId),
  });

  const loadExam = useCallback(async (id: string) => {
    const detail: PerioExamDetail = await getPerioExam(id);
    setExamId(detail.id);
    setTeeth(detail.teeth);
    setNotes(detail.notes ?? "");
    const first = detail.teeth.find((t) => !t.missing)?.toothNumber ?? detail.teeth[0]?.toothNumber ?? null;
    setSelectedTooth(first);
  }, []);

  useEffect(() => {
    if (exams.length > 0 && !examId) {
      void loadExam(exams[0].id);
    }
  }, [exams, examId, loadExam]);

  useEffect(() => {
    if (!listLoading && exams.length === 0 && teeth.length === 0 && examId == null) {
      startNewExam();
    }
  }, [listLoading, exams.length, teeth.length, examId]);

  function startNewExam(): void {
    setExamId(null);
    setNotes("");
    setTeeth([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => defaultTooth(n) as PerioToothDto));
    setSelectedTooth(1);
  }

  const handleSelectTooth = useCallback((toothNumber: number | null) => {
    setSelectedTooth(toothNumber);
  }, []);

  const handleChartToothClick = useCallback((tooth: PerioToothDto) => {
    setSelectedTooth(tooth.toothNumber);
  }, []);

  async function handleSave(): Promise<void> {
    const validation = validatePerioTeeth(teeth);
    if (!validation.ok) {
      toast.error(validation.errors[0] ?? t("pages.patientDetail.perio.validationFailed"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        notes: notes.trim() || null,
        teeth: teeth.map(({ id: _id, ...rest }) => rest),
      };
      if (examId) {
        await updatePerioExam(examId, payload);
        toast.success(t("pages.patientDetail.perio.saved"));
      } else {
        const created = await createPerioExam(patientId, payload);
        setExamId(created.id);
        toast.success(t("pages.patientDetail.perio.created"));
      }
      await queryClient.invalidateQueries({ queryKey: ["perioExams", patientId] });
      await queryClient.invalidateQueries({ queryKey: ["latestPerioExam", patientId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patientDetail.perio.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (listLoading && teeth.length === 0) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.perio.loading")}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="text-xs font-bold uppercase text-slate-500">{t("pages.patientDetail.perio.selectExam")}</label>
          <select
            className="mt-1 block rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={examId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) void loadExam(v);
            }}
          >
            <option value="">{t("pages.patientDetail.perio.newExamOption")}</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {new Date(ex.examDate).toLocaleDateString()} — {ex._count?.teeth ?? 0} {t("pages.patientDetail.perio.teeth")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={startNewExam} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold">
            <Plus size={14} /> {t("pages.patientDetail.perio.newExam")}
          </button>
          <button
            type="button"
            disabled={saving || teeth.length === 0}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
          >
            <Save size={14} /> {saving ? t("pages.patientDetail.perio.saving") : t("pages.patientDetail.perio.save")}
          </button>
        </div>
      </div>
      <textarea
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        rows={2}
        placeholder={t("pages.patientDetail.perio.notesPlaceholder")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <PeriodontalChart
        teeth={teeth}
        selectedToothId={selectedTooth}
        onToothClick={handleChartToothClick}
      />
      <PerioMeasurementEditor
        teeth={teeth}
        selectedTooth={selectedTooth}
        onSelectTooth={handleSelectTooth}
        onChange={setTeeth}
      />
    </div>
  );
}

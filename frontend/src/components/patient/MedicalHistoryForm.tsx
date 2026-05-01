import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { apiFetch } from "../../services/api";

export const MEDICAL_CONDITION_CODES = [
  "HEART_DISEASE",
  "CONGENITAL_HEART",
  "RHEUMATIC_FEVER",
  "ANGINA",
  "HBP",
  "LBP",
  "DIABETES",
  "ASTHMA",
  "TB",
  "BRONCHITIS",
  "EMPHYSEMA",
  "SINUSITIS",
  "HAY_FEVER",
  "KIDNEY",
  "LIVER_HEPATITIS",
  "JAUNDICE",
  "ULCERS",
  "THYROID",
  "EPILEPSY",
  "FAINTING",
  "STROKE",
  "ANEMIA",
  "HEMOPHILIA",
  "HIV_AIDS",
  "CANCER",
  "ARTHRITIS",
  "PSYCHIATRIC",
  "VENEREAL",
] as const;

type ConditionCode = (typeof MEDICAL_CONDITION_CODES)[number];

const CONDITION_LABEL: Record<ConditionCode, string> = {
  HEART_DISEASE: "Heart disease",
  CONGENITAL_HEART: "Congenital heart disorder",
  RHEUMATIC_FEVER: "Rheumatic fever",
  ANGINA: "Angina",
  HBP: "High blood pressure",
  LBP: "Low blood pressure",
  DIABETES: "Diabetes",
  ASTHMA: "Asthma",
  TB: "Tuberculosis",
  BRONCHITIS: "Bronchitis",
  EMPHYSEMA: "Emphysema",
  SINUSITIS: "Sinusitis",
  HAY_FEVER: "Hay fever",
  KIDNEY: "Kidney disease",
  LIVER_HEPATITIS: "Liver / Hepatitis",
  JAUNDICE: "Jaundice",
  ULCERS: "Stomach ulcers",
  THYROID: "Thyroid problem",
  EPILEPSY: "Epilepsy",
  FAINTING: "Fainting spells",
  STROKE: "Stroke",
  ANEMIA: "Anemia",
  HEMOPHILIA: "Hemophilia / Bleeding",
  HIV_AIDS: "HIV / AIDS",
  CANCER: "Cancer / Tumor",
  ARTHRITIS: "Arthritis / Rheumatism",
  PSYCHIATRIC: "Psychiatric condition",
  VENEREAL: "Venereal disease / STD",
};

const LIFESTYLE_OPTS = ["NEVER", "OCCASIONAL", "FREQUENT", "DAILY"] as const;
type Lifestyle = (typeof LIFESTYLE_OPTS)[number];

interface MedicalHistory {
  id?: string;
  version?: number;
  underPhysicianCare: boolean;
  underPhysicianCareReason: string | null;
  hospitalized: boolean;
  hospitalizedReason: string | null;
  hospitalizedYear: number | null;
  takingMedications: boolean;
  medicationsList: string | null;
  seriousIllness: boolean;
  seriousIllnessDetails: string | null;
  conditions: ConditionCode[];
  conditionsOther: string | null;
  allergyAnesthetic: boolean;
  allergyPenicillin: boolean;
  allergySulfa: boolean;
  allergyAspirin: boolean;
  allergyLatex: boolean;
  allergyOther: string | null;
  smoker: Lifestyle;
  alcohol: Lifestyle;
  recreationalDrug: Lifestyle;
  isPregnant: boolean;
  pregnancyMonths: number | null;
  isBreastfeeding: boolean;
  usesContraceptive: boolean;
  notes: string | null;
  recordedBy?: { firstName: string; lastName: string } | null;
  recordedAt?: string;
}

function empty(): MedicalHistory {
  return {
    underPhysicianCare: false,
    underPhysicianCareReason: "",
    hospitalized: false,
    hospitalizedReason: "",
    hospitalizedYear: null,
    takingMedications: false,
    medicationsList: "",
    seriousIllness: false,
    seriousIllnessDetails: "",
    conditions: [],
    conditionsOther: "",
    allergyAnesthetic: false,
    allergyPenicillin: false,
    allergySulfa: false,
    allergyAspirin: false,
    allergyLatex: false,
    allergyOther: "",
    smoker: "NEVER",
    alcohol: "NEVER",
    recreationalDrug: "NEVER",
    isPregnant: false,
    pregnancyMonths: null,
    isBreastfeeding: false,
    usesContraceptive: false,
    notes: "",
  };
}

interface Props {
  patientId: string;
  patientGender: string | null;
  canEdit: boolean;
}

export function MedicalHistoryForm({ patientId, patientGender, canEdit }: Props): JSX.Element {
  const { t } = useTranslation();
  const [state, setState] = useState<MedicalHistory>(empty);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** patientId değişince 0’a çekilir; Retry ile artırılır */
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const [recordedBy, setRecordedBy] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    apiFetch<{ success: true; data: MedicalHistory | null }>(`/patients/${patientId}/medical-history`)
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setState({ ...empty(), ...res.data });
          setVersion(res.data.version ?? null);
          if (res.data.recordedBy) {
            setRecordedBy(`Dr. ${res.data.recordedBy.firstName} ${res.data.recordedBy.lastName}`);
          }
          setRecordedAt(res.data.recordedAt ?? null);
        } else {
          setState(empty());
          setVersion(null);
          setRecordedBy(null);
          setRecordedAt(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Could not load medical history";
        setLoadError(msg);
        toast.error(msg);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId, reloadKey]);

  const toggleCondition = (code: ConditionCode): void => {
    setState((s) => {
      const has = s.conditions.includes(code);
      return { ...s, conditions: has ? s.conditions.filter((c) => c !== code) : [...s.conditions, code] };
    });
  };

  const setField = <K extends keyof MedicalHistory>(key: K, value: MedicalHistory[K]): void => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const conditionChunks = useMemo(() => {
    const arr = MEDICAL_CONDITION_CODES;
    const per = Math.ceil(arr.length / 2);
    return [arr.slice(0, per), arr.slice(per)];
  }, []);

  const submit = async (): Promise<void> => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const body = {
        ...state,
        underPhysicianCareReason: state.underPhysicianCareReason || undefined,
        hospitalizedReason: state.hospitalizedReason || undefined,
        hospitalizedYear: state.hospitalizedYear ?? undefined,
        medicationsList: state.medicationsList || undefined,
        seriousIllnessDetails: state.seriousIllnessDetails || undefined,
        conditionsOther: state.conditionsOther || undefined,
        allergyOther: state.allergyOther || undefined,
        pregnancyMonths: state.pregnancyMonths ?? undefined,
        notes: state.notes || undefined,
      };
      const res = await apiFetch<{ success: true; data: MedicalHistory }>(
        `/patients/${patientId}/medical-history`,
        { method: "PUT", body: JSON.stringify(body) },
      );
      setVersion(res.data.version ?? null);
      if (res.data.recordedBy) {
        setRecordedBy(`Dr. ${res.data.recordedBy.firstName} ${res.data.recordedBy.lastName}`);
      }
      setRecordedAt(res.data.recordedAt ?? new Date().toISOString());
      toast.success("Medical history saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {t("pages.patientDetail.medicalLoading")}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm" role="alert">
        <p className="text-sm font-medium text-rose-900">{loadError}</p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
          onClick={() => setReloadKey((c) => c + 1)}
        >
          {t("pages.common.retry")}
        </button>
      </div>
    );
  }

  const isFemale = patientGender === "FEMALE";
  const disabled = !canEdit;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Medical history questionnaire</h3>
            <p className="text-xs text-slate-500">
              {version ? `v${version}` : "New record"}
              {recordedBy ? ` · Last by ${recordedBy}` : ""}
              {recordedAt ? ` · ${new Date(recordedAt).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}` : ""}
            </p>
          </div>
          {canEdit ? (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          ) : null}
        </div>
      </div>

      {/* General health */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold text-slate-900">General health</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <YesNoWithReason
            label="Currently under physician care?"
            checked={state.underPhysicianCare}
            reason={state.underPhysicianCareReason ?? ""}
            onToggle={(v) => setField("underPhysicianCare", v)}
            onReason={(v) => setField("underPhysicianCareReason", v)}
            disabled={disabled}
            reasonPlaceholder="Reason / condition"
          />
          <YesNoWithReason
            label="Ever hospitalized?"
            checked={state.hospitalized}
            reason={state.hospitalizedReason ?? ""}
            onToggle={(v) => setField("hospitalized", v)}
            onReason={(v) => setField("hospitalizedReason", v)}
            disabled={disabled}
            reasonPlaceholder="Reason"
            extra={
              <input
                type="number"
                placeholder="Year"
                disabled={disabled}
                value={state.hospitalizedYear ?? ""}
                onChange={(e) =>
                  setField("hospitalizedYear", e.target.value === "" ? null : Number(e.target.value))
                }
                className="mt-1 w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
              />
            }
          />
          <YesNoWithReason
            label="Taking medications?"
            checked={state.takingMedications}
            reason={state.medicationsList ?? ""}
            onToggle={(v) => setField("takingMedications", v)}
            onReason={(v) => setField("medicationsList", v)}
            disabled={disabled}
            reasonPlaceholder="Medication list"
          />
          <YesNoWithReason
            label="Serious illness / surgery?"
            checked={state.seriousIllness}
            reason={state.seriousIllnessDetails ?? ""}
            onToggle={(v) => setField("seriousIllness", v)}
            onReason={(v) => setField("seriousIllnessDetails", v)}
            disabled={disabled}
            reasonPlaceholder="Details"
          />
        </div>
      </section>

      {/* Conditions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold text-slate-900">Medical conditions</h4>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {conditionChunks.flat().map((code) => (
            <label
              key={code}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={state.conditions.includes(code)}
                onChange={() => toggleCondition(code)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{CONDITION_LABEL[code]}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Other / notes</label>
          <textarea
            disabled={disabled}
            rows={2}
            value={state.conditionsOther ?? ""}
            onChange={(e) => setField("conditionsOther", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* Allergies */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold text-slate-900">Allergies</h4>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {([
            ["allergyAnesthetic", "Local anesthetic"],
            ["allergyPenicillin", "Penicillin"],
            ["allergySulfa", "Sulfa"],
            ["allergyAspirin", "Aspirin"],
            ["allergyLatex", "Latex"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50">
              <input
                type="checkbox"
                disabled={disabled}
                checked={state[key] as boolean}
                onChange={(e) => setField(key, e.target.checked as MedicalHistory[typeof key])}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Other allergies</label>
          <input
            disabled={disabled}
            type="text"
            value={state.allergyOther ?? ""}
            onChange={(e) => setField("allergyOther", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      {/* Lifestyle */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-semibold text-slate-900">Lifestyle</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["smoker", "alcohol", "recreationalDrug"] as const).map((key) => (
            <div key={key}>
              <label className="text-xs font-medium text-slate-600">
                {key === "smoker" ? "Smoking" : key === "alcohol" ? "Alcohol" : "Recreational drugs"}
              </label>
              <select
                disabled={disabled}
                value={state[key] as Lifestyle}
                onChange={(e) => setField(key, e.target.value as Lifestyle)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {LIFESTYLE_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Female-specific */}
      {isFemale ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-sm font-semibold text-slate-900">Female-specific</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={disabled}
                checked={state.isPregnant}
                onChange={(e) => setField("isPregnant", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">Pregnant</span>
            </label>
            <input
              type="number"
              placeholder="Pregnancy month"
              disabled={disabled || !state.isPregnant}
              value={state.pregnancyMonths ?? ""}
              onChange={(e) =>
                setField("pregnancyMonths", e.target.value === "" ? null : Number(e.target.value))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={disabled}
                checked={state.isBreastfeeding}
                onChange={(e) => setField("isBreastfeeding", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">Breastfeeding</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={disabled}
                checked={state.usesContraceptive}
                onChange={(e) => setField("usesContraceptive", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm">Uses contraceptive</span>
            </label>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-900">Additional notes</label>
        <textarea
          disabled={disabled}
          rows={4}
          value={state.notes ?? ""}
          onChange={(e) => setField("notes", e.target.value)}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </section>
    </div>
  );
}

interface YesNoProps {
  label: string;
  checked: boolean;
  reason: string;
  onToggle: (v: boolean) => void;
  onReason: (v: string) => void;
  disabled?: boolean;
  reasonPlaceholder?: string;
  extra?: React.ReactNode;
}

function YesNoWithReason({
  label,
  checked,
  reason,
  onToggle,
  onReason,
  disabled,
  reasonPlaceholder,
  extra,
}: YesNoProps): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <label className="flex items-center gap-3 text-sm text-slate-800">
        <span className="flex-1">{label}</span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(true)}
            className={`rounded-md px-3 py-1 text-xs ${
              checked ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(false)}
            className={`rounded-md px-3 py-1 text-xs ${
              !checked ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            No
          </button>
        </span>
      </label>
      {checked ? (
        <div className="mt-2">
          <input
            type="text"
            disabled={disabled}
            placeholder={reasonPlaceholder ?? "Details"}
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
          {extra}
        </div>
      ) : null}
    </div>
  );
}

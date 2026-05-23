import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Activity, 
  ShieldAlert, 
  Flame, 
  Wind, 
  Droplet, 
  Zap, 
  Stethoscope,
  Save,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar
} from "lucide-react";

import api from "../../services/api";

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
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const [recordedBy, setRecordedBy] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    api.get<{ data: MedicalHistory | null }>(`/patients/${patientId}/medical-history`)
      .then((res: any) => {
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
      .catch((err: any) => {
        if (cancelled) return;
        const msg = err.response?.data?.message || err.message || t("medicalHistory.loadFailedFallback", { defaultValue: "Load Failed Fallback" });
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
    if (!canEdit) return;
    setState((s) => {
      const has = s.conditions.includes(code);
      return { ...s, conditions: has ? s.conditions.filter((c) => c !== code) : [...s.conditions, code] };
    });
  };

  const setField = <K extends keyof MedicalHistory>(key: K, value: MedicalHistory[K]): void => {
    if (!canEdit) return;
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
      const res = await api.put<{ data: MedicalHistory }>(
        `/patients/${patientId}/medical-history`,
        body
      );
      setVersion(res.data.data.version ?? null);
      if (res.data.data.recordedBy) {
        setRecordedBy(`Dr. ${res.data.data.recordedBy.firstName} ${res.data.data.recordedBy.lastName}`);
      }
      setRecordedAt(res.data.data.recordedAt ?? new Date().toISOString());
      toast.success(t("pages.patientDetail.medicalSaveSuccess", { defaultValue: "Medical Save Success" }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || t("pages.patientDetail.medicalSaveFailed", { defaultValue: "Medical Save Failed" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{t("medicalHistory.loading", { defaultValue: "Loading" })}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50/30 p-12 text-center shadow-sm" role="alert">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">{t("medicalHistory.loadFailed", { defaultValue: "Load Failed" })}</h3>
        <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs mx-auto">{loadError}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCcw size={14} />
          Retry Connection
        </button>
      </div>
    );
  }

  const isFemale = patientGender === "FEMALE";
  const disabled = !canEdit;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Form Header Area */}
      <header className="flex flex-col sm:flex-row items-start justify-between gap-6 card">
        <div className="flex items-center gap-5">
           <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary border border-brand-primary/20">
              <Stethoscope size={24} />
           </div>
           <div>
              <h2 className="text-xl font-bold tracking-tight text-brand-text">{t("medicalHistory.title", { defaultValue: "Title" })}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-brand-muted">
                 <span className="flex items-center gap-1.5 rounded-md bg-brand-surface-soft px-2 py-1 border border-brand-border">
                    <CheckCircle2 size={12} className="text-brand-primary" />
                    v{version ?? 1}
                 </span>
                 {recordedBy && (
                   <span className="flex items-center gap-1.5 rounded-md bg-brand-surface-soft px-2 py-1 border border-brand-border">
                      <User size={12} />
                      {recordedBy}
                   </span>
                 )}
                 {recordedAt && (
                   <span className="flex items-center gap-1.5 rounded-md bg-brand-surface-soft px-2 py-1 border border-brand-border">
                      <Calendar size={12} />
                      {new Date(recordedAt).toLocaleDateString()}
                   </span>
                 )}
              </div>
           </div>
        </div>
        {canEdit && (
          <button
            onClick={() => void submit()}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? t("medicalHistory.saving", { defaultValue: "Saving" }) : t("medicalHistory.save", { defaultValue: "Save" })}
          </button>
        )}
      </header>

      {/* General health */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
           <Activity className="text-teal-500" size={20} />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("medicalHistory.sections.general", { defaultValue: "General" })}</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <YesNoWithReason
            label={t("medicalHistory.questions.physicianCare", { defaultValue: "Physician Care" })}
            checked={state.underPhysicianCare}
            reason={state.underPhysicianCareReason ?? ""}
            onToggle={(v) => setField("underPhysicianCare", v)}
            onReason={(v) => setField("underPhysicianCareReason", v)}
            disabled={disabled}
            reasonPlaceholder={t("medicalHistory.fields.reason", { defaultValue: "Reason" })}
          />
          <YesNoWithReason
            label={t("medicalHistory.questions.hospitalized", { defaultValue: "Hospitalized" })}
            checked={state.hospitalized}
            reason={state.hospitalizedReason ?? ""}
            onToggle={(v) => setField("hospitalized", v)}
            onReason={(v) => setField("hospitalizedReason", v)}
            disabled={disabled}
            reasonPlaceholder={t("medicalHistory.fields.details", { defaultValue: "Details" })}
            extra={
              <input
                type="number"
                placeholder={t("medicalHistory.fields.year", { defaultValue: "Year" })}
                disabled={disabled}
                value={state.hospitalizedYear ?? ""}
                onChange={(e) =>
                  setField("hospitalizedYear", e.target.value === "" ? null : Number(e.target.value))
                }
                className="mt-3 h-10 w-24 rounded-xl border-none bg-slate-50 px-3 text-xs font-bold text-slate-900 ring-1 ring-slate-200 transition-all focus:ring-2 focus:ring-sky-500"
              />
            }
          />
          <YesNoWithReason
            label={t("medicalHistory.questions.medications", { defaultValue: "Medications" })}
            checked={state.takingMedications}
            reason={state.medicationsList ?? ""}
            onToggle={(v) => setField("takingMedications", v)}
            onReason={(v) => setField("medicationsList", v)}
            disabled={disabled}
            reasonPlaceholder={t("medicalHistory.fields.medList", { defaultValue: "Med List" })}
          />
          <YesNoWithReason
            label={t("medicalHistory.questions.seriousIllness", { defaultValue: "Serious Illness" })}
            checked={state.seriousIllness}
            reason={state.seriousIllnessDetails ?? ""}
            onToggle={(v) => setField("seriousIllness", v)}
            onReason={(v) => setField("seriousIllnessDetails", v)}
            disabled={disabled}
            reasonPlaceholder={t("medicalHistory.fields.details", { defaultValue: "Details" })}
          />
        </div>
      </section>

      {/* Conditions Checklist */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
           <ShieldAlert className="text-brand-warning" size={16} />
           <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">{t("medicalHistory.sections.conditions", { defaultValue: "Conditions" })}</h3>
        </div>
        <div className="card">
           <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
             {MEDICAL_CONDITION_CODES.map((code) => (
               <label
                 key={code}
                 className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-colors ${ state.conditions.includes(code) ? "bg-brand-primary-soft border border-brand-primary/20 " : "hover:bg-brand-surface-soft border border-transparent" }`}
               >
                 <div className="flex items-center gap-3">
                   <div className={`flex h-5 w-5 items-center justify-center rounded-[6px] border transition-all ${ state.conditions.includes(code) ? "bg-brand-primary border-brand-primary text-white" : "border-brand-border bg-brand-surface " }`}>
                     <AnimatePresence>
                        {state.conditions.includes(code) && (
                          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                             <CheckCircle2 size={12} />
                          </motion.div>
                        )}
                     </AnimatePresence>
                   </div>
                   <span className={`text-xs font-medium transition-colors ${ state.conditions.includes(code) ? "text-brand-text " : "text-brand-muted" }`}>
                     {t(`medicalHistory.conditions.${code}`) || code.replace(/_/g, ' ')}
                   </span>
                 </div>
                 <input
                   type="checkbox"
                   disabled={disabled}
                   checked={state.conditions.includes(code)}
                   onChange={() => toggleCondition(code)}
                   className="sr-only"
                 />
               </label>
             ))}
           </div>
           <div className="mt-8 border-t border-brand-border pt-6">
             <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-brand-muted" />
                <label className="text-xs font-medium text-brand-muted">{t("medicalHistory.fields.otherConditions", { defaultValue: "Other Conditions" })}</label>
             </div>
             <textarea
               disabled={disabled}
               rows={3}
               value={state.conditionsOther ?? ""}
               onChange={(e) => setField("conditionsOther", e.target.value)}
               className="w-full rounded-xl border border-brand-border bg-brand-surface-soft p-3 text-sm text-brand-text focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
             />
           </div>
        </div>
      </section>

      {/* Allergies */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
           <Flame className="text-rose-500" size={20} />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("medicalHistory.sections.allergies", { defaultValue: "Allergies" })}</h3>
        </div>
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {([
              ["allergyAnesthetic", "medicalHistory.allergies.anesthetic"],
              ["allergyPenicillin", "medicalHistory.allergies.penicillin"],
              ["allergySulfa", "medicalHistory.allergies.sulfa"],
              ["allergyAspirin", "medicalHistory.allergies.aspirin"],
              ["allergyLatex", "medicalHistory.allergies.latex"],
            ] as const).map(([key, labelKey]) => (
              <label
                key={key}
                className={`group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border p-5 text-center transition-all ${ state[key] ? "border-rose-200 bg-rose-50/50 shadow-sm " : "border-slate-100 bg-slate-50/30 hover:border-slate-200 " }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${ state[key] ? "bg-rose-500 text-white" : "bg-white text-slate-300 " }`}>
                   <ShieldAlert size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${state[key] ? "text-rose-700 " : "text-slate-400"}`}>
                   {t(labelKey)}
                </span>
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={state[key] as boolean}
                  onChange={(e) => setField(key, e.target.checked as MedicalHistory[typeof key])}
                  className="sr-only"
                />
              </label>
            ))}
          </div>
          <div className="mt-8">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">{t("medicalHistory.fields.otherAllergies", { defaultValue: "Other Allergies" })}</label>
             <input
               disabled={disabled}
               type="text"
               value={state.allergyOther ?? ""}
               onChange={(e) => setField("allergyOther", e.target.value)}
               className="h-14 w-full rounded-2xl border-none bg-slate-50 px-6 text-sm font-bold text-slate-900 ring-1 ring-slate-100 transition-all focus:ring-4 focus:ring-rose-500/10"
             />
          </div>
        </div>
      </section>

      {/* Lifestyle */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
           <Wind className="text-sky-500" size={20} />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("medicalHistory.sections.lifestyle", { defaultValue: "Lifestyle" })}</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(["smoker", "alcohol", "recreationalDrug"] as const).map((key) => (
            <div key={key} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
                {key === "smoker" ? t("medicalHistory.lifestyle.smoking", { defaultValue: "Smoking" }) : key === "alcohol" ? t("medicalHistory.lifestyle.alcohol", { defaultValue: "Alcohol" }) : t("medicalHistory.lifestyle.drugs", { defaultValue: "Drugs" })}
              </label>
              <div className="space-y-2">
                {LIFESTYLE_OPTS.map((o) => (
                  <button
                    key={o}
                    disabled={disabled}
                    onClick={() => setField(key, o)}
                    className={`flex h-12 w-full items-center justify-between rounded-xl px-4 text-xs font-bold transition-all ${ state[key] === o ? "bg-white text-white shadow-lg " : "bg-slate-50 text-slate-500 hover:bg-slate-100 " }`}
                  >
                    {t(`medicalHistory.lifestyle.opts.${o}`)}
                    {state[key] === o && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Female-specific */}
      {isFemale && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-4">
             <Droplet className="text-pink-500" size={20} />
             <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("medicalHistory.sections.female", { defaultValue: "Female" })}</h3>
          </div>
          <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
               <FemaleToggle 
                 label={t("medicalHistory.questions.pregnant", { defaultValue: "Pregnant" })} 
                 checked={state.isPregnant} 
                 onChange={(v) => setField("isPregnant", v)} 
                 disabled={disabled}
               />
               <div className={`transition-opacity ${!state.isPregnant ? 'opacity-30' : ''}`}>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t("medicalHistory.fields.pregnancyMonth", { defaultValue: "Pregnancy Month" })}</label>
                 <input
                   type="number"
                   disabled={disabled || !state.isPregnant}
                   value={state.pregnancyMonths ?? ""}
                   onChange={(e) =>
                     setField("pregnancyMonths", e.target.value === "" ? null : Number(e.target.value))
                   }
                   className="h-12 w-full rounded-xl border-none bg-slate-50 px-4 text-xs font-bold text-slate-900 ring-1 ring-slate-200 transition-all focus:ring-2 focus:ring-pink-500"
                 />
               </div>
               <FemaleToggle 
                 label={t("medicalHistory.questions.breastfeeding", { defaultValue: "Breastfeeding" })} 
                 checked={state.isBreastfeeding} 
                 onChange={(v) => setField("isBreastfeeding", v)} 
                 disabled={disabled}
               />
               <FemaleToggle 
                 label={t("medicalHistory.questions.contraceptives", { defaultValue: "Contraceptives" })} 
                 checked={state.usesContraceptive} 
                 onChange={(v) => setField("usesContraceptive", v)} 
                 disabled={disabled}
               />
            </div>
          </div>
        </section>
      )}

      {/* Additional Notes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
           <Zap className="text-indigo-500" size={20} />
           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t("medicalHistory.sections.notes", { defaultValue: "Notes" })}</h3>
        </div>
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm">
          <textarea
            disabled={disabled}
            rows={5}
            value={state.notes ?? ""}
            placeholder={t("medicalHistory.fields.additionalNotes", { defaultValue: "Additional Notes" })}
            onChange={(e) => setField("notes", e.target.value)}
            className="w-full rounded-3xl border-none bg-slate-50 p-6 text-sm font-bold text-slate-900 ring-1 ring-slate-100 transition-all focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </section>
    </div>
  );
}

function FemaleToggle({ label, checked, onChange, disabled }: { label: string, checked: boolean, onChange: (v: boolean) => void, disabled: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 transition-all ${ checked ? "border-pink-200 bg-pink-50/50 text-pink-700 shadow-sm " : "border-slate-100 bg-slate-50/30 text-slate-400 hover:border-slate-200 " }`}
    >
       <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${ checked ? "bg-pink-500 text-white" : "bg-white text-slate-200 " }`}>
          <CheckCircle2 size={20} />
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
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
  const { t } = useTranslation();
  return (
    <div className={`rounded-[2rem] border transition-all p-6 ${ checked ? "border-sky-100 bg-sky-50/30 " : "border-slate-100 bg-white " }`}>
      <div className="flex flex-col gap-5">
        <p className="text-sm font-black tracking-tight text-slate-800">{label}</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(true)}
            className={`h-11 flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${ checked ? "bg-teal-500 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100 " }`}
          >
            {t("medicalHistory.yes", { defaultValue: "Yes" })}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggle(false)}
            className={`h-11 flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${ !checked ? "bg-white text-white shadow-lg " : "bg-slate-50 text-slate-400 hover:bg-slate-100 " }`}
          >
            {t("medicalHistory.no", { defaultValue: "No" })}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {checked && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-4 pt-4 border-t border-sky-100">
              <input
                type="text"
                disabled={disabled}
                placeholder={reasonPlaceholder ?? t("medicalHistory.specifyDetailsPlaceholder", { defaultValue: "Specify Details Placeholder" })}
                value={reason}
                onChange={(e) => onReason(e.target.value)}
                className="h-12 w-full rounded-xl border-none bg-white px-4 text-xs font-bold text-slate-900 ring-1 ring-sky-200 transition-all focus:ring-2 focus:ring-sky-500"
              />
              {extra}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

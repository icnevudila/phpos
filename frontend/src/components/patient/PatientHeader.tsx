import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Printer,
  Edit3,
  User,
  Phone,
  Calendar,
  Heart,
  ShieldAlert,
  Monitor,
  Star,
  Camera,
  Download,
  Trash2,
} from "lucide-react";
import { downloadPatientDpaExport } from "../../services/patientExport";
import { DpaErasureDialog } from "./DpaErasureDialog";
import { Link } from "react-router-dom";
import { printZebraLabel, printFallback } from "../../services/zebraPrintService";
import {
  fetchPatientFileBlob,
  findLatestAvatar,
  uploadPatientAvatar,
} from "../../services/patientFiles";

interface PatientHeaderProps {
  data: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    phone: string;
    birthDate: string | null;
    gender: string | null;
    allergies: string[];
    philhealthNo?: string | null;
    philhealthType?: string | null;
    loyaltyPoints?: number;
  };
  onEdit: () => void;
  onErased?: () => void;
  dateLocale: string;
  canEditAvatar?: boolean;
  canExportDpa?: boolean;
}

export function PatientHeader({
  data,
  onEdit,
  onErased,
  dateLocale,
  canEditAvatar = false,
  canExportDpa = false,
}: PatientHeaderProps): JSX.Element {
  const { t } = useTranslation();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [erasureOpen, setErasureOpen] = useState(false);

  const fullName = useMemo(() => {
    return [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ");
  }, [data]);

  const age = useMemo(() => {
    if (!data.birthDate) return null;
    const now = new Date();
    const b = new Date(data.birthDate);
    let a = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a;
  }, [data.birthDate]);

  const loadAvatar = useCallback(async () => {
    try {
      const file = await findLatestAvatar(data.id);
      if (!file) {
        setAvatarUrl(null);
        return;
      }
      if (file.publicUrl) {
        setAvatarUrl(file.publicUrl);
        return;
      }
      const blob = await fetchPatientFileBlob(data.id, file.id);
      setAvatarUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    } catch {
      setAvatarUrl(null);
    }
  }, [data.id]);

  useEffect(() => {
    void loadAvatar();
    return () => {
      setAvatarUrl((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [loadAvatar]);

  const handlePrintLabel = async () => {
    const success = await printZebraLabel({
      patientName: fullName,
      patientId: data.id,
      date: new Date().toLocaleDateString("en-PH"),
      clinicName: t("pages.patientDetail.printClinicFallback"),
      type: "PATIENT_ID",
    });

    if (!success) {
      toast.info(t("pages.patientDetail.printZebraNotFound"));
      printFallback({
        patientName: fullName,
        patientId: data.id,
        date: new Date().toLocaleDateString("en-PH"),
        clinicName: t("pages.patientDetail.printClinicFallback"),
        type: "PATIENT_ID",
      });
    } else {
      toast.success(t("pages.patientDetail.printSuccess"));
    }
  };

  async function onDpaExport(): Promise<void> {
    try {
      await downloadPatientDpaExport(data.id);
      toast.success(t("pages.patientDetail.dpaExportSuccess"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patientDetail.dpaExportFailed"));
    }
  }

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("pages.patientDetail.avatarImagesOnly"));
      return;
    }
    setAvatarBusy(true);
    try {
      await uploadPatientAvatar(data.id, file);
      await loadAvatar();
      toast.success(t("pages.patientDetail.avatarUploaded"));
    } catch {
      toast.error(t("pages.patientDetail.avatarFailed"));
    } finally {
      setAvatarBusy(false);
    }
  }

  const dash = t("pages.common.empty");
  const formatDate = (iso: string | null, empty: string, locale: string) => {
    if (!iso) return empty;
    return new Date(iso).toLocaleDateString(locale, {
      timeZone: "Asia/Manila",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
    <div className="relative overflow-hidden rounded-[3.5rem] bg-white dark:bg-slate-900 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
      <motion.div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-start gap-8">
          <div className="relative group">
            <div className="h-24 w-24 overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-sky-500/20">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={40} />
              )}
            </div>
            {canEditAvatar ? (
              <>
                <button
                  type="button"
                  disabled={avatarBusy}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-black/40 text-[9px] font-black uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-wait"
                  aria-label={t("pages.patientDetail.avatarUpload")}
                >
                  <Camera size={20} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onAvatarPick(e)}
                />
              </>
            ) : null}
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white">
              <Heart size={14} fill="currentColor" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                {t("pages.patientDetail.headerBadgeProfile")}
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                {t("pages.patientDetail.headerBadgeActive")}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              {fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-tight">
                <Phone size={14} className="text-sky-500" />
                {data.phone}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-tight">
                <Calendar size={14} className="text-violet-500" />
                {formatDate(data.birthDate, dash, dateLocale)}
                {age !== null && (
                  <span className="ml-1 text-slate-300">({t("pages.patientDetail.yrs", { age })})</span>
                )}
              </div>
              {data.gender && (
                <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {data.gender}
                </div>
              )}
              {data.philhealthType && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  <ShieldAlert size={12} className="text-emerald-500" />
                  {t("pages.patientDetail.phicLabel", { type: data.philhealthType.replace("_", " ") })}
                </div>
              )}
              {data.loyaltyPoints !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  {t("pages.patientDetail.loyaltyPts", { points: data.loyaltyPoints })}
                </div>
              )}
            </div>

            {data.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {data.allergies.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 px-4 py-2 border border-rose-100 dark:border-rose-900/20"
                  >
                    <ShieldAlert size={14} className="text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">
                      {a}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {canExportDpa ? (
            <>
              <button
                type="button"
                onClick={() => void onDpaExport()}
                className="h-16 px-8 flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl ring-1 ring-slate-100 dark:ring-slate-700 hover:bg-slate-50 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Download size={18} aria-hidden />
                {t("pages.patientDetail.dpaExport")}
              </button>
              <button
                type="button"
                onClick={() => setErasureOpen(true)}
                className="h-16 px-8 flex items-center gap-3 rounded-2xl bg-rose-50 text-[10px] font-black uppercase tracking-widest text-rose-700 shadow-xl ring-1 ring-rose-100 hover:bg-rose-100 transition-all active:scale-95 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/50"
              >
                <Trash2 size={18} aria-hidden />
                {t("pages.patientDetail.dpaErasure")}
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => void handlePrintLabel()}
            className="h-16 px-8 flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl ring-1 ring-slate-100 dark:ring-slate-700 hover:bg-slate-50 transition-all active:scale-95"
          >
            <Printer size={18} aria-hidden />
            {t("pages.patientDetail.printLabel")}
          </button>
          <Link
            to={`/patients/${data.id}/presentation`}
            className="h-16 px-8 flex items-center gap-3 rounded-2xl bg-indigo-500 text-[10px] font-black uppercase tracking-widest text-white shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            <Monitor size={18} />
            {t("pages.patientDetail.presentation")}
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="h-16 px-8 flex items-center gap-3 rounded-2xl bg-slate-900 dark:bg-white text-[10px] font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            <Edit3 size={18} />
            {t("pages.patientDetail.edit")}
          </button>
        </div>
      </div>
    </div>
    <DpaErasureDialog
      open={erasureOpen}
      patientId={data.id}
      patientName={fullName}
      onClose={() => setErasureOpen(false)}
      onDone={() => {
        toast.success(t("pages.patientDetail.dpaErasureSuccess"));
        onErased?.();
      }}
    />
    </>
  );
}

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
      clinicName: t("pages.patientDetail.printClinicFallback", { defaultValue: "Print Clinic Fallback" }),
      type: "PATIENT_ID",
    });

    if (!success) {
      toast.info(t("pages.patientDetail.printZebraNotFound", { defaultValue: "Print Zebra Not Found" }));
      printFallback({
        patientName: fullName,
        patientId: data.id,
        date: new Date().toLocaleDateString("en-PH"),
        clinicName: t("pages.patientDetail.printClinicFallback", { defaultValue: "Print Clinic Fallback" }),
        type: "PATIENT_ID",
      });
    } else {
      toast.success(t("pages.patientDetail.printSuccess", { defaultValue: "Demo mode: print job simulated. No hardware was contacted." }));
    }
  };

  async function onDpaExport(): Promise<void> {
    try {
      await downloadPatientDpaExport(data.id);
      toast.success(t("pages.patientDetail.dpaExportSuccess", { defaultValue: "Dpa Export Success" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patientDetail.dpaExportFailed", { defaultValue: "Dpa Export Failed" }));
    }
  }

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("pages.patientDetail.avatarImagesOnly", { defaultValue: "Avatar Images Only" }));
      return;
    }
    setAvatarBusy(true);
    try {
      await uploadPatientAvatar(data.id, file);
      await loadAvatar();
      toast.success(t("pages.patientDetail.avatarUploaded", { defaultValue: "Avatar Uploaded" }));
    } catch {
      toast.error(t("pages.patientDetail.avatarFailed", { defaultValue: "Avatar Failed" }));
    } finally {
      setAvatarBusy(false);
    }
  }

  const dash = t("pages.common.empty", { defaultValue: "Empty" });
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
    <div className="card p-6 relative overflow-hidden group">
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-brand-surface-soft border border-brand-border flex items-center justify-center text-brand-muted">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={24} />
              )}
            </div>
            {canEditAvatar ? (
              <>
                <button
                  type="button"
                  disabled={avatarBusy}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-[10px] font-bold uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-wait"
                  aria-label={t("pages.patientDetail.avatarUpload", { defaultValue: "Avatar Upload" })}
                >
                  <Camera size={16} />
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
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-md bg-brand-primary border-2 border-brand-surface flex items-center justify-center text-white">
              <Heart size={10} fill="currentColor" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                Clinical Patient Profile
              </span>
              <div className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">
                Active record
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-brand-text leading-none">
              {fullName}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm font-medium text-brand-muted">
                <Phone size={14} />
                {data.phone}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-brand-muted">
                <Calendar size={14} />
                {formatDate(data.birthDate, dash, dateLocale)}
                {age !== null && (
                  <span className="ml-1 opacity-70">({t("pages.patientDetail.yrs", { age })})</span>
                )}
              </div>
              {data.gender && (
                <div className="px-2 py-0.5 rounded-md bg-brand-surface-soft border border-brand-border text-xs font-medium text-brand-muted uppercase">
                  {data.gender}
                </div>
              )}
              {data.philhealthType && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-primary-soft border border-brand-primary/20 text-xs font-medium text-brand-primary uppercase">
                  <ShieldAlert size={12} />
                  {t("pages.patientDetail.phicLabel", { type: data.philhealthType.replace("_", " ") })}
                </div>
              )}
              {data.loyaltyPoints !== undefined && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/50 text-xs font-medium text-amber-700 uppercase">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  {t("pages.patientDetail.loyaltyPts", { points: data.loyaltyPoints })}
                </div>
              )}
            </div>

            {data.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {data.allergies.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200/50 px-2 py-1"
                  >
                    <ShieldAlert size={12} className="text-rose-500" />
                    <span className="text-xs font-bold text-rose-700 uppercase">
                      {a}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canExportDpa ? (
            <button
              type="button"
              onClick={() => void onDpaExport()}
              className="btn-secondary text-xs px-3 py-1.5 h-8"
            >
              <Download size={14} aria-hidden />
              Export Data
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handlePrintLabel()}
            className="btn-secondary text-xs px-3 py-1.5 h-8"
          >
            <Printer size={14} aria-hidden />
            Print Label
          </button>
          <Link
            to={`/patients/${data.id}/presentation`}
            className="btn-secondary text-xs px-3 py-1.5 h-8"
          >
            <Monitor size={14} />
            Patient Portal
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="btn-secondary text-xs px-3 py-1.5 h-8"
          >
            <Edit3 size={14} />
            Edit
          </button>
          
          <div className="h-6 w-px bg-brand-border mx-1 hidden sm:block"></div>
          
          <button
            type="button"
            className="btn-primary text-xs px-4 py-1.5 h-8"
          >
            <Calendar size={14} />
            New Appointment
          </button>

          {canExportDpa ? (
            <button
              type="button"
              onClick={() => setErasureOpen(true)}
              className="text-brand-muted hover:text-brand-danger p-1 transition-colors ml-1"
              title="DPA Erasure"
            >
              <Trash2 size={14} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
    <DpaErasureDialog
      open={erasureOpen}
      patientId={data.id}
      patientName={fullName}
      onClose={() => setErasureOpen(false)}
      onDone={() => {
        toast.success(t("pages.patientDetail.dpaErasureSuccess", { defaultValue: "Dpa Erasure Success" }));
        onErased?.();
      }}
    />
    </>
  );
}

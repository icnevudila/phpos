import { useTranslation } from "react-i18next";
import { VoiceNoteWidget } from "./VoiceNoteWidget";
import { Plus, ClipboardList, Stethoscope, FileText, Activity } from "lucide-react";

interface OverviewTabProps {
  data: {
    nickname: string | null;
    email: string | null;
    civilStatus: string | null;
    occupation: string | null;
    religion: string | null;
    nationality: string | null;
    philhealthNo: string | null;
    bloodType: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    bloodPressureSystolic: number | null;
    bloodPressureDiastolic: number | null;
    pulseRate: number | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    referralSource: string | null;
    previousDentist: string | null;
    lastDentalVisit: string | null;
    reasonForVisit: string | null;
    medicalHistoryText: string | null;
  };
  dateLocale: string;
}

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 border-b border-brand-border/50 last:border-0">
      <span className="w-40 shrink-0 text-xs font-bold text-brand-muted uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-medium ${value ? "text-brand-text" : "text-brand-muted italic opacity-60"}`}>
        {value || t("pages.patientDetail.overview.notProvided", { defaultValue: "Not provided" })}
      </span>
    </div>
  );
}

export function OverviewTab({ data, dateLocale }: OverviewTabProps): JSX.Element {
  const { t } = useTranslation();

  const formatDate = (iso: string | null | undefined): string | null => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(dateLocale, { timeZone: "Asia/Manila", dateStyle: "long" });
  };

  const addressString = [data.address, data.city, data.province].filter(Boolean).join(", ");
  const bpString = data.bloodPressureSystolic && data.bloodPressureDiastolic 
    ? `${data.bloodPressureSystolic} / ${data.bloodPressureDiastolic} mmHg` 
    : null;
  const pulseString = data.pulseRate ? `${data.pulseRate} bpm` : null;
  const emergencyString = [data.emergencyContactName, data.emergencyContactPhone].filter(Boolean).join(" · ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* LEFT COLUMN */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">{t("pages.patientDetail.overview.patientIdentity", { defaultValue: "Patient Identity" })}</h2>
          <div className="flex flex-col">
            <ReadOnlyField label={t("pages.patientDetail.overview.nickname", { defaultValue: "Nickname" })} value={data.nickname} />
            <ReadOnlyField label={t("pages.patientDetail.overview.nationality", { defaultValue: "Nationality" })} value={data.nationality} />
            <ReadOnlyField label={t("pages.patientDetail.overview.civilStatus", { defaultValue: "Civil Status" })} value={data.civilStatus} />
            <ReadOnlyField label={t("pages.patientDetail.overview.occupation", { defaultValue: "Occupation" })} value={data.occupation} />
            <ReadOnlyField label={t("pages.patientDetail.overview.religion", { defaultValue: "Religion" })} value={data.religion} />
            <ReadOnlyField label={t("pages.patientDetail.overview.address", { defaultValue: "Address" })} value={addressString} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">{t("pages.patientDetail.overview.contactEmergency", { defaultValue: "Contact & Emergency" })}</h2>
          <div className="flex flex-col">
            <ReadOnlyField label={t("pages.patientDetail.overview.emergencyContact", { defaultValue: "Emergency Contact" })} value={emergencyString} />
            <ReadOnlyField label={t("pages.patientDetail.overview.previousDentist", { defaultValue: "Previous Dentist" })} value={data.previousDentist} />
            <ReadOnlyField label={t("pages.patientDetail.overview.referredBy", { defaultValue: "Referred By" })} value={data.referralSource} />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">{t("pages.patientDetail.overview.visitSummary", { defaultValue: "Visit Summary" })}</h2>
          <div className="flex flex-col">
            <ReadOnlyField label={t("pages.patientDetail.overview.reasonForVisit", { defaultValue: "Reason for Visit" })} value={data.reasonForVisit} />
            <ReadOnlyField label={t("pages.patientDetail.overview.lastVisit", { defaultValue: "Last Visit" })} value={formatDate(data.lastDentalVisit)} />
            <ReadOnlyField label={t("pages.patientDetail.overview.philHealth", { defaultValue: "PhilHealth" })} value={data.philhealthNo} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">{t("pages.patientDetail.overview.clinicalSnapshot", { defaultValue: "Clinical Snapshot" })}</h2>
          <div className="flex flex-col">
            <ReadOnlyField label={t("pages.patientDetail.overview.bloodType", { defaultValue: "Blood Type" })} value={data.bloodType} />
            <ReadOnlyField label={t("pages.patientDetail.overview.bloodPressure", { defaultValue: "Blood Pressure" })} value={bpString} />
            <ReadOnlyField label={t("pages.patientDetail.overview.pulseRate", { defaultValue: "Pulse Rate" })} value={pulseString} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-brand-text">
            <Activity size={18} className="text-brand-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest">{t("pages.patientDetail.overview.medicalHistoryNote", { defaultValue: "Medical History Note" })}</h2>
          </div>
          <div className="bg-brand-surface-soft border border-brand-border rounded-[var(--radius-lg)] p-4 text-sm font-medium text-brand-text leading-relaxed whitespace-pre-wrap">
            {data.medicalHistoryText || (
              <span className="text-brand-muted italic">{t("pages.patientDetail.overview.noMedicalNotes", { defaultValue: "No specific medical history notes recorded." })}</span>
            )}
          </div>
        </div>

      </div>

      <div className="lg:col-span-2 pt-6 border-t border-brand-border mt-4">
        <VoiceNoteWidget 
          onTranscriptionComplete={(text) => {
            console.log("Transcript to save:", text);
            alert(t("pages.patientDetail.overview.voiceNoteCaptured", { defaultValue: "Voice Note Captured" }));
          }} 
        />
      </div>
    </div>
  );
}

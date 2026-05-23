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
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">Patient Identity</h2>
          <div className="flex flex-col">
            <ReadOnlyField label="Nickname" value={data.nickname} />
            <ReadOnlyField label="Nationality" value={data.nationality} />
            <ReadOnlyField label="Civil Status" value={data.civilStatus} />
            <ReadOnlyField label="Occupation" value={data.occupation} />
            <ReadOnlyField label="Religion" value={data.religion} />
            <ReadOnlyField label="Address" value={addressString} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">Contact & Emergency</h2>
          <div className="flex flex-col">
            <ReadOnlyField label="Emergency Contact" value={emergencyString} />
            <ReadOnlyField label="Previous Dentist" value={data.previousDentist} />
            <ReadOnlyField label="Referred By" value={data.referralSource} />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">Visit Summary</h2>
          <div className="flex flex-col">
            <ReadOnlyField label="Reason for Visit" value={data.reasonForVisit} />
            <ReadOnlyField label="Last Visit" value={formatDate(data.lastDentalVisit)} />
            <ReadOnlyField label="PhilHealth" value={data.philhealthNo} />
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">Clinical Snapshot</h2>
          <div className="flex flex-col">
            <ReadOnlyField label="Blood Type" value={data.bloodType} />
            <ReadOnlyField label="Blood Pressure" value={bpString} />
            <ReadOnlyField label="Pulse Rate" value={pulseString} />
          </div>
        </div>

        <div className="card bg-brand-surface-soft border-brand-border">
          <h2 className="text-sm font-black text-brand-text uppercase tracking-widest mb-4">Next Best Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-brand-border text-sm font-bold text-brand-text hover:bg-brand-surface transition-colors shadow-sm">
              <Plus size={16} className="text-brand-primary" /> Book Follow-up
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-brand-border text-sm font-bold text-brand-text hover:bg-brand-surface transition-colors shadow-sm">
              <ClipboardList size={16} className="text-brand-primary" /> Add SOAP Note
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-brand-border text-sm font-bold text-brand-text hover:bg-brand-surface transition-colors shadow-sm">
              <Stethoscope size={16} className="text-brand-primary" /> Open Dental Chart
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-brand-border text-sm font-bold text-brand-text hover:bg-brand-surface transition-colors shadow-sm">
              <FileText size={16} className="text-brand-primary" /> Create Invoice
            </button>
            <button className="flex items-center gap-2 p-3 rounded-lg bg-white border border-brand-border text-sm font-bold text-brand-text hover:bg-brand-surface transition-colors shadow-sm">
              <Activity size={16} className="text-brand-primary" /> Update Medical History
            </button>
          </div>
        </div>
      </div>

      {data.medicalHistoryText ? (
        <div className="lg:col-span-2 card bg-amber-50/50 border-amber-200">
          <h2 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-2">Legacy Notes</h2>
          <p className="whitespace-pre-wrap text-sm font-medium text-amber-800">{data.medicalHistoryText}</p>
        </div>
      ) : null}
      
      <div className="lg:col-span-2 pt-6 border-t border-brand-border mt-4">
        <VoiceNoteWidget 
          onTranscriptionComplete={(text) => {
            console.log("Transcript to save:", text);
            alert(t("pages.patientDetail.overview.voiceNoteCaptured"));
          }} 
        />
      </div>
    </div>
  );
}

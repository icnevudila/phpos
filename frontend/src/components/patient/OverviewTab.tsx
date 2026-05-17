import { useTranslation } from "react-i18next";
import { VoiceNoteWidget } from "./VoiceNoteWidget";

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

export function OverviewTab({ data, dateLocale }: OverviewTabProps): JSX.Element {
  const { t } = useTranslation();
  const dash = t("pages.common.empty");

  const formatDate = (iso: string | null | undefined, empty: string, locale: string): string => {
    if (!iso) return empty;
    return new Date(iso).toLocaleDateString(locale, { timeZone: "Asia/Manila" });
  };

  const rows: Array<{ label: string; value: string }> = [
    { label: t("pages.patientDetail.overview.nickname"), value: data.nickname ?? "" },
    { label: t("pages.patientDetail.overview.email"), value: data.email ?? "" },
    { label: t("pages.patientDetail.overview.civilStatus"), value: data.civilStatus ?? "" },
    { label: t("pages.patientDetail.overview.occupation"), value: data.occupation ?? "" },
    { label: t("pages.patientDetail.overview.religion"), value: data.religion ?? "" },
    { label: t("pages.patientDetail.overview.nationality"), value: data.nationality ?? "" },
    { label: t("pages.patientDetail.overview.philhealth"), value: data.philhealthNo ?? "" },
    { label: t("pages.patientDetail.overview.bloodType"), value: data.bloodType ?? "" },
    { label: t("pages.patientDetail.overview.address"), value: [data.address, data.city, data.province].filter(Boolean).join(", ") },
    {
      label: t("pages.patientDetail.overview.bloodPressure"),
      value:
        data.bloodPressureSystolic && data.bloodPressureDiastolic
          ? t("pages.patientDetail.overview.bpFormatted", {
              sys: data.bloodPressureSystolic,
              dia: data.bloodPressureDiastolic,
            })
          : "",
    },
    {
      label: t("pages.patientDetail.overview.pulseRate"),
      value: data.pulseRate ? t("pages.patientDetail.overview.pulseFormatted", { rate: data.pulseRate }) : "",
    },
    {
      label: t("pages.patientDetail.overview.emergencyContact"),
      value: [data.emergencyContactName, data.emergencyContactPhone].filter(Boolean).join(" · "),
    },
    { label: t("pages.patientDetail.overview.referredBy"), value: data.referralSource ?? "" },
    { label: t("pages.patientDetail.overview.previousDentist"), value: data.previousDentist ?? "" },
    {
      label: t("pages.patientDetail.overview.lastDentalVisit"),
      value: formatDate(data.lastDentalVisit, dash, dateLocale),
    },
    { label: t("pages.patientDetail.overview.reasonForVisit"), value: data.reasonForVisit ?? "" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{row.label}</p>
          <p className="mt-1 text-sm text-slate-800">{row.value || dash}</p>
        </div>
      ))}
      {data.medicalHistoryText ? (
        <div className="md:col-span-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t("pages.patientDetail.overview.legacyNotes")}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{data.medicalHistoryText}</p>
        </div>
      ) : null}
      
      <div className="md:col-span-2 pt-6 border-t border-slate-100 mt-4">
        <VoiceNoteWidget 
          onTranscriptionComplete={(text) => {
            console.log("Transcript to save:", text);
            // In a real app, this would update the patient record via API
            alert(t("pages.patientDetail.overview.voiceNoteCaptured"));
          }} 
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { openAuthedPdf } from "../../services/api";
import { ElectronicConsent } from "./ElectronicConsent";

const PATIENT_FORM_CARDS = [
  { slug: "dental-record", titleKey: "dentalRecordTitle", descKey: "dentalRecordDesc" },
  { slug: "medical-history", titleKey: "medicalHistoryTitle", descKey: "medicalHistoryDesc" },
  { slug: "treatment-record", titleKey: "treatmentRecordTitle", descKey: "treatmentRecordDesc" },
  { slug: "informed-consent", titleKey: "informedConsentTitle", descKey: "informedConsentDesc", signable: true },
  { slug: "orthodontic-record", titleKey: "orthodonticTitle", descKey: "orthodonticDesc" },
];

interface DocumentsTabProps {
  patientId: string;
  patientName?: string;
}

export function DocumentsTab({ patientId, patientName = "Patient" }: DocumentsTabProps): JSX.Element {
  const { t } = useTranslation();
  const [pending, setPending] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);

  const handleOpen = async (slug: string): Promise<void> => {
    setPending(slug);
    try {
      await openAuthedPdf(`/patients/${patientId}/forms/${slug}.pdf`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("pages.patientDetail.documents.downloadFailed", { defaultValue: "Download Failed" });
      toast.error(msg);
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PATIENT_FORM_CARDS.map((f) => (
          <div key={f.slug} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">{t(`pages.patientDetail.documents.${f.titleKey}`)}</p>
              <p className="mt-1 text-xs text-slate-500">{t(`pages.patientDetail.documents.${f.descKey}`)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void handleOpen(f.slug)} disabled={pending === f.slug} className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60">
                {pending === f.slug ? t("pages.patientDetail.documents.opening", { defaultValue: "Opening" }) : t("pages.patientDetail.documents.openPdf", { defaultValue: "Open Pdf" })}
              </button>
              {f.signable ? (
                <button type="button" onClick={() => setConsentOpen(true)} className="rounded-md border border-teal-200 px-3 py-1.5 text-xs font-bold text-teal-700">
                  {t("pages.patientDetail.documents.signElectronic", { defaultValue: "Sign Electronic" })}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {consentOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConsentOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <ElectronicConsent
              title={t("pages.patientDetail.documents.informedConsentTitle", { defaultValue: "Informed Consent Title" })}
              content={t("pages.patientDetail.documents.informedConsentBody", { defaultValue: "Informed Consent Body" })}
              patientName={patientName}
              onSign={() => {
                toast.success(t("pages.patientDetail.documents.consentSigned", { defaultValue: "Consent Signed" }));
                setConsentOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

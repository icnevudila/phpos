import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PatientForm } from "../components/PatientForm";
import { DentalChart } from "../components/dental/DentalChart";
import { MedicalHistoryForm } from "../components/patient/MedicalHistoryForm";
import { PatientHmoPanel } from "../components/patient/PatientHmoPanel";
import { PrescriptionsTab } from "../components/patient/PrescriptionsTab";
import { XrayWorkspace } from "../components/patient/XrayWorkspace";
import { PeriodontalChart } from "../components/perio/PeriodontalChart";
import AdvancedPerioVisualizer from "../components/perio/AdvancedPerioVisualizer";
import TMJFaceAnatomy from "../components/anatomy/TMJFaceAnatomy";
import TreatmentTimeline from "../components/timeline/TreatmentTimeline";
import EnhancedBeforeAfterSlider from "../components/slider/EnhancedBeforeAfterSlider";
import { getUser } from "../hooks/authTokens";
import { apiFetch, openAuthedPdf } from "../services/api";
import { createAppointmentTreatment } from "../services/treatments";
import type { Tooth } from "../types/dentalChart";

type TabKey =
  | "overview"
  | "medical"
  | "chart"
  | "perio"
  | "advanced-perio"
  | "tmj"
  | "treatment-timeline"
  | "before-after"
  | "hmo"
  | "appointments"
  | "treatments"
  | "invoices"
  | "documents"
  | "prescriptions"
  | "xray";

interface PatientFull {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  phone: string;
  email: string | null;
  birthDate: string | null;
  gender: string | null;
  civilStatus: string | null;
  occupation: string | null;
  religion: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  bloodType: string | null;
  allergies: string[];
  philhealthNo: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  referralSource: string | null;
  previousDentist: string | null;
  lastDentalVisit: string | null;
  reasonForVisit: string | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  pulseRate: number | null;
  medicalHistoryText: string | null;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    duration: number;
    status: string;
    type: string | null;
    notes: string | null;
    dentist: { id: string; firstName: string; lastName: string };
  }>;
  invoices: Array<{
    id: string;
    orNumber: string | null;
    subtotal: string;
    discount: string;
    total: string;
    status: string;
    dueDate: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
}

interface Treatment {
  id: string;
  procedure: string;
  quantity: number;
  unitPrice: string;
  toothIds: string[];
  notes: string | null;
  createdAt: string;
  dentist: { firstName: string; lastName: string };
}

const money = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === "") return "₱ 0.00";
  const num = typeof v === "string" ? Number(v) : v;
  return `₱ ${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function pickLocale(lang: string): string {
  return lang === "tr" ? "tr-TR" : "en-PH";
}

function formatDate(iso: string | null | undefined, empty: string, locale: string): string {
  if (!iso) return empty;
  return new Date(iso).toLocaleDateString(locale, { timeZone: "Asia/Manila" });
}

function formatDateTime(iso: string | null | undefined, empty: string, locale: string): string {
  if (!iso) return empty;
  return new Date(iso).toLocaleString(locale, { timeZone: "Asia/Manila" });
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNPAID: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  PENDING: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  CHECKED_IN: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-fuchsia-100 text-fuchsia-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  NO_SHOW: "bg-rose-100 text-rose-700",
};

export function PatientDetailPage(): JSX.Element {
  const { t, i18n } = useTranslation();
  const dateLocale = pickLocale(i18n.language);
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PatientFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [teeth, setTeeth] = useState<Tooth[]>([]);
  const [teethLoading, setTeethLoading] = useState(true);
  const [treatments, setTreatments] = useState<Treatment[] | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const user = getUser();
  const canWriteDental = user?.role === "ADMIN" || user?.role === "DENTIST";

  const loadPatient = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      const res = await apiFetch<{ success: true; data: PatientFull }>(`/patients/${id}`);
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadTeeth = useCallback(async (): Promise<void> => {
    if (!id) return;
    setTeethLoading(true);
    try {
      const res = await apiFetch<{ success: true; data: Tooth[] }>(`/patients/${id}/teeth`);
      setTeeth(res.data);
    } catch {
      setTeeth([]);
    } finally {
      setTeethLoading(false);
    }
  }, [id]);

  const loadTreatments = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      const res = await apiFetch<{ success: true; data: Treatment[] }>(
        `/patients/${id}/treatments`,
      );
      setTreatments(res.data);
    } catch {
      // Endpoint yoksa appointment bazlı listeyi türet — sessizce geç
      setTreatments([]);
    }
  }, [id]);

  useEffect(() => {
    void loadPatient();
    void loadTeeth();
  }, [loadPatient, loadTeeth]);

  useEffect(() => {
    if (tab === "treatments" && treatments === null) {
      void loadTreatments();
    }
  }, [tab, treatments, loadTreatments]);

  const fullName = useMemo(() => {
    if (!data) return "";
    return [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" ");
  }, [data]);

  const age = useMemo(() => {
    if (!data?.birthDate) return null;
    const now = new Date();
    const b = new Date(data.birthDate);
    let a = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) a--;
    return a;
  }, [data]);

  const tabDefs = useMemo(
    () =>
      [
        { key: "overview" as const, label: t("pages.patientDetail.tabs.overview") },
        { key: "medical" as const, label: t("pages.patientDetail.tabs.medical") },
        { key: "chart" as const, label: t("pages.patientDetail.tabs.chart") },
        { key: "perio" as const, label: t("pages.patientDetail.tabs.perio") },
        { key: "advanced-perio" as const, label: "Advanced Perio" },
        { key: "tmj" as const, label: "TMJ/Face" },
        { key: "treatment-timeline" as const, label: "Timeline" },
        { key: "before-after" as const, label: "Progress" },
        { key: "hmo" as const, label: t("pages.patientDetail.tabs.hmo") },
        { key: "appointments" as const, label: t("pages.patientDetail.tabs.appointments") },
        { key: "treatments" as const, label: t("pages.patientDetail.tabs.treatments") },
        { key: "invoices" as const, label: t("pages.patientDetail.tabs.invoices") },
        { key: "documents" as const, label: t("pages.patientDetail.tabs.documents") },
        { key: "prescriptions" as const, label: "Prescriptions" },
        { key: "xray" as const, label: t("pages.patientDetail.tabs.xray") },
      ],
    [t],
  );

  const dash = t("pages.common.empty");

  if (!id) {
    return <p className="p-8 text-slate-600">{t("pages.patientDetail.invalid")}</p>;
  }

  return (
    <div className="space-y-5">
      <Link to="/patients" className="inline-flex items-center text-sm text-sky-600 hover:underline">
        {t("pages.patientDetail.back")}
      </Link>

      {loading ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 opacity-90" aria-hidden>
              <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
            </svg>
            <span className="absolute inset-0 rounded-2xl border-2 border-white/25 animate-ping opacity-30" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t("pages.patientDetail.loading")}</p>
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-emerald-500/70 animate-bounce"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        </div>
      ) : !data ? (
        <p className="text-red-600">{t("pages.patientDetail.notFound")}</p>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{fullName}</h1>
                <p className="mt-1 text-sm text-slate-600">
                  {data.phone}
                  {data.birthDate
                    ? ` · ${formatDate(data.birthDate, dash, dateLocale)}${age !== null ? ` (${age} yrs)` : ""}`
                    : ""}
                  {data.gender ? ` · ${data.gender}` : ""}
                </p>
                {data.allergies.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {data.allergies.map((a) => (
                      <span key={a} className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                        ⚠ {a}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                {t("pages.patientDetail.edit")}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-200 px-2">
              {tabDefs.map((def) => (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => setTab(def.key)}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition ${
                    tab === def.key
                      ? "border-b-2 border-emerald-600 text-emerald-700"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {def.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === "overview" ? <OverviewTab data={data} dateLocale={dateLocale} /> : null}
              {tab === "medical" ? (
                <MedicalHistoryForm
                  patientId={id}
                  patientGender={data.gender}
                  canEdit={canWriteDental}
                />
              ) : null}
              {tab === "chart" ? (
                teethLoading ? (
                  <p className="text-sm text-slate-500">{t("pages.patientDetail.chartLoading")}</p>
                ) : (
                  <DentalChart
                    patientId={id}
                    teeth={teeth}
                    onUpdate={() => void loadTeeth()}
                    readOnly={!canWriteDental}
                  />
                )
              ) : null}
              {tab === "perio" ? <PeriodontalChart patientId={id} /> : null}
              {tab === "hmo" ? <PatientHmoPanel patientId={id} /> : null}
              {tab === "appointments" ? (
                <AppointmentsTab items={data.appointments} dateLocale={dateLocale} />
              ) : null}
              {tab === "treatments" ? (
                <TreatmentsTab
                  patientId={id}
                  items={treatments}
                  canWrite={canWriteDental}
                  appointments={data.appointments}
                  dateLocale={dateLocale}
                  onAdded={() => void loadTreatments()}
                />
              ) : null}
              {tab === "invoices" ? <InvoicesTab items={data.invoices} dateLocale={dateLocale} /> : null}
              {tab === "documents" ? <DocumentsTab patientId={id} /> : null}
              {tab === "prescriptions" ? <PrescriptionsTab patientId={id} dateLocale={dateLocale} canWrite={canWriteDental} appointments={data.appointments} /> : null}
              {tab === "xray" ? <XrayWorkspace patientId={id} /> : null}
            </div>
          </div>
        </>
      )}

      <PatientForm
        open={editOpen}
        patientId={id}
        onClose={() => setEditOpen(false)}
        onSaved={() => void loadPatient()}
      />
    </div>
  );
}

function OverviewTab({ data, dateLocale }: { data: PatientFull; dateLocale: string }): JSX.Element {
  const { t } = useTranslation();
  const dash = t("pages.common.empty");
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
    </div>
  );
}

function AppointmentsTab({
  items,
  dateLocale,
}: {
  items: PatientFull["appointments"];
  dateLocale: string;
}): JSX.Element {
  const { t } = useTranslation();
  const dash = t("pages.common.empty");
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.appointments.empty")}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colWhen")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colType")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colDentist")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colDuration")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="px-2 py-2 text-slate-800">{formatDateTime(a.scheduledAt, dash, dateLocale)}</td>
              <td className="px-2 py-2 text-slate-600">{a.type ?? dash}</td>
              <td className="px-2 py-2 text-slate-600">
                {t("pages.common.drPrefix")} {a.dentist.firstName} {a.dentist.lastName}
              </td>
              <td className="px-2 py-2 text-slate-600">
                {t("pages.patientDetail.appointments.durationMin", { count: a.duration })}
              </td>
              <td className="px-2 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t(`pages.dashboard.queueStatus.${a.status}`, { defaultValue: a.status })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TreatmentsTab({
  patientId,
  items,
  canWrite,
  appointments,
  dateLocale,
  onAdded,
}: {
  patientId: string;
  items: Treatment[] | null;
  canWrite: boolean;
  appointments: PatientFull["appointments"];
  dateLocale: string;
  onAdded: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const totalPhp = useMemo(
    () => (items ?? []).reduce((s, r) => s + Number(r.unitPrice) * r.quantity, 0),
    [items],
  );

  if (items === null) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.treatmentsLoading")}</p>;
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {t("pages.patientDetail.treatmentSummaryTitle")}
          </p>
          <p className="mt-1 text-sm text-emerald-950">
            <span className="font-bold">{items.length}</span> {t("pages.patientDetail.treatmentLineCount")} ·{" "}
            <span className="font-bold">{money(totalPhp)}</span> {t("pages.patientDetail.treatmentTotal")}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            void openAuthedPdf(`/patients/${patientId}/forms/treatment-record.pdf`).catch(() =>
              toast.error(t("pages.patientDetail.treatmentPdfFailed")),
            )
          }
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-50"
        >
          {t("pages.patientDetail.treatmentPdf")}
        </button>
      </div>
      {canWrite ? (
        <QuickTreatmentEntry appointments={appointments} dateLocale={dateLocale} onAdded={onAdded} />
      ) : null}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{t("pages.patientDetail.treatmentsEmpty")}</p>
      ) : (
    <div className="overflow-x-auto">
      <table className="min-w-[860px] w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colDate")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colProcedure")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colTooth")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colQty")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colUnit")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colTotal")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.treatments.colDentist")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-slate-100">
              <td className="px-2 py-2 text-slate-800">{formatDate(row.createdAt, t("pages.common.empty"), dateLocale)}</td>
              <td className="px-2 py-2 text-slate-800">{row.procedure.replace(/_/g, " ")}</td>
              <td className="px-2 py-2 text-slate-600">{row.toothIds.join(", ") || t("pages.common.empty")}</td>
              <td className="px-2 py-2 text-slate-600">{row.quantity}</td>
              <td className="px-2 py-2 text-slate-600">{money(row.unitPrice)}</td>
              <td className="px-2 py-2 font-medium text-slate-900">
                {money(Number(row.unitPrice) * row.quantity)}
              </td>
              <td className="px-2 py-2 text-slate-600">
                {t("pages.common.drPrefix")} {row.dentist.firstName} {row.dentist.lastName}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      )}
    </div>
  );
}

function QuickTreatmentEntry({
  appointments,
  dateLocale,
  onAdded,
}: {
  appointments: PatientFull["appointments"];
  dateLocale: string;
  onAdded: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const validAppointments = appointments.filter((a) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(a.status),
  );
  const [appointmentId, setAppointmentId] = useState(validAppointments[0]?.id ?? "");
  const [procedure, setProcedure] = useState(() => t("pages.common.consultationDefault"));
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(500);
  const [toothIds, setToothIds] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(): Promise<void> {
    if (!appointmentId) {
      toast.error(t("pages.patientDetail.treatments.toastSelectAppt"));
      return;
    }
    setBusy(true);
    try {
      await createAppointmentTreatment(appointmentId, {
        procedure,
        quantity,
        unitPrice,
        toothIds: toothIds
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        notes: notes || undefined,
      });
      setNotes("");
      setToothIds("");
      await onAdded();
      toast.success(t("pages.patientDetail.treatments.toastAdded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patientDetail.treatments.toastAddFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {t("pages.patientDetail.treatments.quickTitle")}
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
        <select
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">{t("pages.patientDetail.treatments.selectAppt")}</option>
          {validAppointments.map((a) => (
            <option key={a.id} value={a.id}>
              {new Date(a.scheduledAt).toLocaleDateString(dateLocale, { timeZone: "Asia/Manila" })} ·{" "}
              {a.type ?? t("pages.patientDetail.appointments.apptTypeGeneral")} ·{" "}
              {t(`pages.dashboard.queueStatus.${a.status}`, { defaultValue: a.status })}
            </option>
          ))}
        </select>
        <input
          value={procedure}
          onChange={(e) => setProcedure(e.target.value)}
          placeholder={t("pages.patientDetail.treatments.placeholderProcedure")}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          value={toothIds}
          onChange={(e) => setToothIds(e.target.value)}
          placeholder={t("pages.patientDetail.treatments.placeholderToothIds")}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          type="number"
          min={0}
          step="0.01"
          value={unitPrice}
          onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("pages.patientDetail.treatments.placeholderNotes")}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {t("pages.patientDetail.treatments.addTreatment")}
        </button>
      </div>
    </section>
  );
}

function InvoicesTab({
  items,
  dateLocale,
}: {
  items: PatientFull["invoices"];
  dateLocale: string;
}): JSX.Element {
  const { t } = useTranslation();
  const dash = t("pages.common.empty");
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.invoices.empty")}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colOr")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colDate")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colSubtotal")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colDiscount")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colTotal")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.invoices.colStatus")}</th>
            <th className="px-2 py-2" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {items.map((inv) => (
            <tr key={inv.id} className="border-b border-slate-100">
              <td className="px-2 py-2 font-mono text-xs text-slate-700">{inv.orNumber ?? dash}</td>
              <td className="px-2 py-2 text-slate-800">{formatDate(inv.createdAt, dash, dateLocale)}</td>
              <td className="px-2 py-2 text-slate-600">{money(inv.subtotal)}</td>
              <td className="px-2 py-2 text-slate-600">{money(inv.discount)}</td>
              <td className="px-2 py-2 font-medium text-slate-900">{money(inv.total)}</td>
              <td className="px-2 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[inv.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t(`pages.patientDetail.invoices.statusLabels.${inv.status}`, { defaultValue: inv.status })}
                </span>
              </td>
              <td className="px-2 py-2 text-right">
                <Link to={`/invoices/${inv.id}`} className="text-xs text-sky-600 hover:underline">
                  {t("pages.patientDetail.invoices.open")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PATIENT_FORM_CARDS: Array<{ slug: string; titleKey: string; descKey: string }> = [
  { slug: "dental-record", titleKey: "dentalRecordTitle", descKey: "dentalRecordDesc" },
  { slug: "medical-history", titleKey: "medicalHistoryTitle", descKey: "medicalHistoryDesc" },
  { slug: "treatment-record", titleKey: "treatmentRecordTitle", descKey: "treatmentRecordDesc" },
  { slug: "informed-consent", titleKey: "informedConsentTitle", descKey: "informedConsentDesc" },
  { slug: "orthodontic-record", titleKey: "orthodonticTitle", descKey: "orthodonticDesc" },
];

function DocumentsTab({ patientId }: { patientId: string }): JSX.Element {
  const { t } = useTranslation();
  const [pending, setPending] = useState<string | null>(null);

  const handleOpen = async (slug: string): Promise<void> => {
    setPending(slug);
    try {
      await openAuthedPdf(`/patients/${patientId}/forms/${slug}.pdf`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("pages.patientDetail.documents.downloadFailed");
      toast.error(msg);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {PATIENT_FORM_CARDS.map((f) => (
        <div
          key={f.slug}
          className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {t(`pages.patientDetail.documents.${f.titleKey}`)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{t(`pages.patientDetail.documents.${f.descKey}`)}</p>
          </div>
          <button
            type="button"
            onClick={() => void handleOpen(f.slug)}
            disabled={pending === f.slug}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {pending === f.slug ? t("pages.patientDetail.documents.opening") : t("pages.patientDetail.documents.openPdf")}
          </button>
        </div>
      ))}
    </div>
  );
}

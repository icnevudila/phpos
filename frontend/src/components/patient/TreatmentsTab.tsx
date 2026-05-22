import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { openAuthedPdf } from "../../services/api";
import { createInvoiceFromAppointment } from "../../services/invoices";
import { createAppointmentTreatment } from "../../services/treatments";

export interface PatientTreatmentRow {
  id: string;
  appointmentId: string;
  procedure: string;
  quantity: number;
  unitPrice: string;
  toothIds: string[];
  phase: string | null;
  notes: string | null;
  createdAt: string;
  dentist: { firstName: string; lastName: string };
}

interface AppointmentBrief {
  id: string;
  scheduledAt: string;
  status: string;
  type: string | null;
}

interface TreatmentsTabProps {
  patientId: string;
  items: PatientTreatmentRow[] | null;
  canWrite: boolean;
  appointments: AppointmentBrief[];
  dateLocale: string;
  onAdded: () => void;
}

const money = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === "") return "₱ 0.00";
  const num = typeof v === "string" ? Number(v) : v;
  return `₱ ${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso: string | null | undefined, empty: string, locale: string): string => {
  if (!iso) return empty;
  return new Date(iso).toLocaleDateString(locale, { timeZone: "Asia/Manila" });
};

export function TreatmentsTab({
  patientId,
  items,
  canWrite,
  appointments,
  dateLocale,
  onAdded,
}: TreatmentsTabProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const billingAppointment = useMemo(() => {
    const latestTreatmentApptId = items?.[0]?.appointmentId;
    if (latestTreatmentApptId) {
      const match = appointments.find((a) => a.id === latestTreatmentApptId);
      if (match) return match;
    }
    const sorted = [...appointments].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    return (
      sorted.find((a) => ["IN_PROGRESS", "CHECKED_IN", "CONFIRMED"].includes(a.status)) ?? sorted[0]
    );
  }, [appointments, items]);

  async function onCreateInvoiceFromTreatments(): Promise<void> {
    if (!billingAppointment) {
      toast.error(t("pages.patientDetail.createInvoiceNoAppointment"));
      return;
    }
    if (!items?.length) {
      toast.error(t("pages.patientDetail.treatmentsEmpty"));
      return;
    }
    setInvoiceBusy(true);
    try {
      const invoice = await createInvoiceFromAppointment(billingAppointment.id);
      toast.success(t("pages.patientDetail.createInvoiceSuccess"));
      navigate(`/invoices/${invoice.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patientDetail.createInvoiceFailed"));
    } finally {
      setInvoiceBusy(false);
    }
  }

  const totalPhp = useMemo(
    () => (items ?? []).reduce((s, r) => s + Number(r.unitPrice) * r.quantity, 0),
    [items],
  );

  if (items === null) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.treatmentsLoading")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-teal-100 bg-teal-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
            {t("pages.patientDetail.treatmentSummaryTitle")}
          </p>
          <p className="mt-1 text-sm text-teal-950">
            <span className="font-bold">{items.length}</span> {t("pages.patientDetail.treatmentLineCount")} ·{" "}
            <span className="font-bold">{money(totalPhp)}</span> {t("pages.patientDetail.treatmentTotal")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite && items.length > 0 ? (
            <button
              type="button"
              disabled={invoiceBusy || !billingAppointment}
              onClick={() => void onCreateInvoiceFromTreatments()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
            >
              <Receipt size={16} />
              {invoiceBusy ? t("pages.patientDetail.createInvoiceBusy") : t("pages.patientDetail.createInvoiceFromTreatments")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() =>
              void openAuthedPdf(`/patients/${patientId}/forms/treatment-record.pdf`).catch(() =>
                toast.error(t("pages.patientDetail.treatmentPdfFailed")),
              )
            }
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-900 shadow-sm hover:bg-teal-50"
          >
            {t("pages.patientDetail.treatmentPdf")}
          </button>
        </div>
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
                <th className="px-2 py-2">Phase</th>
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
                  <td className="px-2 py-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {row.phase || "Unphased"}
                    </span>
                  </td>
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
  appointments: AppointmentBrief[];
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
  const [phase, setPhase] = useState("");
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
        phase: phase || undefined,
        toothIds: toothIds
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        notes: notes || undefined,
      });
      setNotes("");
      setPhase("");
      setToothIds("");
      onAdded();
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
          value={phase}
          onChange={(e) => setPhase(e.target.value)}
          placeholder="Phase (e.g. Phase 1)"
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
          className="rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {t("pages.patientDetail.treatments.addTreatment")}
        </button>
      </div>
    </section>
  );
}

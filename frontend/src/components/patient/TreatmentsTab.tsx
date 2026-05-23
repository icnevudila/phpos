import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Receipt, FileText, Plus } from "lucide-react";
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
  if (v === null || v === undefined || v === "") return "₱0.00";
  const num = typeof v === "string" ? Number(v) : v;
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso: string | null | undefined, empty: string, locale: string): string => {
  if (!iso) return empty;
  return new Date(iso).toLocaleDateString(locale, { 
    timeZone: "Asia/Manila",
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function TreatmentsTab({
  patientId,
  items,
  canWrite,
  appointments,
  dateLocale,
  onAdded,
}: TreatmentsTabProps): JSX.Element {
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
      toast.error("No active appointment found to link the invoice.");
      return;
    }
    if (!items?.length) {
      toast.error("No treatments available to invoice.");
      return;
    }
    setInvoiceBusy(true);
    try {
      const invoice = await createInvoiceFromAppointment(billingAppointment.id);
      toast.success("Invoice generated successfully.");
      navigate(`/invoices/${invoice.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate invoice.");
    } finally {
      setInvoiceBusy(false);
    }
  }

  const totalPhp = useMemo(
    () => (items ?? []).reduce((s, r) => s + Number(r.unitPrice) * r.quantity, 0),
    [items],
  );

  if (items === null) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest animate-pulse">Loading treatments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Summary Header */}
      <div className="card bg-brand-surface-soft border border-brand-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-0.5">
            Total Treatment Value
          </p>
          <div className="flex items-end gap-3">
             <p className="text-2xl font-black text-brand-text tabular-nums leading-none">
               {money(totalPhp)}
             </p>
             <p className="text-xs font-bold text-brand-muted mb-0.5">
               across {items.length} procedures
             </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void openAuthedPdf(`/patients/${patientId}/forms/treatment-record.pdf`).catch(() =>
                toast.error("Failed to generate PDF."),
              )
            }
            className="btn-secondary h-9 px-4 text-xs gap-2"
          >
            <FileText size={14} /> PDF Record
          </button>
          {canWrite && items.length > 0 ? (
            <button
              type="button"
              disabled={invoiceBusy || !billingAppointment}
              onClick={() => void onCreateInvoiceFromTreatments()}
              className="btn-primary h-9 px-4 text-xs gap-2 disabled:opacity-50"
            >
              <Receipt size={14} />
              {invoiceBusy ? "Generating Invoice..." : "Create Invoice"}
            </button>
          ) : null}
        </div>
      </div>

      {canWrite ? (
        <QuickTreatmentEntry appointments={appointments} dateLocale={dateLocale} onAdded={onAdded} />
      ) : null}

      {items.length === 0 ? (
        <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border mt-4">
          <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">No Treatments Logged</p>
        </div>
      ) : (
        <div className="card border border-brand-border overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-brand-surface-muted border-b border-brand-border">
                <tr>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Date</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Procedure</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Phase</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Tooth</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Qty</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Unit Price</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Total</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50 bg-white">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-brand-surface-soft transition-colors">
                    <td className="py-3 px-4 text-xs font-bold text-brand-text whitespace-nowrap">{formatDate(row.createdAt, "--", dateLocale)}</td>
                    <td className="py-3 px-4 text-xs font-bold text-brand-text">{row.procedure.replace(/_/g, " ")}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-brand-border bg-white text-[9px] font-black uppercase tracking-widest text-brand-muted">
                        {row.phase || "Unphased"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-brand-muted">{row.toothIds.join(", ") || "--"}</td>
                    <td className="py-3 px-4 text-xs font-medium text-brand-muted tabular-nums text-right">{row.quantity}</td>
                    <td className="py-3 px-4 text-xs font-medium text-brand-muted tabular-nums text-right">{money(row.unitPrice)}</td>
                    <td className="py-3 px-4 text-sm font-black text-brand-text tabular-nums text-right tracking-tight">
                      {money(Number(row.unitPrice) * row.quantity)}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-brand-muted whitespace-nowrap">
                      Dr. {row.dentist.firstName} {row.dentist.lastName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  const validAppointments = appointments.filter((a) =>
    ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_PROGRESS"].includes(a.status),
  );
  const [appointmentId, setAppointmentId] = useState(validAppointments[0]?.id ?? "");
  const [procedure, setProcedure] = useState("General Consultation");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(500);
  const [toothIds, setToothIds] = useState("");
  const [phase, setPhase] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(): Promise<void> {
    if (!appointmentId) {
      toast.error("Please select an appointment.");
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
      toast.success("Treatment logged.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log treatment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4 bg-white border border-brand-border">
      <div className="flex items-center gap-2 mb-4">
         <Plus className="text-brand-primary" size={16} />
         <p className="text-xs font-black uppercase tracking-widest text-brand-text">
           Quick Log Treatment
         </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-3 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted ml-1">Visit</label>
           <select
             value={appointmentId}
             onChange={(e) => setAppointmentId(e.target.value)}
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all"
           >
             <option value="">Select Appointment...</option>
             {validAppointments.map((a) => (
               <option key={a.id} value={a.id}>
                 {new Date(a.scheduledAt).toLocaleDateString()} · {a.type ?? "General"}
               </option>
             ))}
           </select>
        </div>
        <div className="md:col-span-3 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted ml-1">Procedure</label>
           <input
             value={procedure}
             onChange={(e) => setProcedure(e.target.value)}
             placeholder="e.g. Prophylaxis"
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all"
           />
        </div>
        <div className="md:col-span-2 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted ml-1">Teeth (Optional)</label>
           <input
             value={toothIds}
             onChange={(e) => setToothIds(e.target.value)}
             placeholder="e.g. 14, 15"
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all"
           />
        </div>
        <div className="md:col-span-2 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted ml-1">Phase (Optional)</label>
           <input
             value={phase}
             onChange={(e) => setPhase(e.target.value)}
             placeholder="e.g. Phase 1"
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all"
           />
        </div>
        <div className="md:col-span-1 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted ml-1">Qty</label>
           <input
             type="number"
             min={1}
             value={quantity}
             onChange={(e) => setQuantity(Number(e.target.value) || 1)}
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all tabular-nums"
           />
        </div>
        <div className="md:col-span-1 space-y-1">
           <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted ml-1">Price</label>
           <input
             type="number"
             min={0}
             step="0.01"
             value={unitPrice}
             onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all tabular-nums"
           />
        </div>
        <div className="md:col-span-10 space-y-1">
           <input
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Additional clinical notes..."
             className="w-full h-9 rounded-[var(--radius-sm)] bg-white px-3 text-xs font-medium border border-brand-border outline-none focus:ring-1 focus:ring-brand-primary transition-all"
           />
        </div>
        <div className="md:col-span-2 flex items-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="btn-primary w-full h-9 text-xs flex justify-center items-center disabled:opacity-50"
          >
            {busy ? "Saving..." : "Log Treatment"}
          </button>
        </div>
      </div>
    </div>
  );
}

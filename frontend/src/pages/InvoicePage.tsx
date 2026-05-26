import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  Shield, 
  Clock, 
  Plus, 
  CheckCircle2, 
  RefreshCw,  
  Send,
  Loader2,
  AlertCircle,
  Edit3,
  Phone,
  MoreVertical,
  Zap,
  Star
} from "lucide-react";

import { InvoiceHmoClaimChips } from "../components/invoices/InvoiceHmoClaimChips";
import { InvoiceStatusBadge } from "../components/invoices/InvoiceStatusBadge";
import { PaymentModal } from "../components/invoices/PaymentModal";
import {
  createPaymongoLink,
  fetchInvoice,
  openInvoicePdf,
  openPhilhealthWorksheetPdf,
  openBir2307Pdf,
  simulatePaymongoPaid,
  updateInvoice,
} from "../services/invoices";
import {
  createHmoClaim,
  fetchHmoProviders,
  fetchPatientHmoMemberships,
  type HmoProvider,
  type PatientHmoMembership,
} from "../services/hmo";
import type { InvoiceDto } from "../types/invoice";
import { formatPHP } from "../types/invoice";

// fieldFocus removed

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function InvoicePage(): JSX.Element {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountDraft, setDiscountDraft] = useState("0");
  const [paymongoUrl, setPaymongoUrl] = useState<string | null>(null);
  const [paymongoMock, setPaymongoMock] = useState(false);
  const [busyGcash, setBusyGcash] = useState(false);
  const [providers, setProviders] = useState<HmoProvider[]>([]);
  const [memberships, setMemberships] = useState<PatientHmoMembership[]>([]);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimProviderId, setClaimProviderId] = useState("");
  const [claimSelectedLineIds, setClaimSelectedLineIds] = useState<string[]>([]);
  const [claimCopay, setClaimCopay] = useState(0);
  const [claimNotes] = useState("");
  const [claimDiagnosisCode, setClaimDiagnosisCode] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const inv = await fetchInvoice(id);
      setInvoice(inv);
      setDiscountDraft(inv.discount);
      const [p, m] = await Promise.all([
        fetchHmoProviders(),
        fetchPatientHmoMemberships(inv.patient.id),
      ]);
      setProviders(p.filter((x) => x.isActive));
      setMemberships(m);
      setClaimSelectedLineIds(inv.treatments.map((t) => t.id));
      setClaimProviderId(m.find((x) => x.isPrimary)?.providerId ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.invoice.loadFailed", { defaultValue: "Load Failed" }));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDiscount(): Promise<void> {
    if (!invoice) return;
    const value = Number(discountDraft);
    if (Number.isNaN(value) || value < 0) return;
    try {
      const updated = await updateInvoice(invoice.id, { discount: value });
      setInvoice(updated);
      setEditingDiscount(false);
      toast.success(t("pages.invoice.saved", { defaultValue: "Saved" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertDiscountFailed", { defaultValue: "Alert Discount Failed" }));
    }
  }

  async function onGcashClick(): Promise<void> {
    if (!invoice) return;
    setBusyGcash(true);
    try {
      const res = await createPaymongoLink(invoice.id, "GCASH");
      const payUrl = res.checkoutUrl ?? res.url;
      setPaymongoUrl(payUrl);
      setPaymongoMock(res.mock);
      window.open(payUrl, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertGcashFailed", { defaultValue: "Alert Gcash Failed" }));
    } finally {
      setBusyGcash(false);
    }
  }

  async function onMockPaid(): Promise<void> {
    if (!invoice) return;
    try {
      const updated = await simulatePaymongoPaid(invoice.id);
      setInvoice(updated);
      setPaymongoUrl(null);
      toast.success(t("pages.invoice.paidFull", { date: t("pages.invoice.paidJustNow", { defaultValue: "Demo mode: payment recorded locally. No live gateway was charged." }) }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertSimulateFailed", { defaultValue: "Alert Simulate Failed" }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 text-center px-6">
        <div className="h-20 w-20 rounded-[2.5rem] bg-rose-50 text-rose-500 flex items-center justify-center">
           <FileText size={40} />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800">{error ?? t("pages.invoice.notFound", { defaultValue: "Not Found" })}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">The requested financial record could not be retrieved.</p>
        </div>
        <Link to="/invoices" className="btn-primary">
          {t("pages.invoice.backList", { defaultValue: "Back List" })}
        </Link>
      </div>
    );
  }

  const balance = Number(invoice.balance);
  const isPaid = invoice.status === "PAID";
  const claimRequested = invoice.treatments
    .filter((t) => claimSelectedLineIds.includes(t.id))
    .reduce((sum, t) => sum + Number(t.lineTotal), 0);
  const claimCoverage = Math.max(0, claimRequested - claimCopay);
  const selectedMembership = memberships.find((m) => m.providerId === claimProviderId);
  // showNonPrimaryPlanHint removed

  async function submitClaim(): Promise<void> {
    if (!claimProviderId) {
      toast.error(t("pages.invoice.toastSelectProvider", { defaultValue: "Toast Select Provider" }));
      return;
    }
    if (claimRequested <= 0) {
      toast.error(t("pages.invoice.toastSelectLine", { defaultValue: "Toast Select Line" }));
      return;
    }
    if (!claimDiagnosisCode) {
      toast.error(t("pages.invoice.toastSelectDiagnosisCode", { defaultValue: "Please select an ICD-10 diagnosis code." }));
      return;
    }
    setClaimBusy(true);
    try {
      const lineDesc = invoice!.treatments
        .filter((t) => claimSelectedLineIds.includes(t.id))
        .map(
          (tr) =>
            `${tr.procedure}(${tr.toothIds.join(",") || t("pages.invoice.generalLine", { defaultValue: "General Line" })})`,
        )
        .join(" | ");
      await createHmoClaim({
        patientId: invoice!.patient.id,
        invoiceId: invoice!.id,
        providerId: claimProviderId,
        patientHmoId: selectedMembership?.id,
        treatmentIds: claimSelectedLineIds,
        requestedAmount: claimRequested,
        patientCopay: claimCopay,
        status: "SUBMITTED",
        notes: `ICD-10: ${claimDiagnosisCode} | ` + (claimNotes || t("pages.invoice.claimNotesAuto", { lines: lineDesc })),
      });
      toast.success(t("pages.invoice.toastClaimSubmitted", { defaultValue: "Demo mode: claim transmission simulated." }));
      setClaimOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.toastClaimFailed", { defaultValue: "Toast Claim Failed" }));
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <div className={`mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pb-24 print:bg-white print:p-0 ${!isPaid && balance > 0 ? "pb-32 md:pb-24" : "pt-6"}`}>
      {/* Navigation & Actions */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6 print:hidden">
         <Link 
           to="/invoices" 
           className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold uppercase tracking-widest text-slate-500 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-slate-50 hover:text-teal-600"
         >
           <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
           {t("pages.invoice.backInvoices", { defaultValue: "Back Invoices" })}
         </Link>

         <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs px-3 py-1.5 h-8"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={() => openInvoicePdf(invoice.id).catch(() => toast.error(t("pages.invoice.pdfFailed", { defaultValue: "Pdf Failed" })))}
              className="btn-secondary text-xs px-3 py-1.5 h-8"
            >
              <Download size={14} />
              PDF
            </button>
            {invoice.patient.philhealthNo && (
              <button
                onClick={() => openPhilhealthWorksheetPdf(invoice.id).catch(() => toast.error(t("pages.invoice.philhealthWorksheetPdfFailed", { defaultValue: "Philhealth Worksheet Pdf Failed" })))}
                className="btn-secondary text-xs px-3 py-1.5 h-8 text-brand-warning border-brand-warning/30 hover:bg-brand-warning-soft"
              >
                <FileText size={14} />
                PHIC Form
              </button>
            )}
            <button
              onClick={() => openBir2307Pdf(invoice.id).catch(() => toast.error(t("pages.invoice.bir2307Failed", { defaultValue: "Bir2307 Failed" })))}
              className="btn-secondary text-xs px-3 py-1.5 h-8 text-brand-info border-brand-info/30 hover:bg-brand-info-soft"
            >
              <Shield size={14} />
              BIR 2307
            </button>
         </div>
      </header>

      {/* Main 2-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Ledger & Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Info Bar */}
          <div className="card p-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 border border-brand-border">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Official Receipt</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-brand-text font-mono">
                  {invoice.orNumber || t("pages.invoice.orNumberPending", { defaultValue: "Or Number Pending" })}
                </h1>
                <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                  Issued {fmtDateTime(invoice.createdAt)}
                </p>
              </div>
            </div>

            <div className="hidden lg:block h-12 w-px bg-brand-border" />

            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-brand-surface-soft border border-brand-border flex items-center justify-center text-brand-muted">
                  <User size={20} />
               </div>
               <div>
                  <p className="text-sm font-bold text-brand-text uppercase tracking-tight">{invoice.patient.fullName}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-brand-text-soft uppercase tracking-widest">
                     <span className="flex items-center gap-1"><Phone size={10} className="opacity-40" /> {invoice.patient.phone}</span>
                     {invoice.patient.loyaltyPoints !== undefined && (
                        <span className="flex items-center gap-1 text-brand-warning">
                           <Star size={10} className="fill-brand-warning opacity-50" />
                           {invoice.patient.loyaltyPoints} Pts
                        </span>
                     )}
                  </div>
               </div>
            </div>
            
            {(invoice.appointment || invoice.hmoClaims?.length) && (
              <>
                <div className="hidden xl:block h-12 w-px bg-brand-border" />
                <div className="flex flex-col gap-1.5">
                   {invoice.appointment && (
                     <div className="flex items-center gap-2 text-xs font-bold text-brand-text">
                       <Calendar size={14} className="text-brand-muted" />
                       {fmtDateTime(invoice.appointment.scheduledAt)}
                       <span className="px-1.5 py-0.5 rounded bg-brand-surface text-[10px] text-brand-muted">Dr. {invoice.appointment.dentist.fullName}</span>
                     </div>
                   )}
                   {(invoice.hmoClaims?.length ?? 0) > 0 && (
                     <div className="flex items-center gap-2">
                       <Shield size={14} className="text-brand-info" />
                       <InvoiceHmoClaimChips claims={invoice.hmoClaims ?? []} />
                     </div>
                   )}
                </div>
              </>
            )}
          </div>

          {/* Ledger Table */}
          <div className="card border border-brand-border overflow-hidden">
             <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface-soft">
                <div className="flex items-center gap-2">
                   <FileText size={16} className="text-brand-primary" />
                   <h2 className="text-sm font-black text-brand-text uppercase tracking-widest">Treatments Ledger</h2>
                </div>
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                   {invoice.treatments.length} Items
                </span>
             </div>
             
             <table className="w-full text-left border-collapse">
                <thead className="bg-brand-surface border-b border-brand-border/50">
                   <tr>
                      <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Procedure</th>
                      <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">Area / Tooth</th>
                      <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Qty</th>
                      <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted text-right">Total</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50 bg-white">
                   {invoice.treatments.map((row) => (
                      <tr key={row.id} className="hover:bg-brand-surface-soft transition-colors">
                         <td className="py-3 px-4">
                            <p className="text-xs font-bold text-brand-text uppercase">{row.procedure.replace(/_/g, " ")}</p>
                            {row.notes && <p className="text-[10px] font-medium text-brand-muted italic mt-0.5">{row.notes}</p>}
                         </td>
                         <td className="py-3 px-4 text-xs font-medium text-brand-muted uppercase">
                            {row.toothIds.length ? row.toothIds.join(", ") : "General"}
                         </td>
                         <td className="py-3 px-4 text-right text-xs font-bold text-brand-text tabular-nums">{row.quantity}</td>
                         <td className="py-3 px-4 text-right text-xs font-bold text-brand-text tabular-nums">{formatPHP(row.unitPrice)}</td>
                         <td className="py-3 px-4 text-right text-sm font-black text-brand-text tabular-nums">{formatPHP(row.lineTotal)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>

             {/* Totals Summary */}
             <div className="bg-brand-surface-soft border-t border-brand-border p-5 flex flex-col items-end">
                <div className="w-full max-w-[280px] space-y-3">
                   <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-muted">
                      <span>Subtotal</span>
                      <span className="text-brand-text tabular-nums">{formatPHP(invoice.subtotal)}</span>
                   </div>
                   
                   <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-brand-muted">
                      <span>Discount</span>
                      <div className="flex items-center gap-2">
                         {editingDiscount && !isPaid ? (
                            <div className="flex items-center gap-1">
                               <input
                                  type="number"
                                  step="0.01"
                                  value={discountDraft}
                                  onChange={(e) => setDiscountDraft(e.target.value)}
                                  className="w-20 h-7 rounded bg-white border border-brand-border px-2 text-right text-xs font-bold outline-none"
                               />
                               <button onClick={saveDiscount} className="h-7 w-7 rounded bg-brand-primary text-white flex items-center justify-center shadow-sm"><CheckCircle2 size={12} /></button>
                            </div>
                         ) : (
                            <div className="flex items-center gap-2">
                               <span className="text-brand-danger tabular-nums">-{formatPHP(invoice.discount)}</span>
                               {!isPaid && <button onClick={() => setEditingDiscount(true)} className="h-5 w-5 rounded bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-primary"><Edit3 size={10} /></button>}
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="pt-3 border-t border-brand-border/50 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-brand-text">Invoice Total</span>
                      <span className="text-xl font-black text-brand-text tracking-tight tabular-nums">{formatPHP(invoice.total)}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Payments Ledger */}
          <div className="card border border-brand-border print:hidden">
             <div className="p-4 border-b border-brand-border flex items-center justify-between bg-brand-surface-soft">
                <div className="flex items-center gap-2">
                   <CreditCard size={16} className="text-brand-primary" />
                   <h2 className="text-sm font-black text-brand-text uppercase tracking-widest">Payment Ledger</h2>
                </div>
                {!isPaid && (
                   <button
                     onClick={() => setModalOpen(true)}
                     className="btn-secondary text-[10px] px-2 py-1 h-6 gap-1"
                   >
                     <Plus size={10} /> Record
                   </button>
                )}
             </div>
             
             {invoice.payments.length === 0 ? (
                <div className="p-6 text-center">
                   <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">No payments recorded</p>
                </div>
             ) : (
                <div className="divide-y divide-brand-border/50">
                   {invoice.payments.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between hover:bg-brand-surface transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-8 w-12 rounded bg-brand-surface border border-brand-border flex items-center justify-center text-brand-primary font-black text-[10px] uppercase">
                               {p.method.slice(0, 3)}
                            </div>
                            <div>
                               <p className="text-xs font-black text-brand-text">{formatPHP(p.amount)}</p>
                               <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                  <span>{fmtDateTime(p.paidAt)}</span>
                                  {p.referenceNo && (
                                     <>
                                        <span className="h-1 w-1 rounded-full bg-brand-border" />
                                        <span>Ref: {p.referenceNo}</span>
                                     </>
                                  )}
                               </div>
                            </div>
                         </div>
                         {p.notes && <p className="text-[10px] font-medium text-brand-muted italic max-w-[120px] text-right truncate">"{p.notes}"</p>}
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Right Column: Collection Panel */}
        <div className="lg:col-span-4 space-y-6 print:hidden sticky top-24">
          
          <div className="card overflow-hidden border border-brand-border shadow-sm">
             <div className="bg-brand-surface-muted p-6 border-b border-brand-border relative overflow-hidden">
                <div className="relative z-10 flex flex-col gap-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Remaining Balance</p>
                   <p className="text-4xl font-black text-brand-text tracking-tight tabular-nums">{formatPHP(invoice.balance)}</p>
                </div>
                
                <div className="mt-6 space-y-2 relative z-10">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-muted">
                      <span>Collection Progress</span>
                      <span className="text-brand-primary">{Math.round((Number(invoice.paid) / Number(invoice.total)) * 100)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-brand-surface rounded-full overflow-hidden border border-brand-border/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(Number(invoice.paid) / Number(invoice.total)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-brand-primary" 
                      />
                   </div>
                </div>
             </div>

             <div className="p-6 bg-white space-y-4">
                {isPaid ? (
                   <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800">
                      <CheckCircle2 size={20} className="text-teal-600" />
                      <div>
                         <p className="text-xs font-black uppercase tracking-widest">Settled in Full</p>
                         <p className="text-[10px] font-bold opacity-80">{invoice.paidAt ? fmtDateTime(invoice.paidAt) : "Completed"}</p>
                      </div>
                   </div>
                ) : (
                   <>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="btn-primary w-full py-3 h-auto justify-center shadow-md"
                      >
                         <Plus size={16} />
                         Record Payment
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                         <button
                           disabled={busyGcash || balance <= 0}
                           onClick={onGcashClick}
                           className="flex items-center justify-center gap-2 p-2 rounded-lg bg-brand-surface border border-brand-border text-xs font-bold text-brand-text hover:bg-brand-surface-soft transition-colors"
                         >
                            GCash / Maya
                         </button>
                         <button
                           disabled={balance <= 0}
                           onClick={() => setModalOpen(true)}
                           className="flex items-center justify-center gap-2 p-2 rounded-lg bg-brand-surface border border-brand-border text-xs font-bold text-brand-text hover:bg-brand-surface-soft transition-colors"
                         >
                            Card Terminal
                         </button>
                      </div>
                   </>
                )}
             </div>
          </div>

          {/* HMO Integration */}
          <div className="card border border-brand-border overflow-hidden">
             <div className="p-4 flex items-center justify-between border-b border-brand-border bg-brand-surface-soft">
                <div className="flex items-center gap-2">
                   <Shield size={16} className="text-brand-info" />
                   <h2 className="text-xs font-black text-brand-text uppercase tracking-widest">HMO Claims</h2>
                </div>
                {!isPaid && (
                  <button
                    onClick={() => setClaimOpen(!claimOpen)}
                    className="h-6 w-6 rounded flex items-center justify-center bg-brand-surface border border-brand-border hover:bg-brand-info hover:text-white transition-colors"
                  >
                    <Plus size={12} className={claimOpen ? "rotate-45" : ""} />
                  </button>
                )}
             </div>

             <AnimatePresence>
                {claimOpen && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: "auto", opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                      <div className="p-4 space-y-4 bg-white">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Provider</label>
                            <select
                              value={claimProviderId}
                              onChange={(e) => setClaimProviderId(e.target.value)}
                              className="h-9 w-full rounded bg-brand-surface border border-brand-border px-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                            >
                               <option value="">Select Provider...</option>
                               {providers.map((p) => {
                                 const mem = memberships.find((m) => m.providerId === p.id);
                                 return (
                                   <option key={p.id} value={p.id}>
                                     {p.name} {mem?.isPrimary ? " (Primary)" : ""}
                                   </option>
                                 );
                               })}
                            </select>
                         </div>

                         <div className="p-3 rounded bg-brand-surface-soft border border-brand-border space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Treatments Covered</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                               {invoice.treatments.map((row) => (
                                  <label key={row.id} className="flex items-center justify-between group cursor-pointer">
                                     <div className="flex items-center gap-2">
                                        <div className={`h-3.5 w-3.5 rounded-[3px] border-2 transition-colors flex items-center justify-center ${claimSelectedLineIds.includes(row.id) ? 'bg-brand-primary border-brand-primary' : 'border-brand-muted/30'}`}>
                                           {claimSelectedLineIds.includes(row.id) && <CheckCircle2 size={8} className="text-white" />}
                                        </div>
                                        <input
                                           type="checkbox"
                                           className="hidden"
                                           checked={claimSelectedLineIds.includes(row.id)}
                                           onChange={(e) => {
                                              setClaimSelectedLineIds((prev) => e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id));
                                           }}
                                        />
                                        <span className="text-[10px] font-bold text-brand-text uppercase truncate max-w-[120px]">{row.procedure.replace(/_/g, " ")}</span>
                                     </div>
                                     <span className="text-[10px] font-bold text-brand-text-soft tabular-nums">{formatPHP(row.lineTotal)}</span>
                                  </label>
                               ))}
                            </div>
                         </div>

                          <div className="space-y-1.5">
                             <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">ICD-10 Diagnosis Code</label>
                             <select
                               value={claimDiagnosisCode}
                               onChange={(e) => setClaimDiagnosisCode(e.target.value)}
                               className="h-9 w-full rounded bg-brand-surface border border-brand-border px-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                             >
                                <option value="">Select ICD-10 Code...</option>
                                <option value="K02.9">K02.9 - Dental caries, unspecified</option>
                                <option value="K05.3">K05.3 - Chronic periodontitis</option>
                                <option value="K04.0">K04.0 - Pulpitis</option>
                                <option value="K08.8">K08.8 - Other specified disorders of teeth and supporting structures</option>
                                <option value="K03.6">K03.6 - Deposits [accretions] on teeth</option>
                             </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Patient Copay</label>
                               <input
                                 type="number"
                                 value={claimCopay}
                                 onChange={(e) => setClaimCopay(Number(e.target.value) || 0)}
                                 className="h-9 w-full rounded bg-brand-surface border border-brand-border px-2 text-xs font-bold text-brand-text outline-none focus:border-brand-primary"
                               />
                            </div>
                            <div className="px-2 rounded bg-brand-info-soft border border-brand-info/20 flex flex-col justify-center">
                               <p className="text-[10px] font-black text-brand-info uppercase tracking-widest">Coverage</p>
                               <p className="text-sm font-black text-brand-info tabular-nums mt-0.5">{formatPHP(claimCoverage)}</p>
                            </div>
                         </div>

                         <button
                           disabled={claimBusy}
                           onClick={() => void submitClaim()}
                           className="btn-primary w-full justify-center gap-2 h-9 text-xs"
                         >
                            {claimBusy ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                            Submit Claim
                         </button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {invoice.notes && (
             <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-1">Notes</p>
                <p className="text-xs font-medium text-amber-900 leading-relaxed italic">{invoice.notes}</p>
             </div>
          )}
        </div>
      </div>

      {/* Online Payment Logic Banner */}
      {paymongoUrl && (
         <motion.div 
           initial={{ y: 100 }}
           animate={{ y: 0 }}
           className="fixed inset-x-0 bottom-10 z-50 mx-auto max-w-xl px-6"
         >
            <div className="bg-brand-navy text-white p-5 rounded-[var(--radius-lg)] shadow-popover flex items-center justify-between border border-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[var(--radius-md)] bg-white/10 flex items-center justify-center text-brand-info">
                     <Clock size={20} className="animate-pulse" />
                  </div>
                  <div>
                     <p className="text-sm font-bold uppercase tracking-widest">Waiting for Gateway...</p>
                     <p className="text-xs font-medium text-white/60 uppercase tracking-tight truncate max-w-[200px]">{paymongoUrl}</p>
                  </div>
               </div>
               {paymongoMock && (
                  <button onClick={onMockPaid} className="px-4 py-2 rounded-[var(--radius-sm)] bg-brand-primary text-white text-xs font-bold uppercase tracking-widest shadow-sm hover:scale-105 transition-transform">Simulate Success</button>
               )}
            </div>
         </motion.div>
      )}

      {/* Modals */}
      <PaymentModal
        open={modalOpen}
        invoice={invoice}
        onClose={() => setModalOpen(false)}
        onSaved={(inv) => {
          setInvoice(inv);
          setModalOpen(false);
          toast.success(t("pages.invoice.saved", { defaultValue: "Saved" }));
        }}
      />
    </div>
  );
}

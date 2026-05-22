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
      setError(e instanceof Error ? e.message : t("pages.invoice.loadFailed"));
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
      toast.success(t("pages.invoice.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertDiscountFailed"));
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
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertGcashFailed"));
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
      toast.success(t("pages.invoice.paidFull", { date: t("pages.invoice.paidJustNow") }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertSimulateFailed"));
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
          <p className="text-xl font-bold text-slate-800">{error ?? t("pages.invoice.notFound")}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">The requested financial record could not be retrieved.</p>
        </div>
        <Link to="/invoices" className="btn-primary">
          {t("pages.invoice.backList")}
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
      toast.error(t("pages.invoice.toastSelectProvider"));
      return;
    }
    if (claimRequested <= 0) {
      toast.error(t("pages.invoice.toastSelectLine"));
      return;
    }
    setClaimBusy(true);
    try {
      const lineDesc = invoice!.treatments
        .filter((t) => claimSelectedLineIds.includes(t.id))
        .map(
          (tr) =>
            `${tr.procedure}(${tr.toothIds.join(",") || t("pages.invoice.generalLine")})`,
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
        notes: claimNotes || t("pages.invoice.claimNotesAuto", { lines: lineDesc }),
      });
      toast.success(t("pages.invoice.toastClaimSubmitted"));
      setClaimOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.toastClaimFailed"));
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <div className={`min-h-screen w-full pb-24 bg-[#f5f7f9] print:bg-white ${!isPaid && balance > 0 ? "pb-32 md:pb-24" : ""}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 space-y-8 pt-8">
        
        {/* Navigation & Actions */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between print:hidden">
           <Link 
             to="/invoices" 
             className="group flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-teal-500 transition-all"
           >
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-all">
                <ArrowLeft size={18} />
             </div>
             {t("pages.invoice.backInvoices")}
           </Link>

           <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center gap-2"
              >
                <Printer size={16} />
                <span className="text-xs font-semibold uppercase tracking-widest">{t("pages.invoice.print")}</span>
              </button>
              <button
                onClick={() => openInvoicePdf(invoice.id).catch(() => toast.error(t("pages.invoice.pdfFailed")))}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={16} />
                <span className="text-xs font-semibold uppercase tracking-widest">PDF</span>
              </button>
              {invoice.patient.philhealthNo && (
                <button
                  onClick={() => openPhilhealthWorksheetPdf(invoice.id).catch(() => toast.error(t("pages.invoice.philhealthWorksheetPdfFailed")))}
                  className="flex h-10 items-center gap-2 px-4 rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 transition-all hover:bg-amber-500 hover:text-white"
                >
                  <FileText size={16} />
                  <span className="text-xs font-semibold uppercase tracking-widest">{t("pages.invoice.philhealthBtn")}</span>
                </button>
              )}
              <button
                onClick={() => openBir2307Pdf(invoice.id).catch(() => toast.error(t("pages.invoice.bir2307Failed")))}
                className="flex h-10 items-center gap-2 px-4 rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-all hover:bg-blue-500 hover:text-white"
              >
                <Shield size={16} />
                <span className="text-xs font-semibold uppercase tracking-widest">{t("pages.invoice.bir2307Label")}</span>
              </button>
           </div>
        </header>

        {/* Hero Section */}
        <section className="card overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-semibold uppercase tracking-widest text-teal-500">{t("pages.invoice.officialReceipt")}</span>
                       <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-mono">
                       {invoice.orNumber || t("pages.invoice.orNumberPending")}
                    </h1>
                    <p className="text-sm font-medium text-slate-400">
                       {t("pages.invoice.issued", { date: fmtDateTime(invoice.createdAt) })}
                    </p>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                       <User size={24} />
                    </div>
                    <div>
                       <p className="text-lg font-bold text-slate-800 uppercase tracking-tight">{invoice.patient.fullName}</p>
                       <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Phone size={12} className="opacity-40" /> {invoice.patient.phone}</span>
                          {invoice.patient.philhealthNo && (
                            <span className="flex items-center gap-1.5 text-teal-500"><Shield size={12} className="opacity-40" /> PH: {invoice.patient.philhealthNo}</span>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2">
                    {invoice.patient.isSeniorCitizen && (
                       <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold uppercase tracking-widest border border-amber-100">SC Discount Active</span>
                    )}
                    {invoice.patient.pwdIdNo && (
                       <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-widest border border-sky-100">PWD Discount Active</span>
                    )}
                    {invoice.patient.loyaltyPoints !== undefined && (
                       <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-semibold uppercase tracking-widest border border-amber-100">
                          <Star size={10} className="fill-amber-500" />
                          {invoice.patient.loyaltyPoints} Loyalty Points
                       </span>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
                 {invoice.appointment && (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                       <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Appointment Session</p>
                       <div className="flex items-start gap-3">
                          <Calendar className="text-teal-500 mt-1" size={18} />
                          <div>
                             <p className="text-base font-bold text-slate-800">{fmtDateTime(invoice.appointment.scheduledAt)}</p>
                             <p className="text-sm font-medium text-slate-500 mt-1">Dr. {invoice.appointment.dentist.fullName}</p>
                             <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-600 text-xs font-semibold uppercase tracking-tight">
                                {invoice.appointment.type?.replace(/_/g, " ")}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {(invoice.hmoClaims?.length ?? 0) > 0 && (
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                       <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">Integrated HMO Claims</p>
                       <InvoiceHmoClaimChips claims={invoice.hmoClaims ?? []} />
                    </div>
                 )}
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Ledger Table */}
           <div className="lg:col-span-8 space-y-6">
              <section className="card p-0 overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <FileText size={18} className="text-slate-400" />
                       <h2 className="text-base font-semibold text-slate-800">Treatments & Procedures</h2>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                       {invoice.treatments.length} Items
                    </span>
                 </div>
                 <div className="data-table-wrapper">
                    <table className="data-table">
                       <thead>
                          <tr>
                             <th>Procedure</th>
                             <th className="text-right">Qty</th>
                             <th className="text-right">Unit Price</th>
                             <th className="text-right">Total</th>
                          </tr>
                       </thead>
                       <tbody>
                          {invoice.treatments.map((row) => (
                             <tr key={row.id}>
                                <td>
                                   <div className="space-y-1">
                                      <p className="text-sm font-semibold text-slate-800 uppercase leading-none">{row.procedure.replace(/_/g, " ")}</p>
                                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
                                         <span>
                                           {row.toothIds.length
                                             ? t("pages.invoice.toothLine", { teeth: row.toothIds.join(", ") })
                                             : t("pages.common.general")}
                                         </span>
                                         {row.notes && (
                                            <>
                                               <span className="h-1 w-1 rounded-full bg-slate-200" />
                                               <span className="italic">{row.notes}</span>
                                            </>
                                         )}
                                      </div>
                                   </div>
                                </td>
                                <td className="text-right font-semibold text-slate-500 tabular-nums">{row.quantity}</td>
                                <td className="text-right font-semibold text-slate-500 tabular-nums">{formatPHP(row.unitPrice)}</td>
                                <td className="text-right font-semibold text-slate-800 tabular-nums">{formatPHP(row.lineTotal)}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 {/* Totals Summary */}
                 <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col items-end gap-3">
                    <div className="w-full max-w-xs space-y-3">
                       <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
                          <span>Subtotal</span>
                          <span className="text-slate-800">{formatPHP(invoice.subtotal)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                          <span>Discount</span>
                          <div className="flex items-center gap-2">
                             {editingDiscount && !isPaid ? (
                                <div className="flex items-center gap-2">
                                   <input
                                      type="number"
                                      step="0.01"
                                      value={discountDraft}
                                      onChange={(e) => setDiscountDraft(e.target.value)}
                                      className="w-24 h-9 rounded-xl bg-white border-none ring-1 ring-slate-200 px-3 text-right text-sm font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                                   />
                                   <button onClick={saveDiscount} className="h-9 w-9 rounded-xl bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-all shadow-sm"><CheckCircle2 size={16} /></button>
                                   <button onClick={() => { setEditingDiscount(false); setDiscountDraft(invoice.discount); }} className="h-9 w-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-all"><MoreVertical size={16} /></button>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2">
                                   <span className="text-rose-500">-{formatPHP(invoice.discount)}</span>
                                   {!isPaid && <button onClick={() => setEditingDiscount(true)} className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-teal-500 transition-all"><Plus size={12} /></button>}
                                </div>
                             )}
                          </div>
                       </div>
                       <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-sm font-semibold uppercase tracking-widest text-slate-800">Total Amount</span>
                          <span className="text-2xl font-bold text-slate-800 tracking-tight">{formatPHP(invoice.total)}</span>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Payments Ledger */}
              <section className="card p-0 overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <CreditCard size={18} className="text-slate-400" />
                       <h2 className="text-base font-semibold text-slate-800">Payment Ledger</h2>
                    </div>
                    {!isPaid && (
                       <button
                         onClick={() => setModalOpen(true)}
                         className="btn-primary flex items-center gap-2"
                       >
                         <Plus size={14} /> Record Payment
                       </button>
                    )}
                 </div>
                 <div className="p-6 space-y-4">
                    {invoice.payments.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                            <CreditCard className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-sm font-medium text-slate-500">No payments recorded yet</p>
                       </div>
                    ) : (
                       invoice.payments.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-teal-500 shadow-sm font-bold text-xs uppercase">
                                   {p.method.slice(0, 3)}
                                </div>
                                <div>
                                   <p className="text-base font-bold text-slate-800">{formatPHP(p.amount)}</p>
                                   <div className="flex items-center gap-2 mt-1 text-xs font-medium text-slate-400 uppercase tracking-widest">
                                      <span>{fmtDateTime(p.paidAt)}</span>
                                      {p.referenceNo && (
                                         <>
                                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span>Ref: {p.referenceNo}</span>
                                         </>
                                      )}
                                   </div>
                                </div>
                             </div>
                             {p.notes && <p className="text-xs font-medium text-slate-400 italic max-w-xs text-right truncate">"{p.notes}"</p>}
                          </div>
                       ))
                    )}
                 </div>
              </section>
           </div>

           {/* Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              {/* Balance Card */}
              <section className="card bg-slate-800 p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/10 blur-[80px]" />
                 <div className="relative z-10 space-y-6">
                    <div>
                       <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-2">Remaining Ledger Balance</p>
                       <p className="text-3xl font-bold text-white">{formatPHP(invoice.balance)}</p>
                    </div>
                    <div className="space-y-3 pt-6 border-t border-white/5">
                       <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                          <span>Collection Progress</span>
                          <span className="text-white">{Math.round((Number(invoice.paid) / Number(invoice.total)) * 100)}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(Number(invoice.paid) / Number(invoice.total)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-teal-500" 
                          />
                       </div>
                    </div>
                    {isPaid ? (
                       <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-500 text-white shadow-sm">
                          <CheckCircle2 size={24} />
                          <div>
                             <p className="text-sm font-semibold uppercase tracking-widest">Settled in Full</p>
                             <p className="text-xs font-medium opacity-80">{invoice.paidAt ? fmtDateTime(invoice.paidAt) : "Completed"}</p>
                          </div>
                       </div>
                    ) : (
                       <button
                         disabled={busyGcash || balance <= 0}
                         onClick={onGcashClick}
                         className="w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-white text-slate-900 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                       >
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-16 bg-[#007DFE] flex items-center justify-center rounded-lg text-white font-bold italic text-xs">GCash</div>
                             <div className="h-8 w-16 bg-[#D9FD0D] flex items-center justify-center rounded-lg text-slate-900 font-bold italic text-xs">Maya</div>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">{t("pages.invoice.openPaymentGateway")}</p>
                       </button>
                    )}
                 </div>
              </section>

              {/* HMO Integration */}
              <section className="card overflow-hidden">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <Shield size={18} className="text-sky-500" />
                       <h2 className="text-base font-semibold text-slate-800">HMO Integration</h2>
                    </div>
                    <button
                      onClick={() => setClaimOpen(!claimOpen)}
                      className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all ${claimOpen ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-sky-500 hover:text-white'}`}
                    >
                      <Plus size={18} className={claimOpen ? "rotate-45" : ""} />
                    </button>
                 </div>

                 <AnimatePresence>
                    {claimOpen ? (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="space-y-4 overflow-hidden"
                       >
                          <div className="space-y-2">
                             <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Provider Authority</label>
                             <select
                               value={claimProviderId}
                               onChange={(e) => setClaimProviderId(e.target.value)}
                               className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
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

                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                             <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Treatment Mapping</p>
                             <div className="space-y-2">
                                {invoice.treatments.map((row) => (
                                   <label key={row.id} className="flex items-center justify-between group cursor-pointer">
                                      <div className="flex items-center gap-2">
                                         <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${claimSelectedLineIds.includes(row.id) ? 'bg-teal-500 border-teal-500' : 'border-slate-200'}`}>
                                            {claimSelectedLineIds.includes(row.id) && <CheckCircle2 size={12} className="text-white" />}
                                         </div>
                                         <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={claimSelectedLineIds.includes(row.id)}
                                            onChange={(e) => {
                                               setClaimSelectedLineIds((prev) => e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id));
                                            }}
                                         />
                                         <span className="text-xs font-semibold text-slate-600 uppercase truncate max-w-[120px]">{row.procedure}</span>
                                      </div>
                                      <span className="text-xs font-semibold text-slate-400">{formatPHP(row.lineTotal)}</span>
                                   </label>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Patient Copay</label>
                                <input
                                  type="number"
                                  value={claimCopay}
                                  onChange={(e) => setClaimCopay(Number(e.target.value) || 0)}
                                  className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
                                />
                             </div>
                             <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex flex-col justify-center">
                                <p className="text-xs font-semibold text-sky-600 uppercase tracking-widest">Coverage</p>
                                <p className="text-lg font-bold text-sky-700">{formatPHP(claimCoverage)}</p>
                             </div>
                          </div>

                          <button
                            disabled={claimBusy}
                            onClick={() => void submitClaim()}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                          >
                             {claimBusy ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                             {t("pages.invoice.submitClinicalClaim")}
                          </button>
                       </motion.div>
                    ) : (
                       <p className="text-xs font-medium text-slate-400 italic">Initialize a new HMO claim sequence to route clinical charges to affiliated insurance providers.</p>
                    )}
                 </AnimatePresence>
              </section>

              {invoice.notes && (
                 <section className="card">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Internal Notes</p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{invoice.notes}"</p>
                 </section>
              )}
           </div>
        </div>
      </div>

      {/* Online Payment Logic Banner */}
      {paymongoUrl && (
         <motion.div 
           initial={{ y: 100 }}
           animate={{ y: 0 }}
           className="fixed inset-x-0 bottom-10 z-50 mx-auto max-w-xl px-6"
         >
            <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-2xl flex items-center justify-between ring-1 ring-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-400">
                     <Clock size={20} className="animate-pulse" />
                  </div>
                  <div>
                     <p className="text-sm font-semibold uppercase tracking-widest">Waiting for Gateway...</p>
                     <p className="text-xs font-medium text-slate-400 uppercase tracking-tight truncate max-w-[200px]">{paymongoUrl}</p>
                  </div>
               </div>
               {paymongoMock && (
                  <button onClick={onMockPaid} className="px-4 py-2 rounded-xl bg-teal-500 text-white text-xs font-semibold uppercase tracking-widest shadow-sm hover:scale-105 transition-all">Simulate Success</button>
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
          toast.success(t("pages.invoice.saved"));
        }}
      />
    </div>
  );
}

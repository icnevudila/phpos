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
  Zap
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
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Ledger...</p>
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
          <p className="text-xl font-black text-slate-900 dark:text-white">{error ?? t("pages.invoice.notFound")}</p>
          <p className="mt-2 text-sm font-medium text-slate-400">The requested financial record could not be retrieved.</p>
        </div>
        <Link to="/invoices" className="rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black text-white uppercase tracking-widest shadow-xl transition-all hover:scale-105">
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
    <div className={`min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950 print:bg-white ${!isPaid && balance > 0 ? "pb-32 md:pb-24" : ""}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Navigation & Actions */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-center justify-between print:hidden">
           <Link 
             to="/invoices" 
             className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-all"
           >
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 group-hover:scale-110 transition-all">
                <ArrowLeft size={20} />
             </div>
             {t("pages.invoice.backInvoices")}
           </Link>

           <div className="flex items-center gap-4">
              <button
                onClick={() => window.print()}
                className="flex h-14 items-center gap-3 px-6 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:text-emerald-500"
              >
                <Printer size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t("pages.invoice.print")}</span>
              </button>
              <button
                onClick={() => openInvoicePdf(invoice.id).catch(() => toast.error(t("pages.invoice.pdfFailed")))}
                className="flex h-14 items-center gap-3 px-6 rounded-2xl bg-white dark:bg-slate-900 text-slate-400 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:text-emerald-500"
              >
                <Download size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">PDF</span>
              </button>
              {invoice.patient.philhealthNo && (
                <button
                  onClick={() => openPhilhealthWorksheetPdf(invoice.id).catch(() => toast.error(t("pages.invoice.philhealthWorksheetPdfFailed")))}
                  className="flex h-14 items-center gap-3 px-6 rounded-2xl bg-amber-50 text-amber-600 shadow-xl ring-1 ring-amber-100 transition-all hover:bg-amber-500 hover:text-white"
                >
                  <FileText size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t("pages.invoice.philhealthBtn")}</span>
                </button>
              )}
              <button
                onClick={() => openBir2307Pdf(invoice.id).catch(() => toast.error(t("pages.invoice.bir2307Failed")))}
                className="flex h-14 items-center gap-3 px-6 rounded-2xl bg-blue-50 text-blue-600 shadow-xl ring-1 ring-blue-100 transition-all hover:bg-blue-500 hover:text-white"
              >
                <Shield size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{t("pages.invoice.bir2307Label")}</span>
              </button>
           </div>
        </header>

        {/* Hero Section */}
        <section className="relative rounded-[3.5rem] bg-white dark:bg-slate-900 p-10 lg:p-16 shadow-2xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
           <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-500/5 blur-[120px] pointer-events-none" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">{t("pages.invoice.officialReceipt")}</span>
                       <InvoiceStatusBadge status={invoice.status} />
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white font-mono leading-none">
                       {invoice.orNumber || t("pages.invoice.orNumberPending")}
                    </h1>
                    <p className="text-sm font-medium text-slate-400">
                       {t("pages.invoice.issued", { date: fmtDateTime(invoice.createdAt) })}
                    </p>
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                       <User size={32} />
                    </div>
                    <div>
                       <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{invoice.patient.fullName}</p>
                       <div className="flex items-center gap-4 mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Phone size={12} className="opacity-40" /> {invoice.patient.phone}</span>
                          {invoice.patient.philhealthNo && (
                            <span className="flex items-center gap-1.5 text-emerald-500"><Shield size={12} className="opacity-40" /> PH: {invoice.patient.philhealthNo}</span>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-2">
                    {invoice.patient.isSeniorCitizen && (
                       <span className="px-4 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest border border-amber-100">SC Discount Active</span>
                    )}
                    {invoice.patient.pwdIdNo && (
                       <span className="px-4 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-[9px] font-black uppercase tracking-widest border border-sky-100">PWD Discount Active</span>
                    )}
                 </div>
              </div>

              <div className="space-y-8">
                 {invoice.appointment && (
                    <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appointment Session</p>
                       <div className="flex items-start gap-4">
                          <Calendar className="text-emerald-500 mt-1" size={20} />
                          <div>
                             <p className="text-lg font-black text-slate-900 dark:text-white">{fmtDateTime(invoice.appointment.scheduledAt)}</p>
                             <p className="text-sm font-bold text-slate-500 mt-1">Dr. {invoice.appointment.dentist.fullName}</p>
                             <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                                {invoice.appointment.type?.replace(/_/g, " ")}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 {(invoice.hmoClaims?.length ?? 0) > 0 && (
                    <div className="p-8 rounded-[2.5rem] bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Integrated HMO Claims</p>
                       <InvoiceHmoClaimChips claims={invoice.hmoClaims ?? []} />
                    </div>
                 )}
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Ledger Table */}
           <div className="lg:col-span-8 space-y-12">
              <section className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                 <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <FileText size={20} className="text-slate-400" />
                       <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Treatments & Procedures</h2>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {invoice.treatments.length} Items
                    </span>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/30 dark:bg-slate-800/30">
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Procedure</th>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Qty</th>
                             <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Price</th>
                             <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {invoice.treatments.map((row) => (
                             <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                <td className="px-10 py-8">
                                   <div className="space-y-1">
                                      <p className="text-base font-black text-slate-900 dark:text-white uppercase leading-none">{row.procedure.replace(/_/g, " ")}</p>
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                                <td className="px-8 py-8 text-right font-black text-slate-500 tabular-nums">{row.quantity}</td>
                                <td className="px-8 py-8 text-right font-black text-slate-500 tabular-nums">{formatPHP(row.unitPrice)}</td>
                                <td className="px-10 py-8 text-right font-black text-slate-900 dark:text-white tabular-nums">{formatPHP(row.lineTotal)}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 {/* Totals Summary */}
                 <div className="p-10 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col items-end gap-4">
                    <div className="w-full max-w-xs space-y-3">
                       <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                          <span>Subtotal</span>
                          <span className="text-slate-900 dark:text-white">{formatPHP(invoice.subtotal)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                          <span>Discount</span>
                          <div className="flex items-center gap-3">
                             {editingDiscount && !isPaid ? (
                                <div className="flex items-center gap-2">
                                   <input
                                      type="number"
                                      step="0.01"
                                      value={discountDraft}
                                      onChange={(e) => setDiscountDraft(e.target.value)}
                                      className="w-24 h-10 rounded-xl bg-white dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-700 px-3 text-right text-sm font-black focus:ring-2 focus:ring-emerald-500 outline-none"
                                   />
                                   <button onClick={saveDiscount} className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"><CheckCircle2 size={18} /></button>
                                   <button onClick={() => { setEditingDiscount(false); setDiscountDraft(invoice.discount); }} className="h-10 w-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-all"><MoreVertical size={18} /></button>
                                </div>
                             ) : (
                                <div className="flex items-center gap-3">
                                   <span className="text-rose-500">-{formatPHP(invoice.discount)}</span>
                                   {!isPaid && <button onClick={() => setEditingDiscount(true)} className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all"><Plus size={14} /></button>}
                                </div>
                             )}
                          </div>
                       </div>
                       <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Total Amount</span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatPHP(invoice.total)}</span>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Payments Ledger */}
              <section className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                 <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <CreditCard size={20} className="text-slate-400" />
                       <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Payment Ledger</h2>
                    </div>
                    {!isPaid && (
                       <button
                         onClick={() => setModalOpen(true)}
                         className="flex h-12 items-center gap-3 px-6 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                       >
                         <Plus size={16} /> Record Payment
                       </button>
                    )}
                 </div>
                 <div className="p-10 space-y-6">
                    {invoice.payments.length === 0 ? (
                       <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No payments recorded yet</p>
                       </div>
                    ) : (
                       invoice.payments.map((p) => (
                          <div key={p.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group">
                             <div className="flex items-center gap-6">
                                <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-500 shadow-sm font-black text-xs uppercase">
                                   {p.method.slice(0, 3)}
                                </div>
                                <div>
                                   <p className="text-lg font-black text-slate-900 dark:text-white">{formatPHP(p.amount)}</p>
                                   <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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

           {/* Workspace Intelligence */}
           <div className="lg:col-span-4 space-y-12">
              <section className="rounded-[3rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 blur-[80px]" />
                 <div className="relative z-10 space-y-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Remaining Ledger Balance</p>
                       <p className="text-5xl font-black text-white tracking-tighter">{formatPHP(invoice.balance)}</p>
                    </div>
                    <div className="space-y-4 pt-8 border-t border-white/5">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Collection Progress</span>
                          <span className="text-white">{Math.round((Number(invoice.paid) / Number(invoice.total)) * 100)}%</span>
                       </div>
                       <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(Number(invoice.paid) / Number(invoice.total)) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-emerald-500" 
                          />
                       </div>
                    </div>
                    {isPaid ? (
                       <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                          <CheckCircle2 size={32} />
                          <div>
                             <p className="text-sm font-black uppercase tracking-widest">Settled in Full</p>
                             <p className="text-[10px] font-bold opacity-80">{invoice.paidAt ? fmtDateTime(invoice.paidAt) : "Completed"}</p>
                          </div>
                       </div>
                    ) : (
                       <button
                         disabled={busyGcash || balance <= 0}
                         onClick={onGcashClick}
                         className="w-full flex flex-col items-center justify-center gap-2 p-8 rounded-[2.5rem] bg-white text-slate-900 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
                       >
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-20 bg-[#007DFE] flex items-center justify-center rounded-lg text-white font-black italic text-[10px]">GCash</div>
                             <div className="h-10 w-20 bg-[#D9FD0D] flex items-center justify-center rounded-lg text-slate-900 font-black italic text-[10px]">Maya</div>
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{t("pages.invoice.openPaymentGateway")}</p>
                       </button>
                    )}
                 </div>
              </section>

              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden relative">
                 <div className="absolute top-0 right-0 h-32 w-32 bg-sky-500/5 blur-3xl pointer-events-none" />
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                       <Shield size={20} className="text-sky-500" />
                       <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">HMO Integration</h2>
                    </div>
                    <button
                      onClick={() => setClaimOpen(!claimOpen)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${claimOpen ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-sky-500 hover:text-white'}`}
                    >
                      <Plus size={20} className={claimOpen ? "rotate-45" : ""} />
                    </button>
                 </div>

                 <AnimatePresence>
                    {claimOpen ? (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="space-y-6 overflow-hidden"
                       >
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Provider Authority</label>
                             <select
                               value={claimProviderId}
                               onChange={(e) => setClaimProviderId(e.target.value)}
                               className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all"
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

                          <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Treatment Mapping</p>
                             <div className="space-y-2">
                                {invoice.treatments.map((row) => (
                                   <label key={row.id} className="flex items-center justify-between group cursor-pointer">
                                      <div className="flex items-center gap-3">
                                         <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${claimSelectedLineIds.includes(row.id) ? 'bg-sky-500 border-sky-500' : 'border-slate-200 dark:border-slate-700'}`}>
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
                                         <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase truncate max-w-[120px]">{row.procedure}</span>
                                      </div>
                                      <span className="text-[11px] font-black text-slate-400">{formatPHP(row.lineTotal)}</span>
                                   </label>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Patient Copay</label>
                                <input
                                  type="number"
                                  value={claimCopay}
                                  onChange={(e) => setClaimCopay(Number(e.target.value) || 0)}
                                  className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all"
                                />
                             </div>
                             <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/50 flex flex-col justify-center">
                                <p className="text-[8px] font-black text-sky-600 uppercase tracking-widest">Coverage Estimate</p>
                                <p className="text-xl font-black text-sky-700 dark:text-sky-400 tracking-tighter">{formatPHP(claimCoverage)}</p>
                             </div>
                          </div>

                          <button
                            disabled={claimBusy}
                            onClick={() => void submitClaim()}
                            className="w-full h-16 rounded-2xl bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                          >
                             {claimBusy ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                             {t("pages.invoice.submitClinicalClaim")}
                          </button>
                       </motion.div>
                    ) : (
                       <p className="text-xs font-medium text-slate-400 italic">Initialize a new HMO claim sequence to route clinical charges to affiliated insurance providers.</p>
                    )}
                 </AnimatePresence>
              </section>

              {invoice.notes && (
                 <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Internal Notes</p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{invoice.notes}"</p>
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
            <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between ring-1 ring-white/10 backdrop-blur-xl">
               <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                     <Clock size={24} className="animate-pulse" />
                  </div>
                  <div>
                     <p className="text-sm font-black uppercase tracking-widest">Waiting for Gateway...</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">{paymongoUrl}</p>
                  </div>
               </div>
               {paymongoMock && (
                  <button onClick={onMockPaid} className="px-6 py-3 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Simulate Success</button>
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

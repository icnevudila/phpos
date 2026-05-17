import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  FileText, 
  CreditCard, 
  Paperclip, 
  Save,
  Activity,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Shield,
  ExternalLink,
  Download,
  Trash2,
  Upload
} from "lucide-react";

import { HMO_CLAIM_STATUS_I18N_KEY } from "../constants/hmoClaimStatusLabels";
import { hmoClaimStatusActionTargets } from "../constants/hmoClaimStatusTransitions";
import { useAuth } from "../hooks/useAuth";
import { downloadAuthedFile } from "../services/api";
import {
  type HmoClaimAttachmentKind,
  type HmoClaimDetail,
  type HmoClaimStatus,
  deleteHmoClaimAttachment,
  fetchHmoClaim,
  updateHmoClaim,
  uploadHmoClaimAttachment,
} from "../services/hmo";
import { formatPHP } from "../types/invoice";

const ATTACHMENT_KIND_I18N: Record<HmoClaimAttachmentKind, string> = {
  LOA: "pages.hmoClaimDetail.kindLoa",
  PREAUTH: "pages.hmoClaimDetail.kindPreauth",
  OTHER: "pages.hmoClaimDetail.kindOther",
};

const STATUS_STYLE: Record<string, { color: string, bg: string, icon: any }> = {
  DRAFT: { color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", icon: FileText },
  SUBMITTED: { color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/20", icon: Clock },
  APPROVED: { color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle2 },
  PARTIAL_APPROVED: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20", icon: AlertCircle },
  REJECTED: { color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/20", icon: XCircle },
  PAID: { color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: Shield },
};

export function HmoClaimDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id = "" } = useParams();
  const [claim, setClaim] = useState<HmoClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approvedDraft, setApprovedDraft] = useState("");
  const [copayDraft, setCopayDraft] = useState("");
  const [externalRefDraft, setExternalRefDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [uploadKind, setUploadKind] = useState<HmoClaimAttachmentKind>("LOA");
  // uploadingAttach removed (redundant with saving?)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageAttachments = user?.user_metadata?.role === "ADMIN" || user?.user_metadata?.role === "DENTIST";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await fetchHmoClaim(id);
      setClaim({ ...c, attachments: c.attachments ?? [] });
      setApprovedDraft(c.approvedAmount ?? "");
      setCopayDraft(c.patientCopay);
      setExternalRefDraft(c.externalRef ?? "");
      setNotesDraft(c.notes ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => { void load(); }, [load]);

  const saveFields = async () => {
    if (!claim) return;
    setSaving(true);
    try {
      const approved = approvedDraft.trim() === "" ? null : Math.max(0, Number(approvedDraft));
      if (approved !== null && Number.isNaN(approved)) {
        toast.error(t("pages.hmoClaimDetail.invalidNumber"));
        return;
      }
      const copay = Math.max(0, Number(copayDraft));
      if (Number.isNaN(copay)) {
        toast.error(t("pages.hmoClaimDetail.invalidNumber"));
        return;
      }
      const updated = await updateHmoClaim(claim.id, {
        approvedAmount: approved,
        patientCopay: copay,
        externalRef: externalRefDraft.trim() || null,
        notes: notesDraft.trim() || null,
      });
      setClaim({ ...updated, attachments: updated.attachments ?? claim.attachments ?? [] });
      toast.success(t("pages.hmoClaimDetail.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (next: HmoClaimStatus) => {
    if (!claim) return;
    setSaving(true);
    try {
      const updated = await updateHmoClaim(claim.id, { status: next });
      setClaim({ ...updated, attachments: updated.attachments ?? claim.attachments ?? [] });
      setApprovedDraft(updated.approvedAmount ?? "");
      setCopayDraft(updated.patientCopay);
      setExternalRefDraft(updated.externalRef ?? "");
      setNotesDraft(updated.notes ?? "");
      toast.success(t("pages.hmoClaimDetail.statusUpdated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.statusFailed"));
    } finally {
      setSaving(false);
    }
  };

  const onAttachmentFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file || !claim) return;
    try {
      const created = await uploadHmoClaimAttachment(claim.id, file, uploadKind);
      setClaim(prev => prev ? { ...prev, attachments: [created, ...(prev.attachments ?? [])] } : prev);
      toast.success(t("pages.hmoClaimDetail.attachmentUploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.uploadFailed"));
    }
  };

  const onDownloadAttachment = async (attachId: string, fileName: string) => {
    try {
      await downloadAuthedFile(`/hmo-claims/${id}/attachments/${attachId}/download`, fileName);
      // downloadAuthedFile already handles the download link creation
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.downloadFailed"));
    }
  };

  const onDeleteAttachment = async (attachId: string) => {
    if (!confirm(t("pages.hmoClaimDetail.deleteAttachmentConfirm"))) return;
    try {
      await deleteHmoClaimAttachment(id, attachId);
      setClaim(prev => prev ? { ...prev, attachments: (prev.attachments ?? []).filter(a => a.id !== attachId) } : prev);
      toast.success(t("pages.hmoClaimDetail.attachmentDeleted"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.deleteFailed"));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Activity className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Claim Data...</p>
      </div>
    );
  }

  if (!claim) return <></>;

  const style = STATUS_STYLE[claim.status] || STATUS_STYLE.DRAFT;
  const StatusIcon = style.icon;

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Navigation */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-center justify-between">
           <Link 
             to="/hmo-claims" 
             className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-all"
           >
             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 group-hover:scale-110 transition-all">
                <ArrowLeft size={20} />
             </div>
             {t("pages.hmoClaimDetail.backList")}
           </Link>

           <div className="flex items-center gap-4">
              <Link
                to={`/invoices/${claim.invoiceId}`}
                className="flex h-14 items-center gap-3 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <ExternalLink size={16} />
                {t("pages.hmoClaimDetail.openInvoice")}
              </Link>
           </div>
        </header>

        {/* Claim Hero */}
        <section className="relative rounded-[3.5rem] bg-white dark:bg-slate-900 p-10 lg:p-16 shadow-2xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
           <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className={`flex h-10 items-center gap-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.color}`}>
                       <StatusIcon size={14} />
                       {t(HMO_CLAIM_STATUS_I18N_KEY[claim.status])}
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Case ID</span>
                 </div>
                 <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white">
                    {claim.claimNumber}
                 </h1>
                 <div className="flex flex-col gap-2">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                       {claim.patient.firstName} {claim.patient.lastName}
                    </p>
                    <p className="text-sm font-black uppercase tracking-widest text-emerald-500">
                       {claim.provider.name} • {claim.provider.code}
                    </p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lines</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{claim.lineCount}</p>
                 </div>
                 <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Requested</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{formatPHP(claim.requestedAmount)}</p>
                 </div>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           {/* Financials & Status */}
           <div className="lg:col-span-7 space-y-12">
              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="flex items-center gap-4 mb-12">
                    <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/30 flex items-center justify-center">
                       <CreditCard size={24} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Reconciliation</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">{t("pages.hmoClaimDetail.approved")}</label>
                       <input 
                         value={approvedDraft}
                         onChange={e => setApprovedDraft(e.target.value)}
                         placeholder="0.00"
                         className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Patient Copay (PHP)</label>
                       <input 
                         value={copayDraft}
                         onChange={e => setCopayDraft(e.target.value)}
                         className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all" 
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Provider Reference</label>
                       <input 
                         value={externalRefDraft}
                         onChange={e => setExternalRefDraft(e.target.value)}
                         className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all" 
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2 block">Internal Audit Notes</label>
                       <textarea 
                         value={notesDraft}
                         onChange={e => setNotesDraft(e.target.value)}
                         className="h-32 w-full rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 px-8 py-5 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                       />
                    </div>
                 </div>

                 <button
                   disabled={saving}
                   onClick={saveFields}
                   className="mt-10 w-full h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                   {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                   {saving ? t("pages.hmoClaimDetail.commitSaving") : t("pages.hmoClaimDetail.commitCta")}
                 </button>
              </section>

              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="h-12 w-12 rounded-2xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 flex items-center justify-center">
                       <Activity size={24} />
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Workflow transition</h2>
                 </div>
                 
                 <div className="flex flex-wrap gap-4">
                    {hmoClaimStatusActionTargets(claim.status).map((st) => (
                      <button
                        key={st}
                        disabled={saving}
                        onClick={() => void setStatus(st)}
                        className="h-16 px-10 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 hover:bg-violet-500 hover:text-white hover:border-violet-500 transition-all disabled:opacity-40"
                      >
                         {st}
                      </button>
                    ))}
                    {hmoClaimStatusActionTargets(claim.status).length === 0 && (
                       <p className="text-xs font-bold text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl w-full">
                          Workflow has reached a terminal state for this claim.
                       </p>
                    )}
                 </div>
              </section>
           </div>

           {/* Right: Attachments & Treatment Lines */}
           <div className="lg:col-span-5 space-y-12">
              <section className="rounded-[3.5rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden group border border-slate-800">
                 <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 blur-[80px]" />
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-3">
                       <Paperclip size={20} className="text-sky-400" />
                       <h2 className="text-xl font-black tracking-tight text-white">Attachments</h2>
                    </div>
                    {canManageAttachments && (
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all shadow-xl"
                       >
                          <Upload size={20} />
                       </button>
                    )}
                 </div>

                 <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    onChange={onAttachmentFileChange} 
                 />

                 <div className="space-y-4 relative z-10">
                    <div className="grid grid-cols-3 gap-2 mb-6">
                       {["LOA", "PREAUTH", "OTHER"].map(k => (
                          <button
                            key={k}
                            onClick={() => setUploadKind(k as any)}
                            className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                               uploadKind === k ? "bg-sky-500 text-white shadow-lg" : "bg-slate-800 text-slate-500"
                            }`}
                          >
                             {k}
                          </button>
                       ))}
                    </div>

                    <AnimatePresence mode="popLayout">
                       {(claim.attachments ?? []).length === 0 ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center border-2 border-dashed border-slate-800 rounded-[2rem]">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Repository Empty</p>
                          </motion.div>
                       ) : (
                          claim.attachments.map((att, idx) => (
                             <motion.div 
                               key={att.id} 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: idx * 0.05 }}
                               className="flex items-center justify-between p-6 bg-slate-800/50 rounded-2xl border border-slate-800 group/item"
                             >
                                <div className="flex items-center gap-4">
                                   <div className="h-12 w-12 rounded-xl bg-slate-700 flex items-center justify-center text-sky-400 shadow-lg">
                                      <FileText size={22} />
                                   </div>
                                   <div className="space-y-0.5">
                                      <p className="text-xs font-black text-white uppercase tracking-tight truncate max-w-[120px]">{att.fileName}</p>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t(ATTACHMENT_KIND_I18N[att.kind])}</p>
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                      onClick={() => void onDownloadAttachment(att.id, att.fileName)}
                                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-700 text-slate-300 hover:bg-white hover:text-slate-900 transition-all"
                                   >
                                      <Download size={18} />
                                   </button>
                                   {canManageAttachments && (
                                      <button 
                                         onClick={() => void onDeleteAttachment(att.id)}
                                         className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-950/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-900/20"
                                      >
                                         <Trash2 size={18} />
                                      </button>
                                   )}
                                </div>
                             </motion.div>
                          ))
                       )}
                    </AnimatePresence>
                 </div>
              </section>

              <section className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                 <div className="flex items-center gap-3 mb-10">
                    <Shield size={18} className="text-slate-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Diagnostic Ledger</h2>
                 </div>
                 <div className="space-y-8">
                    {claim.lines.map((ln) => (
                       <div key={ln.id} className="flex items-start justify-between">
                          <div className="space-y-2">
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{ln.treatment.procedure}</p>
                             <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                   {ln.treatment.toothIds.join(", ") || t("pages.common.general")}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                   Qty {ln.treatment.quantity}
                                </span>
                             </div>
                          </div>
                          <p className="text-lg font-black text-slate-900 dark:text-white">
                             {formatPHP(ln.lineAmount)}
                          </p>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
}

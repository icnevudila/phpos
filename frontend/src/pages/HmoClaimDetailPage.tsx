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
  DRAFT: { color: "text-slate-500", bg: "bg-slate-100", icon: FileText },
  SUBMITTED: { color: "text-sky-500", bg: "bg-sky-50", icon: Clock },
  APPROVED: { color: "text-teal-500", bg: "bg-teal-50", icon: CheckCircle2 },
  PARTIAL_APPROVED: { color: "text-amber-500", bg: "bg-amber-50", icon: AlertCircle },
  REJECTED: { color: "text-rose-500", bg: "bg-rose-50", icon: XCircle },
  PAID: { color: "text-indigo-500", bg: "bg-indigo-50", icon: Shield },
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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (!claim) return <></>;

  const style = STATUS_STYLE[claim.status] || STATUS_STYLE.DRAFT;
  const StatusIcon = style.icon;

  return (
    <div className="min-h-screen w-full pb-24 bg-[#f5f7f9]">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10 space-y-8 pt-8">
        
        {/* Navigation */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
           <Link 
             to="/hmo-claims" 
             className="group flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-teal-500 transition-all"
           >
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-all">
                <ArrowLeft size={18} />
             </div>
             {t("pages.hmoClaimDetail.backList")}
           </Link>

           <div className="flex items-center gap-3">
              <Link
                to={`/invoices/${claim.invoiceId}`}
                className="btn-primary flex items-center gap-2"
              >
                <ExternalLink size={14} />
                {t("pages.hmoClaimDetail.openInvoice")}
              </Link>
           </div>
        </header>

        {/* Claim Hero */}
        <section className="card overflow-hidden">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className={`flex h-9 items-center gap-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-widest ${style.bg} ${style.color}`}>
                       <StatusIcon size={14} />
                       {t(HMO_CLAIM_STATUS_I18N_KEY[claim.status])}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">Case ID</span>
                 </div>
                 <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                    {claim.claimNumber}
                 </h1>
                 <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-slate-800">
                       {claim.patient.firstName} {claim.patient.lastName}
                    </p>
                    <p className="text-sm font-semibold uppercase tracking-widest text-teal-500">
                       {claim.provider.name} • {claim.provider.code}
                    </p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="stat-card">
                    <p className="stat-card-label">Lines</p>
                    <p className="stat-card-value">{claim.lineCount}</p>
                 </div>
                 <div className="stat-card">
                    <p className="stat-card-label">Requested</p>
                    <p className="stat-card-value">{formatPHP(claim.requestedAmount)}</p>
                 </div>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Financials & Status */}
           <div className="lg:col-span-7 space-y-6">
              <section className="card">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                       <CreditCard size={20} />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800">Reconciliation</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">{t("pages.hmoClaimDetail.approved")}</label>
                       <input 
                         value={approvedDraft}
                         onChange={e => setApprovedDraft(e.target.value)}
                         placeholder="0.00"
                         className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Patient Copay (PHP)</label>
                       <input 
                         value={copayDraft}
                         onChange={e => setCopayDraft(e.target.value)}
                         className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all" 
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Provider Reference</label>
                       <input 
                         value={externalRefDraft}
                         onChange={e => setExternalRefDraft(e.target.value)}
                         className="h-12 w-full rounded-xl bg-slate-50 px-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all" 
                       />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 ml-2 mb-1 block">Internal Audit Notes</label>
                       <textarea 
                         value={notesDraft}
                         onChange={e => setNotesDraft(e.target.value)}
                         className="h-28 w-full rounded-2xl bg-slate-50 px-5 py-4 text-sm font-medium outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                       />
                    </div>
                 </div>

                 <button
                   disabled={saving}
                   onClick={saveFields}
                   className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
                 >
                   {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                   {saving ? t("pages.hmoClaimDetail.commitSaving") : t("pages.hmoClaimDetail.commitCta")}
                 </button>
              </section>

              <section className="card">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                       <Activity size={20} />
                    </div>
                    <h2 className="text-base font-semibold text-slate-800">Workflow Transition</h2>
                 </div>
                 
                 <div className="flex flex-wrap gap-3">
                    {hmoClaimStatusActionTargets(claim.status).map((st) => (
                      <button
                        key={st}
                        disabled={saving}
                        onClick={() => void setStatus(st)}
                        className="h-12 px-6 rounded-xl bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-widest border border-slate-100 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all disabled:opacity-40"
                      >
                         {st}
                      </button>
                    ))}
                    {hmoClaimStatusActionTargets(claim.status).length === 0 && (
                       <p className="text-xs font-medium text-slate-400 italic bg-slate-50 p-4 rounded-xl w-full">
                          Workflow has reached a terminal state for this claim.
                       </p>
                    )}
                 </div>
              </section>
           </div>

           {/* Right: Attachments & Treatment Lines */}
           <div className="lg:col-span-5 space-y-6">
              {/* Attachments Panel */}
              <section className="card bg-slate-800 relative overflow-hidden">
                 <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/10 blur-[80px]" />
                 <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                       <Paperclip size={18} className="text-sky-400" />
                       <h2 className="text-base font-semibold text-white">Attachments</h2>
                    </div>
                    {canManageAttachments && (
                       <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                       >
                          <Upload size={16} />
                       </button>
                    )}
                 </div>

                 <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="hidden" 
                    onChange={onAttachmentFileChange} 
                 />

                 <div className="space-y-3 relative z-10">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                       {["LOA", "PREAUTH", "OTHER"].map(k => (
                          <button
                            key={k}
                            onClick={() => setUploadKind(k as any)}
                            className={`py-1.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all ${ uploadKind === k ? "bg-teal-500 text-white shadow-sm" : "bg-slate-700 text-slate-400" }`}
                          >
                             {k}
                          </button>
                       ))}
                    </div>

                    <AnimatePresence mode="popLayout">
                       {(claim.attachments ?? []).length === 0 ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center border-2 border-dashed border-slate-700 rounded-2xl">
                             <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Repository Empty</p>
                          </motion.div>
                       ) : (
                          claim.attachments.map((att, idx) => (
                             <motion.div 
                               key={att.id} 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: idx * 0.05 }}
                               className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-slate-700"
                             >
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-slate-600 flex items-center justify-center text-sky-400">
                                      <FileText size={18} />
                                   </div>
                                   <div className="space-y-0.5">
                                      <p className="text-xs font-semibold text-white uppercase tracking-tight truncate max-w-[120px]">{att.fileName}</p>
                                      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{t(ATTACHMENT_KIND_I18N[att.kind])}</p>
                                   </div>
                                </div>
                                <div className="flex gap-2">
                                   <button 
                                      onClick={() => void onDownloadAttachment(att.id, att.fileName)}
                                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-600 text-slate-300 hover:bg-white hover:text-slate-900 transition-all"
                                   >
                                      <Download size={16} />
                                   </button>
                                   {canManageAttachments && (
                                      <button 
                                         onClick={() => void onDeleteAttachment(att.id)}
                                         className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-950/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                      >
                                         <Trash2 size={16} />
                                      </button>
                                   )}
                                </div>
                             </motion.div>
                          ))
                       )}
                    </AnimatePresence>
                 </div>
              </section>

              {/* Diagnostic Ledger */}
              <section className="card">
                 <div className="flex items-center gap-2 mb-6">
                    <Shield size={16} className="text-slate-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Diagnostic Ledger</h2>
                 </div>
                 <div className="space-y-6">
                    {claim.lines.map((ln) => (
                       <div key={ln.id} className="flex items-start justify-between">
                          <div className="space-y-2">
                             <p className="text-sm font-semibold text-slate-800 uppercase">{ln.treatment.procedure}</p>
                             <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-lg bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                   {ln.treatment.toothIds.join(", ") || t("pages.common.general")}
                                </span>
                                <span className="text-xs font-medium text-slate-300 uppercase tracking-widest">
                                   Qty {ln.treatment.quantity}
                                </span>
                             </div>
                          </div>
                          <p className="text-base font-bold text-slate-800">
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

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
  DRAFT: { color: "text-brand-muted", bg: "bg-brand-surface-muted", icon: FileText },
  SUBMITTED: { color: "text-brand-info", bg: "bg-brand-info-soft", icon: Clock },
  APPROVED: { color: "text-brand-primary", bg: "bg-brand-primary-soft", icon: CheckCircle2 },
  PARTIAL_APPROVED: { color: "text-brand-warning", bg: "bg-brand-warning-soft", icon: AlertCircle },
  REJECTED: { color: "text-brand-danger", bg: "bg-brand-danger-soft", icon: XCircle },
  PAID: { color: "text-brand-success", bg: "bg-brand-success-soft", icon: Shield },
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
    <div className="page-container space-y-8">
      {/* Navigation */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
         <Link 
           to="/hmo-claims" 
           className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors"
         >
           <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-surface shadow-sm border border-brand-border group-hover:scale-110 transition-transform">
              <ArrowLeft size={18} />
           </div>
           {t("pages.hmoClaimDetail.backList")}
         </Link>

         <div className="flex items-center gap-3">
            <Link
              to={`/invoices/${claim.invoiceId}`}
              className="btn-primary flex items-center gap-2 h-10"
            >
              <ExternalLink size={14} />
              {t("pages.hmoClaimDetail.openInvoice")}
            </Link>
         </div>
      </header>

      {/* Claim Hero */}
      <section className="card overflow-hidden border border-brand-border">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className={`flex h-9 items-center gap-2 px-3 rounded-[var(--radius-sm)] text-xs font-bold uppercase tracking-widest ${style.bg} ${style.color}`}>
                     <StatusIcon size={14} />
                     {t(HMO_CLAIM_STATUS_I18N_KEY[claim.status])}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Case ID</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-brand-text">
                  {claim.claimNumber}
               </h1>
               <div className="flex flex-col gap-1">
                  <p className="text-lg font-bold text-brand-text">
                     {claim.patient.firstName} {claim.patient.lastName}
                  </p>
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-primary">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Financials & Status */}
         <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <section className="card">
               <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-brand-info-soft text-brand-info flex items-center justify-center">
                     <CreditCard size={20} />
                  </div>
                  <h2 className="text-base font-bold text-brand-text">Reconciliation</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1 block">{t("pages.hmoClaimDetail.approved")}</label>
                     <input 
                       value={approvedDraft}
                       onChange={e => setApprovedDraft(e.target.value)}
                       placeholder="0.00"
                       className="h-10 w-full rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border px-3 text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary transition-shadow" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1 block">Patient Copay (PHP)</label>
                     <input 
                       value={copayDraft}
                       onChange={e => setCopayDraft(e.target.value)}
                       className="h-10 w-full rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border px-3 text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary transition-shadow" 
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1 block">Provider Reference</label>
                     <input 
                       value={externalRefDraft}
                       onChange={e => setExternalRefDraft(e.target.value)}
                       className="h-10 w-full rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border px-3 text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary transition-shadow" 
                     />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1 block">Internal Audit Notes</label>
                     <textarea 
                       value={notesDraft}
                       onChange={e => setNotesDraft(e.target.value)}
                       className="h-28 w-full rounded-[var(--radius-md)] bg-brand-surface border border-brand-border px-4 py-3 text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary transition-shadow resize-none"
                     />
                  </div>
               </div>

               <button
                 disabled={saving}
                 onClick={saveFields}
                 className="btn-primary mt-6 w-full flex items-center justify-center gap-2 h-11"
               >
                 {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                 {saving ? t("pages.hmoClaimDetail.commitSaving") : t("pages.hmoClaimDetail.commitCta")}
               </button>
            </section>

            <section className="card">
               <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-[var(--radius-sm)] bg-brand-primary-soft text-brand-primary flex items-center justify-center">
                     <Activity size={20} />
                  </div>
                  <h2 className="text-base font-bold text-brand-text">Workflow Transition</h2>
               </div>
               
               <div className="flex flex-wrap gap-3">
                  {hmoClaimStatusActionTargets(claim.status).map((st) => (
                    <button
                      key={st}
                      disabled={saving}
                      onClick={() => void setStatus(st)}
                      className="h-10 px-5 rounded-[var(--radius-sm)] bg-brand-surface-soft text-brand-text text-xs font-bold uppercase tracking-widest border border-brand-border hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors disabled:opacity-40"
                    >
                       {st}
                    </button>
                  ))}
                  {hmoClaimStatusActionTargets(claim.status).length === 0 && (
                     <p className="text-xs font-bold text-brand-muted italic bg-brand-surface-soft p-4 rounded-[var(--radius-md)] w-full border border-brand-border">
                        Workflow has reached a terminal state for this claim.
                     </p>
                  )}
               </div>
            </section>
         </div>         {/* Right: Attachments & Treatment Lines */}
         <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Attachments Panel */}
            <section className="rounded-[var(--radius-lg)] bg-brand-navy relative overflow-hidden shadow-popover p-6">
               <div className="absolute top-0 right-0 h-40 w-40 bg-brand-primary/20 blur-[80px]" />
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                     <Paperclip size={18} className="text-brand-info" />
                     <h2 className="text-base font-bold text-white">Attachments</h2>
                  </div>
                  {canManageAttachments && (
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-white/10 text-white hover:bg-white/20 transition-colors"
                     >
                        <Upload size={14} />
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
                  <div className="grid grid-cols-3 gap-2">
                     {["LOA", "PREAUTH", "OTHER"].map(k => (
                        <button
                          key={k}
                          onClick={() => setUploadKind(k as any)}
                          className={`py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-widest transition-colors ${ uploadKind === k ? "bg-brand-primary text-white shadow-sm" : "bg-white/5 text-white/60 hover:bg-white/10" }`}
                        >
                           {k}
                        </button>
                     ))}
                  </div>

                  <AnimatePresence mode="popLayout">
                     {(claim.attachments ?? []).length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center border border-dashed border-white/20 rounded-[var(--radius-md)] bg-white/5">
                           <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Repository Empty</p>
                        </motion.div>
                     ) : (
                        <div className="space-y-2">
                        {claim.attachments.map((att, idx) => (
                           <motion.div 
                             key={att.id} 
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.05 }}
                             className="flex items-center justify-between p-3 bg-white/5 rounded-[var(--radius-sm)] border border-white/10"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-white/10 flex items-center justify-center text-brand-info">
                                    <FileText size={14} />
                                 </div>
                                 <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[120px]">{att.fileName}</p>
                                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{t(ATTACHMENT_KIND_I18N[att.kind])}</p>
                                 </div>
                              </div>
                              <div className="flex gap-1.5">
                                 <button 
                                    onClick={() => void onDownloadAttachment(att.id, att.fileName)}
                                    className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-white/10 text-white/70 hover:bg-white hover:text-brand-navy transition-colors"
                                 >
                                    <Download size={14} />
                                 </button>
                                 {canManageAttachments && (
                                    <button 
                                       onClick={() => void onDeleteAttachment(att.id)}
                                       className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] bg-brand-danger/20 text-brand-danger hover:bg-brand-danger hover:text-white transition-colors"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 )}
                              </div>
                           </motion.div>
                        ))}
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </section>

            {/* Diagnostic Ledger */}
            <section className="card">
               <div className="flex items-center gap-2 mb-6">
                  <Shield size={16} className="text-brand-muted" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Diagnostic Ledger</h2>
               </div>
               <div className="space-y-5">
                  {claim.lines.map((ln) => (
                     <div key={ln.id} className="flex items-start justify-between pb-4 border-b border-brand-border last:border-0 last:pb-0">
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-brand-text uppercase leading-tight">{ln.treatment.procedure}</p>
                           <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-brand-surface-muted text-[10px] font-bold text-brand-text-soft uppercase tracking-widest border border-brand-border">
                                 {ln.treatment.toothIds.join(", ") || t("pages.common.general")}
                              </span>
                              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                                 Qty {ln.treatment.quantity}
                              </span>
                           </div>
                        </div>
                        <p className="text-sm font-bold text-brand-text">
                           {formatPHP(ln.lineAmount)}
                        </p>
                     </div>
                  ))}
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}

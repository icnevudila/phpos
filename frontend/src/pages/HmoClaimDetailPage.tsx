import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

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

export function HmoClaimDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const { getUser } = useAuth();
  const { id = "" } = useParams();
  const [claim, setClaim] = useState<HmoClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approvedDraft, setApprovedDraft] = useState("");
  const [copayDraft, setCopayDraft] = useState("");
  const [externalRefDraft, setExternalRefDraft] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const [uploadKind, setUploadKind] = useState<HmoClaimAttachmentKind>("LOA");
  const [uploadingAttach, setUploadingAttach] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageAttachments =
    getUser()?.role === "ADMIN" || getUser()?.role === "DENTIST";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const c = await fetchHmoClaim(id);
      const withAttachments: HmoClaimDetail = { ...c, attachments: c.attachments ?? [] };
      setClaim(withAttachments);
      setApprovedDraft(c.approvedAmount ?? "");
      setCopayDraft(c.patientCopay);
      setExternalRefDraft(c.externalRef ?? "");
      setNotesDraft(c.notes ?? "");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.loadFailed"));
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveFields(): Promise<void> {
    if (!claim) return;
    setSaving(true);
    try {
      const approved =
        approvedDraft.trim() === "" ? null : Math.max(0, Number(approvedDraft));
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
  }

  async function setStatus(next: HmoClaimStatus): Promise<void> {
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
  }

  async function onAttachmentFileChange(ev: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file || !claim) return;
    setUploadingAttach(true);
    try {
      const created = await uploadHmoClaimAttachment(claim.id, file, uploadKind);
      setClaim((prev) =>
        prev ? { ...prev, attachments: [created, ...(prev.attachments ?? [])] } : prev,
      );
      toast.success(t("pages.hmoClaimDetail.attachmentUploaded"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.uploadFailed"));
    } finally {
      setUploadingAttach(false);
    }
  }

  async function onDownloadAttachment(attachmentId: string, fileName: string): Promise<void> {
    if (!claim) return;
    try {
      await downloadAuthedFile(
        `/hmo/claims/${claim.id}/attachments/${attachmentId}/download`,
        fileName,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.downloadFailed"));
    }
  }

  async function onDeleteAttachment(attachmentId: string): Promise<void> {
    if (!claim) return;
    setSaving(true);
    try {
      await deleteHmoClaimAttachment(claim.id, attachmentId);
      setClaim((prev) =>
        prev
          ? { ...prev, attachments: (prev.attachments ?? []).filter((a) => a.id !== attachmentId) }
          : prev,
      );
      toast.success(t("pages.hmoClaimDetail.attachmentRemoved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.hmoClaimDetail.deleteFailed"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-center text-sm text-slate-500">{t("pages.hmoClaimDetail.loading")}</p>;
  }
  if (!claim) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">{t("pages.hmoClaimDetail.notFound")}</p>
        <Link to="/hmo-claims" className="mt-3 inline-block text-sm font-semibold text-emerald-700">
          {t("pages.hmoClaimDetail.backList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/hmo-claims" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← {t("pages.hmoClaimDetail.backList")}
        </Link>
        <Link
          to={`/invoices/${claim.invoiceId}`}
          className="text-sm font-semibold text-slate-700 hover:underline"
        >
          {t("pages.hmoClaimDetail.openInvoice")}
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
          {t("pages.hmoClaimDetail.eyebrow")}
        </p>
        <h1 className="mt-1 font-mono text-2xl font-bold text-slate-900">{claim.claimNumber}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {claim.patient.firstName} {claim.patient.lastName} · {claim.provider.name} ({claim.provider.code})
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {t("pages.hmoClaimDetail.status")}:{" "}
          <span className="font-semibold">{t(HMO_CLAIM_STATUS_I18N_KEY[claim.status])}</span>
          {" · "}
          {t("pages.hmoClaimDetail.lineCountLabel", { count: claim.lineCount })}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          {t("pages.hmoClaimDetail.sectionAmounts")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">
              {t("pages.hmoClaimDetail.requested")}
            </label>
            <p className="mt-1 text-lg font-semibold text-slate-900">{formatPHP(claim.requestedAmount)}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">
              {t("pages.hmoClaimDetail.approved")}
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={approvedDraft}
              onChange={(e) => setApprovedDraft(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">
              {t("pages.hmoClaimDetail.copay")}
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={copayDraft}
              onChange={(e) => setCopayDraft(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500">
              {t("pages.hmoClaimDetail.externalRef")}
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={externalRefDraft}
              onChange={(e) => setExternalRefDraft(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase text-slate-500">
            {t("pages.hmoClaimDetail.notes")}
          </label>
          <textarea
            className="mt-1 min-h-[88px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveFields()}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? t("common.saving") : t("common.save")}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          {t("pages.hmoClaimDetail.sectionAttachments")}
        </h2>
        {canManageAttachments ? (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500">
                {t("pages.hmoClaimDetail.uploadKind")}
              </label>
              <select
                className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={uploadKind}
                onChange={(e) => setUploadKind(e.target.value as HmoClaimAttachmentKind)}
              >
                <option value="LOA">{t("pages.hmoClaimDetail.kindLoa")}</option>
                <option value="PREAUTH">{t("pages.hmoClaimDetail.kindPreauth")}</option>
                <option value="OTHER">{t("pages.hmoClaimDetail.kindOther")}</option>
              </select>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => void onAttachmentFileChange(e)}
            />
            <button
              type="button"
              disabled={uploadingAttach}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-50"
            >
              {uploadingAttach ? t("pages.hmoClaimDetail.uploading") : t("pages.hmoClaimDetail.uploadPick")}
            </button>
            <p className="w-full text-xs text-slate-500">{t("pages.hmoClaimDetail.uploadHint")}</p>
          </div>
        ) : null}
        <ul className="mt-4 divide-y divide-slate-100">
          {(claim.attachments ?? []).length === 0 ? (
            <li className="py-3 text-sm text-slate-500">{t("pages.hmoClaimDetail.attachmentsEmpty")}</li>
          ) : (
            (claim.attachments ?? []).map((att) => (
              <li key={att.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{att.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {t(ATTACHMENT_KIND_I18N[att.kind])} ·{" "}
                    {t("pages.hmoClaimDetail.sizeKb", { n: (att.sizeBytes / 1024).toFixed(1) })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50"
                    onClick={() => void onDownloadAttachment(att.id, att.fileName)}
                  >
                    {t("pages.hmoClaimDetail.download")}
                  </button>
                  {canManageAttachments ? (
                    <button
                      type="button"
                      disabled={saving}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      onClick={() => void onDeleteAttachment(att.id)}
                    >
                      {t("pages.hmoClaimDetail.delete")}
                    </button>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          {t("pages.hmoClaimDetail.sectionStatus")}
        </h2>
        {hmoClaimStatusActionTargets(claim.status).length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">{t("pages.hmoClaimDetail.statusFinal")}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {hmoClaimStatusActionTargets(claim.status).map((st) => (
              <button
                key={st}
                type="button"
                disabled={saving}
                onClick={() => void setStatus(st)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                {st === "SUBMITTED" && claim.status === "REJECTED"
                  ? t("pages.hmoClaims.actionResubmit")
                  : st === "DRAFT"
                    ? t("pages.hmoClaims.actionWithdraw")
                    : t(HMO_CLAIM_STATUS_I18N_KEY[st])}
              </button>
            ))}
          </div>
        )}
      </section>

      {claim.lines.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            {t("pages.hmoClaimDetail.sectionLines")}
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {claim.lines.map((ln) => (
              <li key={ln.id} className="py-3 text-sm">
                <p className="font-semibold text-slate-900">{ln.treatment.procedure}</p>
                <p className="text-xs text-slate-500">
                  {ln.treatment.toothIds.length
                    ? ln.treatment.toothIds.join(", ")
                    : t("pages.hmoClaimDetail.dash")}{" "}
                  · {t("pages.hmoClaimDetail.qty", { n: ln.treatment.quantity })}
                </p>
                <p className="mt-1 text-slate-700">
                  {t("pages.hmoClaimDetail.lineSnapshot")}: {formatPHP(ln.lineAmount)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

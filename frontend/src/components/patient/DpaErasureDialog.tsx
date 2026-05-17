import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { requestPatientDpaErasure } from "../../services/patientExport";

export function DpaErasureDialog({
  open,
  patientId,
  patientName,
  onClose,
  onDone,
}: {
  open: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onDone: () => void;
}): JSX.Element | null {
  const { t } = useTranslation();
  const [confirmId, setConfirmId] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const canSubmit = confirmId === patientId && !busy;

  async function submit(): Promise<void> {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await requestPatientDpaErasure(patientId, reason);
      onDone();
      onClose();
      setConfirmId("");
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.patientDetail.dpaErasureFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpa-erasure-title"
    >
      <motion.div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        <motion.div className="mb-6 flex items-start justify-between gap-4">
          <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50">
            <AlertTriangle size={24} aria-hidden />
          </motion.div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("pages.common.close", { defaultValue: "Close" })}
          >
            <X size={20} />
          </button>
        </motion.div>

        <h2 id="dpa-erasure-title" className="text-xl font-black text-slate-900 dark:text-white">
          {t("pages.patientDetail.dpaErasureTitle")}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t("pages.patientDetail.dpaErasureHint", { name: patientName })}
        </p>

        <label className="mt-6 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t("pages.patientDetail.dpaErasureConfirmLabel")}
          <input
            type="text"
            value={confirmId}
            onChange={(e) => setConfirmId(e.target.value)}
            placeholder={patientId}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
            autoComplete="off"
          />
        </label>

        <label className="mt-4 block text-[10px] font-black uppercase tracking-widest text-slate-400">
          {t("pages.patientDetail.dpaErasureReasonLabel")}
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        {error ? (
          <p className="mt-4 text-sm font-semibold text-rose-600" role="alert">
            {error}
          </p>
        ) : null}

        <motion.div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            {t("pages.common.cancel", { defaultValue: "Cancel" })}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            {busy ? t("pages.common.loading", { defaultValue: "Loading..." }) : t("pages.patientDetail.dpaErasureSubmit")}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Save, Share2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import {
  createPatientReferral,
  listPatientReferrals,
  type PatientReferral,
} from "../../services/referrals";

const NS = "pages.patientDetail.referral";

export function ReferralTab({ patientId }: { patientId: string }): JSX.Element {
  const { t } = useTranslation();
  const [items, setItems] = useState<PatientReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ referredTo: "", specialty: "", reason: "", notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPatientReferrals(patientId);
      setItems(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t(`${NS}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [patientId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!form.referredTo.trim() && !form.reason.trim()) {
      toast.error(t(`${NS}.emptyError`));
      return;
    }
    setSaving(true);
    try {
      const entry = await createPatientReferral({ patientId, ...form });
      setItems((prev) => [entry, ...prev]);
      setForm({ referredTo: "", specialty: "", reason: "", notes: "" });
      toast.success(t(`${NS}.saved`));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t(`${NS}.saveFailed`));
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Share2 className="mt-1 text-teal-500" size={22} />
          <div>
            <h3 className="text-lg font-black text-slate-900">{t(`${NS}.title`)}</h3>
            <p className="text-sm text-slate-500">{t(`${NS}.subtitle`)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {t(`${NS}.refresh`)}
        </button>
      </div>

      <form
        onSubmit={(e) => void handleSave(e)}
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <label className="block text-xs font-bold text-slate-600">
          {t(`${NS}.referredTo`)}
          <input
            value={form.referredTo}
            onChange={(e) => setForm({ ...form, referredTo: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t(`${NS}.referredToPlaceholder`)}
          />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          {t(`${NS}.specialty`)}
          <input
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t(`${NS}.specialtyPlaceholder`)}
          />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          {t(`${NS}.reason`)}
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t(`${NS}.reasonPlaceholder`)}
          />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          {t(`${NS}.notes`)}
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t(`${NS}.notesPlaceholder`)}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-black uppercase text-white disabled:opacity-50"
        >
          <Save size={14} /> {saving ? t(`${NS}.saving`) : t(`${NS}.save`)}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">{t(`${NS}.loading`)}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">{t(`${NS}.empty`)}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {new Date(r.createdAt).toLocaleString()} · Dr. {r.author.lastName}
              </p>
              <p className="mt-2 font-bold text-slate-900">
                {r.referredTo || t(`${NS}.unknownClinic`)}
              </p>
              {r.specialty.trim() ? <p className="text-xs text-slate-500">{r.specialty}</p> : null}
              {r.reason.trim() ? <p className="mt-2 text-sm text-slate-600">{r.reason}</p> : null}
              {r.notes.trim() ? <p className="mt-1 text-xs text-slate-500">{r.notes}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

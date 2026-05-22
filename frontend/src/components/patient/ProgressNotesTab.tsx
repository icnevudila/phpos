import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Save, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { createSoapNote, listSoapNotes, type SoapNote } from "../../services/soapNotes";

const NS = "pages.patientDetail.soapNotes";

export function ProgressNotesTab({ patientId }: { patientId: string }): JSX.Element {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<SoapNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subjective: "", objective: "", assessment: "", plan: "" });

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSoapNotes(patientId);
      setNotes(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t(`${NS}.loadFailed`));
    } finally {
      setLoading(false);
    }
  }, [patientId, t]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!form.subjective.trim() && !form.objective.trim() && !form.assessment.trim() && !form.plan.trim()) {
      toast.error(t(`${NS}.emptyError`));
      return;
    }
    setSaving(true);
    try {
      const entry = await createSoapNote({ patientId, ...form });
      setNotes((prev) => [entry, ...prev]);
      setForm({ subjective: "", objective: "", assessment: "", plan: "" });
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
          <FileText className="mt-1 text-sky-500" size={22} />
          <div>
            <h3 className="text-lg font-black text-slate-900">{t(`${NS}.title`)}</h3>
            <p className="text-sm text-slate-500">{t(`${NS}.subtitle`)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadNotes()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {t(`${NS}.refresh`)}
        </button>
      </div>

      <form onSubmit={(e) => void handleSave(e)} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
          <label key={field} className="block text-xs font-bold text-slate-600">
            {t(`${NS}.${field}`)}
            <textarea
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              rows={field === "plan" ? 3 : 2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder={t(`${NS}.${field}Placeholder`)}
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-black uppercase text-white disabled:opacity-60"
        >
          <Save size={14} /> {saving ? t(`${NS}.saving`) : t(`${NS}.save`)}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">{t(`${NS}.loading`)}</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-slate-500">{t(`${NS}.empty`)}</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((n) => (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {new Date(n.createdAt).toLocaleString()} — Dr. {n.author.firstName} {n.author.lastName}
              </p>
              <dl className="mt-3 grid gap-2 text-sm">
                {(["subjective", "objective", "assessment", "plan"] as const).map((field) =>
                  n[field].trim() ? (
                    <div key={field}>
                      <dt className="font-bold text-slate-700">{t(`${NS}.${field}`)}</dt>
                      <dd className="whitespace-pre-wrap text-slate-600">{n[field]}</dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

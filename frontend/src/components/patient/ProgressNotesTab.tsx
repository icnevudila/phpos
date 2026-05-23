import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, FileText, RefreshCw, Activity } from "lucide-react";
import { toast } from "sonner";

import { createSoapNote, listSoapNotes, type SoapNote } from "../../services/soapNotes";

export function ProgressNotesTab({ patientId }: { patientId: string }): JSX.Element {
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
      toast.error(e instanceof Error ? e.message : "Failed to load SOAP notes.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!form.subjective.trim() && !form.objective.trim() && !form.assessment.trim() && !form.plan.trim()) {
      toast.error("Please fill in at least one section of the SOAP note.");
      return;
    }
    setSaving(true);
    try {
      const entry = await createSoapNote({ patientId, ...form });
      setNotes((prev) => [entry, ...prev]);
      setForm({ subjective: "", objective: "", assessment: "", plan: "" });
      toast.success("SOAP note saved successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save SOAP note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Activity className="text-brand-muted" size={20} />
          <div>
            <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Clinical SOAP Notes</h3>
            <p className="text-xs text-brand-muted mt-0.5">Record structured clinical observations and treatment plans.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadNotes()}
          disabled={loading}
          className="btn-secondary text-[10px] px-2 py-1.5 h-7"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Form Column */}
         <form onSubmit={(e) => void handleSave(e)} className="card bg-white border border-brand-border h-fit">
           <div className="px-5 py-3 border-b border-brand-border bg-brand-surface-soft">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted">New Entry</h4>
           </div>
           <div className="p-5 space-y-4">
             {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
               <label key={field} className="block space-y-1.5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-brand-text ml-1">
                    {field}
                 </span>
                 <textarea
                   value={form[field]}
                   onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                   rows={field === "plan" ? 3 : 2}
                   className="w-full rounded-[var(--radius-sm)] border border-brand-border bg-white px-3 py-2 text-xs font-medium text-brand-text outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
                   placeholder={`Enter ${field} observations...`}
                 />
               </label>
             ))}
           </div>
           <div className="px-5 py-4 border-t border-brand-border bg-brand-surface-soft">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full justify-center text-xs h-9"
              >
                <Save size={14} /> {saving ? "Saving Record..." : "Save SOAP Note"}
              </button>
           </div>
         </form>

         {/* History Column */}
         <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-muted ml-1">Historical Notes</h4>
            {loading ? (
              <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
                <RefreshCw className="animate-spin text-brand-muted mb-2" size={20} />
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface border border-brand-border">
                <FileText className="text-brand-border mb-2" size={24} />
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">No SOAP notes recorded.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {notes.map((n) => (
                  <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card border border-brand-border bg-white overflow-hidden"
                  >
                    <div className="px-4 py-2.5 bg-brand-surface-soft border-b border-brand-border flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">
                         {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </p>
                       <p className="text-[10px] font-bold text-brand-text bg-white border border-brand-border px-2 py-0.5 rounded-[var(--radius-sm)]">
                         Dr. {n.author.firstName} {n.author.lastName}
                       </p>
                    </div>
                    <dl className="p-4 grid gap-4 text-xs">
                      {(["subjective", "objective", "assessment", "plan"] as const).map((field) =>
                        n[field].trim() ? (
                          <div key={field} className="space-y-1">
                            <dt className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{field}</dt>
                            <dd className="whitespace-pre-wrap text-brand-text font-medium leading-relaxed bg-brand-surface-soft/50 p-2 rounded-[var(--radius-sm)] border border-brand-border/50">{n[field]}</dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                  </motion.li>
                ))}
              </ul>
            )}
         </div>
      </div>
    </div>
  );
}

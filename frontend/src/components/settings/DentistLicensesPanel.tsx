import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  BadgeCheck, 
  FileCheck, 
  Save, 
  Loader2, 
  Building,
  UserCheck
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";

export function DentistLicensesPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = user;
  const [draft, setDraft] = useState({ prcNumber: "", ptrNumber: "", s2License: "", tinNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const res = await api.get<any>(`/users/${profile.id}`);
        const user = res.data;
        setDraft({
          prcNumber: user.prcNumber || "",
          ptrNumber: user.ptrNumber || "",
          s2License: user.s2License || "",
          tinNumber: user.tinNumber || "",
        });
      } catch (err) {
        toast.error(t("pages.settings.licenses.loadFailed", { defaultValue: "Load Failed" }));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [profile?.id, t]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/prescriptions/licenses", draft);
      toast.success(t("pages.settings.licenses.updated", { defaultValue: "Updated" }));
    } catch (err) {
      toast.error(t("pages.settings.licenses.updateFailed", { defaultValue: "Update Failed" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white rounded-[2.5rem] ring-1 ring-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("common.loading", { defaultValue: "Loading" })}</p>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[3rem] bg-white p-10 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-6 mb-10 border-b border-slate-50 pb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-teal-50 text-teal-600">
           <ShieldCheck size={32} />
        </div>
        <div>
           <h2 className="text-2xl font-black tracking-tight text-slate-900">
             {t("pages.settings.licenses.title", { defaultValue: "Title" })}
           </h2>
           <p className="text-sm font-medium text-slate-400 mt-1 max-w-md">
             {t("pages.settings.licenses.subtitle", { defaultValue: "Subtitle" })}
           </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <BadgeCheck size={14} className="opacity-40" />
              {t("pages.settings.licenses.prc", { defaultValue: "Prc" })}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
             value={draft.prcNumber}
             onChange={(e) => setDraft({ ...draft, prcNumber: e.target.value })}
             placeholder={t("pages.settings.licenses.prcPlaceholder", { defaultValue: "Prc Placeholder" })}
           />
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <FileCheck size={14} className="opacity-40" />
              {t("pages.settings.licenses.ptr", { defaultValue: "Ptr" })}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
             value={draft.ptrNumber}
             onChange={(e) => setDraft({ ...draft, ptrNumber: e.target.value })}
             placeholder={t("pages.settings.licenses.ptrPlaceholder", { defaultValue: "Ptr Placeholder" })}
           />
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <UserCheck size={14} className="opacity-40" />
              {t("pages.settings.licenses.s2", { defaultValue: "S2" })}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
             value={draft.s2License}
             onChange={(e) => setDraft({ ...draft, s2License: e.target.value })}
             placeholder={t("pages.settings.licenses.s2Placeholder", { defaultValue: "S2 Placeholder" })}
           />
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <Building size={14} className="opacity-40" />
              {t("pages.settings.licenses.tin", { defaultValue: "Tin" })}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-teal-500 transition-all"
             value={draft.tinNumber}
             onChange={(e) => setDraft({ ...draft, tinNumber: e.target.value })}
             placeholder={t("pages.settings.licenses.tinPlaceholder", { defaultValue: "Tin Placeholder" })}
           />
        </div>
      </div>

      <div className="mt-12 pt-10 border-t border-slate-50 flex justify-end">
        <button
          disabled={saving}
          onClick={save}
          className="group flex h-16 items-center gap-3 rounded-[1.5rem] bg-white px-10 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              {t("pages.settings.licenses.saveCta", { defaultValue: "Save Cta" })}
            </>
          )}
        </button>
      </div>
    </motion.section>
  );
}

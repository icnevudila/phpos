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

import { getAuthProfile } from "../../hooks/authTokens";
import api from "../../services/api";

export function DentistLicensesPanel() {
  const { t } = useTranslation();
  const profile = getAuthProfile();
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
        toast.error(t("pages.settings.licenses.loadFailed"));
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
      toast.success(t("pages.settings.licenses.updated"));
    } catch (err) {
      toast.error(t("pages.settings.licenses.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4 bg-white dark:bg-slate-900 rounded-[2.5rem] ring-1 ring-slate-100 dark:ring-slate-800">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl shadow-slate-200/40 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-6 mb-10 border-b border-slate-50 dark:border-slate-800 pb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
           <ShieldCheck size={32} />
        </div>
        <div>
           <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
             {t("pages.settings.licenses.title")}
           </h2>
           <p className="text-sm font-medium text-slate-400 mt-1 max-w-md">
             {t("pages.settings.licenses.subtitle")}
           </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <BadgeCheck size={14} className="opacity-40" />
              {t("pages.settings.licenses.prc")}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
             value={draft.prcNumber}
             onChange={(e) => setDraft({ ...draft, prcNumber: e.target.value })}
             placeholder={t("pages.settings.licenses.prcPlaceholder")}
           />
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <FileCheck size={14} className="opacity-40" />
              {t("pages.settings.licenses.ptr")}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
             value={draft.ptrNumber}
             onChange={(e) => setDraft({ ...draft, ptrNumber: e.target.value })}
             placeholder={t("pages.settings.licenses.ptrPlaceholder")}
           />
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <UserCheck size={14} className="opacity-40" />
              {t("pages.settings.licenses.s2")}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
             value={draft.s2License}
             onChange={(e) => setDraft({ ...draft, s2License: e.target.value })}
             placeholder={t("pages.settings.licenses.s2Placeholder")}
           />
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">
              <Building size={14} className="opacity-40" />
              {t("pages.settings.licenses.tin")}
           </div>
           <input
             className="h-16 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-6 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all"
             value={draft.tinNumber}
             onChange={(e) => setDraft({ ...draft, tinNumber: e.target.value })}
             placeholder={t("pages.settings.licenses.tinPlaceholder")}
           />
        </div>
      </div>

      <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-end">
        <button
          disabled={saving}
          onClick={save}
          className="group flex h-16 items-center gap-3 rounded-[1.5rem] bg-slate-900 dark:bg-white px-10 text-xs font-black uppercase tracking-widest text-white dark:text-slate-900 shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              {t("pages.settings.licenses.saveCta")}
            </>
          )}
        </button>
      </div>
    </motion.section>
  );
}

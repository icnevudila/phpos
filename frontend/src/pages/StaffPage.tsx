import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

import { StaffTeamPanel } from "../components/settings/StaffTeamPanel";

/** Yalnızca `ADMIN` — `App.tsx` içinde `RoleGuard` ile korunur. */
export function StaffPage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Cinematic Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm">
                  <Users size={20} />
               </span>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {t("pages.staff.kicker")}
               </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-7xl">
                {t("pages.staff.heroTitle")}{" "}
                <span className="text-indigo-500 italic">{t("pages.staff.heroAccent")}</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
                {t("pages.staff.subtitle")}{" "}
                <Link to="/settings" className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  {t("pages.staff.settingsLink")}
                  <Settings size={14} />
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Link
               to="/settings"
               className="flex h-16 items-center gap-3 rounded-[1.5rem] bg-white dark:bg-slate-900 px-8 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 transition-all hover:scale-105 active:scale-95"
             >
               <Settings size={18} aria-hidden /> {t("pages.staff.configButton")}
             </Link>
          </div>
        </header>

        {/* Workspace Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <StaffTeamPanel />
        </motion.div>
      </div>
    </div>
  );
}


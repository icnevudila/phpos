import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

import { StaffTeamPanel } from "../components/settings/StaffTeamPanel";

/** Yalnızca `ADMIN` — `App.tsx` içinde `RoleGuard` ile korunur. */
export function StaffPage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full pb-24 bg-[#f5f7f9]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-6 pt-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-sm">
                  <Users size={16} />
               </span>
               <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t("pages.staff.kicker")}
               </span>
            </div>
            <h1 className="page-header-title">
              {t("pages.staff.heroTitle")}{" "}
              <span className="text-teal-500">{t("pages.staff.heroAccent")}</span>
            </h1>
            <p className="page-header-sub">
              {t("pages.staff.subtitle")}{" "}
              <Link to="/settings" className="inline-flex items-center gap-1.5 font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                {t("pages.staff.settingsLink")}
                <Settings size={12} />
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Link
               to="/settings"
               className="btn-secondary flex items-center gap-2"
             >
               <Settings size={16} aria-hidden /> {t("pages.staff.configButton")}
             </Link>
          </div>
        </div>

        {/* Workspace Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <StaffTeamPanel />
        </motion.div>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

import { StaffTeamPanel } from "../components/settings/StaffTeamPanel";

/** Yalnızca `ADMIN` — `App.tsx` içinde `RoleGuard` ile korunur. */
export function StaffPage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-brand-surface-soft text-brand-primary shadow-sm border border-brand-border">
                <Users size={16} />
             </span>
             <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                {t("pages.staff.kicker", { defaultValue: "Kicker" })}
             </span>
          </div>
          <h1 className="page-header-title">
            {t("pages.staff.heroTitle", { defaultValue: "Hero Title" })}{" "}
            <span className="text-brand-primary">{t("pages.staff.heroAccent", { defaultValue: "Hero Accent" })}</span>
          </h1>
          <p className="page-header-sub">
            {t("pages.staff.subtitle", { defaultValue: "Subtitle" })}{" "}
            <Link to="/settings" className="inline-flex items-center gap-1.5 font-semibold text-brand-primary hover:text-brand-text transition-colors">
              {t("pages.staff.settingsLink", { defaultValue: "Settings Link" })}
              <Settings size={12} />
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Link
             to="/settings"
             className="btn-secondary flex items-center gap-2"
           >
             <Settings size={16} aria-hidden /> {t("pages.staff.configButton", { defaultValue: "Config Button" })}
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
  );
}

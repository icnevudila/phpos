import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { StaffTeamPanel } from "../components/settings/StaffTeamPanel";

/** Yalnızca `ADMIN` — `App.tsx` içinde `RoleGuard` ile korunur. */
export function StaffPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("pages.staff.title")}</h1>
        <p className="text-xs text-slate-500">
          {t("pages.staff.subtitle")}{" "}
          <Link to="/settings" className="font-semibold text-emerald-700 hover:underline">
            {t("pages.staff.settingsLink")}
          </Link>
        </p>
      </div>
      <StaffTeamPanel />
    </div>
  );
}

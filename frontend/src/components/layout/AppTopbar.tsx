import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { LanguageSwitcher } from "../LanguageSwitcher";
import type { AuthProfile } from "../../hooks/authTokens";
import { MenuIcon } from "./icons";
import { filterNavForRole, findActiveNavItem } from "./navItems";
import { UserMenu } from "./UserMenu";

interface AppTopbarProps {
  profile: AuthProfile | null;
  onOpenDrawer: () => void;
}

export function AppTopbar({ profile, onOpenDrawer }: AppTopbarProps): JSX.Element {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const items = filterNavForRole(profile?.role);
  const active = findActiveNavItem(items, pathname);

  // Detail view breadcrumb hint, e.g. /patients/:id → "Patients · Detail"
  let subtitle: string | null = null;
  if (active && active.matchPrefix && pathname.startsWith(`${active.matchPrefix}/`)) {
    subtitle = t("nav.detailSuffix");
  }

  return (
    <header
      className="sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-sm sm:gap-3 sm:px-4 md:min-h-16 md:px-6"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <button
        type="button"
        onClick={onOpenDrawer}
        className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 lg:hidden"
        aria-label={t("nav.openMenu")}
      >
        <MenuIcon size={20} />
      </button>

      <div className="min-w-0 flex-1 py-0.5">
        <h1 className="truncate text-base font-bold tracking-tight text-slate-800 sm:text-lg">
          {active ? t(`nav.${active.key}`) : t("nav.fallbackTitle")}
          {subtitle ? (
            <span className="ml-1.5 font-medium text-slate-400 sm:ml-2">· {subtitle}</span>
          ) : null}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
        <LanguageSwitcher className="inline-flex shrink-0" />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { LanguageSwitcher } from "../LanguageSwitcher";
import type { AuthProfile } from "../../hooks/authTokens";
import { MenuIcon, MoonIcon, SunIcon } from "./icons";
import { filterNavForRole, findActiveNavItem } from "./navItems";
import { UserMenu } from "./UserMenu";
import { useTheme } from "../../hooks/useTheme";

interface AppTopbarProps {
  profile: AuthProfile | null;
  onOpenDrawer: () => void;
}

export function AppTopbar({ profile, onOpenDrawer }: AppTopbarProps): JSX.Element {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const items = filterNavForRole(profile?.role);
  const active = findActiveNavItem(items, pathname);

  // Detail view breadcrumb hint, e.g. /patients/:id → "Patients · Detail"
  let subtitle: string | null = null;
  if (active && active.matchPrefix && pathname.startsWith(`${active.matchPrefix}/`)) {
    subtitle = t("nav.detailSuffix");
  }

  return (
    <header
      className="sticky top-0 z-30 flex min-h-14 items-center gap-2 border-b border-slate-200/90 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:gap-3 sm:px-4 md:min-h-16 md:px-6"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <button
        type="button"
        onClick={onOpenDrawer}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden"
        aria-label={t("nav.openMenu")}
      >
        <MenuIcon size={22} />
      </button>

      <div className="min-w-0 flex-1 py-0.5">
        <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg md:text-xl">
          {active ? t(`nav.${active.key}`) : t("nav.fallbackTitle")}
          {subtitle ? (
            <span className="ml-1.5 font-medium text-slate-400 dark:text-slate-500 sm:ml-2">· {subtitle}</span>
          ) : null}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
        </button>
        <LanguageSwitcher className="inline-flex shrink-0" />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Search, Plus, Menu } from "lucide-react";

import { LanguageSwitcher } from "../LanguageSwitcher";
import type { AuthProfile } from "../../hooks/authTokens";
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

  let subtitle: string | null = null;
  if (active && active.matchPrefix && pathname.startsWith(`${active.matchPrefix}/`)) {
    subtitle = t("nav.detailSuffix", { defaultValue: "Detail" });
  }

  return (
    <header
      className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-brand-border bg-brand-surface px-4 shadow-sm md:min-h-[72px] md:px-8"
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-muted transition hover:bg-brand-surface-muted hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
          aria-label={t("nav.openMenu")}
        >
          <Menu size={22} />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-xl font-bold tracking-tight text-brand-text">
            {active ? t(`nav.${active.key}`) : t("nav.fallbackTitle")}
            {subtitle ? (
              <span className="ml-2 font-medium text-brand-muted">· {subtitle}</span>
            ) : null}
          </h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4 lg:flex-none">
        {/* Global Search */}
        <div className="relative hidden max-w-sm flex-1 md:block lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
          <input
            type="text"
            placeholder={t("nav.searchPlaceholder", { defaultValue: "Search patients, invoices..." })}
            className="h-10 w-full rounded-xl border border-brand-border bg-brand-surface-soft pl-9 pr-4 text-sm font-medium text-brand-text placeholder-brand-muted transition-colors focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Quick Action */}
        <button className="btn-primary hidden h-10 gap-2 px-4 sm:flex">
          <Plus size={18} />
          <span className="hidden xl:inline">{t("nav.quickAction", { defaultValue: "New Appointment" })}</span>
        </button>

        <div className="h-8 w-px bg-brand-border hidden md:block"></div>

        <LanguageSwitcher className="inline-flex shrink-0" />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}

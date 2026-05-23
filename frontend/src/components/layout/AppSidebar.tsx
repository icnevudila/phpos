import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { prefetchRouteData } from "../../services/routePrefetch";
import type { UserRole } from "../../types/user";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { filterNavForRole, groupNavBySection, isActiveItem } from "./navItems";

interface AppSidebarProps {
  role: UserRole | undefined;
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile overlay drawer: close handler (only provided on mobile). */
  onNavigate?: () => void;
}

export function AppSidebar({
  role,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: AppSidebarProps): JSX.Element {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const items = filterNavForRole(role);
  const groups = groupNavBySection(items);
  const isDrawer = Boolean(onNavigate);

  const widthClass = isDrawer
    ? "w-[min(22rem,calc(100vw-3rem))] sm:w-72"
    : collapsed
      ? "w-[68px]"
      : "w-56 md:w-60";

  function linkCls(active: boolean, isCollapsedDesktop: boolean): string {
    const size = isDrawer
      ? "min-h-12 px-3 py-3 text-base gap-3.5"
      : isCollapsedDesktop
        ? "min-h-11 justify-center px-2"
        : "min-h-10 px-3 py-2 text-sm gap-3";

    const color = active
      ? "bg-brand-primary text-white font-bold shadow-sm"
      : "text-brand-text-soft hover:bg-brand-surface-muted hover:text-brand-text font-medium transition-colors";

    return (
      `group relative flex w-full items-center rounded-xl transition-all duration-200 ` +
      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 ` +
      `${size} ${color}`
    );
  }

  return (
    <aside
      className={`flex h-full flex-col bg-brand-surface border-r border-brand-border transition-[width] duration-300 ease-out motion-reduce:transition-none ${widthClass}`}
      aria-label={t("nav.primaryNavAria")}
    >
      {/* Brand */}
      <div
        className={`flex items-center gap-3 px-4 ${ isDrawer ? "min-h-[3.5rem] py-2 sm:min-h-16" : "h-16" }`}
      >
        <div className="flex items-center justify-center shrink-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-sm text-white font-black text-xl leading-none">
            D
          </div>
        </div>
        {!collapsed || isDrawer ? (
          <span className="font-bold text-lg tracking-tight text-brand-text">
            DentQL
          </span>
        ) : null}
      </div>

      {/* Nav */}
      <nav
        className="flex flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-thin px-3 py-4 sm:px-4"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="space-y-6">
          {groups.map(({ section, items: sectionItems }) => (
            <div key={section}>
              {!collapsed || isDrawer ? (
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  {t(`nav.section.${section}`)}
                </p>
              ) : (
                <div className="mx-auto mb-3 h-px w-6 bg-brand-border" aria-hidden />
              )}
              <ul className="space-y-1">
                {sectionItems.map((item) => {
                  const active = isActiveItem(item, pathname);
                  const Icon = item.icon;
                  return (
                    <li key={item.key}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        onMouseEnter={() => prefetchRouteData(item.to)}
                        onFocus={() => prefetchRouteData(item.to)}
                        className={linkCls(active, collapsed && !isDrawer)}
                        title={collapsed && !isDrawer ? t(`nav.${item.key}`) : undefined}
                        aria-current={active ? "page" : undefined}
                      >
                        <span
                          className={`flex shrink-0 items-center justify-center ${ collapsed && !isDrawer ? "h-9 w-9" : "h-5 w-5 sm:h-6 sm:w-6" } ${active ? "text-white" : "text-brand-muted group-hover:text-brand-primary"}`}
                        >
                          <Icon size={collapsed && !isDrawer ? 22 : isDrawer ? 21 : 18} />
                        </span>
                        {!collapsed || isDrawer ? (
                          <span className="min-w-0 flex-1 truncate text-left leading-snug">
                            {t(`nav.${item.key}`)}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      {!onNavigate ? (
        <div className="border-t border-brand-border p-3 sm:p-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-brand-muted transition hover:bg-brand-surface-muted hover:text-brand-text sm:text-sm border border-transparent hover:border-brand-border"
            aria-label={collapsed ? t("nav.sidebarExpand") : t("nav.sidebarCollapse")}
          >
            {collapsed ? <ChevronRightIcon size={18} /> : (
              <>
                <ChevronLeftIcon size={18} />
                <span>{t("nav.sidebarCollapse")}</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </aside>
  );
}

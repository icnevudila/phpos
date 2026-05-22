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
      ? "bg-white text-teal-700 font-semibold shadow-sm"
      : "text-teal-800/70 hover:bg-white/60 hover:text-teal-800 font-medium";

    return (
      `group relative flex w-full items-center rounded-xl transition-colors ` +
      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 ` +
      `${size} ${color}`
    );
  }

  return (
    <aside
      className={`flex h-full flex-col border-r border-teal-200/60 transition-[width] duration-200 ease-out motion-reduce:transition-none ${widthClass}`}
      style={{ background: "var(--color-sidebar-bg)" }}
      aria-label={t("nav.primaryNavAria")}
    >
      {/* Brand */}
      <div
        className={`flex items-center gap-3 border-b border-teal-200/50 px-3 sm:px-4 ${ isDrawer ? "min-h-[3.5rem] py-2 sm:min-h-16" : "h-14" }`}
      >
        <div className="flex items-center justify-center py-1 shrink-0">
          <img
            src="/Firefly.png"
            alt="DentQL"
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-lg"
          />
        </div>
        {!collapsed || isDrawer ? (
          <span className="font-black text-base tracking-tight text-teal-900">
            DentQL<span className="text-teal-500">.</span>
          </span>
        ) : null}
      </div>

      {/* Nav */}
      <nav
        className="flex flex-1 flex-col overflow-y-auto overscroll-contain scrollbar-thin px-2 py-3 sm:px-2.5 sm:py-4"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="space-y-4 sm:space-y-5">
          {groups.map(({ section, items: sectionItems }) => (
            <div key={section}>
              {!collapsed || isDrawer ? (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-700/50 sm:text-[11px]">
                  {t(`nav.section.${section}`)}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-8 bg-teal-300/40" aria-hidden />
              )}
              <ul className="space-y-0.5 sm:space-y-1">
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
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-teal-500"
                          />
                        ) : null}
                        <span
                          className={`flex shrink-0 items-center justify-center ${ collapsed && !isDrawer ? "h-9 w-9" : "h-5 w-5 sm:h-6 sm:w-6" } ${active ? "text-teal-600" : "text-teal-600/60 group-hover:text-teal-700"}`}
                        >
                          <Icon size={collapsed && !isDrawer ? 20 : isDrawer ? 21 : 17} />
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
        <div className="border-t border-teal-200/40 p-2 sm:p-2.5" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-teal-700/60 transition hover:bg-white/60 hover:text-teal-800 sm:text-sm"
            aria-label={collapsed ? t("nav.sidebarExpand") : t("nav.sidebarCollapse")}
          >
            {collapsed ? <ChevronRightIcon size={16} /> : (
              <>
                <ChevronLeftIcon size={16} />
                <span>{t("nav.sidebarCollapse")}</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </aside>
  );
}

import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { prefetchRouteData } from "../../services/routePrefetch";
import type { UserRole } from "../../types/user";
import { ChevronLeftIcon, ChevronRightIcon, ToothIcon } from "./icons";
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
      ? "w-[72px]"
      : "w-60 md:w-64";
  const asideSurface =
    "flex h-full flex-col border-slate-200 bg-white transition-[width] duration-200 ease-out motion-reduce:transition-none " +
    "supports-[padding:max(0px)]:pt-[max(0.5rem,env(safe-area-inset-top))]";

  const linkShell = (active: boolean, isCollapsedDesktop: boolean): string => {
    const touch = isDrawer ? "min-h-12 px-3 py-3 text-base gap-3.5" : isCollapsedDesktop ? "min-h-11 justify-center px-2" : "min-h-11 px-3 py-2.5 text-sm gap-3";
    const colors = active
      ? "bg-sky-50 text-sky-800"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
    return (
      `group relative flex w-full items-center rounded-xl font-medium transition-colors motion-reduce:transition-none ` +
      `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ` +
      `${touch} ${colors}`
    );
  };

  return (
    <aside
      className={`${asideSurface} border-r ${widthClass}`}
      aria-label={t("nav.primaryNavAria")}
    >
      {/* Brand — taller on drawer for thumb reach */}
      <div
        className={`flex items-center gap-2 border-b border-slate-100 px-3 sm:px-4 ${
          isDrawer ? "min-h-[3.5rem] py-2 sm:min-h-16" : "h-14"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-rose-400 text-white shadow-md shadow-sky-500/20 sm:h-10 sm:w-10">
          <ToothIcon size={isDrawer ? 20 : 18} />
        </span>
        {!collapsed || isDrawer ? (
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">{t("common.appName")}</div>
            <div className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
              {t("nav.brandTagline")}
            </div>
          </div>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-2 py-3 supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-2.5 sm:py-4">
        <div className="space-y-5 sm:space-y-6">
          {groups.map(({ section, items: sectionItems }) => (
            <div key={section}>
              {!collapsed || isDrawer ? (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px]">
                  {t(`nav.section.${section}`)}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-8 bg-slate-200" aria-hidden />
              )}
              <ul className="space-y-1 sm:space-y-1.5">
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
                        className={linkShell(active, collapsed && !isDrawer)}
                        title={collapsed && !isDrawer ? t(`nav.${item.key}`) : undefined}
                        aria-current={active ? "page" : undefined}
                      >
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-sky-500"
                          />
                        ) : null}
                        <span
                          className={`flex shrink-0 items-center justify-center ${
                            collapsed && !isDrawer ? "h-9 w-9" : "h-6 w-6 sm:h-7 sm:w-7"
                          } ${active ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`}
                        >
                          <Icon size={collapsed && !isDrawer ? 20 : isDrawer ? 22 : 19} />
                        </span>
                        {!collapsed || isDrawer ? (
                          <span className="min-w-0 flex-1 truncate text-left leading-snug">{t(`nav.${item.key}`)}</span>
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

      {!onNavigate ? (
        <div className="border-t border-slate-100 p-2 sm:p-2.5 supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:text-sm"
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

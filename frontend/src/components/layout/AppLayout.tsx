import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

import { getAuthProfile, setAuthProfile, type AuthProfile } from "../../hooks/authTokens";
import { fetchAuthMeProfile } from "../../services/api";
import { AppShellLoading } from "./AppShellLoading";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";
import { XIcon } from "./icons";

const COLLAPSE_KEY = "dentease_sidebar_collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppLayout(): JSX.Element {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState<AuthProfile | null>(() => getAuthProfile());
  const [meReady, setMeReady] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Keep profile in sync if login happens inside this layout (defensive)
  useEffect(() => {
    const onStorage = (): void => setProfile(getAuthProfile());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /** `GET /auth/me` — JWT ile kullanıcıyı doğrula ve profili güncelle. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchAuthMeProfile();
        if (cancelled) return;
        if (next) {
          setAuthProfile(next);
          setProfile(next);
        }
      } finally {
        if (!cancelled) setMeReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-[100dvh] min-h-0 w-full bg-[#f5f7f9] text-slate-800">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        {t("nav.skipToContent")}
      </a>

      {/* Desktop sidebar */}
      <div className="hidden min-h-0 lg:block">
        <AppSidebar
          role={profile?.role}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile / tablet drawer */}
      {drawerOpen ? (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal
          aria-label={t("nav.mobileMenuTitle")}
        >
          <button
            type="button"
            className="absolute inset-0 bg-white/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-label={t("nav.closeBackdrop")}
          />
          <div
            className="relative z-10 flex h-full max-w-[min(22rem,calc(100vw-2.5rem))] flex-col shadow-2xl shadow-slate-900/10 motion-safe:animate-nav-drawer-in sm:max-w-[24rem]"
            style={{
              paddingLeft: "max(0px, env(safe-area-inset-left))",
              paddingBottom: "max(0px, env(safe-area-inset-bottom))",
            }}
          >
            <AppSidebar
              role={profile?.role}
              collapsed={false}
              onToggleCollapse={() => {}}
              onNavigate={() => setDrawerOpen(false)}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-teal-200 bg-white/90 text-teal-700 shadow-sm backdrop-blur hover:bg-teal-50 sm:right-3 sm:top-3"
              style={{ top: "max(0.5rem, env(safe-area-inset-top))", right: "max(0.5rem, env(safe-area-inset-right))" }}
              aria-label={t("nav.closeMenu")}
            >
              <XIcon size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar profile={profile} onOpenDrawer={() => setDrawerOpen(true)} />
        <main
          id="main"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus-visible:ring-inset scrollbar-thin"
        >
          <div
            className="mx-auto w-full min-w-0 max-w-7xl px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
            style={{
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "max(1rem, env(safe-area-inset-right))",
              paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
            }}
          >
            {meReady ? <Outlet /> : <AppShellLoading />}
          </div>
        </main>
      </div>
    </div>
  );
}

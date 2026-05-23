import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Building2, 
  Shield, 
  Users, 
  FileText, 
  Save, 
  RefreshCw,
  Copy, 
  ExternalLink,
  Activity,
  MapPin,
  Layout,
  Bell,
  Monitor,
} from "lucide-react";

import { HmoProvidersPanel } from "../components/settings/HmoProvidersPanel";
import { StaffTeamPanel } from "../components/settings/StaffTeamPanel";
import { DentistLicensesPanel } from "../components/settings/DentistLicensesPanel";
import { NotificationSettingsPanel } from "../components/settings/NotificationSettingsPanel";
import { SecuritySettingsPanel } from "../components/settings/SecuritySettingsPanel";
import { getAuthProfile } from "../hooks/authTokens";
import { fetchClinic, patchClinic, type ClinicDto } from "../services/clinic";
import { buildQueueDisplayUrl } from "../utils/queueDisplayUrl";

type Tab = "clinic" | "hmo" | "team" | "licenses" | "notifications" | "security";

const settingsField =
  "h-14 w-full rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 shadow-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:bg-slate-50";

export function SettingsPage(): JSX.Element {
  const { t } = useTranslation();
  const profile = getAuthProfile();
  const isAdmin = profile?.role === "ADMIN";
  const isDentist = profile?.role === "DENTIST";
  const [tab, setTab] = useState<Tab>("clinic");

  const [clinic, setClinic] = useState<ClinicDto | null>(null);
  const [, setClinicLoading] = useState(true);
  const [clinicSaving, setClinicSaving] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    logoUrl: "",
  });

  const loadClinic = useCallback(async () => {
    setClinicLoading(true);
    try {
      const c = await fetchClinic();
      setClinic(c);
      setDraft({
        name: c.name,
        address: c.address ?? "",
        city: c.city ?? "",
        phone: c.phone ?? "",
        logoUrl: c.logoUrl ?? "",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastLoadClinicFailed"));
    } finally {
      setClinicLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadClinic();
  }, [loadClinic]);

  const kioskUrl =
    typeof window !== "undefined" && clinic?.slug
      ? `${window.location.origin}/kiosk/${encodeURIComponent(clinic.slug)}`
      : "";

  const queueDisplayUrl =
    typeof window !== "undefined" && clinic?.slug
      ? buildQueueDisplayUrl(window.location.origin, clinic.slug, clinic.id)
      : "";

  async function copyText(url: string, okKey: string, failKey: string): Promise<void> {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t(okKey));
    } catch {
      toast.error(t(failKey));
    }
  }

  async function copyKioskUrl(): Promise<void> {
    await copyText(
      kioskUrl,
      "pages.settings.toastKioskCopied",
      "pages.settings.toastKioskCopyFailed",
    );
  }

  async function copyQueueDisplayUrl(): Promise<void> {
    await copyText(
      queueDisplayUrl,
      "pages.settings.toastQueueCopied",
      "pages.settings.toastQueueCopyFailed",
    );
  }

  async function saveClinic(): Promise<void> {
    if (!isAdmin) return;
    setClinicSaving(true);
    try {
      const updated = await patchClinic({
        name: draft.name,
        address: draft.address || null,
        city: draft.city || null,
        phone: draft.phone || null,
        logoUrl: draft.logoUrl || null,
      });
      setClinic(updated);
      toast.success(t("pages.settings.toastClinicSaved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastSaveFailed"));
    } finally {
      setClinicSaving(false);
    }
  }

  const tabs = [
    { id: "clinic", label: t("pages.settings.tabClinic"), icon: Building2, show: true },
    { id: "hmo", label: t("pages.settings.tabHmo"), icon: Shield, show: isAdmin },
    { id: "team", label: t("pages.settings.tabTeam"), icon: Users, show: isAdmin },
    { id: "licenses", label: t("pages.settings.tabLicenses"), icon: FileText, show: isDentist },
    { id: "notifications", label: t("pages.settings.tabNotifications"), icon: Bell, show: isAdmin },
    { id: "security", label: "Security & API", icon: Shield, show: isAdmin },
  ] as const;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <Settings size={16} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {t("pages.settings.kicker")}
            </span>
          </div>
          <h1 className="page-header-title">
            {t("pages.settings.heroTitle")}{" "}
            <span className="text-teal-500 italic">{t("pages.settings.heroAccent")}</span>
          </h1>
          <p className="page-header-sub">{t("pages.settings.subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Left Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav
            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
            role="tablist"
            aria-label={t("pages.settings.title")}
          >
            {tabs.filter((tabItem) => tabItem.show).map((tabItem) => {
              const Icon = tabItem.icon;
              const active = tab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={t("pages.settings.tabAria", { label: tabItem.label })}
                  onClick={() => setTab(tabItem.id as Tab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 whitespace-nowrap ${ active ? "bg-teal-50 text-teal-700 shadow-sm border border-teal-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent" }`}
                >
                  <Icon size={18} className={active ? "text-teal-600" : "text-slate-400"} aria-hidden />
                  <span>{tabItem.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content */}
        <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tab === "clinic" && (
              <section className="grid gap-8 lg:grid-cols-12">
                {/* Clinic Profile Form */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="card">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-sm">
                        <Building2 size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-800">{t("pages.settings.clinicProfile")}</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.settings.name")}</label>
                          <input
                            className={settingsField}
                            value={draft.name}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.settings.phone")}</label>
                          <input
                            className={settingsField}
                            value={draft.phone}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.settings.address")}</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            className={`${settingsField} pl-12`}
                            value={draft.address}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.settings.city")}</label>
                          <input
                            className={settingsField}
                            value={draft.city}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("pages.settings.logoUrl")}</label>
                          <input
                            className={settingsField}
                            placeholder={t("pages.settings.logoPlaceholder")}
                            value={draft.logoUrl}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        {!isAdmin && <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{t("pages.settings.adminOnly")}</p>}
                        <button
                          type="button"
                          onClick={() => void saveClinic()}
                          disabled={clinicSaving || !isAdmin}
                          className="btn-primary ml-auto"
                        >
                          {clinicSaving ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Save size={16} /> {t("pages.settings.saveChanges")}
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kiosk & Queue Panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="card bg-white text-white relative overflow-hidden">
                    <div className="absolute -bottom-16 -right-16 h-48 w-48 bg-teal-500/20 rounded-full blur-[80px]" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                          <Layout size={20} />
                        </div>
                        <div className="text-[10px] font-bold text-teal-400 bg-teal-400/10 px-3 py-1 rounded-full uppercase tracking-wider">Kiosk System</div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">{t("pages.settings.kioskTabletTitle")}</h3>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">
                          {t("pages.settings.kioskTabletHint")}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            readOnly
                            className="h-12 w-full rounded-xl bg-white/5 border border-white/10 pl-4 pr-20 text-xs font-mono text-teal-200 outline-none"
                            value={kioskUrl}
                          />
                          <button
                            onClick={() => void copyKioskUrl()}
                            className="absolute right-1.5 top-1.5 h-9 px-3 rounded-lg bg-teal-500 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-teal-600 transition-all"
                          >
                            <Copy size={12} className="inline mr-1" /> {t("pages.settings.kioskCopyCta")}
                          </button>
                        </div>
                        <a 
                          href={kioskUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                          {t("pages.settings.kioskOpenPreview")} <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="space-y-3 border-t border-white/10 pt-6">
                        <div className="flex items-center gap-2">
                          <Monitor size={16} className="text-teal-400" aria-hidden />
                          <h4 className="text-sm font-bold uppercase tracking-widest text-white">
                            {t("pages.settings.queueDisplayTitle")}
                          </h4>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-slate-400">
                          {t("pages.settings.queueDisplayHint")}
                        </p>
                        <div className="relative">
                          <input
                            readOnly
                            aria-label={t("pages.settings.queueDisplayUrlAria")}
                            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-4 pr-20 font-mono text-[10px] text-teal-200 outline-none"
                            value={queueDisplayUrl}
                          />
                          <button
                            type="button"
                            onClick={() => void copyQueueDisplayUrl()}
                            className="absolute right-1.5 top-1.5 flex h-9 items-center gap-1 rounded-lg bg-teal-500 px-3 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-teal-600"
                          >
                            <Copy size={12} aria-hidden />
                            {t("pages.settings.queueDisplayCopyCta")}
                          </button>
                        </div>
                        <a
                          href={queueDisplayUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
                        >
                          {t("pages.settings.queueDisplayOpenPreview")} <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                          <span>Portal Integrity</span>
                          <span className="text-teal-400">Stable</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-[94%] bg-teal-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Activity size={18} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">System Information</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2.5 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version</span>
                        <span className="text-xs font-bold text-slate-900">v2.4.0-pro</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Region</span>
                        <span className="text-xs font-bold text-slate-900">PH-CENTRAL-1</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Storage</span>
                        <span className="text-xs font-bold text-slate-900">88% Utilized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "hmo" && isAdmin && <HmoProvidersPanel />}
            {tab === "team" && isAdmin && <StaffTeamPanel />}
            {tab === "licenses" && isDentist && <DentistLicensesPanel />}
            {tab === "notifications" && isAdmin && <NotificationSettingsPanel />}
            {tab === "security" && isAdmin && <SecuritySettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}

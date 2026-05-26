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
import { IntegrationsPanel } from "../components/settings/IntegrationsPanel";
import { useAuth } from "../hooks/useAuth";
import { fetchClinic, patchClinic, type ClinicDto } from "../services/clinic";
import { buildQueueDisplayUrl } from "../utils/queueDisplayUrl";

type Tab = "clinic" | "hmo" | "team" | "licenses" | "notifications" | "security" | "integrations";

const settingsField =
  "h-10 w-full rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:bg-brand-surface-muted transition-shadow";

export function SettingsPage(): JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = user?.user_metadata ? {
    id: user.id,
    firstName: user.user_metadata.firstName || "",
    lastName: user.user_metadata.lastName || "",
    role: user.user_metadata.role || "STAFF",
    email: user.email || ""
  } : null;
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
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastLoadClinicFailed", { defaultValue: "Toast Load Clinic Failed" }));
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
      toast.success(t("pages.settings.toastClinicSaved", { defaultValue: "Toast Clinic Saved" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastSaveFailed", { defaultValue: "Toast Save Failed" }));
    } finally {
      setClinicSaving(false);
    }
  }

  const tabs = [
    { id: "clinic", label: t("pages.settings.tabClinic", { defaultValue: "Tab Clinic" }), icon: Building2, show: true },
    { id: "hmo", label: t("pages.settings.tabHmo", { defaultValue: "Tab Hmo" }), icon: Shield, show: isAdmin },
    { id: "team", label: t("pages.settings.tabTeam", { defaultValue: "Tab Team" }), icon: Users, show: isAdmin },
    { id: "licenses", label: t("pages.settings.tabLicenses", { defaultValue: "Tab Licenses" }), icon: FileText, show: isDentist },
    { id: "notifications", label: t("pages.settings.tabNotifications", { defaultValue: "Tab Notifications" }), icon: Bell, show: isAdmin },
    { id: "security", label: "Security & API", icon: Shield, show: isAdmin },
    { id: "integrations", label: "Integrations", icon: Activity, show: isAdmin },
  ] as const;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary-soft text-brand-primary">
              <Settings size={16} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {t("pages.settings.kicker", { defaultValue: "Administration" })}
            </span>
          </div>
          <h1 className="page-header-title">
            {t("pages.settings.heroTitle", { defaultValue: "Clinic" })}{" "}
            <span className="text-brand-primary italic">{t("pages.settings.heroAccent", { defaultValue: "Control Room" })}</span>
          </h1>
          <p className="page-header-sub">{t("pages.settings.subtitle", { defaultValue: "Manage operations, security, and clinic policies." })}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Left Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav
            className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0"
            role="tablist"
            aria-label={t("pages.settings.title", { defaultValue: "Title" })}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary whitespace-nowrap ${ active ? "bg-brand-primary-soft text-brand-primary shadow-sm border border-brand-primary-soft" : "text-brand-text hover:bg-brand-surface-muted border border-transparent" }`}
                >
                  <Icon size={18} className={active ? "text-brand-primary" : "text-brand-muted"} aria-hidden />
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary text-white shadow-sm">
                        <Building2 size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-brand-text">{t("pages.settings.clinicProfile", { defaultValue: "Clinic Profile" })}</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{t("pages.settings.name", { defaultValue: "Name" })}</label>
                          <input
                            className={settingsField}
                            value={draft.name}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{t("pages.settings.phone", { defaultValue: "Phone" })}</label>
                          <input
                            className={settingsField}
                            value={draft.phone}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{t("pages.settings.address", { defaultValue: "Address" })}</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                          <input
                            className={`${settingsField} pl-10`}
                            value={draft.address}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{t("pages.settings.city", { defaultValue: "City" })}</label>
                          <input
                            className={settingsField}
                            value={draft.city}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{t("pages.settings.logoUrl", { defaultValue: "Logo Url" })}</label>
                          <input
                            className={settingsField}
                            placeholder={t("pages.settings.logoPlaceholder", { defaultValue: "Logo Placeholder" })}
                            value={draft.logoUrl}
                            disabled={!isAdmin}
                            onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                        {!isAdmin && <p className="text-xs font-bold text-brand-warning uppercase tracking-widest">{t("pages.settings.adminOnly", { defaultValue: "Admin Only" })}</p>}
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
                              <Save size={16} /> {t("pages.settings.saveChanges", { defaultValue: "Save Changes" })}
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kiosk & Queue Panel */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="card">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary-soft text-brand-primary">
                          <Layout size={20} />
                        </div>
                        <div className="text-[10px] font-bold text-brand-primary bg-brand-primary-soft px-3 py-1 rounded-[var(--radius-sm)] uppercase tracking-wider">Kiosk System</div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-brand-text">{t("pages.settings.kioskTabletTitle", { defaultValue: "Kiosk Tablet Title" })}</h3>
                        <p className="text-xs font-medium text-brand-muted leading-relaxed">
                          {t("pages.settings.kioskTabletHint", { defaultValue: "Kiosk Tablet Hint" })}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <input
                            readOnly
                            className="h-10 w-full rounded-[var(--radius-md)] bg-brand-surface-muted border border-brand-border pl-3 pr-24 text-xs font-mono text-brand-text outline-none"
                            value={kioskUrl}
                          />
                          <button
                            onClick={() => void copyKioskUrl()}
                            className="absolute right-1 top-1 h-8 px-3 rounded-[var(--radius-sm)] bg-brand-surface text-brand-text border border-brand-border text-[10px] font-bold uppercase tracking-wider hover:bg-brand-surface-muted transition-all"
                          >
                            <Copy size={12} className="inline mr-1" /> {t("pages.settings.kioskCopyCta", { defaultValue: "Kiosk Copy Cta" })}
                          </button>
                        </div>
                        <a 
                          href={kioskUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors"
                        >
                          {t("pages.settings.kioskOpenPreview", { defaultValue: "Kiosk Open Preview" })} <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="space-y-3 border-t border-brand-border pt-6">
                        <div className="flex items-center gap-2">
                          <Monitor size={16} className="text-brand-primary" aria-hidden />
                          <h4 className="text-sm font-bold uppercase tracking-widest text-brand-text">
                            {t("pages.settings.queueDisplayTitle", { defaultValue: "Queue Display Title" })}
                          </h4>
                        </div>
                        <p className="text-xs font-medium leading-relaxed text-brand-muted">
                          {t("pages.settings.queueDisplayHint", { defaultValue: "Queue Display Hint" })}
                        </p>
                        <div className="relative">
                          <input
                            readOnly
                            aria-label={t("pages.settings.queueDisplayUrlAria", { defaultValue: "Queue Display Url Aria" })}
                            className="h-10 w-full rounded-[var(--radius-md)] border border-brand-border bg-brand-surface-muted pl-3 pr-24 font-mono text-xs text-brand-text outline-none"
                            value={queueDisplayUrl}
                          />
                          <button
                            type="button"
                            onClick={() => void copyQueueDisplayUrl()}
                            className="absolute right-1 top-1 flex h-8 items-center gap-1 rounded-[var(--radius-sm)] bg-brand-surface border border-brand-border px-3 text-[10px] font-bold uppercase tracking-wider text-brand-text hover:bg-brand-surface-muted"
                          >
                            <Copy size={12} aria-hidden />
                            {t("pages.settings.queueDisplayCopyCta", { defaultValue: "Queue Display Copy Cta" })}
                          </button>
                        </div>
                        <a
                          href={queueDisplayUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-muted transition-colors hover:text-brand-primary"
                        >
                          {t("pages.settings.queueDisplayOpenPreview", { defaultValue: "Queue Display Open Preview" })} <ExternalLink size={12} />
                        </a>
                      </div>

                      <div className="pt-4 border-t border-brand-border">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-3">
                          <span>Portal Integrity</span>
                          <span className="text-brand-success">Stable</span>
                        </div>
                        <div className="h-1.5 w-full bg-brand-surface-muted rounded-full overflow-hidden">
                          <div className="h-full w-[94%] bg-brand-success" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-brand-surface-muted text-brand-muted">
                        <Activity size={16} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-brand-muted">System Information</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Version</span>
                        <span className="text-xs font-bold text-brand-text">v2.4.0-pro</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Region</span>
                        <span className="text-xs font-bold text-brand-text">PH-CENTRAL-1</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-brand-border">
                        <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Storage</span>
                        <span className="text-xs font-bold text-brand-text">88% Utilized</span>
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
            {tab === "security" && (
              <SecuritySettingsPanel />
            )}
            {tab === "integrations" && (
              <IntegrationsPanel />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}

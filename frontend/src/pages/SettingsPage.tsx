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
import { getAuthProfile } from "../hooks/authTokens";
import { fetchClinic, patchClinic, type ClinicDto } from "../services/clinic";
import { buildQueueDisplayUrl } from "../utils/queueDisplayUrl";

type Tab = "clinic" | "hmo" | "team" | "licenses" | "notifications";

const settingsField =
  "h-14 w-full rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:disabled:bg-slate-900";

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
  ] as const;

  return (
    <div className="min-h-screen w-full pb-24 bg-[#fafbfc] dark:bg-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10 space-y-12 pt-10">
        
        {/* Cinematic Header */}
        <header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm">
                  <Settings size={20} />
               </span>
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {t("pages.settings.kicker")}
               </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white lg:text-7xl">
                {t("pages.settings.heroTitle")}{" "}
                <span className="text-emerald-500 italic">{t("pages.settings.heroAccent")}</span>
              </h1>
              <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
                {t("pages.settings.subtitle")}
              </p>
            </div>
          </div>

          <div
            className="flex max-w-full items-center gap-2 overflow-x-auto p-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 [-webkit-overflow-scrolling:touch]"
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
                   className={`flex h-14 shrink-0 items-center gap-3 rounded-[1.5rem] px-4 text-xs font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 sm:px-6 ${
                     active 
                       ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg" 
                       : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                   }`}
                 >
                   <Icon size={18} aria-hidden />
                   <span className={active ? "block" : "hidden sm:block"}>{tabItem.label}</span>
                 </button>
               );
             })}
          </div>
        </header>

        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "clinic" && (
                <section className="grid gap-12 lg:grid-cols-12">
                   {/* Clinic Profile Form */}
                   <div className="lg:col-span-7 space-y-10">
                      <div className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
                         <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                               <Building2 size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("pages.settings.clinicProfile")}</h2>
                         </div>

                         <div className="space-y-8">
                            <div className="grid gap-8 sm:grid-cols-2">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.name")}</label>
                                  <input
                                    className={settingsField}
                                    value={draft.name}
                                    disabled={!isAdmin}
                                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.phone")}</label>
                                  <input
                                    className={settingsField}
                                    value={draft.phone}
                                    disabled={!isAdmin}
                                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                                  />
                               </div>
                            </div>

                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.address")}</label>
                               <div className="relative">
                                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                  <input
                                    className={`${settingsField} pl-16`}
                                    value={draft.address}
                                    disabled={!isAdmin}
                                    onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                                  />
                               </div>
                            </div>

                            <div className="grid gap-8 sm:grid-cols-2">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.city")}</label>
                                  <input
                                    className={settingsField}
                                    value={draft.city}
                                    disabled={!isAdmin}
                                    onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.logoUrl")}</label>
                                  <input
                                    className={settingsField}
                                    placeholder={t("pages.settings.logoPlaceholder")}
                                    value={draft.logoUrl}
                                    disabled={!isAdmin}
                                    onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))}
                                  />
                               </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                               {!isAdmin && <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">{t("pages.settings.adminOnly")}</p>}
                               <button
                                 type="button"
                                 onClick={() => void saveClinic()}
                                 disabled={clinicSaving || !isAdmin}
                                 className="ml-auto h-16 px-12 rounded-[1.5rem] bg-emerald-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all disabled:opacity-40"
                               >
                                 {clinicSaving ? (
                                   <RefreshCw className="animate-spin" size={18} />
                                 ) : (
                                   <div className="flex items-center gap-2">
                                      <Save size={18} /> {t("pages.settings.saveChanges")}
                                   </div>
                                 )}
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Kiosk Intelligence */}
                   <div className="lg:col-span-5 space-y-10">
                      <div className="rounded-[3rem] bg-slate-900 p-10 shadow-2xl relative overflow-hidden group">
                         <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-emerald-500/20 rounded-full blur-[100px] group-hover:scale-150 transition-all duration-1000" />
                         <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                               <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                  <Layout size={24} />
                                </div>
                                <div className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-4 py-1 rounded-full uppercase tracking-[0.2em]">Kiosk System</div>
                            </div>

                            <div className="space-y-4">
                               <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t("pages.settings.kioskTabletTitle")}</h3>
                               <p className="text-sm font-medium text-slate-400 leading-relaxed">
                                 {t("pages.settings.kioskTabletHint")}
                               </p>
                            </div>

                            <div className="space-y-4 pt-4">
                               <div className="relative">
                                  <input
                                    readOnly
                                    className="h-16 w-full rounded-2xl bg-white/5 border border-white/10 pl-6 pr-24 text-xs font-mono text-emerald-200 outline-none"
                                    value={kioskUrl}
                                  />
                                  <button
                                    onClick={() => void copyKioskUrl()}
                                    className="absolute right-2 top-2 h-12 px-6 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                                  >
                                    <Copy size={14} className="inline mr-2" /> {t("pages.settings.kioskCopyCta")}
                                  </button>
                               </div>
                               <a 
                                 href={kioskUrl} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                               >
                                 {t("pages.settings.kioskOpenPreview")} <ExternalLink size={12} />
                               </a>
                            </div>

                            <div className="space-y-4 border-t border-white/10 pt-8">
                               <div className="flex items-center gap-3">
                                  <Monitor size={20} className="text-emerald-400" aria-hidden />
                                  <h4 className="text-sm font-black uppercase tracking-widest text-white">
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
                                    className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 pl-6 pr-24 font-mono text-[10px] text-emerald-200 outline-none"
                                    value={queueDisplayUrl}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => void copyQueueDisplayUrl()}
                                    className="absolute right-2 top-2 flex h-12 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-emerald-600"
                                  >
                                    <Copy size={14} aria-hidden />
                                    {t("pages.settings.queueDisplayCopyCta")}
                                  </button>
                               </div>
                               <a
                                 href={queueDisplayUrl}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-white"
                               >
                                 {t("pages.settings.queueDisplayOpenPreview")} <ExternalLink size={12} />
                               </a>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                                  <span>Portal Integrity</span>
                                  <span className="text-emerald-400">Stable</span>
                               </div>
                               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full w-[94%] bg-emerald-500" />
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="rounded-[3rem] bg-white dark:bg-slate-900 p-10 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600">
                               <Activity size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Information</span>
                         </div>
                         <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Version</span>
                               <span className="text-xs font-black text-slate-900 dark:text-white">v2.4.0-pro</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Region</span>
                               <span className="text-xs font-black text-slate-900 dark:text-white">PH-CENTRAL-1</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-slate-50 dark:border-slate-800">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Storage</span>
                               <span className="text-xs font-black text-slate-900 dark:text-white">88% Utilized</span>
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


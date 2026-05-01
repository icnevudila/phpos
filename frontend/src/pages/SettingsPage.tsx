import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { HmoProvidersPanel } from "../components/settings/HmoProvidersPanel";
import { StaffTeamPanel } from "../components/settings/StaffTeamPanel";
import { DentistLicensesPanel } from "../components/settings/DentistLicensesPanel";
import { getAuthProfile } from "../hooks/authTokens";
import { fetchClinic, patchClinic, type ClinicDto } from "../services/clinic";

type Tab = "clinic" | "hmo" | "team" | "licenses";

const settingsField =
  "mt-1 w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800 dark:focus-visible:ring-offset-slate-950";

const tabBtn = (active: boolean): string =>
  `min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
    active
      ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
      : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
  }`;

export function SettingsPage(): JSX.Element {
  const { t } = useTranslation();
  const profile = getAuthProfile();
  const isAdmin = profile?.role === "ADMIN";
  const isDentist = profile?.role === "DENTIST";
  const [tab, setTab] = useState<Tab>("clinic");

  const [clinic, setClinic] = useState<ClinicDto | null>(null);
  const [clinicLoading, setClinicLoading] = useState(true);
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

  async function copyKioskUrl(): Promise<void> {
    if (!kioskUrl) return;
    try {
      await navigator.clipboard.writeText(kioskUrl);
      toast.success(t("pages.settings.toastKioskCopied"));
    } catch {
      toast.error(t("pages.settings.toastKioskCopyFailed"));
    }
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

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("pages.settings.title")}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t("pages.settings.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
        <button type="button" onClick={() => setTab("clinic")} className={tabBtn(tab === "clinic")}>
          {t("pages.settings.tabClinic")}
        </button>
        {isAdmin ? (
          <button type="button" onClick={() => setTab("hmo")} className={tabBtn(tab === "hmo")}>
            {t("pages.settings.tabHmo")}
          </button>
        ) : null}
        {isAdmin ? (
          <button type="button" onClick={() => setTab("team")} className={tabBtn(tab === "team")}>
            {t("pages.settings.tabTeam")}
          </button>
        ) : null}
        {isDentist ? (
          <button type="button" onClick={() => setTab("licenses")} className={tabBtn(tab === "licenses")}>
            My Licenses
          </button>
        ) : null}
      </div>

      {tab === "clinic" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t("pages.settings.clinicProfile")}
          </h2>
          {clinicLoading ? (
            <p className="mt-4 text-sm text-slate-500">{t("pages.settings.loading")}</p>
          ) : (
            <div className="mt-4 max-w-lg space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("pages.settings.name")}
                </label>
                <input
                  className={settingsField}
                  value={draft.name}
                  disabled={!isAdmin}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("pages.settings.address")}
                </label>
                <input
                  className={settingsField}
                  value={draft.address}
                  disabled={!isAdmin}
                  onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.settings.city")}
                  </label>
                  <input
                    className={settingsField}
                    value={draft.city}
                    disabled={!isAdmin}
                    onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.settings.phone")}
                  </label>
                  <input
                    className={settingsField}
                    value={draft.phone}
                    disabled={!isAdmin}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("pages.settings.logoUrl")}
                </label>
                <input
                  className={settingsField}
                  placeholder={t("pages.settings.logoPlaceholder")}
                  value={draft.logoUrl}
                  disabled={!isAdmin}
                  onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.target.value }))}
                />
              </div>
              {clinic ? (
                <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
                  <p>{t("pages.settings.portalSlug", { slug: clinic.slug })}</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {t("pages.settings.kioskTabletTitle")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {t("pages.settings.kioskTabletHint")}
                    </p>
                    <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        readOnly
                        className="min-h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-[11px] text-slate-800 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
                        value={kioskUrl}
                        aria-label={t("pages.settings.kioskUrlAria")}
                      />
                      <button
                        type="button"
                        onClick={() => void copyKioskUrl()}
                        disabled={!kioskUrl}
                        className="min-h-10 shrink-0 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
                      >
                        {t("pages.settings.kioskCopyCta")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => void saveClinic()}
                  disabled={clinicSaving}
                  className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
                >
                  {clinicSaving ? t("pages.settings.saving") : t("pages.settings.saveChanges")}
                </button>
              ) : (
                <p className="text-xs text-amber-800 dark:text-amber-200">{t("pages.settings.adminOnly")}</p>
              )}
            </div>
          )}
        </section>
      ) : null}

      {tab === "hmo" && isAdmin ? <HmoProvidersPanel /> : null}

      {tab === "team" && isAdmin ? <StaffTeamPanel /> : null}

      {tab === "licenses" && isDentist ? <DentistLicensesPanel /> : null}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bell, Moon } from "lucide-react";

const STORAGE_KEY = "dentease_notification_prefs";

interface NotificationPrefs {
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  appointmentReminders: boolean;
  invoiceReminders: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  quietHoursEnabled: false,
  quietStart: "21:00",
  quietEnd: "08:00",
  appointmentReminders: true,
  invoiceReminders: true,
};

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function NotificationSettingsPanel(): JSX.Element {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  function save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    toast.success(t("pages.settings.notifications.saved"));
  }

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/40">
          <Bell size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{t("pages.settings.notifications.title")}</h2>
          <p className="text-sm text-slate-500">{t("pages.settings.notifications.subtitle")}</p>
        </div>
      </div>
      <div className="space-y-6">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={prefs.appointmentReminders} onChange={(e) => setPrefs({ ...prefs, appointmentReminders: e.target.checked })} />
          <span className="text-sm font-medium">{t("pages.settings.notifications.appointmentReminders")}</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={prefs.invoiceReminders} onChange={(e) => setPrefs({ ...prefs, invoiceReminders: e.target.checked })} />
          <span className="text-sm font-medium">{t("pages.settings.notifications.invoiceReminders")}</span>
        </label>
        <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
          <label className="mb-3 flex items-center gap-3">
            <Moon size={18} className="text-indigo-500" />
            <input type="checkbox" checked={prefs.quietHoursEnabled} onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })} />
            <span className="text-sm font-bold">{t("pages.settings.notifications.quietHours")}</span>
          </label>
          {prefs.quietHoursEnabled ? (
            <div className="flex flex-wrap gap-4">
              <input type="time" value={prefs.quietStart} onChange={(e) => setPrefs({ ...prefs, quietStart: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <input type="time" value={prefs.quietEnd} onChange={(e) => setPrefs({ ...prefs, quietEnd: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
            </div>
          ) : null}
        </div>
        <button type="button" onClick={save} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black text-white">
          {t("pages.settings.notifications.save")}
        </button>
      </div>
    </section>
  );
}

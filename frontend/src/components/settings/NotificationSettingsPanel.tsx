import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bell, Moon, Send } from "lucide-react";

const STORAGE_KEY = "dentease_notification_prefs";

interface NotificationPrefs {
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  appointmentRemindersSms: boolean;
  appointmentRemindersEmail: boolean;
  invoiceRemindersSms: boolean;
  invoiceRemindersEmail: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  quietHoursEnabled: false,
  quietStart: "21:00",
  quietEnd: "08:00",
  appointmentRemindersSms: true,
  appointmentRemindersEmail: true,
  invoiceRemindersSms: true,
  invoiceRemindersEmail: true,
};

function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    // Backward compatibility conversion:
    return {
      quietHoursEnabled: parsed.quietHoursEnabled ?? DEFAULT_PREFS.quietHoursEnabled,
      quietStart: parsed.quietStart ?? DEFAULT_PREFS.quietStart,
      quietEnd: parsed.quietEnd ?? DEFAULT_PREFS.quietEnd,
      appointmentRemindersSms: parsed.appointmentRemindersSms ?? parsed.appointmentReminders ?? DEFAULT_PREFS.appointmentRemindersSms,
      appointmentRemindersEmail: parsed.appointmentRemindersEmail ?? DEFAULT_PREFS.appointmentRemindersEmail,
      invoiceRemindersSms: parsed.invoiceRemindersSms ?? parsed.invoiceReminders ?? DEFAULT_PREFS.invoiceRemindersSms,
      invoiceRemindersEmail: parsed.invoiceRemindersEmail ?? DEFAULT_PREFS.invoiceRemindersEmail,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function NotificationSettingsPanel(): JSX.Element {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPrefs>(loadPrefs);
  const [activePreviewTab, setActivePreviewTab] = useState<"reminder" | "confirmed" | "payment">("reminder");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  function save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    toast.success(t("pages.settings.notifications.saved"));
  }

  const getPreviewText = (): string => {
    switch (activePreviewTab) {
      case "reminder":
        return `Hi Juan! Reminder: your dental appt with Dr.Santos is on Mon 21 Apr at 10:30 AM. To reschedule call +63 917 123 4567. -DentEase`;
      case "confirmed":
        return `Hi Juan! Confirmed: your appt on Mon 21 Apr at 10:30 AM is booked. See you soon! -DentEase`;
      case "payment":
        return `Hi Juan! Payment of PHP 1,500.00 received (OR-2026-0042). Thank you! -DentEase`;
      default:
        return "";
    }
  };

  return (
    <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
          <Bell size={28} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">{t("pages.settings.notifications.title")}</h2>
          <p className="text-sm text-slate-500">{t("pages.settings.notifications.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Settings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Channel Preferences</h3>
            
            <div className="border border-slate-100 rounded-2xl p-6 space-y-6 bg-slate-50/30">
              {/* Appointment Row */}
              <div className="space-y-2.5">
                <p className="text-sm font-bold text-slate-800">{t("pages.settings.notifications.appointmentReminders")}</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.appointmentRemindersSms}
                      onChange={(e) => setPrefs({ ...prefs, appointmentRemindersSms: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-500">SMS Channel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.appointmentRemindersEmail}
                      onChange={(e) => setPrefs({ ...prefs, appointmentRemindersEmail: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-500">E-mail Channel</span>
                  </label>
                </div>
              </div>

              {/* Invoice Row */}
              <div className="space-y-2.5">
                <p className="text-sm font-bold text-slate-800">{t("pages.settings.notifications.invoiceReminders")}</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.invoiceRemindersSms}
                      onChange={(e) => setPrefs({ ...prefs, invoiceRemindersSms: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-500">SMS Channel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.invoiceRemindersEmail}
                      onChange={(e) => setPrefs({ ...prefs, invoiceRemindersEmail: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-slate-500">E-mail Channel</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50/50">
            <label className="mb-4 flex items-center gap-3 cursor-pointer">
              <Moon size={18} className="text-indigo-500" />
              <input
                type="checkbox"
                checked={prefs.quietHoursEnabled}
                onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
                className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-sm font-bold text-slate-800">{t("pages.settings.notifications.quietHours")}</span>
            </label>
            {prefs.quietHoursEnabled ? (
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Start Time</span>
                  <input
                    type="time"
                    value={prefs.quietStart}
                    onChange={(e) => setPrefs({ ...prefs, quietStart: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">End Time</span>
                  <input
                    type="time"
                    value={prefs.quietEnd}
                    onChange={(e) => setPrefs({ ...prefs, quietEnd: e.target.value })}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={save}
            className="rounded-2xl bg-teal-600 hover:bg-teal-500 transition-all font-black text-xs uppercase tracking-widest text-white px-8 py-4 shadow-xl shadow-teal-500/20"
          >
            {t("pages.settings.notifications.save")}
          </button>
        </div>

        {/* Right Side: SMS Template Preview */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">SMS LIVE PREVIEW</span>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(["reminder", "confirmed", "payment"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePreviewTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${ activePreviewTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 " }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated Mobile Device */}
          <div className="flex-1 rounded-[2.5rem] border-4 border-slate-200 bg-[#f5f7f9] p-4 shadow-2xl relative min-h-[300px] flex flex-col justify-between">
            {/* Top Speaker / Camera Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-slate-800 flex items-center justify-center">
              <div className="w-12 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Content Container */}
            <div className="flex-1 mt-6 flex flex-col justify-between">
              {/* Header */}
              <div className="border-b border-slate-200 pb-3 mb-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DentEase Info</p>
                <p className="text-[9px] text-teal-500 font-bold mt-0.5">Online via SMS Gateway</p>
              </div>

              {/* Message History */}
              <div className="flex-1 flex flex-col justify-end space-y-3 pb-4">
                {/* Received Bubble */}
                <div className="self-start max-w-[85%] bg-slate-800 rounded-[1.25rem] rounded-bl-none px-4 py-3 text-slate-100 shadow-md">
                  <p className="text-xs leading-relaxed font-medium">{getPreviewText()}</p>
                  <p className="text-[8px] text-slate-400 text-right mt-1.5 font-bold">10:30 AM</p>
                </div>
              </div>

              {/* Input Bar */}
              <div className="border-t border-slate-200 pt-3 flex gap-2 items-center">
                <div className="flex-1 h-9 rounded-full bg-white px-4 flex items-center text-[10px] text-slate-550 font-semibold border border-slate-200">
                  Text Message
                </div>
                <div className="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center text-white">
                  <Send size={14} className="ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

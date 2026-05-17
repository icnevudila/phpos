import { useTranslation } from "react-i18next";
import { Clock, Activity, ArrowRight, Bell } from "lucide-react";
import type { DashboardTodayAppointment } from "../../../services/reports";

interface ClinicQueueProps {
  currentlyInClinic: DashboardTodayAppointment[];
  nextAppointments: DashboardTodayAppointment[];
  overdueAppointments: DashboardTodayAppointment[];
  queueBusyId: string | null;
  sendAlert: (row: DashboardTodayAppointment) => void | Promise<boolean>;
  changeQueueStatus: (
    row: DashboardTodayAppointment,
    next: "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW",
  ) => void | Promise<boolean>;
}

export function ClinicQueue({
  currentlyInClinic,
  nextAppointments,
  overdueAppointments,
  queueBusyId,
  sendAlert,
  changeQueueStatus,
}: ClinicQueueProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Activity size={20} />
           </div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
             {t("pages.dashboard.opsTitle")}
           </h2>
        </div>
        <div className="flex items-center gap-2">
           <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t("pages.dashboard.opsLiveBadge")}</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* In Clinic - The Hot Zone */}
        <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("pages.dashboard.opsInClinic")}</p>
             </div>
             <span className="text-[10px] font-black text-emerald-500">
               {t("pages.dashboard.opsActiveCount", { count: currentlyInClinic.length })}
             </span>
          </div>
          
          {currentlyInClinic.length === 0 ? (
            <div className="py-12 text-center">
               <Clock className="h-8 w-8 text-slate-100 mx-auto mb-4" />
               <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{t("pages.dashboard.opsEmpty")}</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {currentlyInClinic.slice(0, 5).map((r) => (
                <li key={r.id} className="group relative flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:ring-1 hover:ring-slate-100">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{r.patientName}</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 block">
                      {r.chairNo || t("pages.dashboard.opsLobbyChair")} · {t(`pages.dashboard.queueStatus.${r.status}`)}
                    </span>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full ${r.status === "IN_PROGRESS" ? "bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" : "bg-sky-500"}`} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming - The Queue */}
        <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("pages.dashboard.opsUpcoming")}</p>
             </div>
             <span className="text-[10px] font-black text-violet-500">
               {t("pages.dashboard.opsQueuedCount", { count: nextAppointments.length })}
             </span>
          </div>

          {nextAppointments.length === 0 ? (
            <div className="py-12 text-center font-black text-slate-200">{t("pages.dashboard.opsEmpty")}</div>
          ) : (
            <ul className="space-y-4">
              {nextAppointments.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 p-4">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-700 dark:text-slate-300">{r.patientName}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block">{r.time}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-200" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Overdue Actions - The Alert Zone */}
        <div className="rounded-[2.5rem] bg-rose-500 dark:bg-rose-950/20 p-8 shadow-2xl shadow-rose-500/20 ring-1 ring-rose-500/10 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
             <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{t("pages.dashboard.opsOverdueActions")}</p>
             </div>
             <Bell size={16} className="text-white/40" />
          </div>

          {overdueAppointments.length === 0 ? (
            <div className="py-12 text-center text-white/20 font-black uppercase tracking-widest">{t("pages.dashboard.opsEmpty")}</div>
          ) : (
            <ul className="space-y-4 relative z-10">
              {overdueAppointments.slice(0, 3).map((r) => (
                <li key={r.id} className="rounded-3xl bg-white/10 backdrop-blur-md p-5 ring-1 ring-white/20">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-white uppercase tracking-tight">{r.patientName}</p>
                      <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mt-1">
                        {r.time} · {t("pages.dashboard.waitingMin", { count: r.waitingMinutes })}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => void sendAlert(r)}
                      disabled={queueBusyId === r.id}
                      className="h-10 rounded-xl bg-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all border border-white/10"
                    >
                      {t("pages.dashboard.actionSendAlert")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void changeQueueStatus(r, "CHECKED_IN")}
                      disabled={queueBusyId === r.id}
                      className="h-10 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-rose-600 hover:scale-105 transition-all shadow-lg"
                    >
                      {t("pages.dashboard.actionCheckIn")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

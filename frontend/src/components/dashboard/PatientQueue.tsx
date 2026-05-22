import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DashboardTodayAppointment } from "../../services/reports";

interface PatientQueueProps {
  queue: {
    waiting: number;
    checkedIn: number;
    inProgress: number;
    rows: DashboardTodayAppointment[];
  };
  queueBusyId: string | null;
  changeStatus: (a: DashboardTodayAppointment, status: string) => void;
  sendAlert: (a: DashboardTodayAppointment) => void;
  statusStyles: Record<string, string>;
}

export function PatientQueue({
  queue,
  queueBusyId,
  changeStatus,
  sendAlert,
  statusStyles
}: PatientQueueProps) {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            {t("pages.dashboard.queueTitle")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("pages.dashboard.queueSubtitle", {
              waiting: queue.waiting,
              checkedIn: queue.checkedIn,
              inProgress: queue.inProgress,
            })}
          </p>
        </div>
        <Link to="/appointments" className="text-xs font-bold text-teal-700 hover:underline">
          {t("pages.dashboard.openCalendar")}
        </Link>
      </div>

      {queue.rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          {t("pages.dashboard.queueEmpty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100">
              <tr>
                <th className="px-2 py-3 text-[11px] font-black uppercase text-slate-400">{t("pages.dashboard.queueTablePatient")}</th>
                <th className="px-2 py-3 text-[11px] font-black uppercase text-slate-400">{t("pages.dashboard.queueTableStatus")}</th>
                <th className="px-2 py-3 text-[11px] font-black uppercase text-slate-400">{t("pages.dashboard.queueTableWait")}</th>
                <th className="px-2 py-3 text-[11px] font-black uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {queue.rows.map((a) => (
                <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-2 py-4">
                    <p className="font-bold text-slate-900">{a.patientName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{a.dentistName}</p>
                  </td>
                  <td className="px-2 py-4">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-tighter ${statusStyles[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-xs font-bold text-slate-600">
                    {t("pages.dashboard.waitingMin", { count: a.waitingMinutes })}
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                        <button
                          onClick={() => changeStatus(a, "CHECKED_IN")}
                          disabled={queueBusyId === a.id}
                          className="rounded-lg border border-teal-300 px-2 py-1 text-[10px] font-black uppercase text-teal-800 hover:bg-teal-50"
                        >
                          Check In
                        </button>
                      )}
                      {a.status === "CHECKED_IN" && (
                        <button
                          onClick={() => changeStatus(a, "IN_PROGRESS")}
                          disabled={queueBusyId === a.id}
                          className="rounded-lg border border-teal-400 px-2 py-1 text-[10px] font-black uppercase text-teal-800 hover:bg-teal-50"
                        >
                          Start
                        </button>
                      )}
                      {a.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => changeStatus(a, "COMPLETED")}
                          disabled={queueBusyId === a.id}
                          className="rounded-lg border border-teal-300 px-2 py-1 text-[10px] font-black uppercase text-teal-700 hover:bg-teal-50"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => sendAlert(a)}
                        disabled={queueBusyId === a.id}
                        className="rounded-lg border border-amber-300 px-2 py-1 text-[10px] font-black uppercase text-amber-700 hover:bg-amber-50"
                      >
                        Alert
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

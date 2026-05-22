import { useTranslation } from "react-i18next";

interface AppointmentRow {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  type: string | null;
  notes: string | null;
  dentist: { id: string; firstName: string; lastName: string };
}

interface AppointmentsTabProps {
  items: AppointmentRow[];
  dateLocale: string;
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-teal-100 text-teal-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNPAID: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  PENDING: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-sky-100 text-sky-700",
  CHECKED_IN: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-fuchsia-100 text-fuchsia-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  NO_SHOW: "bg-rose-100 text-rose-700",
};

export function AppointmentsTab({ items, dateLocale }: AppointmentsTabProps): JSX.Element {
  const { t } = useTranslation();
  const dash = t("pages.common.empty");

  const formatDateTime = (iso: string | null | undefined, empty: string, locale: string): string => {
    if (!iso) return empty;
    return new Date(iso).toLocaleString(locale, { timeZone: "Asia/Manila" });
  };

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.appointments.empty")}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colWhen")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colType")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colDentist")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colDuration")}</th>
            <th className="px-2 py-2">{t("pages.patientDetail.appointments.colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b border-slate-100">
              <td className="px-2 py-2 text-slate-800">{formatDateTime(a.scheduledAt, dash, dateLocale)}</td>
              <td className="px-2 py-2 text-slate-600">{a.type ?? dash}</td>
              <td className="px-2 py-2 text-slate-600">
                {t("pages.common.drPrefix")} {a.dentist.firstName} {a.dentist.lastName}
              </td>
              <td className="px-2 py-2 text-slate-600">
                {t("pages.patientDetail.appointments.durationMin", { count: a.duration })}
              </td>
              <td className="px-2 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${ STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-700" }`}
                >
                  {t(`pages.dashboard.queueStatus.${a.status}`, { defaultValue: a.status })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

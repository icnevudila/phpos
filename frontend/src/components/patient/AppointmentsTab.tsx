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
  PAID: "bg-teal-100 text-teal-800 border-teal-200",
  PARTIAL: "bg-amber-100 text-amber-800 border-amber-200",
  UNPAID: "bg-rose-100 text-rose-800 border-rose-200",
  CANCELLED: "bg-brand-surface text-brand-muted border-brand-border",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
  CHECKED_IN: "bg-indigo-50 text-indigo-700 border-indigo-200",
  IN_PROGRESS: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  COMPLETED: "bg-teal-50 text-teal-800 border-teal-200",
  NO_SHOW: "bg-rose-50 text-rose-700 border-rose-200",
};

export function AppointmentsTab({ items, dateLocale }: AppointmentsTabProps): JSX.Element {
  const { t } = useTranslation();
  const dash = "--";

  const formatDateTime = (iso: string | null | undefined, empty: string, locale: string): string => {
    if (!iso) return empty;
    return new Date(iso).toLocaleString(locale, { 
      timeZone: "Asia/Manila",
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (items.length === 0) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center bg-brand-surface-soft border border-brand-border">
        <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">{t("pages.patientDetail.appointments.empty", { defaultValue: "No Appointments Found" })}</p>
      </div>
    );
  }

  return (
    <div className="card border border-brand-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-brand-surface-muted border-b border-brand-border">
            <tr>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t("pages.patientDetail.appointments.colWhen", { defaultValue: "When" })}</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t("pages.patientDetail.appointments.colType", { defaultValue: "Type" })}</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t("pages.patientDetail.appointments.colProvider", { defaultValue: "Provider" })}</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t("pages.patientDetail.appointments.colDuration", { defaultValue: "Duration" })}</th>
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-brand-muted">{t("pages.patientDetail.appointments.colStatus", { defaultValue: "Status" })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50 bg-white">
            {items.map((a) => (
              <tr key={a.id} className="hover:bg-brand-surface-soft transition-colors">
                <td className="py-3 px-4 text-xs font-bold text-brand-text whitespace-nowrap">{formatDateTime(a.scheduledAt, dash, dateLocale)}</td>
                <td className="py-3 px-4 text-xs font-bold text-brand-text uppercase tracking-tight">{a.type ? a.type.replace(/_/g, ' ') : dash}</td>
                <td className="py-3 px-4 text-xs font-medium text-brand-muted">
                  {t("pages.common.drPrefix", { defaultValue: "Dr." })} {a.dentist.firstName} {a.dentist.lastName}
                </td>
                <td className="py-3 px-4 text-xs font-bold text-brand-text-soft tabular-nums">
                  {a.duration} mins
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] border text-[10px] font-black uppercase tracking-widest ${ STATUS_STYLES[a.status] ?? "bg-brand-surface text-brand-text border-brand-border" }`}
                  >
                    {t(`pages.patientDetail.appointments.status.${a.status}`, { defaultValue: a.status.replace(/_/g, ' ') })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

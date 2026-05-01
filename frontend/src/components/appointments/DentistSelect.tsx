import { useTranslation } from "react-i18next";

import type { DentistRow } from "../../types/appointment";

interface Props {
  dentists: DentistRow[];
  value: string;
  onChange: (id: string) => void;
  includeAll?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DentistSelect({
  dentists,
  value,
  onChange,
  includeAll = false,
  disabled = false,
  className = "",
}: Props): JSX.Element {
  const { t } = useTranslation();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 ${className}`}
    >
      {includeAll ? (
        <option value="">{t("pages.appointments.allDentists")}</option>
      ) : (
        <option value="">{t("pages.appointments.selectDentist")}</option>
      )}
      {dentists.map((d) => (
        <option key={d.id} value={d.id}>
          Dr. {d.firstName} {d.lastName}
        </option>
      ))}
    </select>
  );
}

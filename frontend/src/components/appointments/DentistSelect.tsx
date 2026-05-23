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
      className={`h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow ${className}`}
    >
      {includeAll ? (
        <option value="">{t("pages.appointments.allDentists", { defaultValue: "All Dentists" })}</option>
      ) : (
        <option value="">{t("pages.appointments.selectDentist", { defaultValue: "Select Dentist" })}</option>
      )}
      {dentists.map((d) => (
        <option key={d.id} value={d.id}>
          Dr. {d.firstName} {d.lastName}
        </option>
      ))}
    </select>
  );
}

import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant: "primary" | "success" | "warning" | "danger" | "slate";
  };
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatCard({ label, value, icon: Icon, badge, subtitle, trend }: StatCardProps): JSX.Element {
  return (
    <div className="card flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">{label}</span>
        {Icon && <Icon size={20} className="text-brand-primary opacity-80" />}
      </div>
      <div>
        <span className="text-3xl font-black tracking-tight text-brand-text">{value}</span>
      </div>
      {(badge || subtitle || trend) && (
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          {badge && (
            <span className={`badge badge-${badge.variant}`}>
              {badge.text}
            </span>
          )}
          {trend && (
            <span className={`font-semibold ${trend.value > 0 ? "text-brand-success" : trend.value < 0 ? "text-brand-danger" : "text-brand-muted"}`}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="text-brand-muted-2">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}

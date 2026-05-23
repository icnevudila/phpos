import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
        <h1 className="text-2xl sm:text-[28px] leading-tight font-bold tracking-tight text-brand-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm font-medium text-brand-muted">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

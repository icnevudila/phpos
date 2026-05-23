import type { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[var(--radius-lg)] border border-dashed border-brand-border bg-brand-surface-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface border border-brand-border shadow-sm mb-4">
        <Icon size={24} className="text-brand-muted" />
      </div>
      <h3 className="text-base font-bold text-brand-text mb-1">{title}</h3>
      <p className="text-sm font-medium text-brand-muted max-w-sm mx-auto mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

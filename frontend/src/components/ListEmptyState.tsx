import { Link } from "react-router-dom";

export type EmptyStateAction =
  | { kind: "link"; to: string; label: string }
  | { kind: "button"; onClick: () => void; label: string }
  | { kind: "hash"; href: string; label: string };

const primaryCls =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ";

const secondaryCls =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2     ";

function EmptyAction({ action, variant }: { action: EmptyStateAction; variant: "solid" | "outline" }): JSX.Element {
  const cls = variant === "solid" ? primaryCls : secondaryCls;
  if (action.kind === "link") {
    return (
      <Link to={action.to} className={cls}>
        {action.label}
      </Link>
    );
  }
  if (action.kind === "hash") {
    return (
      <a href={action.href} className={cls}>
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}

function IconReceipt(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
      <path
        d="M9 3h6l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        className="stroke-current stroke-[1.75]"
        strokeLinejoin="round"
      />
      <path d="M9 3v4h4" className="stroke-current stroke-[1.75]" strokeLinejoin="round" />
      <path d="M8 12h8M8 16h5" className="stroke-current stroke-[1.75]" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        className="stroke-current stroke-[1.75]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBell(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        className="stroke-current stroke-[1.75]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
        className="stroke-current stroke-[1.75]"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
      <path d="M3 3v18h18" className="stroke-current stroke-[1.75]" strokeLinecap="round" />
      <path d="M7 14l4-4 4 4 5-6" className="stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBox(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
        className="stroke-current stroke-[1.75]"
        strokeLinejoin="round"
      />
      <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" className="stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  receipt: IconReceipt,
  users: IconUsers,
  bell: IconBell,
  shield: IconShield,
  chart: IconChart,
  box: IconBox,
} as const;

export type ListEmptyIcon = keyof typeof ICONS;

export function ListEmptyState({
  icon,
  title,
  description,
  primary,
  secondary,
}: {
  icon: ListEmptyIcon;
  title: string;
  description: string;
  primary?: EmptyStateAction;
  secondary?: EmptyStateAction;
}): JSX.Element {
  const Ico = ICONS[icon];
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center sm:py-12"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Ico />
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="max-w-md text-sm text-slate-600">{description}</p>
      {primary || secondary ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          {primary ? <EmptyAction action={primary} variant="solid" /> : null}
          {secondary ? <EmptyAction action={secondary} variant="outline" /> : null}
        </div>
      ) : null}
    </div>
  );
}

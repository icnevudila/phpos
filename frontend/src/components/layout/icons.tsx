import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({
  size = 18,
  strokeWidth = 1.8,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Base>
  );
}

export function CalendarIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 3v4M16 3v4" />
    </Base>
  );
}

/** Bekleme listesi — kum saati */
export function HourglassIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M5 2v6l4 4-4 4v6M19 2v6l-4 4 4 4v6" />
    </Base>
  );
}

export function UsersIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15.5 20c0-2.5 1.8-4.5 4.5-4.5" />
    </Base>
  );
}

export function ReceiptIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Base>
  );
}

export function BoxIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </Base>
  );
}

export function BellIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Base>
  );
}

export function ChevronLeftIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M15 6l-6 6 6 6" />
    </Base>
  );
}

export function ChevronRightIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M9 6l6 6-6 6" />
    </Base>
  );
}

export function ChevronDownIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M6 9l6 6 6-6" />
    </Base>
  );
}

export function MenuIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Base>
  );
}

export function XIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function LogOutIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </Base>
  );
}

export function ToothIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 2c3 0 5 2 5 4 0 1.5-.5 2.5-.5 4.5S18 14 17 17s-2 4-3 4-1-1.5-1.5-3-.5-3-.5-3-.5 1.5-.5 3S11 21 10 21s-2-1-3-4-.5-4.5-.5-6.5S6 7.5 6 6c0-2 3-4 6-4z" />
    </Base>
  );
}

export function SettingsIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-3.42 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Base>
  );
}

export function ReportBarsIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M4 19V5M4 19h16M8 19V9M12 19v-6M16 19v-9" />
    </Base>
  );
}

/** Aged receivables / open balances — distinct from generic reports hub */
export function AgingReceivablesIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
      <path d="M12 6v6l4 2" />
      <path d="M8 18h8" />
      <path d="M8 14h3" />
    </Base>
  );
}

/** HMO / sigorta — fatura ikonundan ayrıştırmak için */
export function HmoShieldIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </Base>
  );
}

/** Personel yönetimi (ADMIN) */
export function BriefcaseIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Base>
  );
}

/** Hasta portalı / dış bağlantı */
export function GlobeIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Base>
  );
}

/** Pazarlama ana sayfası */
export function HomeSmileIcon(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </Base>
  );
}

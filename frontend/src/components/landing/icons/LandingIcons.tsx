import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...rest }: IconProps & { children: React.ReactNode }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ────────── PERSONAS (4) ────────── */

export function IconPersonaOwner(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
      <circle cx="12" cy="7.5" r="3.5" />
      <path d="M9.5 14v2.5M14.5 14v2.5M8 20l1.5-3.5M16 20l-1.5-3.5" />
      <path d="M4 9l1.5 1.5M20 9l-1.5 1.5" />
    </Base>
  );
}

export function IconPersonaDentist(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M8 3.5c-1.8 0-3 1-3 3 0 1.3.4 3.3 1 5.5.6 2.4 1.2 5 1.8 6.5.4 1 .9 1.5 1.6 1.5.9 0 1.1-.9 1.6-2.2.4-1.1.8-2.1 1.5-2.1.7 0 1.1 1 1.5 2.1.5 1.3.7 2.2 1.6 2.2.7 0 1.2-.5 1.6-1.5.6-1.5 1.2-4.1 1.8-6.5.6-2.2 1-4.2 1-5.5 0-2-1.2-3-3-3-1 0-1.8.5-2.8.5H10.8C9.8 4 9 3.5 8 3.5Z" />
      <path d="M10 11h4" opacity=".6" />
    </Base>
  );
}

export function IconPersonaReception(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M11 14h5" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
      <circle cx="8" cy="17" r="1" fill="currentColor" />
      <path d="M11 17h3" />
    </Base>
  );
}

export function IconPersonaPatient(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10v.5M15.5 10v.5" strokeWidth={2.2} />
      <path d="M8 14.5c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2" />
      <path d="m17.5 6.5 1.2-1.2M5.3 5.3l1.2 1.2" opacity=".5" />
    </Base>
  );
}

/* ────────── TRUST BADGES (hero, 4) ────────── */

export function IconTrustCloud(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M7 18h10a4 4 0 0 0 .7-7.95 6 6 0 0 0-11.6 1A3.5 3.5 0 0 0 7 18Z" />
      <path d="M12 13v4m-2-2 2 2 2-2" opacity=".7" />
    </Base>
  );
}

export function IconTrustShield(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 3 4 6v6c0 4.5 3.2 8.2 8 9 4.8-.8 8-4.5 8-9V6l-8-3Z" />
      <path d="m9 12 2.2 2L15 10" />
    </Base>
  );
}

export function IconTrustDevice(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
      <path d="M7 5.5h10M7 16h10" opacity=".5" />
    </Base>
  );
}

export function IconTrustGlobe(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </Base>
  );
}

/* ────────── DEVICE SHOWCASE (3) ────────── */

export function IconDevicePhone(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M10 18.5h4" />
      <path d="M6 5.5h12M6 15.5h12" opacity=".4" />
    </Base>
  );
}

export function IconDeviceTablet(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <path d="M10 18h4" />
    </Base>
  );
}

export function IconDeviceDesktop(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M2 14h20M9 21h6M12 17v4" />
    </Base>
  );
}

/* ────────── ALERT + CONTEXT ────────── */

export function IconAlert(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </Base>
  );
}

export function IconPhoneCall(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M5 4h4l1.5 4-2 1.5a12 12 0 0 0 6 6L16 13.5l4 1.5v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </Base>
  );
}

export function IconFolder(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </Base>
  );
}

export function IconSpreadsheet(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M3.5 9h17M3.5 14.5h17M9 3.5v17M15 3.5v17" opacity=".7" />
    </Base>
  );
}

/* ────────── EVERYTHING INSIDE CHIPS (28) ────────── */

export function IconCSV(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 4v10m-4-4 4 4 4-4" />
      <path d="M5 18h14" />
    </Base>
  );
}

export function IconCursor(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M6 3v15l4-3.5 2.5 5.5 2.5-1.2-2.5-5.3H18L6 3Z" />
    </Base>
  );
}

export function IconAudit(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M7 3h9l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M15 3v5h5M9 12h6M9 15.5h6M9 9h3" opacity=".8" />
    </Base>
  );
}

export function IconRoles(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
      <path d="M12 16.4v1.6" />
    </Base>
  );
}

export function IconDark(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z" />
    </Base>
  );
}

export function IconLang(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.3 2.5 2.3 14.5 0 17M12 3.5c-2.3 2.5-2.3 14.5 0 17" opacity=".7" />
    </Base>
  );
}

export function IconPeso(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 7v10M9 8.5h4a2.5 2.5 0 0 1 0 5H9" />
      <path d="M7.5 11h7.5M7.5 13.2h7.5" opacity=".8" />
    </Base>
  );
}

export function IconPesoMono(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M8 4v16M8 6h5a3 3 0 0 1 0 6H8" />
      <path d="M6 9h9M6 11.5h9" opacity=".8" />
    </Base>
  );
}

export function IconCard(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19" />
      <path d="M6 15h3M12 15h2" />
    </Base>
  );
}

export function IconHospital(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M4 21V8l8-4 8 4v13" />
      <path d="M4 21h16M10 21v-4h4v4" />
      <path d="M12 10v4M10 12h4" />
    </Base>
  );
}

export function IconBox(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="m12 3 9 4.5v9L12 21 3 16.5v-9L12 3Z" />
      <path d="m3 7.5 9 4.5 9-4.5M12 12v9" />
    </Base>
  );
}

export function IconMail(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </Base>
  );
}

export function IconPDF(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M7 3h9l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M15 3v5h5" />
      <path d="M8.5 13v4M8.5 13h1.3a1.1 1.1 0 0 1 0 2.2H8.5M12.5 13h1.5a1.2 1.2 0 0 1 1.2 1.2v1.6a1.2 1.2 0 0 1-1.2 1.2h-1.5V13ZM17 13h2M17 15h1.5M17 13v4" />
    </Base>
  );
}

export function IconSelfBook(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M10 18.5h4" />
      <rect x="8.5" y="6" width="7" height="7" rx="1" />
      <path d="M8.5 9h7M11 6v7" opacity=".6" />
    </Base>
  );
}

export function IconClockAlert(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="10.5" cy="13" r="7.5" />
      <path d="M10.5 9v4l2.5 1.5" />
      <path d="M19 4v5" />
      <circle cx="19" cy="11.5" r="0.6" fill="currentColor" />
    </Base>
  );
}

export function IconHourglass(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9h10c0-5-5-6-5-9s5-4 5-9" />
    </Base>
  );
}

export function IconXray(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4" opacity=".6" />
      <path d="M10 10c0-1 .5-2 2-2s2 1 2 2-1 1.5-2 3v3" />
    </Base>
  );
}

export function IconAllergy(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </Base>
  );
}

export function IconTreatmentPlan(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3.5" y="6.5" width="17" height="13" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5v3M16 3.5v3" />
      <path d="M7.5 14h5M7.5 16.5h7" opacity=".8" />
    </Base>
  );
}

export function IconMultiBranch(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="8" width="7" height="13" rx="1" />
      <rect x="14" y="4" width="7" height="17" rx="1" />
      <path d="M5 11h3M5 14h3M5 17h3M16 7h3M16 10h3M16 13h3M16 16h3" opacity=".7" />
    </Base>
  );
}

export function IconEye(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  );
}

export function IconClockGlobe(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
      <path d="M3 12h18" opacity=".5" />
    </Base>
  );
}

export function IconCalendar(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" />
    </Base>
  );
}

export function IconRegister(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="m4 20 3-1 11-11-2-2L5 17l-1 3Z" />
      <path d="m15 8 2 2" opacity=".7" />
    </Base>
  );
}

export function IconKeyboard(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01" strokeWidth={2.2} />
      <path d="M6 14h12" />
    </Base>
  );
}

export function IconHistory(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function IconPower(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 3v8" />
      <path d="M7.5 6.5A7 7 0 1 0 16.5 6.5" />
    </Base>
  );
}

export function IconDragHandle(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="9" cy="6" r="1.3" fill="currentColor" />
      <circle cx="9" cy="12" r="1.3" fill="currentColor" />
      <circle cx="9" cy="18" r="1.3" fill="currentColor" />
      <circle cx="15" cy="6" r="1.3" fill="currentColor" />
      <circle cx="15" cy="12" r="1.3" fill="currentColor" />
      <circle cx="15" cy="18" r="1.3" fill="currentColor" />
    </Base>
  );
}

/* ────────── EYEBROW & MISC ────────── */

export function IconSparkle(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 3.5l1.8 4.3 4.3 1.8-4.3 1.8L12 15.7l-1.8-4.3-4.3-1.8 4.3-1.8z" />
      <path d="M18 16l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" />
    </Base>
  );
}

export function IconGrid(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function IconClock(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Base>
  );
}

export function IconUsers(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c.8-3 3-4.5 5.5-4.5S13.7 16 14.5 19" />
      <circle cx="16.5" cy="8" r="2.3" />
      <path d="M15 14c2.5 0 4.5 1.5 5 4" />
    </Base>
  );
}

export function IconFlow(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="5.5" cy="6" r="2" />
      <circle cx="5.5" cy="18" r="2" />
      <circle cx="18.5" cy="12" r="2" />
      <path d="M7.5 6h3a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-3" />
      <path d="M13.5 12h3" />
    </Base>
  );
}

export function IconDevices(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <rect x="3" y="5" width="13" height="9" rx="1.5" />
      <path d="M3 17h9" />
      <rect x="15" y="9" width="6" height="11" rx="1.2" />
    </Base>
  );
}

export function IconShield(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M12 3.5 5 6v5.2c0 4 2.8 7.5 7 9.3 4.2-1.8 7-5.3 7-9.3V6z" />
      <path d="m9 12 2 2 4-4" />
    </Base>
  );
}

export function IconPriceTag(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M3.5 12.5 12 4l7 .5.5 7-8.5 8.5a2 2 0 0 1-2.8 0l-4.7-4.7a2 2 0 0 1 0-2.8z" />
      <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
    </Base>
  );
}

export function IconSwap(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </Base>
  );
}

export function IconQuote(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M6 10c0-2.5 2-4 4-4v2c-1 0-2 .8-2 2h2v5H5v-5zm8 0c0-2.5 2-4 4-4v2c-1 0-2 .8-2 2h2v5h-4z" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconHelp(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
      <path d="M12 16.5v.01" strokeWidth={2.2} />
    </Base>
  );
}

export function IconPlug(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="M9 3v4M15 3v4" />
      <path d="M6.5 7h11v4a5.5 5.5 0 0 1-11 0z" />
      <path d="M12 16.5V21" />
    </Base>
  );
}

export function IconCrown(p: IconProps): JSX.Element {
  return (
    <Base {...p}>
      <path d="m3 8 3.5 4L12 6l5.5 6L21 8l-1.5 10h-15z" />
      <path d="M7 19h10" />
    </Base>
  );
}

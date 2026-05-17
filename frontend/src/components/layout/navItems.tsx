import type { UserRole } from "../../types/user";
import {
  BellIcon,
  BoxIcon,
  BriefcaseIcon,
  CalendarIcon,
  DashboardIcon,
  GlobeIcon,
  HmoShieldIcon,
  HomeSmileIcon,
  HourglassIcon,
  AgingReceivablesIcon,
  ReceiptIcon,
  ReportBarsIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "./icons";

export type NavSectionId = "overview" | "clinical" | "billing" | "operations" | "admin";

export interface NavItem {
  key: string;
  to: string;
  /** When true, only `pathname === to` counts as active (no prefix match). */
  exact?: boolean;
  matchPrefix?: string;
  icon: (props: { size?: number; className?: string }) => JSX.Element;
  roles?: UserRole[];
  section: NavSectionId;
}

const PORTAL_SLUG = (import.meta.env.VITE_PORTAL_DEMO_SLUG as string | undefined)?.trim();

const CORE_NAV: NavItem[] = [
  {
    key: "dashboard",
    to: "/dashboard",
    section: "overview",
    icon: DashboardIcon,
  },
  {
    key: "publicSite",
    to: "/",
    exact: true,
    section: "overview",
    icon: HomeSmileIcon,
  },
  {
    key: "reports",
    to: "/reports",
    exact: true,
    section: "overview",
    icon: ReportBarsIcon,
  },
  ...(PORTAL_SLUG
    ? ([
        {
          key: "patientPortal",
          to: `/${PORTAL_SLUG}/portal/login`,
          section: "overview" as const,
          icon: GlobeIcon,
        },
      ] satisfies NavItem[])
    : []),
  {
    key: "appointments",
    to: "/appointments",
    section: "clinical",
    icon: CalendarIcon,
  },
  {
    key: "waitlist",
    to: "/waitlist",
    section: "clinical",
    icon: HourglassIcon,
  },
  {
    key: "patients",
    to: "/patients",
    matchPrefix: "/patients",
    section: "clinical",
    icon: UsersIcon,
  },
  {
    key: "compliance",
    to: "/compliance",
    section: "clinical",
    icon: ShieldCheckIcon,
    roles: ["ADMIN", "DENTIST"],
  },
  {
    key: "invoices",
    to: "/invoices",
    matchPrefix: "/invoices",
    section: "billing",
    icon: ReceiptIcon,
  },
  {
    key: "hmo",
    to: "/hmo-claims",
    matchPrefix: "/hmo-claims",
    section: "billing",
    icon: HmoShieldIcon,
  },
  {
    key: "ar-aging",
    to: "/reports/aged-receivables",
    matchPrefix: "/reports/aged-receivables",
    section: "billing",
    icon: AgingReceivablesIcon,
  },
  {
    key: "hmoProviders",
    to: "/hmo-providers",
    section: "billing",
    icon: HmoShieldIcon,
    roles: ["ADMIN"],
  },
  {
    key: "philhealth",
    to: "/philhealth",
    section: "billing",
    icon: ShieldCheckIcon,
    roles: ["ADMIN"],
  },
  {
    key: "inventory",
    to: "/inventory",
    section: "operations",
    icon: BoxIcon,
    roles: ["ADMIN", "DENTIST"],
  },
  {
    key: "notifications",
    to: "/notifications",
    section: "operations",
    icon: BellIcon,
  },
  {
    key: "staff",
    to: "/staff",
    matchPrefix: "/staff",
    section: "admin",
    icon: BriefcaseIcon,
    roles: ["ADMIN"],
  },
  {
    key: "settings",
    to: "/settings",
    section: "admin",
    icon: SettingsIcon,
  },
];

const SECTION_ORDER: NavSectionId[] = ["overview", "clinical", "billing", "operations", "admin"];

export function filterNavForRole(role: UserRole | undefined): NavItem[] {
  if (!role) return CORE_NAV.filter((i) => !i.roles);
  return CORE_NAV.filter((i) => !i.roles || i.roles.includes(role));
}

export function groupNavBySection(items: NavItem[]): { section: NavSectionId; items: NavItem[] }[] {
  return SECTION_ORDER.map((section) => ({
    section,
    items: items.filter((i) => i.section === section),
  })).filter((g) => g.items.length > 0);
}

/** En spesifik eşleşme önce (topbar başlığı). */
export function findActiveNavItem(items: NavItem[], pathname: string): NavItem | undefined {
  const prefixLen = (it: NavItem): number => {
    if (it.exact) return it.to.length + 10_000;
    return (it.matchPrefix ?? it.to).length;
  };
  const sorted = [...items].sort((a, b) => prefixLen(b) - prefixLen(a));
  return sorted.find((i) => isActiveItem(i, pathname));
}

export function isActiveItem(item: NavItem, pathname: string): boolean {
  if (pathname === item.to) return true;
  if (item.exact) return false;
  const prefix = item.matchPrefix ?? item.to;
  if (prefix !== "/" && pathname.startsWith(`${prefix}/`)) return true;
  return false;
}

// Small brand icon for sidebar header
export { ToothIcon as BrandIcon } from "./icons";

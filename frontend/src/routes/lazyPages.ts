import { lazy } from "react";

export const HomePage = lazy(() => import("../pages/HomePage").then((m) => ({ default: m.HomePage })));
export const DashboardPage = lazy(() => import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
export const PatientDetailPage = lazy(() =>
  import("../pages/PatientDetailPage").then((m) => ({ default: m.PatientDetailPage })),
);
export const ReportsPage = lazy(() => import("../pages/ReportsPage").then((m) => ({ default: m.ReportsPage })));
export const InventoryPage = lazy(() => import("../pages/InventoryPage").then((m) => ({ default: m.InventoryPage })));
export const AppointmentsPage = lazy(() =>
  import("../pages/AppointmentsPage").then((m) => ({ default: m.AppointmentsPage })),
);
export const InvoicesListPage = lazy(() =>
  import("../pages/InvoicesListPage").then((m) => ({ default: m.InvoicesListPage })),
);
export const InvoicePage = lazy(() => import("../pages/InvoicePage").then((m) => ({ default: m.InvoicePage })));
export const HmoClaimsPage = lazy(() => import("../pages/HmoClaimsPage").then((m) => ({ default: m.HmoClaimsPage })));
export const HmoClaimDetailPage = lazy(() =>
  import("../pages/HmoClaimDetailPage").then((m) => ({ default: m.HmoClaimDetailPage })),
);
export const SettingsPage = lazy(() => import("../pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
export const PatientList = lazy(() => import("../pages/PatientList").then((m) => ({ default: m.PatientList })));
export const WaitlistPage = lazy(() => import("../pages/WaitlistPage").then((m) => ({ default: m.WaitlistPage })));
export const NotificationsPage = lazy(() =>
  import("../pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })),
);
export const AgedReceivablesPage = lazy(() =>
  import("../pages/AgedReceivablesPage").then((m) => ({ default: m.AgedReceivablesPage })),
);
export const StaffPage = lazy(() => import("../pages/StaffPage").then((m) => ({ default: m.StaffPage })));
export const CompliancePage = lazy(() => import("../pages/CompliancePage").then((m) => ({ default: m.CompliancePage })));
export const PhilHealthClaimsPage = lazy(() =>
  import("../pages/PhilHealthClaimsPage").then((m) => ({ default: m.PhilHealthClaimsPage })),
);
export const PatientPresentationPage = lazy(() =>
  import("../pages/PatientPresentationPage").then((m) => ({ default: m.PatientPresentationPage })),
);
export const HQDashboardPage = lazy(() =>
  import("../pages/HQDashboardPage").then((m) => ({ default: m.HQDashboardPage })),
);

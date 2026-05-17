import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { SuspenseRoute } from "./components/LazyRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute, RoleGuard } from "./components/ProtectedRoute";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { CookiesPage } from "./pages/CookiesPage";
import { FaqPage } from "./pages/FaqPage";
import { TeleConsultationPage } from "./pages/TeleConsultationPage";
import { KioskHomePage } from "./pages/KioskHomePage";
import { KioskIntakePage } from "./pages/KioskIntakePage";
import { HmoProvidersPage } from "./pages/HmoProvidersPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TermsPage } from "./pages/TermsPage";
import { PricingPage } from "./pages/PricingPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { PublicQueuePage } from "./pages/PublicQueuePage";
import { PortalLayout } from "./portal/PortalLayout";
import { PortalProtectedRoute } from "./portal/PortalProtectedRoute";
import { PortalAppointmentsPage } from "./portal/pages/PortalAppointmentsPage";
import { PortalBookPage } from "./portal/pages/PortalBookPage";
import { PortalHistoryPage } from "./portal/pages/PortalHistoryPage";
import { PortalHomePage } from "./portal/pages/PortalHomePage";
import { PortalLoginPage } from "./portal/pages/PortalLoginPage";
import { PortalRegisterPage } from "./portal/pages/PortalRegisterPage";
import {
  AgedReceivablesPage,
  AppointmentsPage,
  CompliancePage,
  DashboardPage,
  HmoClaimDetailPage,
  HmoClaimsPage,
  HomePage,
  HQDashboardPage,
  InventoryPage,
  InvoicePage,
  InvoicesListPage,
  NotificationsPage,
  PatientDetailPage,
  PatientList,
  PatientPresentationPage,
  PhilHealthClaimsPage,
  ReportsPage,
  SettingsPage,
  StaffPage,
  WaitlistPage,
} from "./routes/lazyPages";

function L({ children }: { children: ReactNode }): JSX.Element {
  return <SuspenseRoute>{children}</SuspenseRoute>;
}

export default function App(): JSX.Element {
  return (
    <RouteErrorBoundary>
      <Routes>
        <Route path="/" element={<L><HomePage /></L>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/queue/display" element={<PublicQueuePage />} />
        <Route path="/public-queue" element={<Navigate to="/queue/display" replace />} />
        <Route path="/kiosk/:slug" element={<KioskHomePage />} />
        <Route path="/:slug/kiosk/intake" element={<KioskIntakePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/hq/dashboard"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <L>
                    <HQDashboardPage />
                  </L>
                </RoleGuard>
              }
            />
            <Route path="/dashboard" element={<L><DashboardPage /></L>} />
            <Route
              path="/compliance"
              element={
                <RoleGuard roles={["ADMIN", "DENTIST"]}>
                  <L>
                    <CompliancePage />
                  </L>
                </RoleGuard>
              }
            />
            <Route
              path="/philhealth"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <L>
                    <PhilHealthClaimsPage />
                  </L>
                </RoleGuard>
              }
            />
            <Route path="/reports" element={<L><ReportsPage /></L>} />
            <Route path="/reports/aged-receivables" element={<L><AgedReceivablesPage /></L>} />
            <Route path="/settings" element={<L><SettingsPage /></L>} />
            <Route
              path="/staff"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <L>
                    <StaffPage />
                  </L>
                </RoleGuard>
              }
            />
            <Route path="/appointments" element={<L><AppointmentsPage /></L>} />
            <Route
              path="/waitlist"
              element={
                <RoleGuard roles={["ADMIN", "DENTIST", "RECEPTIONIST"]}>
                  <L>
                    <WaitlistPage />
                  </L>
                </RoleGuard>
              }
            />
            <Route path="/patients" element={<L><PatientList /></L>} />
            <Route path="/patients/:id" element={<L><PatientDetailPage /></L>} />
            <Route path="/patients/:id/presentation" element={<L><PatientPresentationPage /></L>} />
            <Route path="/tele-consultation/:id" element={<TeleConsultationPage />} />
            <Route path="/invoices" element={<L><InvoicesListPage /></L>} />
            <Route path="/invoices/:id" element={<L><InvoicePage /></L>} />
            <Route path="/hmo-claims" element={<L><HmoClaimsPage /></L>} />
            <Route path="/hmo-claims/:id" element={<L><HmoClaimDetailPage /></L>} />
            <Route
              path="/hmo-providers"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <HmoProvidersPage />
                </RoleGuard>
              }
            />
            <Route path="/notifications" element={<L><NotificationsPage /></L>} />
            <Route
              path="/inventory"
              element={
                <RoleGuard roles={["ADMIN", "DENTIST"]}>
                  <L>
                    <InventoryPage />
                  </L>
                </RoleGuard>
              }
            />
          </Route>
        </Route>
        <Route path="/:slug/kiosk" element={<KioskHomePage />} />
        <Route path="/:slug/portal" element={<PortalLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<PortalLoginPage />} />
          <Route path="register" element={<PortalRegisterPage />} />
          <Route element={<PortalProtectedRoute />}>
            <Route path="home" element={<PortalHomePage />} />
            <Route path="book" element={<PortalBookPage />} />
            <Route path="appointments" element={<PortalAppointmentsPage />} />
            <Route path="history" element={<PortalHistoryPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RouteErrorBoundary>
  );
}

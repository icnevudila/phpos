import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute, RoleGuard } from "./components/ProtectedRoute";
import { AgedReceivablesPage } from "./pages/AgedReceivablesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { CookiesPage } from "./pages/CookiesPage";
import { FaqPage } from "./pages/FaqPage";
import { HomePage } from "./pages/HomePage";
import { KioskHomePage } from "./pages/KioskHomePage";
import { HmoClaimDetailPage } from "./pages/HmoClaimDetailPage";
import { HmoClaimsPage } from "./pages/HmoClaimsPage";
import { InventoryPage } from "./pages/InventoryPage";
import { InvoicePage } from "./pages/InvoicePage";
import { InvoicesListPage } from "./pages/InvoicesListPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { PatientList } from "./pages/PatientList";
import { PricingPage } from "./pages/PricingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StaffPage } from "./pages/StaffPage";
import { WaitlistPage } from "./pages/WaitlistPage";
import { PortalLayout } from "./portal/PortalLayout";
import { PortalProtectedRoute } from "./portal/PortalProtectedRoute";
import { PortalAppointmentsPage } from "./portal/pages/PortalAppointmentsPage";
import { PortalBookPage } from "./portal/pages/PortalBookPage";
import { PortalHistoryPage } from "./portal/pages/PortalHistoryPage";
import { PortalHomePage } from "./portal/pages/PortalHomePage";
import { PortalLoginPage } from "./portal/pages/PortalLoginPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/kiosk/:slug" element={<KioskHomePage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/aged-receivables" element={<AgedReceivablesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/staff"
            element={
              <RoleGuard roles={["ADMIN"]}>
                <StaffPage />
              </RoleGuard>
            }
          />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route
            path="/waitlist"
            element={
              <RoleGuard roles={["ADMIN", "DENTIST", "RECEPTIONIST"]}>
                <WaitlistPage />
              </RoleGuard>
            }
          />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/invoices" element={<InvoicesListPage />} />
          <Route path="/invoices/:id" element={<InvoicePage />} />
          <Route path="/hmo-claims" element={<HmoClaimsPage />} />
          <Route path="/hmo-claims/:id" element={<HmoClaimDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route
            path="/inventory"
            element={
              <RoleGuard roles={["ADMIN", "DENTIST"]}>
                <InventoryPage />
              </RoleGuard>
            }
          />
        </Route>
      </Route>
      {/* Reception tablet — /[clinic-slug]/kiosk (public) */}
      <Route path="/:slug/kiosk" element={<KioskHomePage />} />
      {/* Patient portal — /[clinic-slug]/portal/* */}
      <Route path="/:slug/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<PortalLoginPage />} />
        <Route element={<PortalProtectedRoute />}>
          <Route path="home" element={<PortalHomePage />} />
          <Route path="book" element={<PortalBookPage />} />
          <Route path="appointments" element={<PortalAppointmentsPage />} />
          <Route path="history" element={<PortalHistoryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

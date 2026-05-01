/**
 * Filipino (PH) staff + portal `pages.*` strings. Shallow-combined (one top-level key per file),
 * then deep-merged over `pages.en.json` in `i18n/index.ts`.
 */
import agedReceivables from "./locales/ph-pages/agedReceivables.json";
import appointments from "./locales/ph-pages/appointments.json";
import common from "./locales/ph-pages/common.json";
import dashboard from "./locales/ph-pages/dashboard.json";
import hmoClaimDetail from "./locales/ph-pages/hmoClaimDetail.json";
import hmoClaims from "./locales/ph-pages/hmoClaims.json";
import invoice from "./locales/ph-pages/invoice.json";
import inventory from "./locales/ph-pages/inventory.json";
import kiosk from "./locales/ph-pages/kiosk.json";
import marketingPublic from "./locales/ph-pages/marketingPublic.json";
import invoicesList from "./locales/ph-pages/invoicesList.json";
import notFound from "./locales/ph-pages/notFound.json";
import notifications from "./locales/ph-pages/notifications.json";
import patientDetail from "./locales/ph-pages/patientDetail.json";
import patients from "./locales/ph-pages/patients.json";
import portal from "./locales/ph-pages/portal.json";
import privacy from "./locales/ph-pages/privacy.json";
import reports from "./locales/ph-pages/reports.json";
import settings from "./locales/ph-pages/settings.json";
import staff from "./locales/ph-pages/staff.json";
import terms from "./locales/ph-pages/terms.json";
import unauthorized from "./locales/ph-pages/unauthorized.json";
import waitlist from "./locales/ph-pages/waitlist.json";

export const phPagesOverlay: Record<string, unknown> = {
  ...common,
  ...notFound,
  ...unauthorized,
  ...privacy,
  ...terms,
  ...patients,
  ...appointments,
  ...waitlist,
  ...notifications,
  ...hmoClaims,
  ...hmoClaimDetail,
  ...invoicesList,
  ...kiosk,
  ...marketingPublic,
  ...reports,
  ...agedReceivables,
  ...dashboard,
  ...patientDetail,
  ...invoice,
  ...inventory,
  ...settings,
  ...staff,
  ...portal,
};

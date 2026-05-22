import { test, expect } from "@playwright/test";
import * as path from "node:path";
import * as fs from "node:fs";

const SCREENSHOT_DIR = "C:/Users/TP2/.gemini/antigravity/brain/23fa5849-45e3-4470-ab8d-71ee93e3c04c/screenshots";

// Ensure the directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PORTAL_SLUG = process.env.E2E_PORTAL_SLUG ?? "iloilo-demo";
const DEMO_PATIENT_ID = process.env.E2E_PATIENT_ID ?? "demo-patient-1";
const DEMO_INVOICE_ID = process.env.E2E_INVOICE_ID ?? "demo-inv-1";

interface PageCase {
  path: string;
  filename: string;
}

const PUBLIC_PAGES: PageCase[] = [
  { path: "/", filename: "01_landing.png" },
  { path: "/login", filename: "02_login.png" },
  { path: "/forgot-password", filename: "03_forgot_password.png" },
  { path: "/reset-password", filename: "04_reset_password.png" },
  { path: "/register", filename: "05_register.png" },
  { path: "/privacy", filename: "06_privacy.png" },
  { path: "/terms", filename: "07_terms.png" },
  { path: "/about", filename: "08_about.png" },
  { path: "/faq", filename: "09_faq.png" },
  { path: "/contact", filename: "10_contact.png" },
  { path: "/pricing", filename: "11_pricing.png" },
  { path: "/cookies", filename: "12_cookies.png" },
  { path: "/queue/display", filename: "13_public_queue_display.png" },
  { path: `/${PORTAL_SLUG}/portal/login`, filename: "14_portal_login.png" },
  { path: `/${PORTAL_SLUG}/portal/register`, filename: "15_portal_register.png" },
  { path: `/${PORTAL_SLUG}/kiosk`, filename: "16_kiosk_home.png" },
  { path: `/${PORTAL_SLUG}/kiosk/intake`, filename: "17_kiosk_intake.png" },
  { path: "/unauthorized", filename: "18_unauthorized.png" },
];

const STAFF_PAGES: PageCase[] = [
  { path: "/dashboard", filename: "19_staff_dashboard.png" },
  { path: "/hq/dashboard", filename: "20_staff_hq_dashboard.png" },
  { path: "/compliance", filename: "21_staff_compliance.png" },
  { path: "/philhealth", filename: "22_staff_philhealth.png" },
  { path: "/reports", filename: "23_staff_reports.png" },
  { path: "/reports/aged-receivables", filename: "24_staff_aged_receivables.png" },
  { path: "/settings", filename: "25_staff_settings.png" },
  { path: "/staff", filename: "26_staff_staff.png" },
  { path: "/appointments", filename: "27_staff_appointments.png" },
  { path: "/waitlist", filename: "28_staff_waitlist.png" },
  { path: "/patients", filename: "29_staff_patients_list.png" },
  { path: `/patients/${DEMO_PATIENT_ID}`, filename: "30_staff_patient_detail.png" },
  { path: `/patients/${DEMO_PATIENT_ID}/presentation`, filename: "31_staff_patient_presentation.png" },
  { path: `/tele-consultation/${DEMO_PATIENT_ID}`, filename: "32_staff_tele_consultation.png" },
  { path: "/invoices", filename: "33_staff_invoices_list.png" },
  { path: `/invoices/${DEMO_INVOICE_ID}`, filename: "34_staff_invoice_detail.png" },
  { path: "/hmo-claims", filename: "35_staff_hmo_claims_list.png" },
  { path: "/hmo-providers", filename: "36_staff_hmo_providers.png" },
  { path: "/notifications", filename: "37_staff_notifications.png" },
  { path: "/inventory", filename: "38_staff_inventory.png" },
];

test.describe("Public pages screenshots", () => {
  // Clear storage state to avoid logged in state for public screenshots
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const pageCase of PUBLIC_PAGES) {
    test(`Capture screenshot of ${pageCase.path}`, async ({ page }) => {
      test.setTimeout(45_000);
      console.log(`Navigating to public page: ${pageCase.path}`);
      await page.goto(pageCase.path, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.locator("body").waitFor({ state: "visible", timeout: 15_000 });
      await page.waitForTimeout(2000); // Allow any animations/loading to settle
      const screenshotPath = path.join(SCREENSHOT_DIR, pageCase.filename);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to ${screenshotPath}`);
    });
  }
});

test.describe("Staff pages screenshots", () => {
  // Re-uses logged in storage state automatically configured by Playwright setup dependency
  test.describe.configure({ mode: "serial" });

  for (const pageCase of STAFF_PAGES) {
    test(`Capture screenshot of ${pageCase.path}`, async ({ page }) => {
      test.setTimeout(45_000);
      console.log(`Navigating to staff page: ${pageCase.path}`);
      await page.goto(pageCase.path, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.locator("body").waitFor({ state: "visible", timeout: 15_000 });
      await page.waitForTimeout(2500); // Wait for dashboard elements / charts to load
      const screenshotPath = path.join(SCREENSHOT_DIR, pageCase.filename);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to ${screenshotPath}`);
    });
  }
});

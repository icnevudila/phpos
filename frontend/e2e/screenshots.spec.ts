import { expect, test, type Page } from "@playwright/test";
import fs from "fs";

const DEST_DIR = "C:/Users/TP2/Desktop/dentql-screenshots";
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const PORTAL_SLUG = process.env.E2E_PORTAL_SLUG ?? "iloilo-demo";
const DEMO_PATIENT_ID = process.env.E2E_PATIENT_ID ?? "demo-patient-1";
const DEMO_INVOICE_ID = process.env.E2E_INVOICE_ID ?? "demo-inv-1";

type PageCase = { path: string; label: string; allowLoginRedirect?: boolean };

const PUBLIC_PAGES: PageCase[] = [
  { path: "/", label: "Landing (Home)" },
  { path: "/login", label: "Login" },
  { path: "/forgot-password", label: "Forgot password" },
  { path: "/reset-password", label: "Reset password" },
  { path: "/register", label: "Register" },
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
  { path: "/about", label: "About" },
  { path: "/faq", label: "FAQ" },
  { path: "/contact", label: "Contact" },
  { path: "/pricing", label: "Pricing" },
  { path: "/cookies", label: "Cookies" },
  { path: "/queue/display", label: "Public queue display" },
  { path: `/${PORTAL_SLUG}/portal/login`, label: "Portal login" },
  { path: `/${PORTAL_SLUG}/portal/register`, label: "Portal register" },
  { path: `/${PORTAL_SLUG}/kiosk`, label: "Kiosk home" },
  { path: `/${PORTAL_SLUG}/kiosk/intake`, label: "Kiosk intake" },
  { path: "/unauthorized", label: "Unauthorized" },
];

const STAFF_PAGES: PageCase[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/hq/dashboard", label: "HQ dashboard" },
  { path: "/compliance", label: "Compliance" },
  { path: "/philhealth", label: "PhilHealth claims" },
  { path: "/reports", label: "Reports" },
  { path: "/reports/aged-receivables", label: "Aged receivables" },
  { path: "/settings", label: "Settings" },
  { path: "/staff", label: "Staff" },
  { path: "/appointments", label: "Appointments" },
  { path: "/waitlist", label: "Waitlist" },
  { path: "/patients", label: "Patients list" },
  { path: `/patients/${DEMO_PATIENT_ID}`, label: "Patient detail" },
  { path: `/patients/${DEMO_PATIENT_ID}/presentation`, label: "Patient presentation" },
  { path: `/tele-consultation/${DEMO_PATIENT_ID}`, label: "Tele-consultation" },
  { path: "/invoices", label: "Invoices list" },
  { path: `/invoices/${DEMO_INVOICE_ID}`, label: "Invoice detail" },
  { path: "/hmo-claims", label: "HMO claims list" },
  { path: "/hmo-providers", label: "HMO providers" },
  { path: "/notifications", label: "Notifications" },
  { path: "/inventory", label: "Inventory" },
];

async function takeScreenshot(page: Page, path: string, label: string) {
  try {
    await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
    await page.locator("body").waitFor({ state: "visible", timeout: 15_000 });
    
    // Wait for common loading spinners or skeletons to disappear
    await page.waitForFunction(() => {
      const hasLoaders = document.querySelectorAll('.animate-pulse, .animate-spin, [class*="skeleton"], [class*="spinner"], .lucide-loader').length > 0;
      const hasLoadingText = document.body.innerText.includes('Loading...');
      return !hasLoaders && !hasLoadingText;
    }, { timeout: 8_000 }).catch(() => {});

    await page.waitForTimeout(2000); // extra wait to ensure data is fully populated

    const safeLabel = label.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    await page.screenshot({ path: `${DEST_DIR}/${safeLabel}.png`, fullPage: true });
  } catch (err) {
    console.error(`Failed to screenshot ${label}:`, err);
  }
}

test.describe("Screenshots - public", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const { path, label } of PUBLIC_PAGES) {
    test(label, async ({ page }) => {
      test.setTimeout(120_000);
      await takeScreenshot(page, path, label);
    });
  }
});

test.describe("Screenshots - staff (admin)", () => {
  test.setTimeout(180_000);

  for (const { path, label } of STAFF_PAGES) {
    test(label, async ({ page }) => {
      await takeScreenshot(page, path, label);
    });
  }

  const PATIENT_TABS = [
    "overview",
    "medical",
    "soap",
    "chart",
    "perio",
    "advanced-perio",
    "tmj",
    "treatment-timeline",
    "before-after",
    "hmo",
    "appointments",
    "treatments",
    "invoices",
    "documents",
    "prescriptions",
    "xray",
    "intraoral",
    "lab",
    "family",
    "consents",
    "referral",
  ] as const;

  for (const tabKey of PATIENT_TABS) {
    test(`Patient tab: ${tabKey}`, async ({ page }) => {
      await takeScreenshot(page, `/patients/${DEMO_PATIENT_ID}?tab=${tabKey}`, `Patient Tab ${tabKey}`);
    });
  }
});

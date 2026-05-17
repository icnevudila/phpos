import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_EMAIL ?? "admin@dentease.ph";
const ADMIN_PASSWORD = process.env.E2E_PASSWORD ?? "admin123";
const PORTAL_SLUG = process.env.E2E_PORTAL_SLUG ?? "iloilo-demo";
const DEMO_PATIENT_ID = process.env.E2E_PATIENT_ID ?? "demo-patient-1";
const DEMO_INVOICE_ID = process.env.E2E_INVOICE_ID ?? "demo-inv-1";

const ERROR_SNIPPETS = [
  /something went wrong/i,
  /route error/i,
  /unexpected error/i,
  /failed to fetch/i,
  /network error/i,
  /cannot read propert/i,
];

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

async function assertPageHealthy(page: Page, path: string, allowLoginRedirect = false): Promise<void> {
  const consoleErrors: string[] = [];
  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  page.on("console", onConsole);

  const response = await page.goto(path, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(400);

  const status = response?.status() ?? 0;
  expect(status, `${path} HTTP`).toBeLessThan(500);

  const url = page.url();
  if (!allowLoginRedirect) {
    expect(url, `${path} should not bounce to login`).not.toMatch(/\/login$/);
  }

  const bodyText = (await page.locator("body").innerText()).slice(0, 8000);
  expect(bodyText.trim().length, `${path} body empty`).toBeGreaterThan(20);

  for (const pattern of ERROR_SNIPPETS) {
    expect(bodyText, `${path} error UI`).not.toMatch(pattern);
  }

  if (consoleErrors.length > 0) {
    const critical = consoleErrors.filter(
      (e) => !/favicon|404.*\.(png|svg|woff)/i.test(e) && !/ResizeObserver/i.test(e),
    );
    expect(critical, `${path} console errors: ${critical.join(" | ")}`).toHaveLength(0);
  }

  page.off("console", onConsole);
}

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByTestId("login-email").fill(ADMIN_EMAIL);
  await page.getByTestId("login-password").fill(ADMIN_PASSWORD);
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/(dashboard|appointments|patients)/, { timeout: 45_000 });
}

test.describe("A–Z page audit — public", () => {
  for (const { path, label } of PUBLIC_PAGES) {
    test(label, async ({ page }) => {
      await assertPageHealthy(page, path, true);
    });
  }
});

test.describe("A–Z page audit — staff (admin)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  for (const { path, label } of STAFF_PAGES) {
    test(label, async ({ page }) => {
      await assertPageHealthy(page, path);
    });
  }

  test("HMO claim detail (first from list)", async ({ page }) => {
    await page.goto("/hmo-claims");
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => undefined);
    const link = page.locator('a[href^="/hmo-claims/"]').first();
    const count = await link.count();
    test.skip(count === 0, "No HMO claims in seed data");
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    await assertPageHealthy(page, href!);
  });
});

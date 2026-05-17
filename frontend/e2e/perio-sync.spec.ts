import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const patientId = process.env.E2E_PATIENT_ID;
const hasCreds = Boolean(email && password && patientId);

test.describe("Perio chart ↔ grid sync", () => {
  test.skip(!hasCreds, "Set E2E_EMAIL, E2E_PASSWORD, and E2E_PATIENT_ID");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email!);
    await page.getByTestId("login-password").fill(password!);
    await page.getByTestId("login-submit").click();
    await page.waitForURL(/\/(dashboard|appointments)/, { timeout: 30_000 });
    await page.goto(`/patients/${patientId}?tab=perio`);
    await page.getByTestId("perio-tooth-btn-3").waitFor({ timeout: 20_000 });
  });

  test("grid selection highlights chart row", async ({ page }) => {
    await page.getByTestId("perio-tooth-btn-3").click();
    const row = page.getByTestId("perio-chart-row-3");
    await expect(row).toBeVisible();
    await expect(row).toHaveClass(/ring-sky-300/);
  });

  test("chart row click selects grid tooth", async ({ page }) => {
    await page.getByTestId("perio-chart-row-5").click();
    await expect(page.getByTestId("perio-tooth-btn-5")).toHaveAttribute("aria-pressed", "true");
  });
});

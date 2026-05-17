import { expect, test } from "@playwright/test";

const patientId = process.env.E2E_PATIENT_ID ?? "demo-patient-1";

test.describe("Perio chart ↔ grid sync", () => {
  test.beforeEach(async ({ page }) => {
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

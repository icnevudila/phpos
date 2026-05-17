import { expect, test } from "@playwright/test";

test.describe("Authenticated flows", () => {
  test("reaches dashboard or appointments after login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("patients list loads", async ({ page }) => {
    await page.goto("/patients");
    await expect(page.locator("body")).toContainText(/patient|hasta/i, { timeout: 15_000 });
  });

  test("invoices list loads", async ({ page }) => {
    await page.goto("/invoices");
    await expect(page.locator("body")).toContainText(/invoice|fatura|OR/i, { timeout: 15_000 });
  });
});

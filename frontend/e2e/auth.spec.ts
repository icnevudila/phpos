import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const hasCreds = Boolean(email && password);

test.describe("Authenticated flows", () => {
  test.skip(!hasCreds, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated e2e");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email!);
    await page.getByTestId("login-password").fill(password!);
    await page.getByTestId("login-submit").click();
    await page.waitForURL(/\/(dashboard|appointments)/, { timeout: 30_000 });
  });

  test("reaches dashboard or appointments after login", async ({ page }) => {
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

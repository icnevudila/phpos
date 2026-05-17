import { expect, test } from "@playwright/test";

test.describe("Public smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Dent/i);
  });

  test("login page shows form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /sign in|giriş|log in/i })).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("body")).toContainText(/privacy|gizlilik/i);
  });
});

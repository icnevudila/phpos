import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { test as setup } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, ".auth", "admin.json");

setup("admin storage state", async ({ page }) => {
  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.goto("/login");
  await page.getByTestId("login-email").fill(process.env.E2E_EMAIL ?? "admin@dentease.ph");
  await page.getByTestId("login-password").fill(process.env.E2E_PASSWORD ?? "admin123");
  await page.getByTestId("login-submit").click();
  await page.waitForURL(/\/(dashboard|appointments|patients)/, { timeout: 60_000 });
  await page.context().storageState({ path: AUTH_FILE });
});

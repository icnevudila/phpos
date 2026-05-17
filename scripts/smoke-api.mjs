#!/usr/bin/env node
/**
 * Minimal API smoke — backend ayakta mı, auth/login yolu erişilebilir mi?
 * Kullanım: node scripts/smoke-api.mjs [baseUrl]
 * baseUrl, backend PORT + API_PREFIX ile aynı olmalı (örn. PORT=4010 → http://localhost:4010/api).
 */
const base = (process.argv[2] ?? process.env.API_URL ?? "http://localhost:4010/api").replace(/\/$/, "");

async function tryFetch(path, opts = {}) {
  const url = `${base}${path}`;
  const res = await fetch(url, opts);
  return { url, status: res.status, ok: res.ok };
}

async function main() {
  const results = [];
  try {
    results.push(await tryFetch("/health"));
    results.push(await tryFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "smoke@test.invalid", password: "invalid" }),
    }));
    results.push(await tryFetch("/reports/dashboard/alerts", {
      headers: { Authorization: "Bearer invalid" },
    }));

    const loginRes = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@dentease.ph", password: "admin123" }),
    });
    if (loginRes.ok) {
      const loginJson = await loginRes.json();
      const token = loginJson?.data?.accessToken;
      if (token) {
        const auth = { Authorization: `Bearer ${token}` };
        for (const path of [
          "/patients?limit=2",
          "/patients/demo-patient-1",
          "/invoices?limit=5",
          "/reports/dashboard/summary",
          "/reports/dashboard/queue",
          "/reports/dashboard/charts",
          "/lab-orders/patient/demo-patient-1",
          "/appointments?limit=3",
          "/waitlist",
          "/inventory",
          "/clinic",
        ]) {
          results.push(await tryFetch(path, { headers: auth }));
        }
        results.push(
          await tryFetch("/lab-orders", {
            method: "POST",
            headers: { ...auth, "Content-Type": "application/json" },
            body: JSON.stringify({
              patientId: "demo-patient-1",
              itemDescription: "smoke-test crown",
            }),
          }),
        );
      } else {
        console.error("WARN: login OK but no accessToken in response");
      }
    } else {
      console.error(`WARN: seed login failed (${loginRes.status}) — authenticated checks skipped`);
    }
  } catch (e) {
    console.error("Smoke failed:", e instanceof Error ? e.message : e);
    console.error(`Hint: backend ayakta mı? Deneyin: node scripts/smoke-api.mjs http://localhost:<PORT>/api`);
    process.exit(1);
  }

  for (const r of results) {
    const pass = r.status > 0 && r.status < 500;
    console.log(`${pass ? "OK" : "FAIL"} ${r.status} ${r.url}`);
  }

  const allPass = results.every((r) => r.status > 0 && r.status < 500);
  process.exit(allPass ? 0 : 1);
}

main();

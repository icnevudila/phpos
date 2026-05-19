#!/usr/bin/env node
/**
 * A→Z API smoke — tüm ana modüller (GET ağırlıklı, seed demo ID'leri).
 * Kullanım: node scripts/smoke-api-az.mjs [baseUrl]
 */
const base = (process.argv[2] ?? process.env.API_URL ?? "http://localhost:4010/api").replace(/\/$/, "");

const PID = "demo-patient-1";
const AID = "demo-apt-1";
const IID = "demo-inv-1";

async function req(path, opts = {}) {
  const url = `${base}${path}`;
  const res = await fetch(url, opts);
  let body = null;
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      body = await res.json();
    } catch {
      body = null;
    }
  }
  return { url, status: res.status, ok: res.ok, body };
}

function pass(r) {
  return r.status > 0 && r.status < 500;
}

async function main() {
  const results = [];
  const failDetails = [];

  const record = (label, r, expectAuth = true) => {
    const ok = pass(r);
    results.push({ label, ok, status: r.status, url: r.url });
    if (!ok) failDetails.push({ label, status: r.status, url: r.url, body: r.body });
    return r;
  };

  try {
    record("health", await req("/health"));

    const loginRes = await req("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@dentease.ph", password: "admin123" }),
    });
    if (!loginRes.ok) {
      console.error(`LOGIN FAIL ${loginRes.status}`);
      process.exit(1);
    }
    const token = loginRes.body?.data?.accessToken;
    if (!token) {
      console.error("LOGIN: no accessToken");
      process.exit(1);
    }
    const auth = { Authorization: `Bearer ${token}` };
    const get = (path) => req(path, { headers: auth });

    record("auth/me", await get("/auth/me"));

    const routes = [
      ["clinic", "/clinic"],
      ["patients.list", "/patients?limit=5"],
      ["patients.one", `/patients/${PID}`],
      ["patients.files", `/patients/${PID}/files`],
      ["patients.teeth", `/patients/${PID}/teeth`],
      ["patients.treatments", `/patients/${PID}/treatments`],
      ["patients.medical", `/patients/${PID}/medical-history`],
      ["patients.perio", `/patients/${PID}/perio-exams`],
      ["patients.family", `/patients/${PID}/family`],
      ["appointments.list", "/appointments?limit=5"],
      ["appointments.one", `/appointments/${AID}`],
      ["users.dentists", "/users/dentists"],
      ["waitlist", "/waitlist"],
      ["invoices.list", "/invoices?limit=5"],
      ["invoices.one", `/invoices/${IID}`],
      ["inventory", "/inventory"],
      ["staff.users", "/staff/users"],
      ["hmo.providers", "/hmo/providers"],
      ["hmo.claims", "/hmo/claims?limit=5"],
      ["notifications", "/notifications?limit=5"],
      ["reports.summary", "/reports/dashboard/summary"],
      ["reports.queue", "/reports/dashboard/queue"],
      ["reports.charts", "/reports/dashboard/charts"],
      ["reports.alerts", "/reports/dashboard/alerts"],
      ["reports.aged", "/reports/aged-receivables"],
      ["reports.monthly", `/reports/monthly?year=${new Date().getFullYear()}&month=${new Date().getMonth() + 1}`],
      ["eod.summary", "/reports/eod/summary"],
      ["analytics.overview", "/analytics/overview"],
      ["analytics.queue", "/analytics/queue"],
      ["analytics.aging", "/analytics/aging"],
      ["lab.patient", `/lab-orders/patient/${PID}`],
      ["prescriptions", `/prescriptions/patient/${PID}`],
      ["consents", `/consent-forms/patient/${PID}`],
      ["soap", `/soap-notes/patient/${PID}`],
      ["referrals", `/referrals/patient/${PID}`],
      ["sterilization", "/sterilization"],
    ];

    for (const [label, path] of routes) {
      record(label, await get(path));
    }

    record(
      "lab.create",
      await req("/lab-orders", {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: PID,
          itemDescription: `az-smoke-${Date.now()}`,
        }),
      }),
    );
  } catch (e) {
    console.error("Smoke A→Z failed:", e instanceof Error ? e.message : e);
    console.error("Backend ayakta mı? PORT=4010");
    process.exit(1);
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    console.log(`${r.ok ? "OK" : "FAIL"} ${r.status} [${r.label}] ${r.url}`);
  }

  if (failed.length) {
    console.error("\n--- Failures ---");
    for (const f of failDetails) {
      console.error(JSON.stringify(f, null, 2));
    }
    process.exit(1);
  }

  console.log(`\nA→Z smoke: ${results.length}/${results.length} passed`);
}

main();

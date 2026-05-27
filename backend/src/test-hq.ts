import { prisma } from "./lib/prisma.js";
import { getOrganizationAnalytics } from "./services/hqAnalytics.service.js";
import { buildDashboardSummary, buildDashboardQueue, buildDashboardCharts, buildDashboardAlerts } from "./services/reports.service.js";

async function main() {
  console.log("Running HQ test...");
  try {
    const clinics = await prisma.clinic.findMany({
      select: { id: true, organizationId: true }
    });
    console.log("Clinics in DB:", clinics);
    const cid = clinics[0]?.id || "demo-clinic";

    console.log("Testing buildDashboardSummary...");
    const summary = await buildDashboardSummary(cid);
    console.log("Summary success");

    console.log("Testing buildDashboardQueue...");
    const queue = await buildDashboardQueue(cid);
    console.log("Queue success");

    console.log("Testing buildDashboardCharts...");
    const charts = await buildDashboardCharts(cid);
    console.log("Charts success");

    console.log("Testing buildDashboardAlerts...");
    const alerts = await buildDashboardAlerts(cid);
    console.log("Alerts success");

    console.log("Testing buildAgedReceivables...");
    const { buildAgedReceivables } = await import("./services/reports.service.js");
    const aged = await buildAgedReceivables(cid);
    console.log("Aged Receivables success", aged.rows.length);

    console.log("Testing listAppointments...");
    const { listAppointments, listDentists } = await import("./services/appointment.service.js");
    const appts = await listAppointments(cid, {});
    console.log("Appointments success", appts.length);

    console.log("Testing listDentists...");
    const dentists = await listDentists(cid);
    console.log("Dentists success", dentists.length);

    const data = await getOrganizationAnalytics("demo-org-id");
    console.log("Analytics data:", data);
  } catch (err) {
    console.error("CRASH ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

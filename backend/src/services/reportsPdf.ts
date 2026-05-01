import type { Content, TDocumentDefinitions } from "../pdfmakeTypes.js";

import { prisma } from "../lib/prisma.js";

import { buildMonthlyReport } from "./reports.service.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";

export async function generateMonthlyReportPdf(
  clinicId: string,
  year: number,
  month: number,
): Promise<Buffer> {
  const [report, clinic] = await Promise.all([
    buildMonthlyReport(clinicId, year, month),
    prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { name: true, address: true, city: true, phone: true },
    }),
  ]);

  const money = (v: string | number): string =>
    `₱ ${Number(v).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const monthName = new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(`${year}-${String(month).padStart(2, "0")}-15T00:00:00+08:00`));

  const metrics: Array<[string, string]> = [
    ["Revenue", money(report.totalRevenue)],
    ["Appointments", String(report.totalAppointments)],
    ["Completed", String(report.completedAppointments)],
    ["Cancelled", String(report.cancelledAppointments)],
    ["New patients", String(report.newPatients)],
    ["Returning", String(report.returningPatients)],
  ];

  const metricCell = (label: string, value: string): Content => ({
    stack: [
      { text: label, fontSize: 9, color: "#64748b" },
      { text: value, fontSize: 15, bold: true, color: "#0f172a", margin: [0, 6, 0, 0] },
    ],
    fillColor: "#f8fafc",
    margin: [8, 8, 8, 8],
  });

  const metricRows: Content[][] = [];
  for (let i = 0; i < metrics.length; i += 3) {
    const chunk = metrics.slice(i, i + 3);
    const row = chunk.map(([l, v]) => metricCell(l, v));
    while (row.length < 3) row.push({ text: "" });
    metricRows.push(row);
  }

  const methods: Array<[string, string]> = [
    ["Cash", money(report.paymentMethods.cash)],
    ["GCash", money(report.paymentMethods.gcash)],
    ["Maya", money(report.paymentMethods.maya)],
    ["Credit card", money(report.paymentMethods.creditCard)],
    ["Cheque", money(report.paymentMethods.cheque)],
    ["PhilHealth", money(report.paymentMethods.philhealth)],
  ];

  const procBody = [
    [
      { text: "PROCEDURE", style: "th" },
      { text: "COUNT", style: "th", alignment: "right" },
      { text: "REVENUE", style: "th", alignment: "right" },
    ],
    ...(report.topProcedures.length === 0
      ? [[{ text: "— no data —", colSpan: 3, style: "tdMuted" }, {}, {}] as Content[]]
      : report.topProcedures.map((p) => [
          { text: p.name.replace(/_/g, " "), style: "td" },
          { text: String(p.count), style: "td", alignment: "right" },
          { text: money(p.revenue), style: "td", alignment: "right", bold: true },
        ])),
  ] as Content[][];

  const weekRows: Content[][] = report.revenueByWeek.map((w) => [
    { text: `Week ${w.week} · ${w.startDate} → ${w.endDate}`, style: "td" },
    { text: money(w.amount), style: "td", alignment: "right", bold: true },
  ]);

  const dentistBody = [
    [
      { text: "DENTIST", style: "th" },
      { text: "APPT", style: "th", alignment: "right" },
      { text: "COMPLETED", style: "th", alignment: "right" },
      { text: "REVENUE", style: "th", alignment: "right" },
    ],
    ...(report.byDentist.length === 0
      ? [[{ text: "— no data —", colSpan: 4, style: "tdMuted" }, {}, {}, {}] as Content[]]
      : report.byDentist.map((d) => [
          { text: `Dr. ${d.name}`, style: "td" },
          { text: String(d.appointments), style: "td", alignment: "right" },
          { text: String(d.completed), style: "td", alignment: "right" },
          { text: money(d.revenue), style: "td", alignment: "right", bold: true },
        ])),
  ] as Content[][];

  const addr = [clinic?.address, clinic?.city].filter(Boolean).join(", ");

  const doc: TDocumentDefinitions = {
    styles: {
      th: { bold: true, fontSize: 9, color: "#64748b", fillColor: "#f1f5f9" },
      td: { fontSize: 10, color: "#0f172a" },
      tdMuted: { fontSize: 10, color: "#94a3b8", italics: true },
      h1: { fontSize: 18, bold: true, color: "#0f172a" },
      h2: { fontSize: 13, bold: true, color: "#0f172a", margin: [0, 14, 0, 6] },
      sub: { fontSize: 11, color: "#64748b" },
      foot: { fontSize: 9, color: "#94a3b8", alignment: "center" },
    },
    content: [
      { text: clinic?.name ?? "DentEase PH", style: "h1" },
      ...(addr ? [{ text: addr, fontSize: 10, color: "#64748b" } as Content] : []),
      ...(clinic?.phone ? [{ text: clinic.phone, fontSize: 10, color: "#64748b" } as Content] : []),
      {
        canvas: [{ type: "line", x1: 0, y1: 4, x2: 499, y2: 4, lineWidth: 1.5, lineColor: "#10b981" }],
        margin: [0, 6, 0, 12],
      },
      { text: "Monthly report", fontSize: 16, bold: true, color: "#0f172a" },
      { text: monthName, style: "sub", margin: [0, 4, 0, 12] },
      {
        table: {
          widths: ["*", "*", "*"],
          body: metricRows,
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, 8],
      },
      { text: "Payment methods", style: "h2" },
      {
        table: {
          widths: ["*", 120],
          body: methods.map(([label, val]) => [
            { text: label, fontSize: 10, color: "#334155" },
            { text: val, fontSize: 10, alignment: "right", bold: true },
          ]),
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 8],
      },
      { text: "Top procedures", style: "h2" },
      {
        table: {
          headerRows: 1,
          widths: ["*", 70, 90],
          body: procBody,
        },
        layout: {
          fillColor: (row: number) => (row === 0 ? null : row % 2 === 0 ? "#fafafa" : null),
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
        },
        margin: [0, 0, 0, 8],
      },
      { text: "Weekly revenue", style: "h2" },
      {
        table: {
          widths: ["*", 100],
          body: weekRows.length ? weekRows : [[{ text: "—", style: "tdMuted" }, { text: "—", style: "tdMuted" }]],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 8],
      },
      { text: "Performance by dentist", style: "h2" },
      {
        table: {
          headerRows: 1,
          widths: ["*", 55, 75, 85],
          body: dentistBody,
        },
        layout: {
          fillColor: (row: number) => (row === 0 ? null : row % 2 === 0 ? "#fafafa" : null),
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
        },
        margin: [0, 0, 0, 12],
      },
      { text: "Generated by DentEase PH · internal report", style: "foot", margin: [0, 8, 0, 0] },
    ],
  };

  return renderPdfDocument(doc);
}

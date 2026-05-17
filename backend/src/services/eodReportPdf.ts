import type { Content, TDocumentDefinitions } from "../pdfmakeTypes.js";

import { getDailyEodSummary } from "./eod.service.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";
import { dbTasks } from "../lib/dbTasks.js";
import { prisma } from "../lib/prisma.js";

const PHPmoney = (v: number) =>
  `PHP ${v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const manilaDt = (d: Date) =>
  new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

/** X-Report: gün içinde istenen an için anlık özet (kasa kapanmaz). */
export async function generateXReportPdf(clinicId: string, date: Date): Promise<Buffer> {
  return generateEodPdf(clinicId, date, "X-REPORT");
}

/** Z-Report: gün sonu resmi kasa kapanış raporu. */
export async function generateZReportPdf(clinicId: string, date: Date): Promise<Buffer> {
  return generateEodPdf(clinicId, date, "Z-REPORT");
}

async function generateEodPdf(
  clinicId: string,
  date: Date,
  type: "X-REPORT" | "Z-REPORT",
): Promise<Buffer> {
  const [summary, clinic] = await dbTasks([
    () => getDailyEodSummary(clinicId, date),
    () =>
      prisma.clinic.findUnique({
        where: { id: clinicId },
        select: { name: true, address: true, city: true, phone: true, tin: true, birPtuNo: true },
      }),
  ] as const);

  const generatedAt = manilaDt(new Date());
  const reportDate = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);

  const isZ = type === "Z-REPORT";
  const accentColor = isZ ? "#0f172a" : "#0369a1";

  const paymentMethodRows: Content[][] = Object.entries(summary.revenue.byMethod).map(
    ([method, amount]) => [
      { text: method, style: "td" },
      { text: PHPmoney(amount), style: "td", alignment: "right", bold: true },
    ],
  );

  if (paymentMethodRows.length === 0) {
    paymentMethodRows.push([
      { text: "No payments recorded", style: "tdMuted", colSpan: 2 },
      {} as Content,
    ]);
  }

  const doc: TDocumentDefinitions = {
    pageSize: "A5",
    pageMargins: [28, 32, 28, 32],
    styles: {
      reportType: {
        fontSize: 9,
        bold: true,
        color: "#ffffff",
        letterSpacing: 3,
        characterSpacing: 2,
      },
      clinicName: { fontSize: 15, bold: true, color: "#0f172a" },
      subInfo: { fontSize: 8, color: "#64748b" },
      sectionHeader: { fontSize: 8, bold: true, color: accentColor, letterSpacing: 1, characterSpacing: 1 },
      td: { fontSize: 9, color: "#0f172a" },
      tdMuted: { fontSize: 9, color: "#64748b" },
      bigNum: { fontSize: 18, bold: true, color: accentColor },
      foot: { fontSize: 7, color: "#94a3b8", alignment: "center" },
    },
    content: [
      // ── Header badge ──────────────────────────────────────────────
      {
        canvas: [{ type: "rect", x: 0, y: 0, w: 540, h: 28, r: 6, color: accentColor }],
        margin: [0, 0, 0, 4],
      },
      {
        text: type,
        style: "reportType",
        absolutePosition: { x: 28, y: 39 },
      },

      // ── Clinic info ───────────────────────────────────────────────
      { text: clinic?.name ?? "Clinic", style: "clinicName", margin: [0, 12, 0, 2] },
      ...(clinic?.address
        ? [{ text: [clinic.address, clinic.city].filter(Boolean).join(", "), style: "subInfo" } as Content]
        : []),
      ...(clinic?.tin
        ? [{ text: `TIN: ${clinic.tin}${clinic.birPtuNo ? `  |  PTU: ${clinic.birPtuNo}` : ""}`, style: "subInfo", margin: [0, 2, 0, 0] } as Content]
        : []),

      { text: reportDate, style: "subInfo", margin: [0, 6, 0, 0] },
      { text: `Generated: ${generatedAt}`, style: "subInfo", margin: [0, 2, 0, 0] },

      // ── Divider ───────────────────────────────────────────────────
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 0.5, lineColor: "#e2e8f0" }], margin: [0, 12, 0, 12] },

      // ── Revenue ───────────────────────────────────────────────────
      { text: "REVENUE SUMMARY", style: "sectionHeader", margin: [0, 0, 0, 6] },
      {
        columns: [
          { text: "Total Collected", fontSize: 9, color: "#64748b" },
          { text: PHPmoney(summary.revenue.total), style: "bigNum", alignment: "right" },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto"],
          body: [
            [
              { text: "Payment Method", style: "sectionHeader" },
              { text: "Amount", style: "sectionHeader", alignment: "right" },
            ],
            ...paymentMethodRows,
          ],
        },
        layout: {
          hLineColor: () => "#f1f5f9",
          vLineColor: () => "#f1f5f9",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 5,
          paddingBottom: () => 5,
        },
        margin: [0, 0, 0, 16],
      },

      // ── Appointments ──────────────────────────────────────────────
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 0.5, lineColor: "#e2e8f0" }], margin: [0, 0, 0, 12] },
      { text: "APPOINTMENTS", style: "sectionHeader", margin: [0, 0, 0, 6] },
      {
        columns: [
          { stack: [{ text: "Total", style: "tdMuted" }, { text: String(summary.appointments.total), style: "bigNum" }], width: "*" },
          { stack: [{ text: "Completed", style: "tdMuted" }, { text: String(summary.appointments.completed), bold: true, fontSize: 14, color: "#10b981" }], width: "*" },
          { stack: [{ text: "No-show", style: "tdMuted" }, { text: String(summary.appointments.noShow), bold: true, fontSize: 14, color: "#ef4444" }], width: "*" },
          { stack: [{ text: "Cancelled", style: "tdMuted" }, { text: String(summary.appointments.cancelled), bold: true, fontSize: 14, color: "#f59e0b" }], width: "*" },
        ],
        margin: [0, 0, 0, 16],
      },

      // ── HMO & Inventory ───────────────────────────────────────────
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 0.5, lineColor: "#e2e8f0" }], margin: [0, 0, 0, 12] },
      { text: "HMO & INVENTORY", style: "sectionHeader", margin: [0, 0, 0, 6] },
      {
        table: {
          widths: ["*", "auto"],
          body: [
            [{ text: "HMO Claims Submitted", style: "td" }, { text: String(summary.hmo.claimsSubmitted), style: "td", alignment: "right", bold: true }],
            [{ text: "HMO Total Amount", style: "td" }, { text: PHPmoney(summary.hmo.totalAmount), style: "td", alignment: "right", bold: true }],
            [{ text: "Inventory Transactions", style: "td" }, { text: String(summary.inventory.transactionsCount), style: "td", alignment: "right", bold: true }],
            [{ text: "Low Stock Items", style: "td" }, { text: String(summary.inventory.lowStockItems), style: "td", alignment: "right", bold: true, color: summary.inventory.lowStockItems > 0 ? "#ef4444" : "#0f172a" }],
          ],
        },
        layout: {
          hLineColor: () => "#f1f5f9",
          vLineColor: () => "transparent",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          paddingTop: () => 5,
          paddingBottom: () => 5,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        },
        margin: [0, 0, 0, 20],
      },

      // ── Z-Report closure stamp ────────────────────────────────────
      ...(isZ
        ? [
            {
              canvas: [{ type: "rect", x: 0, y: 0, w: 540, h: 32, r: 6, color: "#0f172a" }],
              margin: [0, 0, 0, 4],
            } as Content,
            {
              text: "OFFICIAL END-OF-DAY CLOSURE",
              fontSize: 9,
              bold: true,
              color: "#10b981",
              alignment: "center",
              characterSpacing: 1,
              margin: [0, -26, 0, 20],
            } as Content,
          ]
        : []),

      // ── Footer ────────────────────────────────────────────────────
      {
        text: `${type} generated by DentEase PH · Asia/Manila · ${generatedAt}`,
        style: "foot",
        margin: [0, 8, 0, 0],
      },
    ],
  };

  return renderPdfDocument(doc);
}

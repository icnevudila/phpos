import type { Content, TDocumentDefinitions } from "../pdfmakeTypes.js";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

import { getInvoice } from "./invoice.service.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";

/**
 * PhilHealth resmi CF1/2 değildir — ön büro / muhasebenin resmi forma aktarımı için
 * hasta + OR + prosedür özetini tek PDF’te toplar.
 */
export async function generatePhilhealthWorksheetPdf(clinicId: string, invoiceId: string): Promise<Buffer> {
  const invoice = await getInvoice(clinicId, invoiceId);
  const no = invoice.patient.philhealthNo?.trim();
  if (!no) {
    throw new AppError(
      "Patient has no PhilHealth number on file",
      422,
      "PHILHEALTH_NUMBER_REQUIRED",
    );
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { name: true, address: true, city: true, phone: true },
  });

  const money = (v: string | number): string => {
    const num = typeof v === "string" ? Number(v) : v;
    return `₱ ${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const invDate = new Date(invoice.createdAt).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const addrLine = [clinic?.address, clinic?.city].filter(Boolean).join(", ");

  const seniorPwd =
    invoice.patient.isSeniorCitizen || (invoice.patient.pwdIdNo && invoice.patient.pwdIdNo.trim().length > 0)
      ? [
          "Senior / PWD (statutory discount may apply on invoice):",
          `  Senior citizen flag: ${invoice.patient.isSeniorCitizen ? "Yes" : "No"}`,
          `  OSCA ID: ${invoice.patient.oscaIdNo?.trim() || "—"}`,
          `  PWD ID: ${invoice.patient.pwdIdNo?.trim() || "—"}`,
        ].join("\n")
      : null;

  const tableBody = [
    [
      { text: "Procedure", style: "th" },
      { text: "Tooth", style: "th" },
      { text: "Qty", style: "th", alignment: "center" },
      { text: "Unit", style: "th", alignment: "right" },
      { text: "Line total", style: "th", alignment: "right" },
    ],
    ...invoice.treatments.map((t) => [
      { text: t.procedure.replace(/_/g, " "), style: "td" },
      { text: t.toothIds.join(", ") || "—", style: "tdMuted" },
      { text: String(t.quantity), style: "td", alignment: "center" },
      { text: money(t.unitPrice), style: "td", alignment: "right" },
      { text: money(t.lineTotal), style: "td", alignment: "right", bold: true },
    ]),
  ] as Content[][];

  const doc: TDocumentDefinitions = {
    styles: {
      title: { fontSize: 16, bold: true, color: "#0f172a" },
      warn: { fontSize: 9, color: "#b45309", bold: true },
      muted: { fontSize: 9, color: "#64748b" },
      h2: { fontSize: 11, bold: true, color: "#0f172a" },
      th: { bold: true, fontSize: 9, color: "#475569", fillColor: "#fef3c7" },
      td: { fontSize: 9, color: "#0f172a" },
      tdMuted: { fontSize: 9, color: "#64748b" },
      foot: { fontSize: 8, color: "#94a3b8", alignment: "center" },
    },
    content: [
      { text: "PhilHealth — internal worksheet (NOT CF1/CF2)", style: "title" },
      {
        text: "This PDF is for clinic staff only. Enter values into the official PhilHealth claim forms. DentEase is not affiliated with PhilHealth.",
        style: "warn",
        margin: [0, 6, 0, 10],
      },
      { text: clinic?.name ?? "Clinic", style: "h2" },
      ...(addrLine ? [{ text: addrLine, style: "muted" } as Content] : []),
      ...(clinic?.phone ? [{ text: `Phone: ${clinic.phone}`, style: "muted" } as Content] : []),
      { text: "Invoice / OR", style: "h2", margin: [0, 12, 0, 4] },
      { text: `OR No: ${invoice.orNumber ?? "—"}`, style: "muted" },
      { text: `Invoice date: ${invDate}`, style: "muted", margin: [0, 2, 0, 0] },
      { text: `Invoice total: ${money(invoice.total)} · Balance: ${money(invoice.balance)}`, style: "muted", margin: [0, 2, 0, 0] },
      { text: "Member / patient", style: "h2", margin: [0, 12, 0, 4] },
      { text: invoice.patient.fullName, fontSize: 11, bold: true },
      { text: `PhilHealth No: ${no}`, style: "muted", margin: [0, 4, 0, 0] },
      ...(invoice.patient.phone
        ? [{ text: `Mobile: ${invoice.patient.phone}`, style: "muted", margin: [0, 2, 0, 0] } as Content]
        : []),
      ...(invoice.patient.address || invoice.patient.city
        ? [
            {
              text: [invoice.patient.address, invoice.patient.city].filter(Boolean).join(", "),
              style: "muted",
              margin: [0, 2, 0, 0],
            } as Content,
          ]
        : []),
      ...(seniorPwd ? [{ text: seniorPwd, style: "muted", margin: [0, 8, 0, 0] } as Content] : []),
      { text: "Procedures billed (copy to claim line items)", style: "h2", margin: [0, 12, 0, 6] },
      {
        table: {
          headerRows: 1,
          widths: ["*", 52, 34, 72, 78],
          dontBreakRows: true,
          body: tableBody,
        },
        layout: {
          fillColor: (row: number) => (row === 0 ? null : row % 2 === 0 ? "#fffbeb" : null),
          hLineColor: () => "#fde68a",
          vLineColor: () => "#fde68a",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
      {
        text: "Generated by DentEase PH · Asia/Manila · For internal use only",
        style: "foot",
        margin: [0, 20, 0, 0],
      },
    ],
  };

  return renderPdfDocument(doc);
}

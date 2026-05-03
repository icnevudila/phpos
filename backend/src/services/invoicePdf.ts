import type { Content, TDocumentDefinitions } from "../pdfmakeTypes.js";

import { prisma } from "../lib/prisma.js";

import { getInvoice } from "./invoice.service.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";

/**
 * Basit BIR-benzeri Official Receipt PDF üretir (pdfmake).
 * Not: Gerçek BIR yetkili formu için baskı izni gerekir; bu sürüm iç kullanım
 * içindir.
 */
export async function generateInvoicePdf(clinicId: string, invoiceId: string): Promise<Buffer> {
  const invoice = await getInvoice(clinicId, invoiceId);
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { name: true, address: true, city: true, phone: true, tin: true, birPtuNo: true, birAccreditationNo: true },
  });

  const money = (v: string | number): string => {
    const num = typeof v === "string" ? Number(v) : v;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const invDate = new Date(invoice.createdAt).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const statusColors: Record<string, string> = {
    UNPAID: "#ef4444",
    PARTIAL: "#f59e0b",
    PAID: "#10b981",
  };
  const statusBg = statusColors[invoice.status] ?? "#64748b";

  const addrLine = [clinic?.address, clinic?.city].filter(Boolean).join(", ");

  const tableBody = [
    [
      { text: "PROCEDURE", style: "th" },
      { text: "TOOTH", style: "th" },
      { text: "QTY", style: "th", alignment: "center" },
      { text: "UNIT", style: "th", alignment: "right" },
      { text: "TOTAL", style: "th", alignment: "right" },
    ],
    ...invoice.treatments.map((t) => [
      { text: t.procedure.replace(/_/g, " "), style: "td" },
      { text: t.toothIds.join(", ") || "—", style: "tdMuted" },
      { text: String(t.quantity), style: "td", alignment: "center" },
      { text: money(t.unitPrice), style: "td", alignment: "right" },
      { text: money(t.lineTotal), style: "td", alignment: "right", bold: true },
    ]),
  ] as Content[][];

  const paymentLines: Content[] =
    invoice.payments.length === 0
      ? []
      : [
          { text: "Payments", style: "h2", margin: [0, 12, 0, 4] },
          ...invoice.payments.map((p) => {
            const when = new Date(p.paidAt).toLocaleString("en-PH", {
              timeZone: "Asia/Manila",
              dateStyle: "short",
              timeStyle: "short",
            });
            const parts = [
              when,
              p.method,
              money(p.amount),
              p.referenceNo ? `ref ${p.referenceNo}` : undefined,
            ].filter(Boolean);
            return {
              text: `• ${parts.join(" · ")}`,
              style: "payLine",
              margin: [0, 0, 0, 2],
            } as Content;
          }),
        ];

  const breakdownStack: Content[] = [
    {
      columns: [
        { width: 90, text: "Subtotal", style: "sumLabel" },
        { width: 110, text: money(invoice.subtotal), style: "sumVal" },
      ],
      margin: [0, 0, 0, 2],
    },
  ];

  if (Number(invoice.seniorDiscount) > 0) {
    breakdownStack.push({
      columns: [
        { width: 90, text: "Senior Discount", style: "sumLabel" },
        { width: 110, text: `-${money(invoice.seniorDiscount)}`, style: "sumVal" },
      ],
      margin: [0, 0, 0, 2],
    });
  }

  if (Number(invoice.pwdDiscount) > 0) {
    breakdownStack.push({
      columns: [
        { width: 90, text: "PWD Discount", style: "sumLabel" },
        { width: 110, text: `-${money(invoice.pwdDiscount)}`, style: "sumVal" },
      ],
      margin: [0, 0, 0, 2],
    });
  }

  const otherDiscount = Number(invoice.discount) - Number(invoice.seniorDiscount) - Number(invoice.pwdDiscount);
  if (otherDiscount > 0) {
    breakdownStack.push({
      columns: [
        { width: 90, text: "Other Discount", style: "sumLabel" },
        { width: 110, text: `-${money(otherDiscount)}`, style: "sumVal" },
      ],
      margin: [0, 0, 0, 2],
    });
  }

  if (invoice.vatExempt) {
    breakdownStack.push({
      columns: [
        { width: 90, text: "VAT Exempt Sales", style: "sumLabel" },
        { width: 110, text: money(Number(invoice.subtotal) - Number(invoice.discount)), style: "sumVal" },
      ],
      margin: [0, 0, 0, 2],
    });
  } else {
    breakdownStack.push({
      columns: [
        { width: 90, text: "VAT Amount (12%)", style: "sumLabel" },
        { width: 110, text: money(invoice.vatAmount), style: "sumVal" },
      ],
      margin: [0, 0, 0, 2],
    });
  }

  breakdownStack.push({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 0.5, lineColor: "#cbd5e1" }],
    margin: [0, 2, 0, 6],
  });

  breakdownStack.push({
    columns: [
      { width: 90, text: "Total", style: "totalLabel" },
      { width: 110, text: money(invoice.total), style: "totalVal" },
    ],
    margin: [0, 0, 0, 6],
  });

  breakdownStack.push({ text: `Paid: ${money(invoice.paid)}`, style: "sumLabel", margin: [0, 0, 0, 4] });
  
  breakdownStack.push({
    columns: [
      { width: 90, text: "Balance", style: "totalLabel" },
      { width: 110, text: money(invoice.balance), style: "totalVal" },
    ],
  });

  let watermarkOpts: any = undefined;
  if (invoice.status === "UNPAID" || invoice.status === "PARTIAL") {
    watermarkOpts = { text: "DRAFT / UNPAID", color: "#ef4444", opacity: 0.08, bold: true };
  } else if (invoice.status === "VOID") {
    watermarkOpts = { text: "VOID / CANCELLED", color: "#64748b", opacity: 0.1, bold: true };
  } else if (invoice.status === "PAID") {
    watermarkOpts = { text: "OFFICIAL RECEIPT - PAID", color: "#10b981", opacity: 0.05, bold: true };
  }

  const doc: TDocumentDefinitions = {
    watermark: watermarkOpts,
    styles: {
      clinicName: { fontSize: 18, bold: true, color: "#0f172a" },
      muted: { fontSize: 9, color: "#64748b" },
      orTitle: { fontSize: 15, bold: true, color: "#0f172a" },
      h2: { fontSize: 11, bold: true, color: "#0f172a" },
      th: { bold: true, fontSize: 9, color: "#475569", fillColor: "#f1f5f9" },
      td: { fontSize: 9, color: "#0f172a" },
      tdMuted: { fontSize: 9, color: "#64748b" },
      payLine: { fontSize: 8, color: "#475569" },
      foot: { fontSize: 8, color: "#94a3b8", alignment: "center" },
      sumLabel: { fontSize: 10, color: "#475569" },
      sumVal: { fontSize: 10, color: "#0f172a", alignment: "right" },
      totalLabel: { fontSize: 12, bold: true, color: "#0f172a" },
      totalVal: { fontSize: 12, bold: true, color: "#0f172a", alignment: "right" },
    },
    content: [
      { text: clinic?.name ?? "DentEase PH", style: "clinicName" },
      ...(addrLine ? [{ text: addrLine, style: "muted" } as Content] : []),
      ...(clinic?.phone ? [{ text: clinic.phone, style: "muted" } as Content] : []),
      ...(clinic?.tin ? [{ text: `TIN: ${clinic.tin}`, style: "muted" } as Content] : []),
      ...(clinic?.birPtuNo ? [{ text: `PTU No: ${clinic.birPtuNo}`, style: "muted" } as Content] : []),
      ...(clinic?.birAccreditationNo ? [{ text: `Accreditation No: ${clinic.birAccreditationNo}`, style: "muted" } as Content] : []),
      {
        canvas: [{ type: "line", x1: 0, y1: 4, x2: 499, y2: 4, lineWidth: 1.5, lineColor: "#10b981" }],
        margin: [0, 6, 0, 8],
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "OFFICIAL RECEIPT", style: "orTitle" },
              { text: `OR No: ${invoice.orNumber ?? "—"}`, style: "muted", margin: [0, 4, 0, 0] },
              { text: `Date: ${invDate}`, style: "muted", margin: [0, 2, 0, 0] },
            ],
          },
          {
            width: 108,
            table: {
              widths: [108],
              body: [
                [
                  {
                    text: invoice.status,
                    alignment: "center",
                    fillColor: statusBg,
                    color: "#ffffff",
                    bold: true,
                    margin: [0, 8, 0, 8],
                    fontSize: 11,
                  },
                ],
              ],
            },
            layout: {
              fillColor: () => statusBg,
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0,
              paddingBottom: () => 0,
            },
          },
        ],
        margin: [0, 0, 0, 10],
      },
      { text: "Billed to", style: "h2", margin: [0, 0, 0, 2] },
      { text: invoice.patient.fullName, fontSize: 11, bold: true },
      ...(invoice.patient.phone
        ? [{ text: invoice.patient.phone, style: "muted", margin: [0, 2, 0, 0] } as Content]
        : []),
      ...(invoice.patient.email
        ? [{ text: invoice.patient.email, style: "muted", margin: [0, 2, 0, 0] } as Content]
        : []),
      ...(
        invoice.patient.address || invoice.patient.city
          ? [
              {
                text: [invoice.patient.address, invoice.patient.city].filter(Boolean).join(", "),
                style: "muted",
                margin: [0, 2, 0, 0],
              } as Content,
            ]
          : []
      ),
      ...(invoice.patient.philhealthNo
        ? [
            {
              text: `PhilHealth: ${invoice.patient.philhealthNo}`,
              style: "muted",
              margin: [0, 2, 0, 0],
            } as Content,
          ]
        : []),
      {
        table: {
          headerRows: 1,
          widths: ["*", 52, 34, 72, 78],
          dontBreakRows: true,
          body: tableBody,
        },
        layout: {
          fillColor: (row: number) => (row === 0 ? null : row % 2 === 0 ? "#f8fafc" : null),
          hLineColor: () => "#e2e8f0",
          vLineColor: () => "#e2e8f0",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 10, 0, 12],
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 200,
            stack: breakdownStack,
          },
        ],
      },
      ...paymentLines,
      {
        text: "THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAXES. ASK FOR BIR AUTHORITY TO PRINT.",
        style: "foot",
        margin: [0, 16, 0, 0],
      },
    ],
  };

  return renderPdfDocument(doc);
}

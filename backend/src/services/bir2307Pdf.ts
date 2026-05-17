import type { TDocumentDefinitions } from "../pdfmakeTypes.js";
import { prisma } from "../lib/prisma.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";

/**
 * Generates a BIR Form 2307 (Certificate of Creditable Tax Withheld at Source).
 * This is a simplified version suitable for dental clinic reimbursements.
 */
export async function generateBir2307Pdf(clinicId: string, invoiceId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      patient: true,
      payments: { where: { method: "PHILHEALTH" } },
    }
  });

  if (!invoice) throw new Error("Invoice not found");

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  const doc: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [30, 30, 30, 30],
    styles: {
      header: { fontSize: 16, bold: true, alignment: "center" },
      subheader: { fontSize: 10, alignment: "center", margin: [0, 0, 0, 10] },
      label: { fontSize: 8, bold: true, color: "#475569" },
      value: { fontSize: 9, bold: true },
      tableHeader: { fontSize: 8, bold: true, fillColor: "#f1f5f9", alignment: "center" },
      tableCell: { fontSize: 8 },
    },
    content: [
      { text: "BIR Form No. 2307", style: "label", alignment: "right" },
      { text: "Certificate of Creditable Tax Withheld At Source", style: "header" },
      { text: "Revised January 2018", style: "subheader" },

      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              {
                stack: [
                  { text: "1 For the Period", style: "label" },
                  { text: `From: ${new Date(invoice.createdAt).toLocaleDateString()}  To: ${new Date().toLocaleDateString()}`, style: "value" }
                ],
                border: [true, true, true, true]
              },
              {
                stack: [
                  { text: "2 Total Tax Withheld", style: "label" },
                  { text: `PHP ${(Number(invoice.total) * 0.01).toFixed(2)}`, style: "value" }
                ],
                border: [false, true, true, true]
              }
            ]
          ]
        }
      },

      { text: "PART I - PAYEE INFORMATION", style: "label", margin: [0, 10, 0, 5] },
      {
        table: {
          widths: ["*", 150],
          body: [
            [
              {
                stack: [
                  { text: "3 Taxpayer Identification Number (TIN)", style: "label" },
                  { text: invoice.patient.philhealthNo || "--- --- --- ---", style: "value" }
                ]
              },
              {
                stack: [
                  { text: "4 Payee's Name", style: "label" },
                  { text: `${invoice.patient.firstName} ${invoice.patient.lastName}`, style: "value" }
                ]
              }
            ],
            [
              {
                colSpan: 2,
                stack: [
                  { text: "5 Registered Address", style: "label" },
                  { text: [invoice.patient.address, invoice.patient.city].filter(Boolean).join(", ") || "No address on file", style: "value" }
                ]
              },
              {}
            ]
          ]
        }
      },

      { text: "PART II - PAYOR INFORMATION", style: "label", margin: [0, 10, 0, 5] },
      {
        table: {
          widths: ["*", 150],
          body: [
            [
              {
                stack: [
                  { text: "6 Taxpayer Identification Number (TIN)", style: "label" },
                  { text: clinic?.tin || "000-000-000-000", style: "value" }
                ]
              },
              {
                stack: [
                  { text: "7 Payor's Name", style: "label" },
                  { text: clinic?.name || "DentEase Clinic", style: "value" }
                ]
              }
            ],
            [
              {
                colSpan: 2,
                stack: [
                  { text: "8 Registered Address", style: "label" },
                  { text: [clinic?.address, clinic?.city].filter(Boolean).join(", ") || "Clinic Address", style: "value" }
                ]
              },
              {}
            ]
          ]
        }
      },

      { text: "PART III - DETAILS OF TAX WITHHELD", style: "label", margin: [0, 10, 0, 5] },
      {
        table: {
          widths: ["*", 60, 80, 80, 80, 80],
          headerRows: 1,
          body: [
            [
              { text: "Nature of Income Payment", style: "tableHeader" },
              { text: "ATC", style: "tableHeader" },
              { text: "1st Month", style: "tableHeader" },
              { text: "2nd Month", style: "tableHeader" },
              { text: "3rd Month", style: "tableHeader" },
              { text: "Total", style: "tableHeader" }
            ],
            [
              { text: "Professional fees paid to medical practitioners", style: "tableCell" },
              { text: "WI010", style: "tableCell", alignment: "center" },
              { text: (Number(invoice.total)).toFixed(2), style: "tableCell", alignment: "right" },
              { text: "0.00", style: "tableCell", alignment: "right" },
              { text: "0.00", style: "tableCell", alignment: "right" },
              { text: (Number(invoice.total)).toFixed(2), style: "tableCell", alignment: "right" }
            ]
          ]
        }
      },

      {
        margin: [0, 30, 0, 0],
        columns: [
          {
            stack: [
              { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: "Signature of Payee / Representative", style: "label", alignment: "center", margin: [0, 5, 0, 0] }
            ]
          },
          {
            stack: [
              { canvas: [{ type: "line", x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: "Signature of Payor / Representative", style: "label", alignment: "center", margin: [0, 5, 0, 0] }
            ]
          }
        ]
      }
    ]
  };

  return renderPdfDocument(doc);
}

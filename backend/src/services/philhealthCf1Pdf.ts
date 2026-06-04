import type { TDocumentDefinitions } from "../pdfmakeTypes.js";

import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

import { getInvoice } from "./invoice.service.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";

/**
 * PhilHealth CF1 (Claim Form 1) - Generates a formal, printable representation
 * of the PhilHealth CF1 form with patient eligibility and membership info.
 */
export async function generatePhilhealthCf1Pdf(clinicId: string, invoiceId: string): Promise<Buffer> {
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
    select: { name: true, address: true, city: true, phone: true, philhealthAccreditationNo: true },
  });

  const p = invoice.patient;
  const fullName = p.fullName;
  const memberType = p.philhealthType || "INFORMAL";

  const doc: TDocumentDefinitions = {
    styles: {
      headerTitle: { fontSize: 13, bold: true, color: "#1e3a8a", alignment: "center" },
      subtitle: { fontSize: 10, italic: true, alignment: "center", margin: [0, 2, 0, 8] },
      sectionHeader: { fontSize: 10, bold: true, color: "#ffffff", fillColor: "#1e3a8a", margin: [0, 4, 0, 4] },
      label: { fontSize: 8, bold: true, color: "#475569" },
      value: { fontSize: 9, bold: true, color: "#0f172a" },
      cell: { padding: [4, 4, 4, 4] },
    },
    content: [
      { text: "PHILHEALTH CLAIM FORM 1 (CF1)", style: "headerTitle" },
      { text: "Republic of the Philippines - Philippine Health Insurance Corporation", style: "subtitle" },
      
      // SECTION I: MEMBER INFO
      {
        table: {
          widths: ["*"],
          body: [
            [{ text: "PART I: MEMBER INFORMATION", style: "sectionHeader" }]
          ]
        },
        layout: "noBorders"
      },
      {
        table: {
          widths: ["*", "*", "*"],
          body: [
            [
              { text: [{ text: "1. PhilHealth ID Number (PIN):\n", style: "label" }, { text: no, style: "value" }] },
              { text: [{ text: "2. Full Name:\n", style: "label" }, { text: fullName, style: "value" }] },
              { text: [{ text: "3. Member Type:\n", style: "label" }, { text: memberType.replace(/_/g, " "), style: "value" }] }
            ],
            [
              { text: [{ text: "4. Gender:\n", style: "label" }, { text: p.gender || "—", style: "value" }] },
              { text: [{ text: "5. Civil Status:\n", style: "label" }, { text: p.civilStatus || "—", style: "value" }] },
              { text: [{ text: "6. Mobile No:\n", style: "label" }, { text: p.phone || "—", style: "value" }] }
            ],
            [
              { 
                colSpan: 3,
                text: [{ text: "7. Address:\n", style: "label" }, { text: [p.address, p.city].filter(Boolean).join(", ") || "—", style: "value" }] 
              },
              {},
              {}
            ]
          ]
        },
        layout: {
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
        margin: [0, 0, 0, 10]
      },

      // SECTION II: PATIENT INFO
      {
        table: {
          widths: ["*"],
          body: [
            [{ text: "PART II: PATIENT INFORMATION (If patient is a dependent)", style: "sectionHeader" }]
          ]
        },
        layout: "noBorders"
      },
      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: [{ text: "1. Patient PIN:\n", style: "label" }, { text: no, style: "value" }] },
              { text: [{ text: "2. Relationship to Member:\n", style: "label" }, { text: "SELF", style: "value" }] }
            ],
            [
              { 
                colSpan: 2,
                text: [{ text: "3. Patient Name:\n", style: "label" }, { text: fullName, style: "value" }] 
              },
              {}
            ]
          ]
        },
        layout: {
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
        margin: [0, 0, 0, 10]
      },

      // SECTION III: HEALTH CARE INSTITUTION (HCI) INFO
      {
        table: {
          widths: ["*"],
          body: [
            [{ text: "PART III: HEALTH CARE INSTITUTION (HCI) INFORMATION", style: "sectionHeader" }]
          ]
        },
        layout: "noBorders"
      },
      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: [{ text: "1. HCI Name:\n", style: "label" }, { text: clinic?.name || "—", style: "value" }] },
              { text: [{ text: "2. Accreditation No (PAN):\n", style: "label" }, { text: clinic?.philhealthAccreditationNo || "—", style: "value" }] }
            ],
            [
              { 
                colSpan: 2,
                text: [{ text: "3. HCI Address:\n", style: "label" }, { text: [clinic?.address, clinic?.city].filter(Boolean).join(", ") || "—", style: "value" }] 
              },
              {}
            ]
          ]
        },
        layout: {
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#cbd5e1",
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
        },
        margin: [0, 0, 0, 15]
      },

      // CONSENT / SIGNATURES
      { text: "PART IV: MEMBER / PATIENT CONSENT & CERTIFICATION", style: "label", margin: [0, 4, 0, 4] },
      {
        text: "I certify that the information written on this form is true, correct, and accurate. I agree that PhilHealth may verify this with clinic records.",
        fontSize: 8,
        color: "#475569",
        margin: [0, 0, 0, 15]
      },
      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              { 
                border: [false, false, false, false],
                text: "\n\n_________________________________________________\nSignature of Member / Patient / Representative",
                fontSize: 8,
                alignment: "center"
              },
              { 
                border: [false, false, false, false],
                text: `\n\nDate Signed: ${new Date().toLocaleDateString("en-PH")}\n`,
                fontSize: 8,
                alignment: "center"
              }
            ]
          ]
        },
        layout: "noBorders"
      }
    ]
  };

  return renderPdfDocument(doc);
}

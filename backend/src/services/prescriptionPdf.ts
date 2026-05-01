import type { TDocumentDefinitions } from "../pdfmakeTypes.js";
import { renderPdfDocument } from "./pdfMakePrinter.js";

export async function generatePrescriptionPdf(prescription: any): Promise<Buffer> {
  const prescriptionDate = new Date(prescription.prescriptionDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A5",
    pageMargins: [30, 40, 30, 40],
    content: [
      // Header: Clinic Info
      { text: prescription.clinic.name, style: "header", alignment: "center" },
      { text: prescription.clinic.address || "", style: "subheader", alignment: "center" },
      { text: prescription.clinic.phone || "", style: "subheader", alignment: "center", margin: [0, 0, 0, 20] },

      // Patient Info
      {
        columns: [
          { text: `Patient: ${prescription.patient.firstName} ${prescription.patient.lastName}`, bold: true },
          { text: `Date: ${prescriptionDate}`, alignment: "right" },
        ],
        margin: [0, 0, 0, 5]
      },
      {
        columns: [
          { text: `Age: ${calculateAge(prescription.patient.birthDate)} | Gender: ${prescription.patient.gender || "N/A"}` },
        ],
        margin: [0, 0, 0, 20]
      },

      // Rx Symbol
      { text: "Rx", fontSize: 24, bold: true, italics: true, margin: [0, 0, 0, 10] },

      // Medicines
      ...prescription.items.map((item: any) => [
        { text: `${item.medicineName} ${item.dosage}`, bold: true, margin: [15, 5, 0, 0] },
        { text: `Sig: ${item.frequency}`, margin: [30, 2, 0, 0] },
        { text: `Qty: ${item.quantity} ${item.specialInstructions ? `| Note: ${item.specialInstructions}` : ""}`, margin: [30, 2, 0, 10] }
      ]),

      // Notes
      ...(prescription.notes ? [
        { text: "Notes:", bold: true, margin: [0, 20, 0, 5] },
        { text: prescription.notes, margin: [0, 0, 0, 20] }
      ] : []),

      // Signature Block
      {
        margin: [0, 40, 0, 0],
        columns: [
          { width: "*", text: "" },
          {
            width: "auto",
            stack: [
              { text: "___________________________", margin: [0, 0, 0, 5], alignment: "center" },
              { text: `Dr. ${prescription.dentist.firstName} ${prescription.dentist.lastName}`, bold: true, alignment: "center" },
              { text: `PRC No: ${prescription.dentist.prcNumber || "_______"}`, alignment: "center", fontSize: 9 },
              { text: `PTR No: ${prescription.dentist.ptrNumber || "_______"}`, alignment: "center", fontSize: 9 },
              { text: `S2 License: ${prescription.dentist.s2License || "_______"}`, alignment: "center", fontSize: 9 },
              { text: `TIN: ${prescription.dentist.tinNumber || "_______"}`, alignment: "center", fontSize: 9 },
            ]
          }
        ]
      }
    ],
    styles: {
      header: { fontSize: 16, bold: true },
      subheader: { fontSize: 10, color: "gray" },
    },
    defaultStyle: {
      font: "NotoSans",
      fontSize: 11,
    }
  };

  return renderPdfDocument(docDefinition);
}

function calculateAge(birthDate: Date | null | undefined): string {
  if (!birthDate) return "N/A";
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  return String(Math.abs(ageDate.getUTCFullYear() - 1970));
}

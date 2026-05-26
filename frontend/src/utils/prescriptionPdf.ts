import { createPdfDoc, addClinicHeader, addPatientBlock, addFooter, getClinicAndLicenseData, COLORS, saveOrOpenPdf } from "./pdfUtils";
import autoTable from "jspdf-autotable";

interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  quantity: number;
  specialInstructions: string | null;
}

export interface PrescriptionDto {
  id: string;
  prescriptionDate: string;
  notes: string | null;
  dentist: { id: string; firstName: string; lastName: string };
  items: PrescriptionItem[];
}

export async function generatePrescriptionPdf(rx: PrescriptionDto, patientName: string): Promise<void> {
  const doc = createPdfDoc();
  const { clinic, dentist } = await getClinicAndLicenseData();

  addClinicHeader(doc, clinic, `Prescription (Rx)`);
  
  // Custom patient block that only shows name & date (Prescription Rx style)
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(14, 49, 182, 16, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  
  doc.text(`Patient:`, 18, 59);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(patientName, 32, 59);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`Date:`, 120, 59);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(new Date(rx.prescriptionDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }), 132, 59);

  // Large Rx Symbol
  doc.setFont("georgia", "italic");
  doc.setFontSize(36);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text("Rx", 16, 80);

  // Medication Items Table
  const tableRows = rx.items.map((item, index) => [
    index + 1,
    item.medicineName,
    item.dosage,
    item.frequency,
    item.quantity.toString(),
    item.specialInstructions || "None",
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["#", "Medication", "Dosage", "Frequency", "Qty", "Special Instructions"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.secondary as any,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 35 },
      4: { cellWidth: 15, halign: "center" },
      5: { cellWidth: 54 },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Physician Notes
  if (rx.notes) {
    doc.setFillColor(255, 251, 235); // Amber-50
    doc.setDrawColor(254, 243, 199); // Amber-100
    doc.setLineWidth(0.2);
    doc.roundedRect(14, currentY, 182, 18, 1, 1, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(217, 119, 6); // Amber-600
    doc.text("PHYSICIAN NOTES", 18, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(rx.notes, 18, currentY + 11);
    
    currentY += 24;
  }

  // Doctor Signature and Licenses Block
  const pageHeight = doc.internal.pageSize.getHeight();
  const sigY = pageHeight - 45;

  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.2);
  doc.line(130, sigY, 190, sigY); // Line to sign on

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  
  // Format prescriber name
  const prescriberName = `Dr. ${rx.dentist.firstName} ${rx.dentist.lastName}, DMD`;
  doc.text(prescriberName, 130, sigY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`PRC License No: ${dentist.prcNumber}`, 130, sigY + 9);
  doc.text(`PTR No: ${dentist.ptrNumber}`, 130, sigY + 13);
  doc.text(`S2 License No: ${dentist.s2License}`, 130, sigY + 17);

  addFooter(doc, 1, 1);

  saveOrOpenPdf(doc, `Prescription-${patientName.replace(/\s+/g, "-")}.pdf`);
}

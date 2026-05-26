import { createPdfDoc, addClinicHeader, addPatientBlock, addFooter, getClinicAndLicenseData, COLORS, saveOrOpenPdf } from "./pdfUtils";
import { getPatient } from "../services/patients";
import { PatientTreatmentRow } from "../components/patient/TreatmentsTab";
import { formatPHP } from "../types/invoice";
import autoTable from "jspdf-autotable";

export async function generateTreatmentRecordPdf(
  patientId: string,
  treatments: PatientTreatmentRow[]
): Promise<void> {
  const doc = createPdfDoc();
  
  // Fetch patient details dynamically
  let patientData = { name: "Patient" };
  try {
    patientData = await getPatient(patientId);
  } catch (e) {
    console.warn("Failed to fetch patient for PDF, using ID", e);
  }

  const { clinic, dentist } = await getClinicAndLicenseData();

  addClinicHeader(doc, clinic, "Clinical Treatment Record");
  addPatientBlock(doc, patientData);

  // Table rows formatting
  const tableRows = treatments.map((t, index) => {
    const formattedDate = new Date(t.createdAt).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const lineTotal = Number(t.unitPrice) * t.quantity;
    const dentistName = t.dentist ? `Dr. ${t.dentist.firstName} ${t.dentist.lastName}` : "N/A";
    
    return [
      index + 1,
      formattedDate,
      t.procedure,
      t.phase || "N/A",
      t.toothIds && t.toothIds.length > 0 ? t.toothIds.join(", ") : "General",
      t.quantity.toString(),
      formatPHP(t.unitPrice),
      formatPHP(lineTotal),
      dentistName,
    ];
  });

  autoTable(doc, {
    startY: 78,
    head: [["#", "Date", "Procedure", "Phase", "Tooth", "Qty", "Unit Price", "Total", "Dentist"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.primary as any,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 20 },
      2: { cellWidth: 42 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 10, halign: "center" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 22, halign: "right" },
      8: { cellWidth: 30 },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const pageHeight = doc.internal.pageSize.getHeight();

  // Print Summary
  const totalValue = treatments.reduce((sum, t) => sum + Number(t.unitPrice) * t.quantity, 0);
  
  // Right aligned summary box
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(120, finalY, 76, 12, 1, 1, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("Total Value of Treatments:", 124, finalY + 7);
  doc.text(formatPHP(totalValue), 192 - doc.getTextWidth(formatPHP(totalValue)), finalY + 7);

  // Dentist signature line
  const sigY = pageHeight - 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("Attending Dentist:", 14, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(dentist.fullName, 14, sigY + 6);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`License No. (PRC): ${dentist.prcNumber}`, 14, sigY + 11);

  addFooter(doc, 1, 1);

  saveOrOpenPdf(doc, `TreatmentRecord-${patientId.substring(0, 8)}.pdf`);
}

import { createPdfDoc, addClinicHeader, getClinicAndLicenseData, COLORS, saveOrOpenPdf, addFooter } from "./pdfUtils";
import { getPatient } from "../services/patients";
import { InvoiceDto } from "../types/invoice";
import autoTable from "jspdf-autotable";

export async function generatePhilhealthPdf(invoice: InvoiceDto): Promise<void> {
  const doc = createPdfDoc();
  const { clinic, dentist } = await getClinicAndLicenseData();

  // Custom PhilHealth Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("PHILIPPINES HEALTH INSURANCE CORPORATION", 14, 18);
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text("PHILHEALTH CLAIM FORM 2 (CF2) WORKSHEET", 14, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("IMPORTANT: This worksheet contains clinical information required for PhilHealth eClaims submission.", 14, 27);

  // Clinic Accreditation details
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(14, 31, 182, 12, 1, 1, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(`Institution: ${clinic.name}`, 18, 39);
  doc.text(`PhilHealth Accreditation No (HCI): ACC-HCI-${clinic.tin.substring(0, 8)}`, 110, 39);

  // Divider
  doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 46, 196, 46);

  // PART I - Member / Patient Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("PART I - MEMBER AND PATIENT IDENTIFICATION", 14, 52);

  const patientName = `${invoice.patient.firstName} ${invoice.patient.lastName}`;
  const phicNo = invoice.patient.philhealthNo || "N/A";
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`1. Patient Name: ${patientName.toUpperCase()}`, 14, 58);
  doc.text(`2. PhilHealth PIN: ${phicNo}`, 14, 63);
  doc.text(`3. Contact No: ${invoice.patient.phone || "N/A"}`, 120, 58);
  doc.text(`4. DOB: ${invoice.patient.birthDate || "N/A"}`, 120, 63);

  // PART II - Clinical Data
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PART II - CLINICAL DETAILS & DIAGNOSIS", 14, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("1. Chief Complaint:", 14, 78);
  doc.setFont("helvetica", "bold");
  doc.text("Dental Pain / Restoration Request / General Prophylaxis", 45, 78);

  doc.setFont("helvetica", "normal");
  doc.text("2. ICD-10 Code & Diagnosis:", 14, 83);
  doc.setFont("helvetica", "bold");
  doc.text("K02.9 - Dental Caries, unspecified (ICD-10 Primary)", 60, 83);

  // PART III - Rendered Services Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PART III - PROCEDURES / SERVICES RENDERED", 14, 92);

  const servicesRows = invoice.treatments.map((t, idx) => [
    idx + 1,
    t.procedure,
    t.toothIds && t.toothIds.length > 0 ? t.toothIds.join(", ") : "General",
    "99213 (RVS)", // Mock RVS code
    "1",
    formatPHP(t.unitPrice),
  ]);

  autoTable(doc, {
    startY: 96,
    head: [["#", "Procedure Description", "Tooth No", "RVS Code", "Quantity", "Total Charge"]],
    body: servicesRows,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary as any,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Certification boxes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PART IV - CERTIFICATIONS & SIGNATURES", 14, currentY);
  
  currentY += 6;

  // Attending Dentist Certification Box
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.setFillColor(250, 250, 250);
  doc.rect(14, currentY, 86, 42, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("ATTENDING DENTIST CERTIFICATION", 17, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  const certText1 = "I certify that the diagnosis and services rendered as recorded are true and correct.";
  doc.text(doc.splitTextToSize(certText1, 80), 17, currentY + 9);

  // Line for signature
  doc.line(20, currentY + 28, 80, currentY + 28);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(dentist.fullName, 20, currentY + 32);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`PRC Lic No: ${dentist.prcNumber}  |  PTR No: ${dentist.ptrNumber}`, 20, currentY + 36);
  doc.text(`Accreditation No: PHIC-DEN-${dentist.prcNumber}`, 20, currentY + 39);

  // Member Consent Box
  doc.rect(110, currentY, 86, 42, "FD");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("MEMBER / PATIENT CONSENT", 113, currentY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  const certText2 = "I hereby authorize the release of clinical records/information to PhilHealth for verification purposes.";
  doc.text(doc.splitTextToSize(certText2, 80), 113, currentY + 9);

  doc.line(116, currentY + 28, 176, currentY + 28);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(patientName.toUpperCase(), 116, currentY + 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("Signature of Patient / Member", 116, currentY + 36);

  addFooter(doc, 1, 1);

  saveOrOpenPdf(doc, `PhilHealth-Worksheet-${invoice.id.substring(0, 8)}.pdf`);
}

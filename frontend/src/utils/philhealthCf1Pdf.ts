import { createPdfDoc, COLORS, saveOrOpenPdf, addFooter } from "./pdfUtils";
import { InvoiceDto } from "../types/invoice";

export async function generatePhilhealthCf1Pdf(invoice: InvoiceDto): Promise<void> {
  const doc = createPdfDoc();
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138); // Navy
  doc.text("PHILHEALTH CLAIM FORM 1 (CF1)", 14, 18);
  
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(71, 85, 105);
  doc.text("Republic of the Philippines - Philippine Health Insurance Corporation", 14, 23);

  let y = 28;

  // Helper for drawing section headers
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(30, 58, 138);
    doc.rect(14, y, 182, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 18, y + 4.5);
    y += 6;
  };

  // PART I - Member Info
  drawSectionHeader("PART I - MEMBER INFORMATION");
  
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 182, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const mNo = invoice.patient.philhealthNo || "N/A";
  const mName = invoice.patient.fullName.toUpperCase();
  
  doc.text("1. PhilHealth ID Number (PIN):", 18, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(mNo, 18, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("2. Member Name (Last, First, Middle):", 75, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(mName, 75, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("3. Member Type:", 150, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("INFORMAL MEMBER", 150, y + 10);

  // Line 2
  doc.line(14, y + 14, 196, y + 14);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("4. Gender:", 18, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("FEMALE", 18, y + 24); // Mock or default

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("5. Civil Status:", 75, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("MARRIED", 75, y + 24);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("6. Contact No:", 150, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.patient.phone || "N/A", 150, y + 24);

  // Line 3
  doc.line(14, y + 28, 196, y + 28);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("7. Address (Street, Barangay, City, Province, ZIP):", 18, y + 33);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  const addr = [invoice.patient.address, invoice.patient.city].filter(Boolean).join(", ") || "N/A";
  doc.text(addr.toUpperCase(), 18, y + 36.5);

  y += 44;

  // PART II - Patient dependents
  drawSectionHeader("PART II - PATIENT INFORMATION (DEPENDENTS)");
  doc.rect(14, y, 182, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("1. Patient PIN (PIN of Dependent):", 18, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(mNo, 18, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("2. Relationship to Member:", 120, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("SELF", 120, y + 10);

  doc.line(14, y + 13, 196, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`3. Patient Name: ${mName}`, 18, y + 17.5);

  y += 26;

  // PART III - HCI Info
  drawSectionHeader("PART III - HEALTH CARE INSTITUTION (HCI) INFORMATION");
  doc.rect(14, y, 182, 20);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("1. HCI Name:", 18, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("DENTEASE INTEGRATED DENTAL CLINIC", 18, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("2. Accreditation No (PAN):", 120, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("ACC-HCI-9923841", 120, y + 10);

  doc.line(14, y + 13, 196, y + 13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("3. Address: MANILA, METRO MANILA, PHILIPPINES", 18, y + 17.5);

  y += 28;

  // PART IV - Consent
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text("PART IV - MEMBER / PATIENT CONSENT & CERTIFICATION", 14, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("I certify that the information written on this form is true, correct, and accurate. I agree that PhilHealth may verify clinic records.", 14, y);

  y += 18;
  doc.line(20, y, 80, y);
  doc.line(120, y, 180, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Signature of Member / Dependent", 25, y + 4);
  doc.text(`Date: ${new Date().toLocaleDateString("en-PH")}`, 135, y + 4);

  addFooter(doc, 1, 1);
  saveOrOpenPdf(doc, `PhilHealth-CF1-${invoice.id.substring(0, 8)}.pdf`);
}

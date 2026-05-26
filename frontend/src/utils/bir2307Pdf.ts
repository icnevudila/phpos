import { createPdfDoc, getClinicAndLicenseData, COLORS, saveOrOpenPdf, addFooter } from "./pdfUtils";
import { InvoiceDto, formatPHP } from "../types/invoice";
import autoTable from "jspdf-autotable";

export async function generateBir2307Pdf(invoice: InvoiceDto): Promise<void> {
  const doc = createPdfDoc();
  const { clinic, dentist } = await getClinicAndLicenseData();

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("BUREAU OF INTERNAL REVENUE", 14, 18);
  
  doc.setFontSize(11);
  doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.text("BIR FORM NO. 2307 - CERTIFICATE OF CREDITABLE TAX WITHHELD AT SOURCE", 14, 23);

  // Period Box
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(14, 27, 182, 10, 1, 1, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  const invoiceDate = new Date(invoice.createdAt);
  const periodText = `For the Period: ${invoiceDate.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })} to ${invoiceDate.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}`;
  doc.text(periodText, 18, 33);

  // Part I - Payee Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PART I - PAYEE INFORMATION (RECIPIENT OF INCOME)", 14, 43);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(14, 46, 182, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`1. Payee's TIN: ${invoice.patient.tinNumber || "N/A"}`, 18, 51);
  doc.text(`2. Name of Payee: ${(`${invoice.patient.firstName} ${invoice.patient.lastName}`).toUpperCase()}`, 18, 56);
  doc.text(`3. Registered Address: ${invoice.patient.address || "N/A"}`, 18, 62);

  // Part II - Payor Info
  doc.setFont("helvetica", "bold");
  doc.text("PART II - PAYOR INFORMATION (WITHHOLDING AGENT)", 14, 74);

  doc.rect(14, 77, 182, 22);

  doc.setFont("helvetica", "normal");
  doc.text(`4. Payor's TIN (Clinic): ${clinic.tin}`, 18, 82);
  doc.text(`5. Name of Payor: ${clinic.name.toUpperCase()}`, 18, 87);
  doc.text(`6. Registered Address: ${clinic.address}`, 18, 93);

  // Part III - Tax Details
  doc.setFont("helvetica", "bold");
  doc.text("PART III - DETAILS OF INCOME PAYMENTS & TAXES WITHHELD", 14, 105);

  const subtotalNum = Number(invoice.subtotal);
  // Standard EWT for professional fees: 10% (ATC WI100) or 5% (WI110)
  const isCompany = false; 
  const atcCode = "WI100";
  const taxRate = "10%";
  const taxWithheld = subtotalNum * 0.10;

  const tableRows = [
    [
      "Professional Fees (Dental Practitioners)",
      atcCode,
      formatPHP(subtotalNum),
      formatPHP(subtotalNum),
      formatPHP(subtotalNum),
      taxRate,
      formatPHP(taxWithheld),
    ]
  ];

  autoTable(doc, {
    startY: 108,
    head: [["Nature of Income Payment", "ATC", "1st Month", "2nd Month", "3rd Month", "Tax Rate", "Tax Withheld"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: COLORS.primary as any,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 12;

  // Signatures Section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("We declare under the penalties of perjury that this certificate is true and correct.", 14, currentY);
  
  currentY += 8;

  // Payor Signature box
  doc.rect(14, currentY, 86, 32);
  doc.line(20, currentY + 22, 80, currentY + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(clinic.name.toUpperCase(), 20, currentY + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Signature of Payor / Authorized Representative", 20, currentY + 29);

  // Payee Signature box
  doc.rect(110, currentY, 86, 32);
  doc.line(116, currentY + 22, 176, currentY + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`${invoice.patient.firstName} ${invoice.patient.lastName}`.toUpperCase(), 116, currentY + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Signature of Payee / Authorized Representative", 116, currentY + 29);

  addFooter(doc, 1, 1);

  saveOrOpenPdf(doc, `BIR-2307-${invoice.id.substring(0, 8)}.pdf`);
}

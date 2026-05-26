import { createPdfDoc, addClinicHeader, addPatientBlock, addFooter, getClinicAndLicenseData, COLORS, saveOrOpenPdf } from "./pdfUtils";
import { InvoiceDto, formatPHP } from "../types/invoice";
import autoTable from "jspdf-autotable";

export async function generateInvoicePdf(invoice: InvoiceDto): Promise<void> {
  const doc = createPdfDoc();
  const { clinic, dentist } = await getClinicAndLicenseData();

  const title = invoice.orNumber ? `Official Receipt #${invoice.orNumber}` : `Invoice #${invoice.id.substring(0, 8)}`;
  addClinicHeader(doc, clinic, title);
  addPatientBlock(doc, invoice.patient);

  // Billing Details Left Column
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("Invoice Date:", 14, 78);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(new Date(invoice.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }), 35, 78);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("Status:", 14, 83);
  doc.setFont("helvetica", "bold");
  if (invoice.status === "PAID") {
    doc.setTextColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  } else {
    doc.setTextColor(219, 39, 119); // Rose-600 for unpaid/partial
  }
  doc.text(invoice.status, 35, 83);

  // Senior/PWD details
  if (invoice.patient.isSeniorCitizen || invoice.patient.pwdIdNo) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text("Discount ID:", 100, 78);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(invoice.patient.oscaIdNo || invoice.patient.pwdIdNo || "N/A", 120, 78);
  }

  // Treatment Items Table
  const tableRows = invoice.treatments.map((t, index) => [
    index + 1,
    t.procedure,
    t.toothIds && t.toothIds.length > 0 ? t.toothIds.join(", ") : "General",
    t.quantity.toString(),
    formatPHP(t.unitPrice),
    formatPHP(t.lineTotal),
  ]);

  autoTable(doc, {
    startY: 88,
    head: [["#", "Procedure", "Tooth", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: COLORS.primary as any,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 32, halign: "right" },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Totals Breakdown Box
  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(120, currentY, 76, 32, 1, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  
  doc.text("Subtotal:", 124, currentY + 6);
  doc.text(formatPHP(invoice.subtotal), 192 - doc.getTextWidth(formatPHP(invoice.subtotal)), currentY + 6);

  doc.text("Discount:", 124, currentY + 12);
  doc.text(`-${formatPHP(invoice.discount)}`, 192 - doc.getTextWidth(`-${formatPHP(invoice.discount)}`), currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("Total Amount:", 124, currentY + 18);
  doc.text(formatPHP(invoice.total), 192 - doc.getTextWidth(formatPHP(invoice.total)), currentY + 18);

  doc.text("Amount Paid:", 124, currentY + 24);
  doc.text(formatPHP(invoice.paid), 192 - doc.getTextWidth(formatPHP(invoice.paid)), currentY + 24);

  // Balance due
  doc.setFont("helvetica", "bold");
  doc.setTextColor(219, 39, 119); // Rose-600
  doc.text("Balance Due:", 124, currentY + 29);
  doc.text(formatPHP(invoice.balance), 192 - doc.getTextWidth(formatPHP(invoice.balance)), currentY + 29);

  // Payment History Left Column
  if (invoice.payments && invoice.payments.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text("PAYMENT LOG", 14, currentY + 6);

    const paymentRows = invoice.payments.map((p) => [
      new Date(p.paidAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
      p.method,
      p.referenceNo || "N/A",
      formatPHP(p.amount),
    ]);

    autoTable(doc, {
      startY: currentY + 10,
      margin: { right: 86 }, // avoid overlap with totals box
      head: [["Date", "Method", "Ref No", "Amount"]],
      body: paymentRows,
      theme: "plain",
      headStyles: {
        fillColor: COLORS.secondary as any,
        textColor: [255, 255, 255],
        fontSize: 7,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
      },
    });
  }

  // Doctor Signature
  const pageHeight = doc.internal.pageSize.getHeight();
  const sigY = pageHeight - 40;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("Prepared By:", 14, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(dentist.fullName, 14, sigY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`PRC License No: ${dentist.prcNumber}`, 14, sigY + 11);
  doc.text(`PTR No: ${dentist.ptrNumber}`, 14, sigY + 16);

  addFooter(doc, 1, 1);

  saveOrOpenPdf(doc, `Invoice-${invoice.id.substring(0, 8)}.pdf`);
}

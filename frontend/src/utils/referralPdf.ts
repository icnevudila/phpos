import { createPdfDoc, addClinicHeader, addPatientBlock, getClinicAndLicenseData, COLORS, saveOrOpenPdf, addFooter } from "./pdfUtils";
import { PatientReferral } from "../services/referrals";
import { getPatient } from "../services/patients";

export async function generateReferralPdf(referral: PatientReferral, patientId: string): Promise<void> {
  const doc = createPdfDoc();
  
  // Fetch patient details dynamically
  let patientData = { name: "Patient" };
  try {
    patientData = await getPatient(patientId);
  } catch (e) {
    console.warn("Failed to fetch patient for PDF, using ID", e);
  }

  const { clinic, dentist } = await getClinicAndLicenseData();

  addClinicHeader(doc, clinic, "Referral Letter");
  addPatientBlock(doc, patientData);

  let currentY = 78;

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`Date: ${new Date(referral.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}`, 14, currentY);
  
  currentY += 10;

  // Recipient Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("TO:", 14, currentY);
  
  doc.setFont("helvetica", "bold");
  doc.text(referral.referredTo || "Attending Dentist/Physician", 14, currentY + 5);
  
  if (referral.specialty) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(`Specialty: ${referral.specialty}`, 14, currentY + 9);
    currentY += 16;
  } else {
    currentY += 12;
  }

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(14, currentY, 196, currentY);
  
  currentY += 8;

  // Referral Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("REASON FOR REFERRAL:", 14, currentY);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  
  // Wrap text
  const wrappedReason = doc.splitTextToSize(referral.reason || "N/A", 182);
  doc.text(wrappedReason, 14, currentY + 6);
  
  currentY += 12 + (wrappedReason.length * 4.5);

  if (referral.notes && referral.notes.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text("ADDITIONAL CLINICAL NOTES:", 14, currentY);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    
    const wrappedNotes = doc.splitTextToSize(referral.notes, 182);
    doc.text(wrappedNotes, 14, currentY + 6);
    
    currentY += 12 + (wrappedNotes.length * 4.5);
  }

  // Complimentary Close
  currentY = Math.max(currentY, 160); // Ensure spacing
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("Sincerely,", 14, currentY);

  // Signature Area
  doc.setFont("helvetica", "bold");
  const authorName = referral.author ? `Dr. ${referral.author.firstName} ${referral.author.lastName}, DMD` : dentist.fullName;
  doc.text(authorName, 14, currentY + 12);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`PRC License No: ${dentist.prcNumber}`, 14, currentY + 16);
  doc.text(`PTR No: ${dentist.ptrNumber}`, 14, currentY + 20);

  addFooter(doc, 1, 1);

  saveOrOpenPdf(doc, `Referral-${patientData.name.replace(/\s+/g, "-")}.pdf`);
}

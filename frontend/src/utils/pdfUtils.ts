import jsPDF from "jspdf";
import "jspdf-autotable";
import { fetchClinic } from "../services/clinic";
import { fetchAuthMeProfile } from "../services/api";
import api from "../services/api";

export interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  tin: string;
  logoUrl?: string | null;
}

export interface DentistLicenses {
  prcNumber: string;
  ptrNumber: string;
  s2License: string;
  tinNumber: string;
  fullName: string;
}

// Colors from DentQL palette
export const COLORS = {
  primary: [15, 23, 42],      // Slate 900
  secondary: [13, 148, 136],  // Teal 600
  muted: [100, 116, 139],     // Slate 500
  light: [248, 250, 252],     // Slate 50
  accent: [20, 184, 166],     // Teal 500
};

export async function getClinicAndLicenseData(): Promise<{ clinic: ClinicInfo; dentist: DentistLicenses }> {
  let clinicInfo: ClinicInfo = {
    name: "DENTQL CLINIC",
    address: "123 Medical Avenue, Manila, Philippines",
    phone: "+63 2 8123 4567",
    tin: "000-123-456-000",
  };

  let dentistLicenses: DentistLicenses = {
    prcNumber: "N/A",
    ptrNumber: "N/A",
    s2License: "N/A",
    tinNumber: "N/A",
    fullName: "Dr. John Doe, DMD",
  };

  try {
    const clinic = await fetchClinic();
    if (clinic) {
      clinicInfo.name = clinic.name || clinicInfo.name;
      clinicInfo.address = clinic.address || clinic.city || clinicInfo.address;
      clinicInfo.phone = clinic.phone || clinicInfo.phone;
    }
  } catch (e) {
    console.warn("Failed to fetch clinic settings, using defaults", e);
  }

  try {
    const profile = await fetchAuthMeProfile();
    if (profile) {
      dentistLicenses.fullName = `Dr. ${profile.firstName} ${profile.lastName}, DMD`;
      
      // Fetch licensing details
      const res = await api.get<any>(`/users/${profile.id}`);
      if (res && res.data) {
        const u = res.data;
        dentistLicenses.prcNumber = u.prcNumber || "N/A";
        dentistLicenses.ptrNumber = u.ptrNumber || "N/A";
        dentistLicenses.s2License = u.s2License || "N/A";
        dentistLicenses.tinNumber = u.tinNumber || "N/A";
        clinicInfo.tin = u.tinNumber || clinicInfo.tin; // fallback TIN
      }
    }
  } catch (e) {
    console.warn("Failed to fetch profile settings, using defaults", e);
  }

  return { clinic: clinicInfo, dentist: dentistLicenses };
}

export function createPdfDoc(): jsPDF {
  return new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
}

export function addClinicHeader(doc: jsPDF, clinic: ClinicInfo, title: string) {
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(clinic.name.toUpperCase(), 14, 20);

  // Subtitle / Contact
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`${clinic.address}  |  Tel: ${clinic.phone}`, 14, 25);
  doc.text(`TIN: ${clinic.tin}`, 14, 29);

  // Document Title Badge
  doc.setFillColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.rect(14, 34, 182, 8, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), 17, 39.5);

  // Horizontal divider
  doc.setDrawColor(COLORS.secondary[0], COLORS.secondary[1], COLORS.secondary[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);
}

export function addPatientBlock(
  doc: jsPDF, 
  patient: { name?: string; fullName?: string; firstName?: string; lastName?: string; phone?: string; dob?: string; birthDate?: string; gender?: string; philhealthNo?: string }
) {
  const patientName = patient.fullName || patient.name || `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
  const phone = patient.phone || "N/A";
  const dob = patient.birthDate || patient.dob || "N/A";
  const philhealth = patient.philhealthNo || "N/A";

  doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2]);
  doc.roundedRect(14, 49, 182, 22, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text("PATIENT INFORMATION", 18, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  
  doc.text(`Name:`, 18, 60);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.text(patientName, 32, 60);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(`Phone: ${phone}`, 18, 66);
  doc.text(`DOB: ${dob}`, 110, 60);
  doc.text(`PhilHealth: ${philhealth}`, 110, 66);
}

export function addFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(226, 232, 240); // border-slate-200
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 15, 196, pageHeight - 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text("Powered by DentQL — Clinical Intelligence", 14, pageHeight - 10);
  
  const pageText = `Page ${pageNumber} of ${totalPages}`;
  doc.text(pageText, 196 - doc.getTextWidth(pageText), pageHeight - 10);
}

export function saveOrOpenPdf(doc: jsPDF, filename: string) {
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

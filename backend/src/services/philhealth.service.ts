import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

/**
 * PhilHealth e-Claims XML Generator (Transmittal 2.0 Base)
 * This is a preliminary structure for automated claim generation.
 */
export async function generatePhilhealthXml(claimId: string): Promise<string> {
  const claim = await prisma.hmoClaim.findUnique({
    where: { id: claimId },
    include: {
      clinic: true,
      patient: true,
      invoice: {
        include: { items: true }
      },
      provider: true,
      patientHmo: true,
      lines: {
        include: { treatment: { include: { dentist: true } } }
      }
    }
  });

  if (!claim) throw new AppError("Claim not found", 404, "CLAIM_NOT_FOUND");

  // Basic XML structure for PhilHealth e-Claims 2.0
  // Note: Actual implementation requires strict field validation and specific tag orders.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<TRANSMITTAL pHciAccreditationNo="${claim.clinic.philhealthAccreditationNo || ""}" pTransmittalNo="${claim.claimNumber}" pTransmittalDate="${new Date().toISOString().split('T')[0]}">
  <CLAIM pClaimNumber="${claim.claimNumber}" pTrackingNumber="${claim.externalRef || ""}">
    <PATIENT 
      pPIN="${claim.patient.philhealthNo || ""}" 
      pLastName="${claim.patient.lastName}" 
      pFirstName="${claim.patient.firstName}" 
      pMiddleName="${claim.patient.middleName || ""}" 
      pBirthDate="${claim.patient.birthDate?.toISOString().split('T')[0] || ""}" 
      pGender="${claim.patient.gender?.[0] || ""}"
    />
    <ADMISSION pDateAdmitted="${claim.createdAt.toISOString().split('T')[0]}" pTimeAdmitted="00:00:00" pDateDischarged="${claim.decidedAt?.toISOString().split('T')[0] || ""}" pTimeDischarged="00:00:00" />
    <DIAGNOSIS>
      ${claim.lines.map(line => `
      <ICDCODE pIcdCode="${line.treatment.icd10Code || "Z01.2"}" pIsPrimary="Y" />
      `).join('')}
    </DIAGNOSIS>
    <PROCEDURES>
      ${claim.lines.map(line => `
      <RVSCODE pRvsCode="${line.treatment.rvuCode || ""}" pDatePerformed="${line.treatment.createdAt.toISOString().split('T')[0]}" />
      `).join('')}
    </PROCEDURES>
    <PARTICULARS>
      ${claim.invoice.items.map(item => `
      <ITEM pProcedureName="${item.procedure}" pAmount="${item.total}" />
      `).join('')}
    </PARTICULARS>
  </CLAIM>
</TRANSMITTAL>`;

  return xml.trim();
}

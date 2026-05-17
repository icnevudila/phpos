import { PERIO_SITE_CODES, type PerioSiteCode, type PerioToothDto } from "../services/perio";

export interface PerioValidationResult {
  ok: boolean;
  errors: string[];
}

export function validatePerioTeeth(teeth: PerioToothDto[]): PerioValidationResult {
  const errors: string[] = [];

  if (teeth.length < 1) {
    errors.push("At least one tooth is required.");
    return { ok: false, errors };
  }
  if (teeth.length > 32) {
    errors.push("Maximum 32 teeth per exam.");
  }

  const seen = new Set<number>();
  for (const tooth of teeth) {
    if (tooth.toothNumber < 1 || tooth.toothNumber > 32) {
      errors.push(`Tooth ${tooth.toothNumber}: number must be 1–32.`);
    }
    if (seen.has(tooth.toothNumber)) {
      errors.push(`Tooth ${tooth.toothNumber}: duplicate entry.`);
    }
    seen.add(tooth.toothNumber);

    if (tooth.mobility != null && (tooth.mobility < 0 || tooth.mobility > 3)) {
      errors.push(`Tooth ${tooth.toothNumber}: mobility must be 0–3.`);
    }
    if (tooth.furcation != null && (tooth.furcation < 0 || tooth.furcation > 3)) {
      errors.push(`Tooth ${tooth.toothNumber}: furcation must be 0–3.`);
    }

    if (tooth.missing) continue;

    const codes = new Set<PerioSiteCode>();
    for (const site of tooth.sites) {
      if (!PERIO_SITE_CODES.includes(site.siteCode)) {
        errors.push(`Tooth ${tooth.toothNumber}: invalid site ${site.siteCode}.`);
      }
      if (codes.has(site.siteCode)) {
        errors.push(`Tooth ${tooth.toothNumber}: duplicate site ${site.siteCode}.`);
      }
      codes.add(site.siteCode);
      if (site.pocketDepth < 0 || site.pocketDepth > 15) {
        errors.push(`Tooth ${tooth.toothNumber} ${site.siteCode}: pocket depth must be 0–15 mm.`);
      }
      if (site.recession < 0 || site.recession > 15) {
        errors.push(`Tooth ${tooth.toothNumber} ${site.siteCode}: recession must be 0–15 mm.`);
      }
    }
    if (codes.size === 0) {
      errors.push(`Tooth ${tooth.toothNumber}: at least one site measurement required.`);
    }
  }

  return { ok: errors.length === 0, errors };
}

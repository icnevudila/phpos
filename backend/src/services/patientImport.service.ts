import { createPatient } from "./patient.service.js";
import type { CreatePatientInput } from "../validation/patient.schemas.js";
import { AppError } from "../utils/errors.js";

export interface PatientCsvImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function headerIndex(headers: string[], names: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().replace(/\s+/g, ""));
  for (const name of names) {
    const idx = lower.indexOf(name.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

export async function importPatientsFromCsv(
  clinicId: string,
  csvText: string,
): Promise<PatientCsvImportResult> {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new AppError("CSV must include a header row and at least one data row", 400, "CSV_EMPTY");
  }

  const headers = parseCsvLine(lines[0]);
  const iFirst = headerIndex(headers, ["firstname", "first_name", "first"]);
  const iLast = headerIndex(headers, ["lastname", "last_name", "last"]);
  const iPhone = headerIndex(headers, ["phone", "mobile", "contact"]);
  const iEmail = headerIndex(headers, ["email", "e-mail"]);

  if (iFirst < 0 || iLast < 0 || iPhone < 0) {
    throw new AppError(
      "CSV headers must include firstName, lastName, and phone columns",
      400,
      "CSV_HEADERS_INVALID",
    );
  }

  let created = 0;
  let skipped = 0;
  const errors: PatientCsvImportResult["errors"] = [];

  for (let r = 1; r < lines.length; r += 1) {
    const cols = parseCsvLine(lines[r]);
    const firstName = cols[iFirst]?.trim();
    const lastName = cols[iLast]?.trim();
    const phone = cols[iPhone]?.trim();
    const email = iEmail >= 0 ? cols[iEmail]?.trim() || undefined : undefined;

    if (!firstName || !lastName || !phone) {
      skipped += 1;
      errors.push({ row: r + 1, message: "Missing firstName, lastName, or phone" });
      continue;
    }

    const input: CreatePatientInput = {
      firstName,
      lastName,
      phone,
      email,
      allergies: [],
    };

    try {
      await createPatient(clinicId, input);
      created += 1;
    } catch (e) {
      skipped += 1;
      const message = e instanceof AppError ? e.message : "Create failed";
      errors.push({ row: r + 1, message });
    }
  }

  return { created, skipped, errors: errors.slice(0, 50) };
}

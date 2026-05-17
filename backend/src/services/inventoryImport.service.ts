import { INVENTORY_CATEGORIES } from "../validation/inventory.schemas.js";
import { createInventoryItem } from "./inventory.service.js";
import type { CreateInventoryBody } from "../validation/inventory.schemas.js";
import { AppError } from "../utils/errors.js";

export interface InventoryCsvImportResult {
  created: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}

const CATEGORY_SET = new Set<string>(INVENTORY_CATEGORIES);

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
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
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

function parseCategory(raw: string): (typeof INVENTORY_CATEGORIES)[number] {
  const normalized = raw.trim();
  if (CATEGORY_SET.has(normalized)) return normalized as (typeof INVENTORY_CATEGORIES)[number];
  const match = INVENTORY_CATEGORIES.find((c) => c.toLowerCase() === normalized.toLowerCase());
  return match ?? "Other";
}

export async function importInventoryFromCsv(
  clinicId: string,
  csvText: string,
): Promise<InventoryCsvImportResult> {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new AppError("CSV must include header and at least one row", 400, "CSV_EMPTY");
  }

  const headers = parseCsvLine(lines[0]);
  const iName = headerIndex(headers, ["itemname", "item_name", "name", "item"]);
  const iCat = headerIndex(headers, ["category", "cat"]);
  const iUnit = headerIndex(headers, ["unit", "uom"]);
  const iQty = headerIndex(headers, ["quantity", "qty", "stock"]);
  const iMin = headerIndex(headers, ["minimumstock", "min_stock", "min"]);
  const iCost = headerIndex(headers, ["unitcost", "unit_cost", "cost", "price"]);
  const iSupplier = headerIndex(headers, ["supplier", "vendor"]);
  const iExpiry = headerIndex(headers, ["expirydate", "expiry", "expiration"]);

  if (iName < 0 || iUnit < 0) {
    throw new AppError(
      "CSV must include itemName and unit columns",
      400,
      "CSV_HEADERS_INVALID",
    );
  }

  let created = 0;
  let skipped = 0;
  const errors: InventoryCsvImportResult["errors"] = [];

  for (let r = 1; r < lines.length; r += 1) {
    const cols = parseCsvLine(lines[r]);
    const itemName = cols[iName]?.trim();
    const unit = cols[iUnit]?.trim();
    if (!itemName || !unit) {
      skipped += 1;
      errors.push({ row: r + 1, message: "Missing itemName or unit" });
      continue;
    }

    const quantity = iQty >= 0 ? Number.parseInt(cols[iQty] ?? "0", 10) : 0;
    const minimumStock = iMin >= 0 ? Number.parseInt(cols[iMin] ?? "0", 10) : 0;
    const unitCost = iCost >= 0 ? Number.parseFloat(cols[iCost] ?? "0") : 0;
    const expiryRaw = iExpiry >= 0 ? cols[iExpiry]?.trim() : "";

    const body: CreateInventoryBody = {
      itemName,
      category: parseCategory(iCat >= 0 ? cols[iCat] ?? "Other" : "Other"),
      unit,
      quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : 0,
      minimumStock: Number.isFinite(minimumStock) && minimumStock >= 0 ? minimumStock : 0,
      unitCost: Number.isFinite(unitCost) && unitCost >= 0 ? unitCost : 0,
      supplier: iSupplier >= 0 ? cols[iSupplier]?.trim() || null : null,
      expiryDate: expiryRaw && !Number.isNaN(Date.parse(expiryRaw)) ? new Date(expiryRaw) : null,
    };

    try {
      await createInventoryItem(clinicId, body);
      created += 1;
    } catch (e) {
      skipped += 1;
      errors.push({
        row: r + 1,
        message: e instanceof AppError ? e.message : "Create failed",
      });
    }
  }

  return { created, skipped, errors: errors.slice(0, 50) };
}

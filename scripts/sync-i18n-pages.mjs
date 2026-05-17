#!/usr/bin/env node
/**
 * Compare pages.en.json vs pages.tr.json keys (flat dot paths).
 * Exit 1 if TR is missing keys present in EN.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const enPath = path.join(root, "frontend/src/i18n/locales/pages.en.json");
const trPath = path.join(root, "frontend/src/i18n/locales/pages.tr.json");

function flatKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) keys.push(...flatKeys(v, p));
    else keys.push(p);
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const tr = JSON.parse(fs.readFileSync(trPath, "utf8"));
const enKeys = new Set(flatKeys(en));
const trKeys = new Set(flatKeys(tr));
const missingInTr = [...enKeys].filter((k) => !trKeys.has(k));
const extraInTr = [...trKeys].filter((k) => !enKeys.has(k));

console.log(`EN keys: ${enKeys.size} | TR keys: ${trKeys.size}`);
if (missingInTr.length) {
  console.error(`Missing in TR (${missingInTr.length}):`);
  for (const k of missingInTr.slice(0, 40)) console.error("  -", k);
  if (missingInTr.length > 40) console.error(`  ... +${missingInTr.length - 40} more`);
}
if (extraInTr.length) {
  console.warn(`Extra in TR only (${extraInTr.length}):`);
  for (const k of extraInTr.slice(0, 20)) console.warn("  -", k);
}
const strict = process.argv.includes("--strict");
if (missingInTr.length && strict) process.exit(1);
if (missingInTr.length) {
  console.warn("Run with --strict to fail CI. Copy missing keys from pages.en.json to pages.tr.json.");
}
process.exit(0);

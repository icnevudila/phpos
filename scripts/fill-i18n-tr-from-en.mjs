#!/usr/bin/env node
/**
 * Deep-merge missing keys from pages.en.json into pages.tr.json (EN value as fallback).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const enPath = path.join(root, "frontend/src/i18n/locales/pages.en.json");
const trPath = path.join(root, "frontend/src/i18n/locales/pages.tr.json");

function deepFill(target, source) {
  let added = 0;
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      added += deepFill(target[k], v);
    } else if (!(k in target)) {
      target[k] = v;
      added += 1;
    }
  }
  return added;
}

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const tr = JSON.parse(fs.readFileSync(trPath, "utf8"));
const added = deepFill(tr, en);
fs.writeFileSync(trPath, `${JSON.stringify(tr, null, 2)}\n`, "utf8");
console.log(`Filled ${added} missing keys into pages.tr.json`);

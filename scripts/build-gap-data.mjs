import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const s = readFileSync(join(__dirname, "generate-agent-checklist.mjs.bak"), "utf8");
const start = s.indexOf("const GAPS = [");
const end = s.indexOf("const SHARED_APP", start);
const gapsBlock = s.slice(start, end).replace("const GAPS", "export const GAPS");
const mid = s.indexOf("function parallelNote", end);
const endFn = s.indexOf("let md =", mid);
const fnBlock = s.slice(mid, endFn).replace(/^function /m, "export function ");

const tail = `
export const RESERVED_RANGES = [
  { range: "GAP-071 — GAP-075", note: "Bölüm 13 tablosunda atlanmış (070 → 076)." },
  { range: "GAP-083 — GAP-090", note: "Bölüm 13 tablosunda atlanmış (082 → 091)." },
];

export const PACKAGE_TASKS = [
  { id: "PKG-A", title: "Bölüm 17 Paket A — PH Yasal + Güvenlik", kind: "package" },
  { id: "PKG-B", title: "Bölüm 17 Paket B — HMO tam akış", kind: "package" },
  { id: "PKG-C", title: "Bölüm 17 Paket C — Staff deneyimi", kind: "package" },
  { id: "PKG-D", title: "Bölüm 17 Paket D — Klinik akışı", kind: "package" },
  { id: "PKG-E", title: "Bölüm 17 Paket E — Dashboard+", kind: "package" },
  { id: "PKG-F", title: "Bölüm 17 Paket F — Kanal + ödeme", kind: "package" },
];

export const EXT_TASKS = [
  { id: "EXT-18", title: "Bölüm 18 — Kararların kodlanması", kind: "ext" },
  { id: "EXT-19", title: "Bölüm 19 — Login rework", kind: "ext" },
  { id: "EXT-20", title: "Bölüm 20 — Landing rework", kind: "ext" },
  { id: "EXT-21", title: "Bölüm 21 — PDF/Excel", kind: "ext" },
  { id: "EXT-22", title: "Bölüm 22 — i18n 5 dil", kind: "ext" },
  { id: "EXT-23", title: "Bölüm 23 — Design system + PDF görsel", kind: "ext" },
  { id: "EXT-24", title: "Bölüm 24 — Otomasyon + event bus", kind: "ext" },
];

export const RESERVED_SLOTS = [
  { id: "RES-071-075", title: "Rezerve GAP-071–075 (tabloda satır yok)", kind: "reserved" },
  { id: "RES-083-090", title: "Rezerve GAP-083–090 (tabloda satır yok)", kind: "reserved" },
];

export function getAllTaskMeta() {
  const rows = [];
  for (const g of GAPS) {
    rows.push({ id: g.id, title: g.title, kind: "gap", files: g.files, priority: g.priority });
  }
  for (const p of PACKAGE_TASKS) {
    rows.push({ id: p.id, title: p.title, kind: p.kind });
  }
  for (const e of EXT_TASKS) {
    rows.push({ id: e.id, title: e.title, kind: e.kind });
  }
  for (const r of RESERVED_SLOTS) {
    rows.push({ id: r.id, title: r.title, kind: r.kind });
  }
  return rows;
}

export function getAllTaskIds() {
  return getAllTaskMeta().map((r) => r.id);
}
`;

const header = "/** Paylaşılan GAP / paket / EXT listesi — checklist + AGENT_STATUS.json için */\n";
writeFileSync(join(__dirname, "gap-data.mjs"), header + gapsBlock + "\n" + fnBlock + tail, "utf8");
console.log("Wrote gap-data.mjs");

/**
 * Görev tamamlandığında AGENT_STATUS.json günceller + AGENT_COMPLETION_LOG.md'ye satır ekler.
 *
 * Kullanım:
 *   node scripts/log-agent-completion.mjs --id GAP-001 --summary "Signed URL eklendi"
 *   node scripts/log-agent-completion.mjs --id EXT-22 --summary "i18n dosyaları" --files "frontend/src/i18n/index.ts" --agent "composer"
 *   node scripts/log-agent-completion.mjs --id GAP-001 --undo   (geri al)
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { getAllTaskIds } from "./gap-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const statusPath = join(root, "docs", "AGENT_STATUS.json");
const logPath = join(root, "docs", "AGENT_COMPLETION_LOG.md");

function parseArgs(argv) {
  const out = { id: null, summary: "", files: "", agent: "sub-agent", undo: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") out.id = argv[++i];
    else if (a === "--summary") out.summary = argv[++i] ?? "";
    else if (a === "--files") out.files = argv[++i] ?? "";
    else if (a === "--agent") out.agent = argv[++i] ?? "sub-agent";
    else if (a === "--undo") out.undo = true;
  }
  return out;
}

const args = parseArgs(process.argv);
if (!args.id) {
  console.error("Kullanım: node scripts/log-agent-completion.mjs --id GAP-001 --summary \"...\" [--files \"a,b\"] [--agent ad] [--undo]");
  process.exit(1);
}

const valid = new Set(getAllTaskIds());
if (!valid.has(args.id)) {
  console.error("Geçersiz id:", args.id, "| Geçerli örnek:", [...valid].slice(0, 5).join(", "), "...");
  process.exit(1);
}

if (!existsSync(statusPath)) {
  console.error("Önce: node scripts/init-agent-status.mjs");
  process.exit(1);
}

const data = JSON.parse(readFileSync(statusPath, "utf8"));
if (!data.tasks[args.id]) {
  console.error("Görev bulunamadı:", args.id);
  process.exit(1);
}

const t = data.tasks[args.id];
const now = new Date().toISOString();

if (args.undo) {
  t.done = false;
  t.completedAt = null;
  t.summary = "";
  t.updatedBy = args.agent;
  t.history.push({ at: now, action: "undo", by: args.agent });
} else {
  if (!args.summary.trim()) {
    console.error("--summary zorunlu (undo hariç)");
    process.exit(1);
  }
  t.done = true;
  t.completedAt = now;
  t.summary = args.summary.trim();
  t.updatedBy = args.agent;
  if (args.files) {
    t.filesTouched = args.files.split(",").map((s) => s.trim()).filter(Boolean);
  }
  t.history.push({
    at: now,
    action: "complete",
    by: args.agent,
    summary: t.summary,
    files: t.filesTouched ?? [],
  });
}

data.meta = { ...data.meta, updatedAt: now };
writeFileSync(statusPath, JSON.stringify(data, null, 2), "utf8");

const logLine = `
---

### ${now} | \`${args.id}\` | ${args.undo ? "↩ UNDO" : "✓ DONE"} | agent: **${args.agent}**

${args.undo ? "_Tamamlama geri alındı._" : `**Özet:** ${args.summary}`}
${args.files && !args.undo ? `**Dosyalar:** ${args.files}` : ""}

`;

if (!existsSync(logPath)) {
  writeFileSync(
    logPath,
    `# AGENT_COMPLETION_LOG — Kronolojik tamamlama kaydı\n\n> Bu dosya \`log-agent-completion.mjs\` ile append edilir. Silme.\n`,
    "utf8",
  );
}
appendFileSync(logPath, logLine, "utf8");
console.log(args.undo ? "Geri alındı:" : "Kaydedildi:", args.id);
console.log("Sonraki: node scripts/agent-dashboard.mjs");

/**
 * docs/AGENT_DASHBOARD.md üretir (AGENT_STATUS.json okunur).
 * Çalıştır: node scripts/agent-dashboard.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { getAllTaskIds, getAllTaskMeta } from "./gap-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const statusPath = join(root, "docs", "AGENT_STATUS.json");
const outPath = join(root, "docs", "AGENT_DASHBOARD.md");

if (!existsSync(statusPath)) {
  console.error("AGENT_STATUS.json yok. Önce: node scripts/init-agent-status.mjs");
  process.exit(1);
}

const data = JSON.parse(readFileSync(statusPath, "utf8"));
const tasks = data.tasks ?? {};
const meta = data.meta ?? {};

const ids = getAllTaskIds();
const metaRows = getAllTaskMeta();
const titleById = Object.fromEntries(metaRows.map((r) => [r.id, r.title]));

let done = 0;
let pending = 0;

const lines = [];
lines.push("# AGENT_DASHBOARD — İlerleme Özeti");
lines.push("");
lines.push(`> Otomatik üretim: \`node scripts/agent-dashboard.mjs\`  `);
lines.push(`> Son güncelleme: **${meta.updatedAt ?? "?"}**  `);
lines.push("");
lines.push("| Metrik | Değer |");
lines.push("|--------|-------|");

for (const id of ids) {
  const t = tasks[id];
  if (t?.done) done += 1;
  else pending += 1;
}

const pct = ids.length ? Math.round((done / ids.length) * 1000) / 10 : 0;
lines.push("| Toplam görev | " + ids.length + " |");
lines.push("| Tamamlanan | " + done + " |");
lines.push("| Bekleyen | " + pending + " |");
lines.push("| İlerleme | **" + pct + "%** |");
lines.push("");

lines.push("## Bekleyenler (ilk 50)");
lines.push("");
lines.push("| ID | Başlık | Öncelik |");
lines.push("|----|--------|---------|");

let n = 0;
for (const id of ids) {
  const t = tasks[id];
  if (t?.done) continue;
  n += 1;
  if (n > 50) break;
  const title = (t?.title ?? titleById[id] ?? "").replace(/\|/g, "\\|");
  const pr = (t?.priority ?? "—").replace(/\|/g, "\\|");
  lines.push(`| ${id} | ${title} | ${pr} |`);
}

lines.push("");
lines.push("## Son tamamlananlar (20)");
lines.push("");
lines.push("| ID | Tamamlanma | Özet |");
lines.push("|----|------------|------|");

const completed = ids
  .filter((id) => tasks[id]?.done && tasks[id]?.completedAt)
  .sort((a, b) => (tasks[b].completedAt > tasks[a].completedAt ? 1 : -1))
  .slice(0, 20);

for (const id of completed) {
  const t = tasks[id];
  const sum = (t.summary ?? "—").replace(/\|/g, "\\|").slice(0, 80);
  lines.push(`| ${id} | ${t.completedAt} | ${sum} |`);
}

lines.push("");
lines.push("---");
lines.push("");
lines.push("Tamamlama kaydı için: [`AGENT_COMPLETION_LOG.md`](AGENT_COMPLETION_LOG.md)");

writeFileSync(outPath, lines.join("\n"), "utf8");
console.log("Wrote docs/AGENT_DASHBOARD.md", done + "/" + ids.length, "done");

/**
 * docs/AGENT_STATUS.json oluşturur veya eksik görevleri ekler (mevcut done bilgisini korur).
 * Çalıştır: node scripts/init-agent-status.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { getAllTaskMeta } from "./gap-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "docs", "AGENT_STATUS.json");

/** @type {{ meta: object, tasks: Record<string, object> }} */
let data = { meta: {}, tasks: {} };

if (existsSync(path)) {
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
    if (!data.tasks) data.tasks = {};
  } catch {
    data = { meta: {}, tasks: {} };
  }
}

const now = new Date().toISOString();
data.meta = {
  ...data.meta,
  schemaVersion: 1,
  updatedAt: now,
  source: "scripts/gap-data.mjs",
};

const rows = getAllTaskMeta();
let added = 0;
for (const row of rows) {
  if (!data.tasks[row.id]) {
    data.tasks[row.id] = {
      title: row.title,
      kind: row.kind ?? "gap",
      files: row.files ?? null,
      priority: row.priority ?? null,
      done: false,
      completedAt: null,
      updatedBy: null,
      summary: "",
      filesTouched: [],
      testNote: "",
      history: [],
    };
    added += 1;
  } else {
    const t = data.tasks[row.id];
    t.title = row.title;
    if (row.files) t.files = row.files;
    if (row.priority) t.priority = row.priority;
    if (!t.kind) t.kind = row.kind ?? "gap";
    if (!Array.isArray(t.history)) t.history = [];
    if (!Array.isArray(t.filesTouched)) t.filesTouched = [];
  }
}

writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
console.log("AGENT_STATUS.json:", Object.keys(data.tasks).length, "görev,", added, "yeni eklendi.");

const logPath = join(root, "docs", "AGENT_COMPLETION_LOG.md");
if (!existsSync(logPath)) {
  writeFileSync(
    logPath,
    `# AGENT_COMPLETION_LOG — Kronolojik tamamlama kaydı

> Her tamamlanan görev için \`node scripts/log-agent-completion.mjs\` bu dosyaya bölüm ekler.

`,
    "utf8",
  );
  console.log("AGENT_COMPLETION_LOG.md oluşturuldu.");
}

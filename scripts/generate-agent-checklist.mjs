/**
 * GAP_ANALYSIS Bölüm 13 tablolarından AGENT_CHECKLIST.md üretir.
 * Çalıştır: node scripts/generate-agent-checklist.mjs
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import {
  GAPS,
  RESERVED_RANGES,
  parallelNote,
  promptFor,
} from "./gap-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let md = `# AGENT_CHECKLIST — Tam GAP Listesi (Otomatik Üretim)

> **Üretim:** \`node scripts/generate-agent-checklist.mjs\`  
> **Durum / ilerleme:** \`docs/AGENT_DASHBOARD.md\` + \`docs/AGENT_STATUS.json\` — \`node scripts/agent-dashboard.mjs\`  
> **Tamamlanınca kayıt:** \`node scripts/log-agent-completion.mjs --id GAP-001 --summary "..."\`  
> **Protokol:** \`docs/AGENT_PROTOCOL.md\`  
> **Kaynak:** \`scripts/gap-data.mjs\` + \`docs/GAP_ANALYSIS.md\` Bölüm 13.  
> **Not:** Başlıkta "GAP-240" yazıyor; Bölüm 13'te **131–240 satır yok**. Rezerve aralıklar aşağıda.

---

## Kurallar (tüm sub-agent'lar)

1. Önce \`docs/GAP_ANALYSIS.md\` ilgili GAP satırını oku.
2. **Minimal diff** — başka modülleri bozma.
3. Çakışma notu varsa aynı batch'te paralel çalıştırma; sıralı veya tek agent.
4. **İş bitince zorunlu:** \`node scripts/log-agent-completion.mjs --id <ID> --summary "kısa özet" [--files "a.ts,b.ts"] [--agent isim]\`
5. İsteğe bağlı: bu dosyada ilgili **Agent özeti** satırını elle doldur (script tekrar çalışınca üzerine yazılabilir).

---

## Paralellik özeti

| Grup | GAP ID | Not |
|------|--------|-----|
| A | 001,004,005 | \`app.ts\` — tek sıra |
| B | 002,026,027,033 | \`invoice.service\` / InvoicePage |
| C | 023,041,058 | PatientDetailPage |
| D | 046,048,049,093,094 | AppointmentsPage |
| E | 025,061–064,117 | DashboardPage |
| F | 101–104,107,108,115 | HomePage + yeni rotalar |
| G | 105,106,114 | DeviceMockups |

---

## GAP-001 … GAP-130 — Sub-agent görevleri

`;

for (const g of GAPS) {
  md += `### ${g.id} — ${g.title}

- [ ] **Öncelik:** ${g.priority}  
- **Hedef dosyalar:** ${g.files}  
- **Paralellik / çakışma:** ${parallelNote(g.id)}

**Agent prompt (kopyala):**
\`\`\`
${promptFor(g)}
\`\`\`

**Agent özeti:** _yapılmadı_

---

`;
}

md += `## Bölüm 17 — Paket A–F (özet sub-agent)

Paralel ekip için bir paket = tek büyük agent prompt.

### PKG-A — PH Yasal + Güvenlik
- [ ] **GAP:** 001,002,009,026,027,028,029,102,103  
**Prompt:** \`docs/GAP_ANALYSIS.md Bölüm 17 Paket A'yı uygula. Çıktı: signed URL/webhook/audit/Senior-PWD/TIN/Privacy Terms.\`

### PKG-B — HMO tam akış
- [ ] **GAP:** 021,022,023,024,025,068  
**Prompt:** \`Bölüm 17 Paket B. HMO UI + reconciliation.\`

### PKG-C — Staff deneyimi
- [ ] **GAP:** 011,012,014,015,016,017,018,019  
**Prompt:** \`Bölüm 17 Paket C. Auth me, password reset, settings, 404, roles, i18n başlangıç.\`

### PKG-D — Klinik akışı
- [ ] **GAP:** 036,037,038,039,040,041,042  
**Prompt:** \`Bölüm 17 Paket D. Recalls, waitlist, treatment plan, Rx, consent, galeri, foto.\`

### PKG-E — Dashboard+
- [ ] **GAP:** 061,062,063,064,065 (025 ile koordine)  
**Prompt:** \`Bölüm 17 Paket E. Queue, stok, doğum günü, alerts, ReportsPage.\`

### PKG-F — Kanal + ödeme
- [ ] **GAP:** 076,077,078,079,081,126,127,128  
**Prompt:** \`Bölüm 17 Paket F. Email, SMS şablon, quiet hours, QR Ph, GrabPay, banka.\`

---

## Bölüm 18–24 — Ek sub-agent (GAP tablosunda ID’si olmayan maddeler)

Her biri \`docs/GAP_ANALYSIS.md\` ilgili bölümde detaylı; **birbirini etkilememesi** için dosya öneklerine göre ayırıldı.

| ID | Konu | Agent prompt |
|----|------|----------------|
| EXT-18 | Kararların kodu (pricing enum BETA/…) | \`Bölüm 18 yanıtlı kararları uygula: PricingPlan enum migration; multi-branch Branch modeli; clinic.settings.dentistCanSeeOthers; landing 8 yasal route.\` |
| EXT-19 | Login rework tam paket | \`Bölüm 19 tüm kabul kriterleri: forgot password UI placeholder, rate limit login, i18n, a11y, branding.\` |
| EXT-20 | Landing rework tam paket | \`Bölüm 20: LND tablosu + yasal blocker; fake testimonial; integrations strip; SEO.\` |
| EXT-21 | PDF/Excel tam paket | \`Bölüm 21: tüm PDF iyileştirmeleri + exceljs CSV/XLSX + BIR alanları.\` |
| EXT-22 | i18n 5 dil + staff | \`Bölüm 22: en/fil/ceb/ilo/tr; TR dev-only; landing TR sızıntısı 0.\` |
| EXT-23 | Design system + PDF görsel | \`Bölüm 23: tailwind token, ui/*, invoice PDF polish, GCash UI.\` |
| EXT-24 | Otomasyon + event bus | \`Bölüm 24: PatientAutocomplete Enter + QuickAdd; event bus; cron SMS; RULE-01/02.\` |

- [ ] EXT-18 — Özet: _  
- [ ] EXT-19 — Özet: _  
- [ ] EXT-20 — Özet: _  
- [ ] EXT-21 — Özet: _  
- [ ] EXT-22 — Özet: _  
- [ ] EXT-23 — Özet: _  
- [ ] EXT-24 — Özet: _  

---

`;

md += `## Numarası tabloda olmayan GAP aralıkları (placeholder sub-agent)

| Aralık | Açıklama | [ ] |
|--------|----------|-----|
`;
for (const r of RESERVED_RANGES) {
  md += `| ${r.range} | ${r.note} | [ ] |\n`;
}
md += `
**Prompt (genel):** \`GAP_ANALYSIS Bölüm 13 numaralandırmasını kontrol et; eksik ID'leri ya sil ya da yeni satırla doldur; sonra bu checklist'i yeniden üret.\`

---

## GAP-131 … GAP-240 — Tabloda tanım yok

Başlıkta "GAP-240" geçiyor; Bölüm 13'te **131–240 için satır yok**. Kapsam pratikte:

- **EXT-18 … EXT-24** satırları (aşağıda) Bölüm 18–24 ile örtüşür.
- İstersen GAP_ANALYSIS'e yeni tablo eklendiğinde \`scripts/gap-data.mjs\` içindeki \`GAPS\` dizisini genişlet ve script'leri yeniden çalıştır.

---

*Bu dosya \`node scripts/generate-agent-checklist.mjs\` ile üretilir. Elle düzenleme yerine \`gap-data.mjs\` güncelle.*
`;

writeFileSync(join(root, "docs", "AGENT_CHECKLIST.md"), md, "utf8");
console.log("Wrote docs/AGENT_CHECKLIST.md", GAPS.length, "GAP entries + reserved + EXT + PKG.");

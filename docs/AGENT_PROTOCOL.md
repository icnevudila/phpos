# Sub-Agent Protokolü — DentEase PH

Bu protokol, **Cursor / Composer / arka plan agent** veya insan geliştiricinin aynı kurallarla ilerlemesi içindir. Amaç: işi bitirince **otomatik kayıt**, **sizin tek yerden görebilmeniz**, **çakışmasız paralel çalışma**.

---

## 1) Tek doğruluk kaynakları

| Dosya | Amaç |
|-------|------|
| [`GAP_ANALYSIS.md`](GAP_ANALYSIS.md) | Ne eksik, neden, yasal notlar |
| [`AGENT_CHECKLIST.md`](AGENT_CHECKLIST.md) | Her GAP için kopyala-yapıştır **prompt** (otomatik üretilir) |
| [`AGENT_STATUS.json`](AGENT_STATUS.json) | Tüm görevlerin **done / bekliyor** makine okunur hali |
| [`AGENT_DASHBOARD.md`](AGENT_DASHBOARD.md) | İnsan okuması için **% ilerleme + tablolar** (otomatik) |
| [`AGENT_COMPLETION_LOG.md`](AGENT_COMPLETION_LOG.md) | **Kronolojik** “kim ne yaptı” günlüğü (append-only) |

---

## 2) Yeni ortam / ilk kurulum

Repo kökünde:

```bash
cd scripts
node init-agent-status.mjs
node ../scripts/generate-agent-checklist.mjs
node agent-dashboard.mjs
```

- `AGENT_STATUS.json` içinde **132 görev** (117 GAP + 6 PKG + 7 EXT + 2 rezerve) oluşur.
- Checklist ve dashboard güncellenir.

---

## 3) Bir görevi bitirince (zorunlu)

```bash
node scripts/log-agent-completion.mjs --id GAP-001 --summary "Kısa açıklama: ne değişti"
```

İsteğe bağlı:

```bash
node scripts/log-agent-completion.mjs --id GAP-026 --summary "Senior indirim satırı" --files "backend/src/services/invoice.service.ts,frontend/src/components/PatientForm.tsx" --agent "cursor-agent-1"
```

Sonra (önerilir):

```bash
node scripts/agent-dashboard.mjs
```

Bu komutlar:

1. `AGENT_STATUS.json` içinde ilgili `id` için `done: true`, `summary`, `completedAt`, `history[]` yazar.
2. `AGENT_COMPLETION_LOG.md` sonuna tarihli bölüm ekler.
3. Dashboard’u yeniden üretir → **ilerleme %** güncellenir.

### Geri alma

```bash
node scripts/log-agent-completion.mjs --id GAP-001 --undo --agent "isim"
```

---

## 4) Checklist markdown’ı yeniden üretmek

`scripts/gap-data.mjs` veya `docs/GAP_ANALYSIS` tablosu değiştiyse:

```bash
node scripts/generate-agent-checklist.mjs
```

> Uyarı: Bu komut `docs/AGENT_CHECKLIST.md` dosyasını **baştan yazar**. Elle yazdığınız “Agent özeti” satırları silinebilir — özetler için **`log-agent-completion`** ve **`AGENT_COMPLETION_LOG.md`** kullanın.

---

## 5) Paralel sub-agent kuralları (çakışma)

- Aynı dosyayı hedefleyen GAP’ler **aynı anda iki agent’a verilmez** (ör. `app.ts`: GAP-001,004,005).
- Detay: [`AGENT_CHECKLIST.md`](AGENT_CHECKLIST.md) içindeki **Paralellik özeti** tablosu.
- **PR stratejisi:** Mümkünse küçük PR; merge sonrası `git pull` ve `agent-dashboard.mjs`.

---

## 6) Bildirim (size düşen mesaj)

Otomatik e-posta/Slack yok; **sizin kontrol ettiğiniz dosyalar:**

1. `docs/AGENT_DASHBOARD.md` → yüzde ve son tamamlananlar  
2. `docs/AGENT_COMPLETION_LOG.md` → tam kronoloji  

İsterseniz CI’de (GitHub Actions) `agent-dashboard` çıktısını artefact veya comment olarak ekleyebilirsiniz — şu an repo dışı.

---

## 7) Kimlik listesi (özet)

- **GAP-xxx:** Bölüm 13 tablosu (117 satır).  
- **PKG-A … PKG-F:** Bölüm 17 paketleri.  
- **EXT-18 … EXT-24:** Bölüm 18–24 büyük iş paketleri.  
- **RES-071-075, RES-083-090:** Tabloda numara atlanmış aralıklar (rezerve).

---

## 8) Sorun giderme

| Sorun | Çözüm |
|-------|--------|
| `Geçersiz id` | `gap-data.mjs` içindeki ID’yi kullanın; `init-agent-status` çalıştırın. |
| Dashboard eski | `node scripts/agent-dashboard.mjs` |
| JSON bozuldu | Git’ten geri alın veya `init-agent-status` (mevcut `done` korunur, eksik key eklenir) |

---

*Son güncelleme: protokol + script seti ile birlikte.*

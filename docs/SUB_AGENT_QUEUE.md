# Sub-agent sıralı kuyruk (GAP tamamı — öncelik sırası)

> **Kural:** Aynı çalıştırma içinde bir sonraki RUN’a geçmeden önce `node scripts/log-agent-completion.mjs --id ...` ve checklist `[x]` güncellensin.  
> **Ortam notu:** Şu an **local/dev**; prod URL, `CORS_ORIGIN`, `PAYMONGO_WEBHOOK_SECRET`, SMS anahtarları sonra — ilgili GAP’lerde env guard / placeholder kabul.

---

## Dönüşte cevaplaman gereken sorular

1. **Şirket / ürün adı** landing ve PDF’lerde kesin metin olarak ne? (ör. “DentEase PH” veya ticari unvan)
2. **Desteklenen diller** (i18n): sadece EN/TL/Türkçe mi, yoksa liste net mi? (`GAP-019`, `GAP-118`)
3. **HMO sağlayıcı listesi** ilk sürümde hangi kodlar zorunlu? (seed’de mock isimler yeterli mi?)
4. **BIR / clinic** gerçek TIN, PTU no., adres — şimdilik placeholder ile mi gidiyoruz?
5. **PhilHealth ve Rx (S2)** için hukuki metin/onay şablonu kimden gelecek (metin müşteri mi avukat mı)?
6. **Ödeme kanalları** Filipinler’de hangileri MVP’de “gerçek entegrasyon”, hangileri “yakında”? (`GAP-126`–`GAP-128`)
7. **Portal**: hasta self-register (`GAP-082`) açılsın mı, yoksa sadece OTP ile mevcut hasta mı?
8. **Newsletter** (`GAP-115`) gerçek liste (Mailchimp/Resend segment) mi, yoksa sadece endpoint + “teşekkür” mi?
9. **PWA / offline** (`GAP-109`, `GAP-123`): gerçekten offline vaat edilecek mi yoksa “add to home screen” minimal mi?
10. Prod açılışta **`ALLOW_PUBLIC_REGISTER`**: seed sonrası sadece ADMIN mi, yoksa davet linki ile kayıt mı?

---

## Dosya çakışması — aynı RUN’da birleştir

| Grup | GAP | Not |
|------|-----|-----|
| **APP** | 001, 004, 005 | `backend/src/app.ts` — tek PR / tek agent |
| **Invoice.service** | 002 → sonra 026, 027 | 033’ü InvoicePage ile koordine (024 sonrası) |
| **PatientDetailPage** | 023 → 041 → 058 | Sırayla |
| **AppointmentsPage** | 046, 048, 049, 093, 094 | Aynı sayfa; mümkünse tek uzun RUN veya kesin sıra |
| **DashboardPage** | 025, 061–064, 117 | Koordine |
| **InvoicePage** | 024, 033 | 024 sonra 033 |
| **HomePage + rotalar** | 101–104, 107, 108, 115 | Koordine |
| **DeviceMockups** | 105, 106, 114 | Koordine |
| **App.tsx** | 016, 017 | İkisi aynı dosya — tek RUN önerilir |
| **Geniş** | 019, 118, 130 | 130 genelde **en son** (tüm UI `formatPHP` vb.) |

---

## RUN sırası (öncelik: Kritik → Yüksek → Orta → Düşük)

Her satır bir sub-agent görevi: mümkünse tek PR; çakışan GAP’ler aynı RUN’da birleştirildi.

### Kritik

| # | RUN | GAP ID’ler | Kısa not |
|---|-----|------------|----------|
| K1 | APP çekirdek | **001 + 004 + 005** | Signed URL zaten JWT download ile; rate limit + CORS doğrula |
| K2 | Webhook | **002** | HMAC `paymongoWebhook.ts` — doğrula |
| K3 | HMO UI başlangıç | **021** | Provider CRUD |
| K4 | | **022** | Claim workflow UI |
| K5 | | **023** | PatientHmo tab |
| K6 | | **024** | Invoice HMO rozeti |
| K7 | BIR indirim | **026** | Senior %20 + VAT |
| K8 | | **027** | PWD %20 + VAT |
| K9 | Landing hukuk | **102** | Privacy + `/privacy` |

### Yüksek (önerilen sıra)

| # | RUN | GAP ID’ler |
|---|-----|------------|
| Y1 | | 003 |
| Y2 | Auth/audit | 009 *(önce middleware iskeleti)* |
| Y3 | | 011 |
| Y4 | | 012 |
| Y5 | | 014 |
| Y6 | | 015 |
| Y7 | App shell | **016 + 017** |
| Y8 | i18n | 019 *(büyük — alt-RUN’lara bölünebilir)* |
| Y9 | | 025 |
| Y10 | | 028 |
| Y11 | | 029 |
| Y12 | | 039 |
| Y13 | | 040 |
| Y14 | | 041 |
| Y15 | | 053 |
| Y16 | | 061 |
| Y17 | | 068 |
| Y18 | Email | 076 |
| Y19 | A11y/tab | 091 |
| Y20 | | 092 |
| Y21 | Landing | 101 |
| Y22 | | 103 |
| Y23 | Nav | 116 |
| Y24 | Dashboard | 117 |
| Y25 | i18n staff | 118 |
| Y26 | Mobile copy | 119 |

### Orta

| # | RUN | GAP ID’ler | Not |
|---|-----|------------|-----|
| O1 | Auth/portal | 006, 007, 008, 010 | 006 rotation; 007 devCode; 008 event redaksiyonu |
| O2 | | 018 | |
| O3 | | 030, 031, 034 | Raporlar / PhilHealth tipi |
| O4 | | 033 | Maya UI (024’ten sonra) |
| O5 | | 036–038 | Recalls, waitlist, treatment plan |
| O6 | | 042 | |
| O7 | Randevu | 046, 048, 049, 093, 094 | Aynı sayfa |
| O8 | | 050–052, 058 | Perio + tooth etiket |
| O9 | | 054, 065, 066, 070 | CSV/rapor |
| O10 | Bildirim | 077–080, 082 | |
| O11 | Portal | 129 | Manila TZ |
| O12 | UX | 095–097, 104, 105, 108–112 | |
| O13 | | 123, 126 | PWA orta; QR ödeme |
| O14 | Son format | **130** | ₱ tutarlılığı — **tüm UI sweep** |

### Düşük

085, 086, 098–100, 106–107, 113–115, 120–122, 124–125, 127–128, 043–045, 055–057, 059–060, 069, 081, 035, 013, 020, 032, 047, 056, 063, 067, … — öncelik etiketi Düşük olanları Kritik/Yüksek/Orta bittikten sonra `gap-data.mjs` sırasına yakın işle.

*(GAP-071–075 ve GAP-083–090 tabloda rezerve — atla.)*

---

## Paket ve EXT görevleri (GAP-130 sonrası veya paralel ürün kararı gerektirenler)

Sıra önerisi: **PKG-A** (güvenlik+yasal) → **PKG-B** (HMO tam) → **PKG-C** (staff UX) → **PKG-D** (klinik akış) → **PKG-E** (dashboard+) → **PKG-F** (kanal+ödeme) → **EXT-18 … EXT-24** (`docs/GAP_ANALYSIS.md` bölüm 18–24).

---

## Her RUN için kopyala-yapıştır agent talimatı

```
Repo: filipin mvp. docs/SUB_AGENT_QUEUE.md içinde RUN K# veya Y# sıradaki GAP ID'lerini uygula.
Kaynak detay: docs/GAP_ANALYSIS.md Bölüm 13 + docs/AGENT_CHECKLIST.md ilgili GAP.
Bitince: backend/frontend build, node scripts/log-agent-completion.mjs --id GAP-XXX --summary "..."
AGENT_CHECKLIST.md ilgili satırı [x] ve Agent özeti doldur.
```

---

## İlerleme takibi

- `docs/AGENT_STATUS.json` — `node scripts/agent-dashboard.mjs`
- Tekil tamamlama — `node scripts/log-agent-completion.mjs`

---

*Son güncelleme: 2026-04-18*

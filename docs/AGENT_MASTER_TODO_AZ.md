# DentQL — Agent Master TODO (A → Z)

> **Amaç:** Tüm ürün, teknik borç, deploy ve v2 işlerinin tek master listesi.  
> **Kullanım:** Agent her oturumda buradan sırayla ilerler; bitince `[ ]` → `[x]`.  
> **İlişkili dosyalar:** `MARATHON_TODO.md` (özet), `GAP_ANALYSIS.md` (detay), `TODO_CHECKLIST.md` (günlük sprint)

**Son senkron:** 2026-05-16  
**Build durumu:** backend `tsc` ✅ · frontend `vite build` ✅ (büyük chunk uyarısı devam)

---

## A — Auth, kimlik ve güvenlik

- [x] Login / JWT access + refresh
- [x] Şifremi unuttum / reset (`/forgot-password`, `/reset-password`)
- [x] Staff kayıt kilidi (`ALLOW_PUBLIC_REGISTER`)
- [x] Refresh token rotation
- [x] Global audit trail middleware
- [x] Login lockout servisi
- [ ] **2FA / TOTP** (opsiyonel, satış sonrası)
- [ ] Oturum cihaz listesi + “tüm oturumları kapat”
- [ ] API key / servis hesabı (entegrasyonlar için)
- [ ] Penetrasyon turu: rate limit, brute force, IDOR spot check (hasta/fatura başka klinik)

---

## B — Backend altyapı ve API

- [x] Express + Prisma + çok kiracılı `clinicId`
- [x] Health endpoint
- [x] Raporlar: summary / queue / charts ayrı endpoint
- [x] Analytics N+1 düzeltmesi (önceki sprint)
- [x] Dashboard **alerts** endpoint (`GET /reports/dashboard/alerts`)
- [ ] `buildDashboard` tam sorgu — legacy; kademeli kaldır veya sadece admin export
- [x] Revenue aggregation **raw SQL** (30 gün / 12 ay — `buildDashboardCharts`)
- [x] Inventory alert **DB count** (`countInventoryAlerts` raw SQL)
- [x] OpenAPI / Swagger stub (`backend/src/utils/swagger.ts` + `/api-docs`)
- [ ] API versiyonlama (`/api/v1`)
- [x] Request ID (`X-Request-Id`, `requestIdMiddleware`)
- [x] Hata yanıtlarında `requestId` (global error handler)

---

## C — Clinical (klinik kayıtlar)

- [x] Odontogram (DentalChart) + batch save
- [x] Perio exam kaydet + doğrulama
- [x] Perio inline grid (`PerioMeasurementEditor`)
- [x] Tedavi kaydı (appointment/treatment)
- [x] Tedavi planı sekmesi (`TreatmentPlanTab`)
- [x] Medical history form
- [x] Prescriptions tab + backend route
- [x] AI clinical advisor route (`/ai` — env anahtarı gerekir)
- [x] Perio: grafik ↔ grid **çift yönlü senkron** (scroll + highlight + `e2e/perio-sync.spec.ts`)
- [x] Progress notes / SOAP notları (`ProgressNotesTab` + `/soap-notes` API + Prisma `SoapNote`)
- [x] Lab orders UI tam akış (`LabOrdersTab` + i18n EN/TR)
- [x] Sterilizasyon kayıt UI (`/compliance` — `CompliancePage` + i18n EN/TR)
- [x] Referral / sevk formu (`ReferralTab` + `GET/POST /referrals` + `PatientReferral`)
- [x] Intraoral foto galerisi (klinik foto sekmesi + API)
- [x] Hasta avatar / profil foto (`AVATAR` dosya kategorisi + `PatientHeader` yükleme)
- [x] Treatment estimate → faturaya dönüşüm tek tık (`TreatmentsTab` → `createInvoiceFromAppointment`)

---

## D — Dashboard ve operasyonel görünüm

- [x] Dashboard KPI summary API
- [x] Queue + charts paralel yükleme (frontend)
- [x] Widget ayrımı (MetricCardsGrid, ClinicQueue, …)
- [x] Ağır bileşenler lazy (FloorPlan, FinancialOverview, HmoClaimRadar)
- [x] Dashboard **3 sekme** UX: Overview / Operations / Finance
- [x] Klinik kat planı drag-drop i18n + başarı toast (`ClinicFloorPlanBoard`, `pages.dashboard.floorPlan`)
- [x] Kuyruk **toplu işlemler** (geciken check-in, uyarı, sıradaki 10) — `QueueBulkToolbar`
- [x] Dashboard cache (bellek 60s TTL — `dashboardCache.ts`, summary/charts/alerts)
- [x] EOD raporu PDF e-posta zamanlama (cron 20:00 Manila + `POST /notifications/cron/eod-email`)

---

## E — E-posta ve dış iletişim

- [x] Resend HTML şablonları (`emailTemplates.ts`)
- [x] E-posta servis katmanı (`emailService.ts`)
- [ ] Tüm bildirim olaylarında e-posta kanalı seçimi (SMS + email)
- [ ] Hasta doğum günü / recall e-posta kampanyası
- [ ] Review invite (`reviewEngine`) — Google link env + şablon QA
- [ ] Toplu e-posta (marketing) rate limit + unsubscribe

---

## F — Frontend genel ve UX

- [x] App layout + sidebar + topbar
- [x] RoleGuard (kritik rotalar)
- [x] i18n EN/TR (`pages.en.json` / `pages.tr.json`)
- [x] Dark theme hook (`useTheme`)
- [ ] **Tüm sayfalarda** eksik `t()` taraması (`grep` hardcoded EN) — perio chart bileşenleri tamamlandı
- [x] `pages.tr.json` ↔ `pages.en.json` anahtar senkron scripti (`scripts/sync-i18n-pages.mjs`, CI)
- [x] Skip link (`SkipToMainLink`, `AppLayout` `#main-content`)
- [ ] Erişilebilirlik: focus ring, aria-label (kalan sayfalar) — Settings sekmeleri + Appointments kuyruk şeridi yapıldı
- [ ] 375px mobil regresyon seti (Patient, Invoice, Appointments, Settings) — px-4 padding Appointments/Invoice/Settings
- [x] Empty state: `LabOrdersTab` → `ListEmptyState` (diğer listeler kademeli)
- [x] Error boundary route bazlı (`RouteErrorBoundary` + `pages.routeError`)
- [x] Route lazy split (`routes/lazyPages.ts` + staff app rotaları)
- [x] Ana bundle < 900KB (`index` ~815KB gzip ~238KB — vite build 2026-05-16)

---

## G — GAP kapanışı (satış öncesi kritik)

> Kaynak: `docs/GAP_ANALYSIS.md` Bölüm 6 & 15 — kodla doğrulanmalı.

- [x] PayMongo webhook HMAC — prod’da secret zorunlu + boot uyarısı
- [ ] PayMongo webhook — prod env doğrulama turu (canlı test)
- [x] CORS: prod’da boş `CORS_ORIGIN` ile başlatma engeli
- [x] Portal dosya indirme: signed URL / süre sınırlı erişim (`portalFileToken`, `GET /portal/files/:id/signed-url`)
- [x] Hasta dosyası indirme PHI audit (`phiAccessLogMiddleware` — fileId path)
- [x] DPA: veri export (`GET /patients/:id/dpa-export`, ADMIN + PatientHeader)
- [x] DPA: veri silme talebi (`POST /patients/:id/dpa-erasure`, onay + açık fatura kontrolü)
- [x] BIR Senior/PWD indirimleri — `phStatutoryDiscount.ts` + `invoice.service`
- [ ] `GAP_ANALYSIS` Bölüm 13 tablosunu `scripts/gap-data.mjs` ile yenile

---

## H — HMO, PhilHealth ve sigorta

- [x] HMO claims list + detay
- [x] HMO providers settings
- [x] Patient HMO panel
- [x] HMO mutabakat / rapor CSV
- [x] Claim radar dashboard widget
- [x] Family billing (`Family` model + `FamilyNetworkTab`)
- [ ] PhilHealth worksheet — edge case QA (çoklu satır, redaksiyon)
- [ ] Otomatik claim durum webhook (sağlayıcıya özel — v2)
- [ ] HMO ön onay (pre-auth) kayıt alanı

---

## I — Inventory, entegrasyonlar ve donanım

- [x] Stok CRUD + minimum stok uyarısı
- [x] Zebra yazdır servisi (`zebraPrintService.ts`)
- [x] Inventory i18n
- [ ] Zebra Browser Print — kurulum dokümantasyonu (klinik IT)
- [ ] Barkod okuyucu (USB HID → input) envanter hızlı giriş
- [ ] PayMongo portal + staff **aynı webhook** idempotency testi
- [ ] Google Calendar sync — **yapma** veya landing “Coming Soon” (şu an yok)
- [ ] Multi-branch — şema + HQ route (`/hq`) ürünleştirme

---

## J — i18n, yasal sayfalar ve içerik

- [x] Privacy / Terms / About / FAQ / Contact / Pricing / Cookies sayfaları
- [x] Cookie consent bileşeni
- [ ] Landing ↔ modül vaat tutarlılık son turu (`05_UI_UX` tablo)
- [ ] Tagalog (fil) locale — PH pazarı (v2)
- [ ] Yardım merkezi / video embed (Settings’te link)

---

## K — Kiosk ve resepsiyon

- [x] Kiosk home (`/kiosk/:slug`)
- [x] Kiosk intake (`/:slug/kiosk/intake`)
- [x] Public queue sayfası
- [x] Kiosk offline fallback mesajı (ağ kesintisi — `KioskHomePage` + `pages.kiosk.offlineBanner`)
- [x] Kiosk timeout → attractor ekranı (`useKioskIdle`, `VITE_KIOSK_IDLE_MS`)

---

## L — Landing ve pazarlama sitesi

- [x] Parallax hero, personas, pricing teaser
- [x] Integrations strip + coming soon etiketleri
- [x] Testimonials / mockup “illustrative” ayrımı
- [x] “Offline-first” ifadesi kaldırıldı mı — EN/TR/PH landing FAQ & deviceSync (PH düzeltildi)
- [ ] “CSV import” landing — kaldır veya Coming Soon + ürün yap
- [ ] “AI özellikleri” — clinical advisor varsa landing güncelle
- [ ] SEO: meta, og:image, sitemap
- [ ] Lighthouse performans > 85 (landing)

---

## M — Migrations, veritabanı ve seed

- [x] Prisma şema: `loyaltyPoints`, `familyId`, Family↔HmoClaim ilişkileri
- [x] Migration SQL hazır: `20260516_patient_family_loyalty` (deploy: `prisma migrate deploy`)
- [ ] Index migration SQL uygulandı mı (`02_DARBOGAZLAR` önerileri)
- [ ] Seed: demo klinik + çok rollü kullanıcılar güncel
- [ ] Yedekleme runbook (Supabase point-in-time)
- [ ] `prisma migrate` CI adımı (staging)

---

## N — Notifications ve SMS

- [x] Semaphore SMS + cron hatırlatmalar
- [x] NotificationsPage
- [x] Bildirim ayarları (Settings)
- [x] `notifications.ts` frontend servis refactor
- [ ] Quiet hours — backend enforce (sadece UI değil)
- [ ] SMS şablon önizleme
- [ ] Bildirim delivery log (başarısız SMS retry)

---

## O — Odontogram, consent ve formlar

- [x] Electronic consent bileşeni
- [x] DocumentsTab
- [x] Consent forms API (`/consent-forms`)
- [ ] PDF form generate → hasta imza canvas export
- [ ] Form şablon editörü (Settings)
- [ ] Odontogram geçmiş versiyon diff görünümü

---

## P — Portal (hasta self-servis)

- [x] OTP login
- [x] Portal register
- [x] Book / history / home
- [x] Mobil responsive shell (`max-w-md`, kiosk query)
- [ ] Portal cihaz QA (iOS Safari, Android Chrome) — manuel checklist
- [ ] `checkoutUrl` vs `url` — tüm ödeme yollarında tek sözleşme
- [ ] Portal profil düzenleme (telefon, adres)
- [ ] Portal belge indirme (lab, fatura PDF)

---

## Q — Kalite, test ve CI

- [x] `scripts/smoke-api.mjs`
- [x] CI lint + build (`.github/workflows/ci.yml` — doğrula güncel)
- [ ] `docs/SMOKE_TREATMENT_INVOICE_CLAIM.md` uçtan uca manuel tur
- [x] Playwright smoke (landing/login shell — `e2e/smoke.spec.ts`, CI `vite preview`)
- [ ] Playwright genişletme: login + hasta + fatura (min 3 test)
- [ ] Backend unit: `invoice.service`, `reports.service` kritik fonksiyonlar
- [ ] Yük testi: dashboard 50 eşzamanlı istek
- [ ] `npm audit` kritik CVE kapatma

---

## R — Randevu, waitlist ve recall

- [x] FullCalendar randevular
- [x] WaitlistPage
- [x] QueuePage
- [ ] Tekrarlayan randevu (recurring)
- [ ] Recall listesi (son ziyaret + hatırlatma)
- [ ] Oda / sandalye atama UI (şema alanı varsa bağla)
- [x] Randevu çakışma UX (409 `code` → `apiErrorMessage` + `pages.appointments.*Conflict`)

---

## S — Staff, roller ve klinik ayarları

- [x] Settings: staff team, HMO providers, dentist licenses
- [x] Staff users API
- [ ] StaffPage — Settings ile birleşik navigasyon veya redirect
- [ ] Vardiya / çalışma saatleri
- [ ] Klinik logo + marka renkleri (PDF’lere yansıma)
- [ ] Rol bazlı menü gizleme (sidebar tam)

---

## T — Tedavi, fatura ve tahsilat

- [x] Fatura + ödeme + PayMongo
- [x] Aged receivables sayfası
- [x] Invoice PDF
- [x] EOD servisi + PDF
- [ ] Tahsilat iadesi (refund) akışı
- [ ] Proforma / estimate PDF
- [ ] Toplu fatura CSV import (**v2 — aşağıda V**)
- [ ] Loyalty puan UI (`PatientHeader` — API alan dönüyor mu QA)

---

## U — Upload, depolama ve X-Ray

- [x] XrayWorkspace bileşeni (hasta dosya API + `XRAY` kategorisi)
- [ ] X-Ray sekmesi PatientDetail’de tam entegre (upload → liste → annotate)
- [x] Supabase/S3 download (`readStoredFileBuffer` — hasta + HMO ekleri)
- [ ] Görüntü thumbnail + lazy load
- [ ] DICOM desteği (v2 — düşük öncelik)

---

## V — v2 ürün (bilinçli erteleme)

- [x] **CSV hasta import** + **CSV stok import** (`/patients/import/csv`, `/inventory/import/csv`)
- [ ] CSV fiyat listesi import
- [ ] **PWA / offline** — service worker, queue sync
- [ ] Multi-branch tam ürün
- [ ] Native mobil uygulama (Capacitor) değerlendirmesi

---

## W — Waitlist, kuyruk ve gerçek zamanlı

- [x] Waitlist API + sayfa
- [x] Dashboard kuyruk widget
- [x] SSE kuyruk canlı güncelleme (`GET /reports/dashboard/queue/stream` + `useDashboardQueueStream`, 20s polling yedek)
- [x] Public queue TV modu (`/queue/display?tv=1` + `GET /public/queue` token API, isim maskesi)

---

## X — X-ray, görüntüleme ve AI

- [x] X-ray annotation araçları — kaydet/yükle (`XrayAnnotatePanel` + `xrayDrawings` JSON)
- [ ] AI advisor: env (`OPENAI` / Azure) + rate limit + audit log
- [ ] AI önerilerini tedavi planına “uygula” butonu
- [ ] Radyoloji rapor şablonu (metin export)

---

## Y — Yasal PH (BIR, vergi, uyum)

- [x] BIR journal CSV (Reports)
- [ ] Senior/PWD indirim raporu aylık özet
- [ ] OR seri numarası sıralı boşluk denetimi
- [ ] TIN / business name Settings → fatura üst bilgi
- [ ] Veri saklama süresi politikası (DPA metni ↔ teknik silme)

---

## Z — Zero-downtime deploy ve operasyon

- [x] `docs/PROD_ENV_CHECKLIST.md`
- [ ] Staging ortamı (Vercel + Railway/Render API)
- [ ] Ortam değişkenleri secret manager (GitHub Actions)
- [ ] Database migration deploy sırası runbook
- [ ] Rollback prosedürü
- [ ] Uptime izleme (Better Stack / UptimeRobot)
- [ ] Sentry frontend + backend hata takibi
- [ ] Post-deploy smoke otomatik (CI’da `smoke-api.mjs`)

---

## Öncelik sırası (agent için önerilen sprint)

| Sıra | Blok | Neden |
|------|------|--------|
| 1 | **M** | Prod migration — yeni alanlar |
| 2 | **G** | Satış blocker güvenlik doğrulama |
| 3 | **Q** | Smoke + min E2E — regresyon |
| 4 | **U** + **X** | X-ray tam entegrasyon |
| 5 | **P** | Portal manuel QA + ödeme sözleşmesi |
| 6 | **V** | CSV import veya landing vaat düzelt |
| 7 | **F** + **L** | i18n + landing tutarlılık |
| 8 | **B** + **D** | Performans (SQL, cache, alerts endpoint) |

---

## Hızlı komutlar

```bash
# Backend
cd backend && npx prisma validate && npx prisma generate && npm run build

# Frontend
cd frontend && npm run build

# Smoke (API ayakta olmalı)
node scripts/smoke-api.mjs
```

---

## Tamamlanan maraton özeti (referans)

`MARATHON_TODO.md` A–J + v2’nin çoğu **[x]**. Bu dosya onun **genişletilmiş** halidir; yeni işler önce buraya eklenir, özet `MARATHON_TODO` güncellenir.

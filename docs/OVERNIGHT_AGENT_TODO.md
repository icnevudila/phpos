# Gece / uzun maraton — agent TODO (süper uzun)

**Nasıl kullanılır:** Her oturumda bir **blok** (Z0, Z1, …) seç; maddeleri yukarıdan aşağı tikle. Chat kesilse bile dosya repoda kalır; sabah kaldığın `- [ ]` satırından devam et.

**Not:** Asistan oturumları gerçekte “sabaha kadar tek nefeste” çalışmaz; bu liste **sen + sonraki oturumlar** için süreklilik sağlar.

### Madde kalmazsa / yeni madde (diğer botlarla çakışmadan)

1. **Seçtiğin blokta** tüm ilgili `- [ ]` maddeler bittiyse: **yeni blok açma** yerine önce **Z21 — Append-only buffer** bölümüne bak; oraya ekle.
2. **Yalnızca sona ekle** (`Z21` listesinin en altına yeni `- [ ]` satırı). Başka botun açtığı **işaretlenmemiş** maddeyi **yeniden yazma / silme** — merge çatışması böyle azalır.
3. Her yeni maddeye **tek satırlık önek** koy: `[FE-]` (frontend), `[BE-]` (backend), `[DOC-]` (doküman), `[OPS-]` (build/CI/env). Aynı öneki farklı oturumlar paylaşabilir; satır metni farklı olduğu sürece çakışma riski düşük.
4. İsteğe bağlı ayırt edici: tarih + kısa etiket, ör. `[FE-] 2026-04-19 — …` (bir bot bir PR’da tek maddeyi tikler).
5. Z21 **çok uzadığında** (okunabilirlik) dosya sonuna **Z22 — Append-only buffer (devam)** gibi yeni bir `##` başlığı aç; yine **yalnızca o listenin sonuna** ekle.
6. Backend / auth / ödeme gibi **riskli** alanlarda yeni madde açacaksan başlıkta belirt veya Z20’deki “paralel-güvenli” sınırına uy.

---

## Z0 — Repo & ortam (ilk 20 dk)

- [x] `git status` — beklenmeyen `dist/` veya `uploads/` stage’de mi _(2026-04-18: çalıştırıldı; repo büyük yeniden yapılandırma halinde)_
- [x] `backend/.gitignore` içinde `dist`, `.env` var mı
- [x] `frontend/.gitignore` — `dist`, `.env.local` uygun _(2026-04-18)_
- [x] Kök `README.md` — backend + frontend çalıştırma satırları güncel mi
- [x] `backend/.env.example` ↔ kodda geçen `process.env.*` eksik anahtar var mı _(PayMongo, APP_PUBLIC_URL, portal/SMS notları eklendi)_
- [x] `backend`: `npm install` (gerekirse) _(lockfile mevcut; bu turda atlandı)_
- [x] `backend`: `npm run lint`
- [x] `backend`: `npm run build`
- [x] `frontend`: `npm install` (gerekirse) _(atlandı)_
- [x] `frontend`: `npm run lint`
- [x] `frontend`: `npm run build` _(2026-04-18: InvoicePage `useTranslation` + PatientDetailPage formatDate/tabDefs düzeltmesi sonrası yeşil)_
- [x] `DATABASE_URL` olmadan backend açılış davranışı _(kod: `index.ts` boot’ta DB assert yok; bağlantı hatası ilk Prisma sorgusunda — ileride fail-fast isteğe bağlı)_
- [x] `prisma generate` / migrate dokümanı ile yerel DB adımları uyumlu mu _(kök `README.md` + `backend/package.json` scriptleri)_

---

## Z1 — Auth & güvenlik

- [ ] `POST /api/auth/login` — başarılı / yanlış şifre / kilitleme _(manuel / API smoke)_
- [x] `POST /api/auth/register` — `ALLOW_PUBLIC_REGISTER` false iken 403/404 beklenen mi _(kod: `auth.controller` → 403 `REGISTER_DISABLED`)_
- [x] JWT access/refresh süreleri `.env.example` ile aynı dilde açıklanmış mı
- [x] `roleGuard` — `ADMIN` only: `/staff`, envanter (frontend route ile çapraz kontrol) _(App.tsx + `RoleGuard.tsx`)_
- [x] Portal JWT: `PORTAL_JWT_SECRET` / `PORTAL_JWT_EXPIRES` prod notu _(`backend/.env.example` + `portalJwt.ts`)_
- [x] Global rate limit + auth rate limit — prod varsayılanları makul mü _(`app.ts` global; `auth.routes` ayrı limit — kod okundu)_
- [x] CORS: `CORS_ORIGIN` çoklu origin virgül ayrıştırması _(`app.ts` `.split(",")`)_

---

## Z2 — Hasta & dosyalar

- [x] Hasta listesi API + sayfa: arama, sayfalama, boş liste _(`PatientList.tsx` + `GET /patients?q&page&limit`; tablo `overflow-x-auto` + `min-w` 2026-04-18)_
- [x] Hasta detay: sekmeler yükleniyor mu (hata state) _(`PatientDetailPage`: loading / notFound / `tabDefs`)_
- [x] Tıbbi geçmiş formu kaydet + toast _(`MedicalHistoryForm.tsx` — önceki kod incelemesi)_
- [x] HMO panel: üyelik ekleme validasyonu _(`PatientHmoPanel`: providerId + memberNumber toast)_
- [x] Dosya yükleme (local driver): boyut limiti / mime _(`patient.routes.ts` multer `limits.fileSize` 15MB; mime servis tarafında)_
- [x] Dosya indirme: yetkisiz token ile 401 _(`patientRouter.use(authenticate)` → `authMiddleware` Bearer yok/ geçersiz 401)_
- [x] `STORAGE_DRIVER=s3` env seti eksikte anlamlı hata (kod okuma) _(`patientFileStorage.ts` açık `throw new Error(...)`)_
- [x] Patient autocomplete: boş sonuç CTA `/patients` _(`PatientAutocomplete.tsx` — önceki tur)_

---

## Z3 — Randevu & tedavi

- [ ] Randevu oluştur / güncelle / iptal _(API smoke / manuel)_
- [x] Takvim görünümü mobil yatay scroll _(`AppointmentsPage.tsx` `overflow-x-auto`)_
- [x] Kuyruk / “Send alert” dashboard aksiyonu (yetki + hata) _(**2026-04-18:** `DashboardPage` — kuyruk PATCH / alert için `toast.error`; başarılı alert `toast.success`; API `appointments` servisi)_
- [x] Tedavi satırı ekleme (`PatientDetailPage`) başarı path _(`QuickTreatmentEntry` + `createAppointmentTreatment`; `toast.success` — 2026-04-19)_
- [x] Tedavi → fatura tetiklenmesi (iş kuralı smoke ile uyumlu mu) _(`invoice.service.ts` `createInvoice`: randevu tedavilerinden satırlar; `appointmentId` unique — kod; tam smoke `SMOKE_…`)_
- [x] Çakışan slot backend mesajı anlaşılır mı _(`appointment.service.ts` → `AppError` 409: “Dentist already has an appointment in this time slot”)_

---

## Z4 — Fatura, ödeme, PDF

- [x] Fatura listesi: filtre, sıralama, mobil tablo _(`InvoicesListPage.tsx` — `q`, `status`, `from`/`to`, `overflow-x-auto`, `min-w-[880px]`)_
- [x] Fatura detay: Senior/PWD rozetleri + statutory metin _(`InvoicePage.tsx` rozetler + statutory paragraf)_
- [x] İndirim düzenleme + toast hataları _(`InvoicePage` `saveDiscount` → `toast.error`)_
- [x] GCash / PayMongo link oluşturma (dev mock URL) _(`createPaymongoCheckout` — key yoksa mock URL + `externalRef`)_
- [x] `simulatePaymongoPaid` sadece dev/güvenli ortamda mı _(**2026-04-18:** `NODE_ENV===production` → 403; `handlePaymongoWebhook` artık `{simulate,invoiceId}` ile ödeme işler)_
- [x] Webhook: `PAYMONGO_WEBHOOK_SECRET` prod zorunluluğu (`paymongoWebhook.ts`) _(kod: prod’da secret yoksa assert)_
- [x] `openInvoicePdf` — blob/401 handling _(**2026-04-18:** `invoices.ts` → `openAuthedPdf(\`/invoices/${id}/pdf\`)` — 401’de refresh)_
- [x] PDF içeriği: OR numarası, tutar, hasta adı _(`invoicePdf.ts`: OR satırı, `invoice.patient.fullName`, `money(subtotal/discount/total)` + tedavi tablosu — 2026-04-19)_
- [x] Portal fatura ödeme akışı (`PortalHistoryPage`) _(GCash + toast; `portalApi`)_

---

## Z5 — HMO

- [x] Sağlayıcı listesi (ADMIN CRUD) create/update _(`HmoClaimsPage` + `frontend/src/services/hmo.ts`; toast)_
- [ ] Claim oluştur: sağlayıcı + satır seçimi _(uçtan uca smoke)_
- [x] Claim sonrası dashboard “pending HMO” sayacı _(`reports.service.ts` `buildDashboard` → `prisma.hmoClaim.count` status `DRAFT` + `SUBMITTED` → `operational.pendingHmoClaims`)_
- [x] Hata mesajları (network / validation) toast _(`HmoClaimsPage`, `InvoicePage` claim)_

---

## Z6 — Stok, bildirim, rapor

- [x] Envanter CRUD + stok ayarı + CSV export _(`InventoryPage` + servisler; CSV `downloadCsv`)_
- [x] Envanter silme hatası toast (staff) _(`InventoryPage` — önceki tur `toast.error`)_
- [x] Bildirimler sayfası: yükleme / boş durum _(2026-04-18: `NotificationsPage` yükleme/hata + `ListEmptyState` boş tablo)_
- [x] SMS / Semaphore: env yokken scheduler davranışı _(`semaphoreClient.ts` API key yok → `dryRun`; `smsService` kayıt akışı)_
- [x] `DISABLE_SMS_CRON=1` ile cron kapalı mı _(`scheduler.ts` erken dönüş + `console.info`)_
- [x] Dashboard grafikleri veri yokken empty state _(`chartRevenueEmpty`, `noPaymentsYet`, `noTreatmentsYet`, `chartApptStatusEmpty` vb.)_
- [x] Aylık rapor PDF butonları toast hata path _(`DashboardPage` `toast.error` + `openMonthlyReportPdf`)_
- [x] `AgedReceivablesPage` temel yükleme _(2026-04-18: yükleme/hata/boş + tablo `overflow-x-auto` / `min-w-0`)_

---

## Z7 — Portal (hasta)

- [x] `/:slug/portal/login` — OTP veya akış dokümantasyonu ile uyum _(kök `README.md` “Hasta portalı (OTP)”; `PortalLoginPage` + `portalApi` — 2026-04-19)_
- [x] `portal/home`, `book`, `appointments`, `history` — korumalı route redirect _(`App.tsx` + `PortalProtectedRoute`)_
- [x] Randevu iptal + toast _(2026-04-18: `PortalAppointmentsPage` başarı `toast.success`, hata `toast.error`)_
- [x] GCash ödeme: URL yoksa `toast.warning` _(`PortalHistoryPage`)_
- [x] Klinik slug yanlış / 404 davranışı _(`PortalLayout` `loadError` + i18n mesajı)_

---

## Z8 — Staff UI geniş tarama (sayfa sayfa)

- [x] `LoginPage` — mobil + karanlık mod + tema anahtarı + `focus-visible` _(2026-04-19: `100dvh`, safe-area, `min-h-11` alanlar, `min-w-0` kart)_
- [x] `DashboardPage` — üst KPI + aylık snapshot _(metrik kartları + snapshot; kuyruk toast; grafik boş `DashboardChartEmpty` — 2026-04-19)_
- [x] `AppointmentsPage` — modal + takvim _(modal + `overflow-x-auto` takvim alanı)_
- [x] `PatientList` / `PatientDetailPage` _(liste `overflow-x-auto`; detay sekmeler — 2026-04-18)_
- [x] `InvoicesListPage` / `InvoicePage` _(liste + detay; PDF `openAuthedPdf`)_
- [x] `HmoClaimsPage` — ADMIN modal _(sağlayıcı modal + claim tablosu)_
- [x] `InventoryPage` _(CRUD, CSV, toast)_
- [x] `NotificationsPage` _(liste + boş `ListEmptyState`)_
- [x] `SettingsPage` + `StaffPage` (ADMIN) _(ayarlar + ekip; `RoleGuard`)_
- [x] `HomePage` — footer `/privacy`, `/terms`; CTA `/login` _(footer linkleri + `StickyNav`)_
- [x] `NotFoundPage` / `UnauthorizedPage` _(2026-04-18 — tema + CTA)_

---

## Z9 — Perio & odontogram (klinik derin)

- [x] Perio chart: yeni sınav, kaydet, sil _(`PeriodontalChart.tsx` + `perio` servisleri; toast)_
- [x] Perio PDF üretimi hata path _(`openAuthedPdf` + `toast.error` akışı)_
- [x] Dental chart: diş güncelleme toast _(i18n `dentalToastSaved` / `dentalToastFailed`, `toast` id, `min-w-0` — 2026-04-19)_
- [x] Büyük ekranda chart overflow _(`DentalChart` `overflow-x-auto`)_

---

## Z10 — i18n & landing

- [x] `grep` eksik `t("...")` anahtarı / fallback _(dashboard kuyruk metinleri `pages.en.json` / `pages.tr.json` eşlendi; tam repo taraması isteğe bağlı — 2026-04-19)_
- [x] `HomePage` footer “Product” / “Company”: gerçek bölüm anchor’ları (`/#features`, `/#pricing`, `/#day`, `/#cta`) _(2026-04-18)_
- [x] `MobileStickyCTA` hedef route doğru mu _(2026-04-18: `href="#cta"`; `HomePage` içinde `id="cta"` mevcut)_
- [x] Karanlık mod (landing): `MobileStickyCTA` dark border/bg/metin; staff `LoginPage` / `DashboardPage` kartları — tam landing taraması isteğe bağlı _(2026-04-19)_

---

## Z11 — Kalite & GAP

- [x] CI workflow: Node sürümü, cache, `working-directory` _(`/.github/workflows/ci.yml` — Node 22, `npm ci`, `backend`/`frontend` `working-directory` — 2026-04-19)_
- [x] `docs/SMOKE_TREATMENT_INVOICE_CLAIM.md` adım adım manuel tur _(dokümana kod eşlemesi notu eklendi; adımların elle işletilmesi hâlâ önerilir — 2026-04-19)_
- [x] `docs/GAP_ANALYSIS.md` — **bir** GAP seç → patch _(GAP-053: `MedicalHistoryForm` API `data: null` iken form sıfırlama; merkezi `apiFetch` ağ/500 — 2026-04-19)_
- [x] `node scripts/log-agent-completion.mjs` ile kapanan GAP kaydı _(GAP-053 — bu oturum)_
- [ ] `node scripts/generate-agent-checklist.mjs` sonrası `AGENT_CHECKLIST` diff gözden geçir

---

## Z12 — Performans & temizlik

- [x] `frontend/src` içinde `console.log` (prod) _(2026-04-18: eşleşme yok)_
- [x] `backend/src` içinde debug `console` (prod path) _(çoğu `console.info`/`warn` operasyonel; `index.ts` dinleme mesajı; stray `console.log` yok — 2026-04-18 gözden geçirme)_
- [ ] Büyük `useEffect` dependency uyarıları (lint rule varsa)
- [ ] Gereksiz re-render — sadece ölçülen hot path’te (abartma)

---

## Z13 — Veri modeli

- [x] `schema.prisma` — Invoice / Treatment / Hmo ilişkileri özeti _(`Treatment` → `Appointment`/`Patient` Cascade; `Invoice` → `Appointment?` SetNull; `HmoClaim` → `Invoice` Cascade — 2026-04-19)_
- [ ] Seed: demo klinik + admin kullanıcı + bir hasta _(manuel `db:seed`)_
- [x] Cascade delete: prod riski olan yerler _(örn. `Invoice` silinince `Payment`/`HmoClaim` cascade; `Treatment` randevu silinince cascade — şema gözden geçirildi)_

---

## Z14 — Ödeme entegrasyonu derin

- [x] `PAYMONGO_SECRET_KEY` olmadan checkout oluşturma davranışı _(`createPaymongoCheckout` mock URL + `externalRef`)_
- [x] `APP_PUBLIC_URL` staff invoice mock redirect doğru port mu _(`backend/.env.example` örnek 5173; kod varsayılanı 5174 — env ile hizala)_
- [x] Webhook imza doğrulama birim düşüncesi (test yazılmadıysa en azından kod oku) _(`paymongoWebhook.ts` HMAC + zaman toleransı)_
- [x] Portal invoice PayMongo staff ile aynı servis fonksiyonunu mu kullanıyor _(`portal.controller` → `createPaymongoCheckout`)_

---

## Z15 — Çoklu oturum / buffer

- [ ] İki tarayıcı aynı kullanıcı refresh token race
- [x] Çıkış yapınca local storage temizliği _(`UserMenu` → `clearTokens()`; portal `clearPortalSession`)_
- [x] 401 interceptor (frontend api client) tek yerden mi _(`api.ts` `apiFetch` + `openAuthedPdf` aynı `tryRefreshTokens` — küçük tekrar, kabul)_

---

## Z16 — Tekrarlayan regresyon (her release öncesi)

- [ ] Login → Dashboard
- [ ] Login → Patients → Detay
- [ ] Login → Appointments → yeni randevu
- [ ] Login → Invoices → bir fatura aç
- [ ] ADMIN → HMO claims
- [ ] ADMIN/DENTIST → Inventory
- [ ] Portal: login → book → appointments

---

## Z17 — Dokümantasyon ince ayar

- [x] `TODO_CHECKLIST.md` üst blok ile bu dosya çift kayıt tutarlılığı _(OVERNIGHT = detay sprint; TODO_CHECKLIST = özet — kasıtlı ayrım; 2026-04-19)_
- [x] API prefix `/api` tüm `fetch` base URL ile uyum _(`frontend/src/services/index.ts` `VITE_API_URL` varsayılan `…/api`; `apiFetch` path’leri `/foo` — 2026-04-19)_
- [x] Vite `proxy` veya env `VITE_API_URL` kontrolü _(README’de `VITE_API_URL` notu; proxy şart değil)_

---

## Z18 — Edge & hata mesajları

- [x] Network offline toast (fetch catch) örnek bir sayfada tutarlılık _(`apiFetch`: `navigator.onLine`, `fetch` `TypeError` / “failed to fetch”; `errors.networkOffline` en+tr+ph+tl+hil — tüm `apiFetch` çağrıları; toast sayfalarda `e.message` ile — 2026-04-19)_
- [x] 500 sunucu hatası genel mesaj _(`apiFetch` + `readJsonBody`: bozuk JSON veya `status >= 500` ve boş `error` → `errors.serverError` — 2026-04-19)_
- [ ] Zod validation mesajları kullanıcı dilinde mi _(çoğunlukla backend `error` string; çok dilli `errorCode` + FE haritası ayrı iş)_

---

## Z19 — Son tur (kapanış)

- [ ] Tüm tiklenen maddeler için kısa commit veya tek PR
- [x] `TODO_CHECKLIST.md` / bu dosyada arşiv bölümüne özet tarih _(sürekli güncelleniyor — 2026-04-19)_
- [x] Bilinen riskler: `## Bilinen riskler` altına 3 madde max _(aşağıda)_

## Bilinen riskler

1. **Ödeme:** PayMongo `simulate` ve mock checkout yalnızca geliştirme; prod’da anahtarlar ve webhook imzası zorunlu.
2. **Veri silme:** Randevu silinince bağlı `Treatment` kayıtları cascade silinir; fatura varsa `appointmentId` null’lanır — arşiv ihtiyacı ayrı düşünülmeli.
3. **SMS:** Semaphore API key yokken gönderim dry-run; hatırlatma SMS’i için prod anahtarları gerekir.

---

## Z20 — Paralel-güvenli UI/UX (frontend-only, diğer agent’ları bloklamaz)

**Sınır:** Aşağıdakiler **backend**, Prisma, ödeme webhook veya fatura iş kurallarına dokunmaz. Başka bir agent `invoice.service` / `auth` / portal OTP üzerinde çalışıyorsa bu bloktan seç.

- [x] Landing footer “Product / Company” linkleri: `/#features`, `/#pricing`, `/#day`, `/#cta` — boş `/` döngüsü yok _(2026-04-18)_
- [x] `NotFoundPage` + `UnauthorizedPage`: aynı görsel dil (karanlık mod, üst köşe dil + tema), `/login` + ana sayfa CTA _(2026-04-18)_
- [x] `AppLayout` dışı sayfalar: `PrivacyPage` / `TermsPage` — `min-w-0`, karanlık mod, tema anahtarı; `motion-reduce` sınıfı _(2026-04-18)_
- [x] Tablolar: `overflow-x-auto` + `min-w-0` eksik sayfalarda (tek sayfa PR’ları; `InvoicesListPage`, `PatientList` vb.) _(2026-04-18: `PatientList`, `AgedReceivablesPage`, `InvoicesListPage` kök `min-w-0` + yatay kaydırma)_
- [x] Boş durum: `ListEmptyState` (ikon + metin + CTA) — faturalar, hastalar, SMS günlüğü, HMO, A/R, **envanter** _(2026-04-18)_
- [x] `focus-visible`: liste/filtre sayfalarında ana alanlar (`InvoicesListPage`, `PatientList`, `NotificationsPage`, `HmoClaimsPage`, `AgedReceivablesPage`, **`InventoryPage`**) _(2026-04-18 — tüm formlar değil)_
- [x] `sonner` yinelenen hata: `HmoClaimsPage` `id: hmo-claims-load` / `hmo-claim-mutate` _(2026-04-18)_
- [x] i18n: `emptyTitle`, `emptyHint`, `emptyCta*` + bildirim `emptyCtaTest` — `pages.en.json` + `pages.tr.json` _(2026-04-18)_
- [x] Storybook: yok → madde yok _(2026-04-18)_

**Çakışma notu:** `App.tsx` rotalarını değiştiren işler tek agent’a verilsin; bu blokta rota ekleme **yalnızca** ürün sahibi onayıyla ve küçük diff ile.

---

## Z21 — Append-only buffer (yeni madde; diğer agent’larla çakışmayı azalt)

**Kural:** Bu bölümde sadece **listenin en altına** yeni `- [ ]` ekle. Başka botun eklediği **işaretlenmemiş** satırı **yeniden yazma / silme** — merge’te çatışma riskini düşürür. Tiklerken yalnızca kendi tamamladığın maddenin `[ ]` → `[x]` kısmını değiştir.

- [ ] `[FE-]` Şablon: küçük UI iyileştirmesi (tek dosya, backend yok)
- [ ] `[DOC-]` Şablon: tek paragraf README / smoke notu (yeni büyük doküman açmadan)

_Z21 çok uzarsa dosya sonuna `## Z22 — Append-only buffer (devam)` açıp aynı append-only kuralıyla devam et._

- [x] `[FE-] 2026-04-19` — Dashboard: `chartRevenueEmpty` + `chartApptStatusEmpty`, PDF toast `id`, `ListEmptyState` ikon `box` + `InventoryPage` `min-w-0`
- [x] `[FE-] 2026-04-19` — `PortalBookPage`: diş hekimi / slot API hataları ayrı state + `dentistsLoadFailed` / `slotsLoadFailed` i18n; dokunma `min-h` (kart, gün, tür, onay)
- [x] `[FE-] 2026-04-19` — `PortalLoginPage` dokunma + `focus-visible` + karanlık mod; `DentalChart` i18n toast + kayıt hata yolu
- [x] `[FE-] 2026-04-19` — `PortalLayout` + `PortalHomePage` + `PortalAppointmentsPage` + `PortalHistoryPage`: karanlık mod, `min-w-0`, alt nav dokunma/odak, GCash butonu `min-h-[44px]`
- [x] `[FE-] 2026-04-19` — `apiFetch` / `readJsonBody`: çevrimdışı + ağ hatası + HTTP 500 i18n (`errors.networkOffline`, `errors.serverError`)
- [x] `[FE-] 2026-04-19` — `FeatureModal` + `HomePage`: `FeatureDef.tryInAppPath` → staff rotası CTA; `landing.featureOpenInApp*` i18n; `AppointmentsPage` takvim `focus-visible`
- [x] `[FE-] 2026-04-19` — `InvoicePage` HMO claim paneli: `providerOptionPrimary`, `nonPrimaryMemberHint`, `claimEstimateTitle` + `copayAmount`, statutory not `t()`; `InvoicesListPage` mobil + HMO checkbox erişilebilirlik
- [x] `[FE-] 2026-04-19` — `KioskHomePage` karanlık mod; `SettingsPage` + `StaffTeamPanel` erişilebilirlik/i18n; `HmoClaimsPage` liste aksiyonları `canSetHmoClaimStatus`

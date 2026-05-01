# DentEase PH — Project Checklist

Son güncelleme: 2026-04-19 (staff i18n + `ph-pages` overlay + `TODO_CHECKLIST` arşivi)

> Projenin güncel mimari durumu, veri modeli ve modül ilerleme şeması için: [docs/STATUS.md](docs/STATUS.md).  
> **Not:** Eski CHECKLIST maddeleri bir kısmı güncelliğini yitirmişti; aşağıdaki işaretler 2026-04-18 itibarıyla repodaki gerçek API ve sayfa varlığına göre güncellendi. Ayrıntılı gap analizi: [docs/GAP_ANALYSIS.md](docs/GAP_ANALYSIS.md).

### Yapılanlar listesi — staff liste / arama keşfi (2026-04-19)

- [x] **`ListEmptyState`**: `secondary` aksiyon (outline), `EmptyStateAction` tipi.
- [x] **`PatientList`**: arama kartı, ipucu, temizle; boş durumda ikincil CTA → randevular.
- [x] **`InvoicesListPage`**: filtre sıfırlama, aktif filtre ipucu; boş durumda ikincil CTA → randevular.
- [x] **`InventoryPage`**: filtre sıfırlama; arama ipucu metni.
- [x] **`HmoClaimsPage`**: tabloda istemci metin araması + temizle + eşleşme yok mesajı.
- [x] **`WaitlistPage`**: kapsam etiketi düzeltmesi (`waitlist.listScopeLabel`); tablo istemci araması + eşleşme yok.
- [x] **`NotificationsPage`**: yüklenen satırlarda istemci metin araması + temizle + eşleşme yok.
- [x] **i18n**: yeni anahtarlar `pages.en.json` ve `pages.tr.json` içinde.
- [x] **Filipin (`ph`) `pages` overlay**: `ph-pages/common.json` (`retry`), `marketingPublic.json` (`navAria`), `appointments.json` (patient autocomplete + treatment editor), `patientDetail.json` (dental/medical/perio yükleme); `pages.en.json` `marketingShell.navAria` eklendi.

---

## 0. Genel Kararlar

- **Proje adı:** DentEase PH (referans: SmileHub PH görselleri)
- **Stack (sabit):**
  - Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
  - Frontend: React 18 + Vite + TypeScript + Tailwind CSS
  - Auth: JWT (access 15dk + refresh 7 gün), bcrypt (salt 12)
  - Validation: Zod
- **Bölge:** PHP (₱), Asia/Manila timezone, telefon `+63XXXXXXXXXX`
- **Diller (i18n, react-i18next):**
  - `en` (English — default)
  - `fil` (Filipino / Tagalog — ana hedef kullanıcı dili)
  - `tr` (Türkçe — geliştirici/yönetici)
- **UI referansı:** SmileHub PH mockup'ları (Dashboard / Odontogram / Queue / Booking / Billing & HMO).

---

## 1. Repo Temizliği (eski filipin POS kalıntıları)

Mevcut dizinde eski "filipin-pos-system" (sari-sari / barber / food POS) dosyaları duruyor. Bunları silmeden yeni projede karışıklık yaratıyor.

**Silinecekler (onay sonrası):**

- [ ] `src/` — eski React POS (BarberPOS, FoodPOS, RetailPOS, CashierMode, UtangTracker, ZReport, BusinessSelector, LandingPage, Login vs.)
- [ ] `server/` — eski Express `api-client.js`, `index.js`
- [ ] `public/` — eski logo, QR placeholder, manifest
- [ ] `dist/` — eski production build
- [ ] `database/schema.sql` — eski POS SQL şeması
- [ ] `prisma/` (kök) — eski Prisma; yenisi `backend/prisma/` içinde
- [ ] `node_modules/` (kök) — gereksiz (yeni yapıda `backend/node_modules/` ve `frontend/node_modules/` ayrı)
- [ ] `package.json` + `package-lock.json` (kök) — eski POS package'i
- [ ] `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` (kök) — eski frontend config
- [ ] `.env.example` (kök) — artık `backend/.env.example` + `frontend/.env.example` var
- [ ] `tsconfig.prisma.json` (kök) — artık `backend/tsconfig.json` içinde ele alınıyor
- [ ] Eski MD'ler: `ARCHITECTURE.md`, `PROJECT_SUMMARY.md`, `QUICK_START.md`, `REFACTORING_SUMMARY.md`, `RESPONSIVE_OPTIMIZATION.md`, `SMART_FEATURES_SUMMARY.md`, `SYNC_ALGORITHM_EXPLANATION.md`
- [ ] `README.md` (kök) — eski içerik; yenisi (DentEase PH) yazılacak
- [ ] `build_error.log`, `build_error_2.log`, `clean_error.log` — atık loglar

**Korunacaklar:**

- `.git/`, `.gitignore`
- `backend/` (yeni API)
- `frontend/` (yeni web uygulaması)
- `CHECKLIST.md` (bu dosya)

---

## 2. Klasör Yapısı (hedef)

```
filipin mvp/                (repo root; ileride `dentease-ph` olarak rename)
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ seed.ts
│  │  └─ exclusion-appointment-overlap.sql
│  ├─ src/
│  │  ├─ app.ts, index.ts
│  │  ├─ routes/, controllers/, services/, middleware/, validation/
│  │  ├─ lib/prisma.ts, utils/, types/
│  │  └─ events/ (notification emitter)
│  ├─ .env.example, package.json, tsconfig.json
│  └─ uploads/ (gitignore)
├─ frontend/
│  ├─ src/
│  │  ├─ pages/, components/, hooks/, services/, types/, validation/
│  │  ├─ i18n/          ← en.json + fil.json + tr.json
│  │  └─ styles/
│  ├─ vite.config.ts, tailwind.config.js, tsconfig.json, index.html
│  └─ .env.example, package.json
├─ docs/                     (UI mockup'lar + PRD)
├─ CHECKLIST.md
└─ README.md                 (yeni)
```

---

## 3. Modül Checklist

Durum işaretleri: ✅ tamam · 🟡 kısmen · ⬜ başlanmadı

### M0 — Proje İskeleti
- [x] Backend Express + TS kurulum, health endpoint
- [x] Frontend Vite + React + TS + Tailwind kurulum
- [x] Prisma schema başlangıcı + seed.ts
- [x] Prisma client singleton, error middleware, asyncHandler, AppError
- [ ] ⚠️ Kök klasördeki eski filipin POS dosyalarının silinmesi (bkz. bölüm 1)
- [x] README.md (DentEase PH — çalıştırma + CHECKLIST / overnight linkleri)

### M1 — Auth & Rolleri
- [x] POST `/api/auth/register` (klinik + admin user)
- [x] POST `/api/auth/login` (bcrypt + lockout + JWT pair)
- [x] POST `/api/auth/refresh`
- [x] POST `/api/auth/logout`
- [x] `authenticate` middleware + `roleGuard`
- [x] Frontend: `useAuth`, `ProtectedRoute`, LoginPage
- [x] GET `/api/auth/me` (`backend/src/routes/auth.routes.ts` — `authenticate` + `meHandler`)

### M2 — Hasta Yönetimi
- [x] CRUD endpoints (GET liste + arama, GET detay, POST, PUT, DELETE soft)
- [x] `PatientFile` yükleme (local / S3 / Supabase driver)
- [x] Zod validasyon, PH telefon formatı, clinic isolation
- [x] Frontend: `PatientList` (debounced search + pagination), `PatientForm` modal, `PatientDetailPage`

### M3 — Dental Chart (Odontogram)
- [x] Backend: `GET/PUT /api/patients/:id/teeth`, `/teeth/:n`, `/teeth/history`
- [x] `ToothAuditLog` (kim/ne zaman/ne değişti)
- [x] Frontend: 32 diş SVG, 5 yüzey tıklama, modal edit, legend, history paneli
- [ ] 🔎 Görsellerdeki "ADG / HS / DS / HY / HD / TX" gibi anatomik etiketleme ile detaylandırma (opsiyonel iyileştirme)

### M4 — Randevu Sistemi  🟡 (çekirdek hazır; UX ince ayarı sürer)
- [x] Backend: list / get / create / update / patch-status / delete (`/api/appointments`, `/api/users/dentists`)
- [x] Çakışma kontrolü (`appointment.service.ts` — `findConflict`)
- [ ] "Next available" slot önerisi (kodda ayrı endpoint/yanıt alanı yok — isteğe bağlı iyileştirme)
- [x] İş saati + Pazar kapalı (`manilaTime` + `isSundayInManila` / iş saati kontrolleri)
- [x] Bildirim tetikleyicileri (`events/notifications.ts` + `emitAppointmentEvent`; SMS şablonları)
- [x] Frontend: `AppointmentsPage` (FullCalendar `timeGrid`), hekim filtresi
- [x] `NewAppointmentModal`, `AppointmentDetailSidebar` + durum / kuyruk aksiyonları
- [x] 🎨 UI/UX: hafta/ay görünümü (bkz. bölüm 8) · mobil takvim ince ayarı sürer

### M5 — Tedavi Kaydı (Treatment Record)
- [x] Oluşturma: `POST /api/appointments/:appointmentId/treatments` (+ finalize akışı)
- [x] `GET /api/patients/:id/treatments`, `PUT/DELETE /api/treatments/:id`
- [x] PDF: `GET /api/patients/:id/forms/treatment-record.pdf` (form çıktısı)
- [x] 🎨 Frontend: tedavi özeti + PDF (bkz. bölüm 8) · baskı önizleme opsiyonel

### M6 — Fatura & Ödeme
- [x] CRUD `/api/invoices`, ödeme ekleme, PayMongo checkout + webhook (`/api/webhooks/paymongo`), simülasyon (dev)
- [x] PDF fatura (`GET /api/invoices/:id/pdf`)
- [x] Frontend: `InvoicesListPage`, `InvoicePage`
- [x] `GET /api/appointments/:appointmentId/invoice` (hızlı uygunluk)
- [ ] 🟡 **HMO + fatura** — fatura detayında claim (co-pay, satır seçimi, çoklu üyelik ipucu, i18n) mevcut; fatura oluşturma sihirbazı / tam mockup HMO rozetleri isteğe bağlı sürer

### M7 — Bildirim Sistemi
- [x] SMS (Semaphore) — servis + şablonlar; randevu SMS'leri
- [x] `Notification` kayıtları + `GET /api/notifications`
- [x] Cron (`scheduler.ts` — Asia/Manila; `app.ts` içinde başlatma; `DISABLE_SMS_CRON` ile kapatılabilir) + manuel tetik: `POST /api/notifications/cron/daily|soon`
- [ ] Email (Resend / benzeri) — kurulu değil
- [ ] Klinik başına şablon / kanal ayarları API'si (`Clinic` modelinde ayrı notification-settings alanı yok — env + kod seviyesinde)

### M8 — Dashboard & Raporlar
- [x] `GET /api/reports/dashboard` (özet; controller `reports.controller`)
- [x] `GET /api/reports/aged-receivables`, `GET /api/reports/monthly` (+ aylık PDF yetkili roller için)
- [x] Frontend: `DashboardPage`, `AgedReceivablesPage`
- [ ] 🎨 Dashboard: mockup’taki ek widget’lar, grafik çeşitliliği, CSV dışa aktarma
- [x] **Patient Queue widget** — `DashboardPage` bugünkü kuyruk tablosu + durum/alert; `AppointmentsPage` üst şerit ile birlikte

### M9 — Stok Takibi
- [x] CRUD `/api/inventory`, `POST /api/inventory/:id/adjust`, `GET /api/inventory/alerts`
- [x] Frontend: `InventoryPage`
- [ ] Düşük stok uyarısı Dashboard widget'ı + kullanım geçmişi detayı (isteğe bağlı)

### M10 — Hasta Portal (self-servis)
- [x] OTP auth (`/api/portal/auth/request-otp`, `verify-otp`)
- [x] Portal: `GET /api/portal/me`, `home`, `appointments`, `history`, `POST .../paymongo` (fatura ödemesi)
- [x] Frontend: `/:slug/portal/*` — `PortalLoginPage`, `PortalHomePage`, `PortalBookPage`, `PortalAppointmentsPage`, `PortalHistoryPage` (tek Vite SPA içinde; ayrı subdomain şart değil)
- [ ] 🎨 Portal mobil / i18n tam kapsamı (bkz. bölüm 4 ve 8)

### M11 — AI Özellikler
- [ ] Clinical note parser (GPT-4o → JSON)
- [ ] No-show risk tahmini
- [ ] Treatment plan suggestion

### M12 — Çok Şube
- [ ] `ClinicGroup` modeli, `GROUP_ADMIN` rolü
- [ ] `/api/group/dashboard`, `/reports`, `/transfer-patient`, `/staff`
- [ ] Sidebar'da şube switcher

---

## 4. i18n Planı  🟡

- [x] `frontend/src/i18n/` — `en.json`, `tr.json`, `ph.json` (Filipino), `tl.json`, `hil.json` (`fil` etiketi `ph` ile eşleniyor)
- [x] `i18next` + `react-i18next` + LanguageDetector + localStorage (`STORAGE_KEY = dentease.lang`)
- [x] Dil seçici (ör. `LanguageSwitcher` — layout’ta)
- [ ] Tarih/saat ve para birimi tüm ekranlarda tutarlı yardımcılar (`Asia/Manila`, `en-PH`) — kısmen
- [ ] Tüm sabit metinler key’lere taşınacak (Landing, staff, portal — hâlâ dağınık İngilizce/metin kalabilir)

---

## 5. UI Tasarım Sistemi (SmileHub görsellerinden)

- [ ] Tailwind theme: `primary` (SmileHub mavisi ~ `#2F80ED`), `accent` (menta / yeşil), yumuşak pastel arka plan
- [ ] Yaprak motifleri / "organic green" brand background (landing + splash)
- [ ] Sidebar navigation: Dashboard · Appointments · Patients · Billing · HMO Claims · Inventory · Staff
- [ ] Patient Queue row: avatar + isim/şube + randevu saati + check-in status chip + "View Details" / "Update Status" / "Send Alert"
- [ ] Odontogram: ADG (adult) + pediatric view toggle, tooth label altlarında durum chip'leri (BB, HY, HS, DS vs. — referans için not)
- [ ] Billing card: Invoice # + Item/Qty/Cost tablosu + HMO status rozetleri (Approved / Pending Approval / Co-payment)
- [ ] Mobil: booking flow (doctor select → calendar → time slots → review & confirm)

---

## 6. Açık Sorular (seninle karara bağlı)

1. **`tıppluskodlar` klasörü** nerede? Benim dizin taramamda bulamadım. Path'i verir misin, yoksa içeriğini kopyala-yapıştır atar mısın? (Referans kod olarak kullanacağız.)
2. **Repo adı** `filipin mvp` → `dentease-ph` olarak değiştirelim mi? (Klasör + git remote dahil.)
3. **Dil önceliği**: Default UI hangisi olsun — `en` mi `fil` mi? (SmileHub görselleri tamamen İngilizce; ben default `en` öneriyorum, kullanıcı kendisi değiştirebilir.)
4. **HMO sağlayıcıları** sabit listeyle mi gelsin (Maxicare, Intellicare, Medicare, Medicard, PhilHealth) yoksa klinik-bazlı yönetilsin mi?
5. **Silme onayı**: Bölüm 1'deki listeyi silmeye başlayayım mı?

---

## 7. Sıradaki Adımlar (önerilen sıra — güncel)

1. ✅ CHECKLIST.md kodla hizalandı (bu güncelleme)
2. ⬜ Bölüm 1 temizliği onayla → eski POS dosyalarını sil
3. 🟡 **Bölüm 8 (UI/UX)** — staff nav, portal linki, hasta listesi HMO rozetleri, fatura listesi + detay HMO sütunu (2026-04-18)
4. ⬜ i18n: kalan sayfaları key’le (öncelik: Login, Dashboard, Appointments, Patient, Invoice)
5. 🟡 **Bölüm 9** — güvenlik çekirdeği kodlandı (CORS uyarısı, PayMongo imza, kayıt kilidi, rate limit, portal OTP); ince ayar / WAF vb. açık
6. ✅ `docs/STATUS.md` modül özeti ve API bölümü güncellendi (2026-04-19); tarihsel TASK notu eklendi

---

## 8. UI / UX — öncelikli yapılacaklar (todo)

> Amaç: SmileHub mockup’larına yaklaşmak, staff ve portal akışlarını “bitmiş” hissi verecek şekilde cilalamak. Backend çoğu modülde hazır; ağırlık arayüzde.

- [x] **HMO (liste / özet):** hasta listesinde sağlayıcı kodu rozetleri (`GET /patients` + `hmoMemberships`); fatura listesinde HMO claim durumu; fatura detayında bağlı claim’ler; `HmoClaimsPage` + hasta detay HMO sekmesi mevcut
- [x] **HMO (derin, 🟡):** fatura detayında claim paneli — çoklu üyelik ipucu, sağlayıcı seçeneklerinde birincil soneki, birincil olmayan plan uyarısı, tahmini kapsam kartı (talep + katkı + kapsam), i18n; ara toplam satırları `t()` _(2026-04-19)_ — tam fatura sihirbazı / tüm mockup rozetleri ayrı iş
- [x] **Billing & faturalar:** fatura listesinde mobil kart görünümü; fatura detayında PayMongo açıklaması + mobilde sabit “çevrimiçi öde” şeridi (liste filtreleri kısmen var)
- [x] **Randevu:** gün / hafta / ay görünümü (`timeGridDay` · `timeGridWeek` · `dayGridMonth`), görünür aralık `from`/`to` ile API; ay görünümünde yeni randevu için gün/hafta ipucu metni
- [ ] **Randevu (ince):** “next slot” API önerisi, mobil kompaktlık
- [x] **Patient Queue (randevu sayfası):** CHECKED_IN / IN_PROGRESS şeridi, detay için tıklanabilir
- [x] **Tedavi:** hasta detay › Tedaviler — satır sayısı + tahmini toplam + treatment-record PDF indir
- [x] **Tasarım / nav:** HMO kalkan ikonu, Staff `/staff`, dashboard metrik linkleri, landing’de hasta portal linki (`VITE_PORTAL_DEMO_SLUG`)
- [x] **Portal:** booking; diş hekimi/slot/API hata mesajları; `PortalBookPage` `min-h` + `PortalLoginPage` / **`PortalLayout`** (alt nav, header) / **`PortalHomePage`** / **`PortalAppointmentsPage`** / **`PortalHistoryPage`** — karanlık mod, `min-w-0`, dokunma + `focus-visible` _(2026-04-19)_
- [x] **Dashboard:** son 30 gün gelir ve randevu durumu grafikleri için veri yokken açıklayıcı boş metin; PDF açma hata toast’u tekilleştirme; karanlık modda kart/şerit sınıfları _(2026-04-19)_
- [x] **Giriş (`/login`):** tema anahtarı, karanlık mod, form `focus-visible`, mobil uygun dokunma yüksekliği _(2026-04-19)_
- [x] **Landing mobil CTA şeridi:** karanlık mod border/arka plan/metin + odak halkası _(2026-04-19)_
- [x] **Landing → staff:** özellik modalında önizleme sonrası ilgili staff rotasına CTA (`FeatureDef.tryInAppPath`); randevu sayfası takvim araç çubuğu `focus-visible` _(2026-04-19)_

---

## 9. Diğer — teknik, güvenlik, ürün (todo)

> `docs/GAP_ANALYSIS.md` ve `docs/AGENT_CHECKLIST.md` ile çakışan maddeler burada özetlenir; detay GAP dokümanında.

- [x] **Güvenlik (çekirdek):** `CORS_ORIGIN` virgül listesi; prod’da boşsa uyarı logu (`app.ts`) · PayMongo `Paymongo-Signature` HMAC (`paymongoWebhook.ts`, prod’da secret zorunlu) · `ALLOW_PUBLIC_REGISTER` ile açık kayıt kilidi · genel `/api` + sıkı `/auth` rate limit · **portal OTP** için ek limit (`/api/portal/auth/request-otp`, `verify-otp`; env: `PORTAL_OTP_*`)
- [ ] **Güvenlik (ince):** webhook için ayrı rate limit politikası, IP allowlist, WAF — operasyonel
- [ ] **PH yasal / operasyon:** BIR alanları, Senior/PWD indirim satırı, DPA / audit tam kapsam (kısmen var)
- [ ] **E-posta:** Resend veya eşdeğeri + şablonlar
- [ ] **Repo:** kök POS kalıntıları (bölüm 1), gereksiz `backend/dist` commit’i (`.gitignore` ile — `dist` ignore’da)
- [ ] **Çok şube / AI (M11–M12):** yol haritası; MVP dışı

# Genel TODO / çalışma checklist’i

Bu dosya **elle** güncellenir: iş bitince `- [ ]` → `- [x]` yap. Tarih notu eklemek istersen satır sonuna `(2026-04-18)` yazabilirsin.

| Dosya | Ne işe yarar |
|--------|----------------|
| **Bu dosya** (`TODO_CHECKLIST.md`) | Günlük sprint, modül önceliği, “şunu unutma” maddeleri |
| `docs/AGENT_CHECKLIST.md` | GAP tabanlı **otomatik** liste — `node scripts/generate-agent-checklist.mjs` |
| `docs/GAP_ANALYSIS.md` | Detaylı gap analizi |
| `node scripts/log-agent-completion.mjs --id GAP-…` | GAP kapanınca log (protokolde varsa) |
| **`docs/OVERNIGHT_AGENT_TODO.md`** | Gece / uzun maraton: **100+** tiklenebilir madde (Z0–Z20 blokları; **Z20** = paralel-güvenli UI-only) |

**Gece modu:** Uzun listeyi burada şişirmemek için ayrı dosyada tutuluyor — [`docs/OVERNIGHT_AGENT_TODO.md`](docs/OVERNIGHT_AGENT_TODO.md) dosyasını aç ve sırayla tikle. (Sohbet oturumu kesilse bile liste repoda kalır.)

---

## 3–4 saatlik agent sprint — geniş checklist (tek oturum)

**Amaç:** Tek başına 3–4 saat dolacak şekilde parçalı iş; her satır mümkünse tek PR veya tek commit altında kapatılabilir olsun. **Hepsini bitirmek zorunlu değil** — önce A→F sırası, yetmezse G’den devam.

**Süre rehberi:** A≈25dk · B≈40dk · C≈50dk · D≈45dk · E≈35dk · F≈20dk · G=buffer.

### A — Repo ve temel doğrulama (~25 dk)

- [ ] `git status` temiz mi; gereksiz `backend/dist` commit’lenmemiş mi (varsa `.gitignore` kontrolü)
- [x] `backend`: `npm run lint` (`tsc --noEmit`) (2026-04-26)
- [x] `backend`: `npm run build` (varsa script; yoksa `package.json`’a bak) (2026-04-26)
- [x] `frontend`: `npm run lint` (2026-04-26)
- [x] `frontend`: production build (`npm run build` veya projedeki karşılığı) (2026-04-26)
- [ ] Kök `README` / hızlı başlangıç yoksa: sadece **5 satırlık** “backend + frontend çalıştır” notu ekleme (başka dokümantasyon şişirme yok)

### B — Smoke: tedavi → fatura → HMO (~40 dk)

_Kaynak: `docs/SMOKE_TREATMENT_INVOICE_CLAIM.md`_

- [ ] Smoke dokümanını baştan sona oku; adımları numaralandır (zaten varsa atla)
- [ ] Seed kullanıcı / klinik ile giriş (ADMIN vs diğer roller)
- [ ] Hasta seç → tedavi satırı → kaydet (beklenen API + UI)
- [ ] Fatura oluşumu / OR görünümü / indirim alanları
- [ ] PDF indir: ağ hatası olmadan blob/URL açılıyor mu
- [ ] HMO claim: sağlayıcı + satır seçimi → başarılı submit veya bilinen hata mesajı tutarlı mı
- [ ] Smoke sırasında bulunan **tek** net bug → minimal fix + dokümana 1 satır not

### C — Fatura & ödeme kod keşfi (~50 dk)

- [ ] `backend/src/services/invoice.service.ts`: PayMongo / simulate / statutory indirim akışını haritala (kısa zihinsel veya yorum satırı yok — sadece oku)
- [ ] Webhook route var mı; env’de hangi anahtarlar zorunlu — `.env.example` ile karşılaştır
- [ ] `invoicePdf` / OR şablonunda Senior/PWD/TIN alanları: UI ile aynı veri kaynağı mı
- [ ] Portal: `startPortalInvoicePaymongo` + checkout URL — staff ile aynı backend kuralları mı
- [ ] “Ödeme başarısız / iptal” kullanıcı mesajları: toast/metin tutarlılığı (İngilizce mi Tagalog mu — projeyle aynı kalsın)

### D — Frontend UX taraması (~45 dk)

- [ ] `InvoicesListPage` + `InvoicePage`: mobil 375px’de taşma, buton sırası
- [ ] `PatientList` / `PatientDetailPage`: tablo + formlar yatay kaydırma
- [ ] `AppointmentsPage`: takvim + CTA dokunma alanı
- [ ] `SettingsPage` + `StaffTeamPanel`: mobilde form genişliği
- [ ] `HmoClaimsPage`: ADMIN olmayan rolde tablo gizli mi; modal kapanış (backdrop / Esc)
- [ ] `grep` ile `confirm(` kullanımları: kritik yerlerde kalsın; gereksizse metin iyileştirme
- [ ] `console.log` debug kalıntısı (prod’a gidecek dosyalarda) — varsa temizle

### E — Backend güvenlik & veri (~35 dk)

- [ ] `patientFileStorage` + route: dosya indirme yetkisi (rol) doğrulanıyor mu
- [ ] `authMiddleware` / `roleGuard`: HMO ve fatura endpoint’leri için beklenen roller
- [ ] `portalAuth` + portal JWT süresi / refresh stratejisi (dokümante veya kod yorumu gerekiyorsa minimal)
- [ ] Prisma: `schema.prisma` ile seed’de zorunlu ilişkiler uyumlu mu (silme cascade dikkat)
- [ ] Rate limit / login lockout: `loginLockout` servisi — edge case (saat dilimi Manila)

### F — Kalite kapanışı (~20 dk)

- [x] CI workflow dosyası var mı; `npm test` / lint adımları güncel mi (`.github/workflows/ci.yml` backend/frontend `npm ci + lint + build`) (2026-04-26)
- [x] Bu sprintte yapılan işler için **`TODO_CHECKLIST.md`** tikleri + “Tamamlandı” arşivi (2026-04-19)
- [ ] GAP kapatıldıysa: `node scripts/log-agent-completion.mjs --id … --summary "…"`
- [ ] Commit mesajı: ne + neden (İngilizce veya Türkçe, ekip standardına göre)

### G — Buffer (süre kalırsa, ~30–45 dk)

- [ ] `docs/GAP_ANALYSIS.md` içinden **bir** düşük riskli GAP seç → minimal diff
- [ ] `HomePage` / landing: iddia edilen özellik linkleri gerçek rotalara gidiyor mu
- [ ] Eksik çeviri anahtarı: `grep` i18n/t() hataları
- [ ] `Perio` veya `DentalChart` hızlı smoke (kaydet + PDF yolu)

---

## Bugün / bu tur (en fazla 3–5 madde)

- [x] Backend: `npm run lint` + `npm run build` (2026-04-18)
- [x] Frontend: `npm run lint` + `npm run build` (2026-04-18 — `INVENTORY_STATUS_STYLES.label` TS düzeltmesi sonrası)
- [x] Sprint kapanış: i18n + `ph` overlay + TS düzeltmeleri arşive işlendi; commit/PR ekip akışına bırakıldı (2026-04-19)
- [x] Tam repo doğrulama turu: backend/frontend lint + build yeniden koşuldu, hepsi yeşil (2026-04-26)

---

## UI/UX Sprint TODO (Vercel sonrası öncelik)

### 1) Dashboard bilgi mimarisi (tek ekran revizyonu)
- [ ] Dashboard’u 3 blokta yeniden kurgula: **Günlük operasyon**, **Finans özeti**, **Hasta akışı**
- [ ] “Hepsi tek yerde” yaklaşımını sekmeli/katmanlı düzene çevir (`Overview` / `Operations` / `Finance`)
- [ ] Kritik KPI’lar için üstte sabit mini kartlar (randevu bugün, bekleyen tahsilat, açık HMO)
- [ ] Dashboard boş durumları ve hata durumları için net CTA (örn. “Randevu oluştur”, “Fatura aç”)

### 2) Mobil responsive (375 / 768 / 1024)
- [ ] Tüm ana sayfalarda yatay taşma taraması (`Dashboard`, `Patients`, `Appointments`, `Invoices`, `HMO`)
- [ ] Mobilde tablo yerine kart görünümü gereken ekranları belirle ve uygula
- [ ] Dokunma hedefleri min. `44px`, ikon butonlar için erişilebilir label/odak halkası
- [ ] AppShell’de mobil üst bar + drawer davranışını tek standarda getir

### 3) UI tutarlılık sistemi
- [ ] Ortak bileşen standardı: `PageHeader`, `StatCard`, `FilterBar`, `EmptyState`, `ErrorState`, `Skeleton`
- [ ] Renk/spacing/typography token’larını gözden geçir; “rastgele class” tekrarlarını azalt
- [ ] Tüm form alanlarında hata metni, yardımcı metin ve disabled/loading stillerini eşitle
- [ ] Toast metinlerini tek dil tonu ve tek fiil yapısına çek (başarılı/hata)

### 4) Dashboard işlevsellik tamamlama
- [ ] Dashboard API bağımlılık haritası çıkar; eksik endpoint veya bozuk payloadları düzelt
- [ ] Her kartın loading/success/error state’i test edilip stabilize edilsin
- [ ] Grafik verileri için tarih aralığı + locale formatı (en/tr/ph) tutarlı hale getirilsin
- [ ] “No data” grafiklerinde açıklayıcı metin + ilgili aksiyon butonu eklensin

### 5) QA / release kriteri
- [ ] “UI smoke checklist” oluştur: 15 dakikalık manuel tur (desktop + mobil)
- [ ] En az 10 kritik sayfa için ekran görüntüsü bazlı önce/sonra doğrulama
- [ ] Vercel preview üzerinde cihaz testleri (iPhone SE, iPad, 1366 laptop)
- [ ] UI/UX sprint bitiş kriteri: kritik görsel bug sayısı `0`, major bug sayısı `<=2`

---

## Ürün — PH / fatura / HMO

- [ ] HMO: claim akışı + sağlayıcı verisi uçtan uca doğrulama
- [ ] Fatura: Senior / PWD / statutory indirim görünürlüğü + PDF ile uyum
- [ ] BIR / TIN / VAT metinleri (şablon + UI + PDF tutarlılığı)
- [ ] Ödeme: webhook / imza / portal URL (ortam bazlı kontrol listesi)

---

## Frontend — UX

- [x] **Staff i18n (EN/TR/PH):** randevu `PatientAutocomplete` + `TreatmentEditorPanel`; hasta `DentalChart` / `MedicalHistoryForm` / `PeriodontalChart`; `AppLayout` mobil drawer `aria-label`; `pages.en.json` `marketingShell.navAria`; `tr.json` nav anahtarları; **Filipin overlay** (`ph-pages/common`, `marketingPublic`, `appointments`, `patientDetail`) — `npm run lint` yeşil (2026-04-19)
- [x] **Z20 (paralel UI):** `ListEmptyState`, tablo `min-w-0` / `overflow-x`, `focus-visible` filtreler, HMO `toast` id, i18n `empty*` anahtarları _(2026-04-18 — `docs/OVERNIGHT_AGENT_TODO.md` Z20 tamam)_
- [ ] Mobil + tablet: tablolar `overflow-x`, dokunma hedefi (~44px), drawer/topbar
- [x] `alert` yerine toast — staff + portal (`InvoicePage`, `DashboardPage`, `InventoryPage`, `PortalAppointmentsPage`, `PortalHistoryPage`) (2026-04-18)
- [x] Boş durumlar: CTA — `PatientAutocomplete` → Patients (önceki tur)
- [x] Landing footer: Product/Company linkleri gerçek bölüm anchor’ları (`/#features` …) _(2026-04-18)_
- [x] Landing özellik modalı: önizleme altında staff rotasına CTA (`FeatureDef.tryInAppPath`) _(2026-04-19)_

---

## Backend — güvenlik ve veri

- [ ] Hasta dosyası: signed URL / yetki sınırları
- [ ] Auth: rol guard, portal JWT, rate limit / kilitleme (varsa gözden geçir)
- [ ] Prisma migrate + seed dokümantasyonu (yeni gelen için)

---

## Kalite ve operasyon

- [x] CI workflow dosyası güncel (backend/frontend lint+build adımları mevcut); yerel lint/build yeşil (2026-04-26)
- [ ] `.env.example` ile gerçek `.env` alanları senkron
- [ ] Smoke dokümanı: `docs/SMOKE_*.md` ile bir tur
- [x] Supabase geçiş hazırlığı: runbook + env şablonu + README hızlı adımlar eklendi (`docs/SUPABASE_MIGRATION.md`, `backend/.env.supabase.example`) (2026-04-26)

---

## Backlog (büyük paketler — parçalara böl)

- [ ] Recall, waitlist, treatment plan
- [ ] Lab, referral, ek staff rolleri, clinic settings
- [ ] Reports ekranı, settings, logo/SVG, PDF header logo

---

## Yeni iş planı (TODO bitince otomatik başlat)

### Sprint S1 — Operasyon dashboard derinleştirme
- [x] Dashboard’a "koltuk/masa durumu" modeli (`chairNo`/`station`) ekle; canlı doluluk kartları çıkar (2026-04-26)
- [x] Queue + waitlist birleştirme kuralları (aynı hastayı çift göstermeme) uygula (2026-04-26)
- [x] Geciken randevular için aksiyon paneli (ara/sms/check-in/no-show) ekle (2026-04-26)
- [x] Dashboard verisini role göre sadeleştir (Admin/Dentist/Receptionist farklı görünüm) (2026-04-26)

### Sprint S2 — Mobil responsive kapama turu
- [x] `Dashboard`, `Appointments`, `Patients`, `Invoices`, `HMO` sayfalarında 375px final düzeltmeleri (2026-04-26)
- [x] Tablolarda standart desen: `overflow-x-auto` + `min-w-*` + mobil kart alternatifi (2026-04-26)
- [x] Filtre alanları mobilde 2 satır standardına çekilsin (taşma ve çakışma yok) (2026-04-26)
- [x] Sticky/fixed elemanlar safe-area ile test edilip standardize edilsin (2026-04-26)

### Sprint S3 — Performans ve UX akıcılığı
- [x] Landing için code-split (ağır preview/animasyon bloklarını lazy load) (2026-04-26)
- [x] Dashboard chart bloklarını görünür olduğunda render et (viewport lazy render) (2026-04-26)
- [x] İlk yüklenmede skeleton + kademeli hydration hissi (jank azaltma) (2026-04-26)
- [x] Route geçişlerinde hissedilen gecikmeyi azalt (ön yükleme / kritik veri önceliği) (2026-04-26)

### Sprint S4 — İleri Düzey Klinik Görselleştirmeler (SaaS Vizyonu)
- [ ] 1. Gelişmiş Perio-Chart: Diş eti çekilmesi (recession) ve kanama (BOP) için interaktif SVG animasyonları.
- [ ] 2. X-Ray Çizim Tuvali: `react-konva` ile röntgen üzeri açı ölçer, cetvel ve serbest çizim (annotation) araçları.
- [ ] 3. Tedavi Planı Zaman Çizelgesi: Ortodonti/İmplant süreçleri için Gantt-chart / Timeline görünümü.
- [ ] 4. Klinik Kat Planı & Canlı Hasta Kuyruğu: Bekleme salonundan koltuğa sürükle-bırak (Drag & Drop) atama sistemi.
- [ ] 5. Before/After Kaydırıcısı (Slider): Tel ve beyazlatma işlemleri için eski/yeni fotoğraf karşılaştırma aracı.
- [ ] 6. Yüz ve TMJ Anatomisi: Çene eklemi, bruksizm ve botoks noktaları işaretleme için interaktif kafatası SVG'si.

---

## HMO (staff) + PhilHealth — iki hat planı

**Hat A — Staff içi HMO operasyonu (özet / sıra)**

- [x] Fatura listesinde **açık HMO talebi** filtresi: `GET /invoices?openHmoClaim=1` (DRAFT / SUBMITTED / PARTIAL_APPROVED) + UI checkbox
- [x] İddia başına **ek dosya** (LOA, ön onay): yükleme, listeleme, silme; `HmoClaimAttachment` modeli _(2026-04-19)_
- [x] **Durum makinesi** sıkılaştırma: geçerli geçişler (PAID yalnızca APPROVED / PARTIAL_APPROVED sonrası; SUBMITTED↔DRAFT geri çekme; REJECTED→SUBMITTED yeniden gönderim); UI’da yalnız izin verilen aksiyonlar _(2026-04-19 — audit log ayrı)_
- [x] **Ay sonu mutabakat**: sağlayıcı × dönem CSV veya PDF; bekleyen vs ödenen toplamlar (2026-04-26)
- [ ] Fatura bakiyesi ile **onaylı tutar / copay** senkron kuralları (iş kuralı dokümantasyonu + kod)

**Hat B — PhilHealth (özet / sıra)**

- [x] **Dahili çalışma sayfası PDF**: `GET /invoices/:id/philhealth-worksheet` — hasta `philhealthNo` zorunlu; CF1/2 olmadığı uyarısı; OR + prosedür tablosu
- [ ] Resmi **CF1 / CF2** alan haritası (hangi alan hangi veriden) + şablon PDF (hukuk/uygunluk gözden geçirmesi)
- [ ] **Case rate / benefit** lookup (statik tablo veya dış kaynak) — en azından not alanı + referans linki
- [ ] Hasta kartında PhilHealth **üyelik türü** (Formal / Informal / Senior / PWD vb.) — şema + UI
- [ ] Portal veya e-posta ile hastaya “eksik PhilHealth bilgisi” hatırlatması

---

## Tamamlandı (arşiv — üstten biten maddeyi buraya `- [x]` ile taşı)

- [x] Frontend `src` içinde `alert(` kalmadı; hata/bilgi `sonner` toast (2026-04-18)
- [x] `InvoicePage`: `useTranslation` + `t` kullanımı; `PatientDetailPage`: `tabDefs` / `formatDate` ikinci argüman / `TABS` hatası giderildi — `npm run build` yeşil (2026-04-18)
- [x] Kök `README.md` + `docs/OVERNIGHT_AGENT_TODO.md` (uzun gece listesi) + `TODO_CHECKLIST` linki (2026-04-18)
- [x] `backend/.env.example` — `APP_PUBLIC_URL`, `PAYMONGO_SECRET_KEY`, portal/SMS yorum satırları (2026-04-18)
- [x] `INVENTORY_STATUS_STYLES` — eksik `label` alanı (InventoryPage derlemesi) (2026-04-18)
- [x] Z20 (paralel UI): footer hash linkleri; 403/404 + Privacy/Terms karanlık mod & tema (2026-04-18)
- [x] Z20 devam: liste boş durumları + `AppLayout` `min-w-0` + HMO toast dedupe (2026-04-18)
- [x] Dashboard boş grafik metinleri + Login tema/focus + landing mobil CTA karanlık mod (2026-04-19)
- [x] Portal book/login UX + DentalChart i18n toast (2026-04-19)
- [x] Portal shell + Home / Appointments / History: karanlık mod + dokunma/odak (2026-04-19)
- [x] PayMongo simulate: `handlePaymongoWebhook` `{ simulate, invoiceId }` yolu düzeltildi; prod’da `POST …/paymongo/simulate` → 403 (2026-04-18)
- [x] `PatientList`: hasta tablosu `overflow-x-auto` + `min-w-[720px]` (2026-04-18)
- [x] `docs/OVERNIGHT_AGENT_TODO.md` — Z2 tamam, Z3/Z4/Z6/Z7 kısmi tik (kod doğrulama) (2026-04-18)
- [x] `openInvoicePdf` → `openAuthedPdf` (401 refresh); `AgedReceivablesPage` eksik `ListEmptyState` import; `OVERNIGHT` Z4/Z5/Z8/Z11 tik güncellemesi (2026-04-18)
- [x] Dashboard kuyruk: durum güncelleme / “Send alert” hata `toast` + başarı `toast`; i18n `queueStatusFailed` / `queueAlertFailed` / `queueAlertSent`; OVERNIGHT Z3/Z4 PDF/Z6/Z12/Z14/Z15 + Z8 geniş tik (2026-04-19)
- [x] OVERNIGHT: Z5 pending HMO sayacı, Z9 perio/dental, Z10 i18n notu, Z13 şema özeti, Z17 doküman, Z19 `Bilinen riskler`; README `VITE_API_URL`; SMOKE dokümanına kod eşlemesi (2026-04-19)
- [x] GAP-053: `MedicalHistoryForm` boş tıbbi geçmişte önceki hasta verisi sıfırlanır; `apiFetch` ağ/500 için `errors.*` i18n; `ph`/`tl`/`hil` locale tamamlandı; Z11/Z18 tik + `log-agent-completion` (2026-04-19)
- [x] `FeatureModal` + `HomePage`: `landing.featureOpenInApp` / staff rotaları; `AppointmentsPage` takvim araç çubuğu `focus-visible` (2026-04-19)
- [x] `InvoicePage` HMO claim: birincil soneki + uyarı + kapsam kartı + statutory `t()`; `InvoicesListPage` mobil kart / HMO filtresi dokunma-odak (2026-04-19)
- [x] HMO staff + PhilHealth (ilk parça): fatura listesi `openHmoClaim=1` filtresi; PhilHealth dahili worksheet PDF + `InvoicePage` butonu; `TODO_CHECKLIST` iki hat planı (2026-04-19)
- [x] Kiosk `/kiosk/:slug` + README; portal `?kiosk=1` geniş kabuk + alt nav; mockup `docs/kiosk-home-mockup.png` (2026-04-19)
- [x] Portal kiosk: `usePortalKioskSuffix` + Home / Appointments iç linkleri + `PortalLayout` / korumalı rota / login / book yönlendirme aynı kaynak (2026-04-19)
- [x] Backend: `package.json` `postinstall` → `prisma generate` (kuru klon / CI’da client–şema uyumu; README hızlı başlangıç) (2026-04-19)
- [x] `App.tsx` `/kiosk/:slug` rotası + Ayarlar kiosk URL’si `/kiosk/{slug}` + panoya kopya; `PatientForm` toast/başlık i18n; README `db:smoke` (2026-04-19)
- [x] `KioskHomePage` karanlık mod + alt bağlantı odak; `SettingsPage` sekmeler / formlar; `StaffTeamPanel` `pages.settings.*` i18n + dokunma; `HmoClaimsPage` `canSetHmoClaimStatus` (2026-04-19)
- [x] **UI/i18n + portal hataları (2026-04-19):** `SkipToMainLink` yalnızca `main.tsx`; `index.html` + `HomePage` çift “içeriğe atla” kaldırıldı · dil seçici `Filipino (PH)` → `Filipino` · `translatePortalError` + `pages.portal.errors` (en/tr) · `useUiLocale` ile portal tarih/₱ formatı · portal ana/randevu durum rozetleri `queueStatus` / fatura `statusLabels` · `PatientDetailPage` Hızlı tedavi / Faturalar / Belgeler sekmesi i18n tamam · `npm run lint` yeşil
- [x] **TS + tablo arama (2026-04-19):** `HmoClaimsPage` `displayClaims` (istemci filtresi); `NotificationsPage` `displayRows`; `InvoicesListPage` kullanılmayan filtre yardımcıları kaldırıldı; `PortalAppointmentsPage` / `PortalHistoryPage` locale + ₱ formatı
- [x] **i18n `ph` overlay tamamlama (2026-04-19):** `ph-pages/common.retry`; `marketingShell.navAria`; `appointments.patientAutocomplete` + `treatmentEditor`; `patientDetail` dental/medical + `perio.loading`

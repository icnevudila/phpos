# DentEase PH — UI/UX Eksik & Yapılacaklar Listesi

> **Tarih:** 2026-05-08 | **Öncelik:** Çalışan, hazır bir proje çıkarmak
> **Kural:** Landing'de gösterilen her özellik, modülde de aynı şekilde çalışmalı

---

## 🎯 BÖLÜM A: Landing ↔ Modül Tutarlılık Tablosu

> Landing sayfasında vaat edilen her özelliğin gerçek modüldeki durumu

| # | Landing'de Gösterilen | Modül Durumu | Aksiyon |
|---|----------------------|--------------|---------|
| 1 | **Randevu Takvimi** (gün/hafta/ay) | ✅ AppointmentsPage — FullCalendar 3 görünüm | Yok |
| 2 | **Odontogram** (interaktif diş haritası) | ✅ DentalChart — 32 diş SVG + 5 yüzey + audit | Yok |
| 3 | **Hasta Kaydı** (demografik + tıbbi) | ✅ PatientList + PatientDetail + MedicalHistory | Yok |
| 4 | **Faturalama & Ödeme** | ✅ Invoices + PayMongo + PDF | Yok |
| 5 | **HMO Takibi** | ✅ HmoClaimsPage + HmoClaimDetail + Settings HMO | Yok |
| 6 | **Stok Yönetimi** | ✅ InventoryPage + adjust + alerts | Yok |
| 7 | **Dashboard & Raporlar** | ✅ Dashboard + Reports + Analytics + AgedReceivables | Yok |
| 8 | **Hasta Kuyruk** | ✅ QueuePage + PublicQueuePage | Yok |
| 9 | **Hasta Portal** (online randevu) | ✅ Portal — OTP + Book + History | Yok |
| 10 | **Kiosk** (tablet resepsiyon) | ✅ KioskHomePage | Yok |
| 11 | **SMS Bildirim** | ✅ Semaphore + Cron + NotificationsPage | Yok |
| 12 | **Periodontal Chart** | 🟡 Var ama recession/suppuration UI eksik | **FIX** |
| 13 | **X-Ray tek yerde** | 🟡 Backend upload var, XrayWorkspace (43KB) var, entegrasyon tam değil | **FIX** |
| 14 | **CSV toplu import** | ❌ API yok, UI yok | **Landing'den kaldır VEYA yap** |
| 15 | **Offline / PWA** | ❌ Service worker yok | **Landing'den kaldır** |
| 16 | **Multi-branch** | ❌ Tek clinicId | **Landing'de "Coming Soon" yap** |
| 17 | **Google Calendar sync** | ❌ Yok | **Landing'den kaldır** |
| 18 | **Email bildirim** | ❌ Yok | **Landing'de sadece SMS göster** |
| 19 | **AI özellikler** | ❌ Yok (M11) | **Landing'de "Coming Soon" yap** |
| 20 | **Waitlist / recurring** | ✅ WaitlistPage var | Yok |

### Acil Landing Düzeltmeleri
- [ ] "Offline-first" → kaldır veya "Cloud-based" yap
- [ ] "Multi-branch" → "Coming Soon" rozeti ekle
- [ ] "Google Calendar" → kaldır
- [ ] "CSV import" → kaldır veya "Coming Soon"
- [ ] Footer linkleri → gerçek sayfalara yönlendir (Privacy, Terms, About, Contact — **zaten var**)
- [ ] Testimonials → "Sample scenarios" etiketi veya kaldır
- [ ] DeviceMockups fake metrikler → "Illustrative" etiketi

---

## 🔴 BÖLÜM B: KRİTİK BUG FIX (Öncelik 1 — Hemen)

| # | Bug | Dosya | Çözüm | Süre |
|---|-----|-------|-------|------|
| B1 | `MedicalHistoryForm` hata yutuyor `.catch(() => {})` | `components/patient/MedicalHistoryForm.tsx` | Error state + retry butonu | 30dk |
| B2 | `InvoicesListPage` satır tıklama full reload | `pages/InvoicesListPage.tsx` | `window.location.href` → `<Link>` | 15dk |
| B3 | `PortalBookPage` tarih cache bug | `portal/pages/PortalBookPage.tsx` | `useMemo` dep array düzelt | 15dk |
| B4 | `PortalHistoryPage` `checkoutUrl` vs `url` sözleşme | `portal/pages/PortalHistoryPage.tsx` | Backend response formatı birleştir | 30dk |
| B5 | `PeriodontalChart` update çağrılmıyor | `components/perio/PeriodontalChart.tsx` | Edit mode + `recession`/`suppuration` ekle | 1.5s |
| B6 | 4 tabloda mobile overflow kırık | PatientList, InvoicesList, Inventory, Notifications | `overflow-x-auto` + `min-w` | 1s |
| B7 | `InventoryPage` i18n karışık (TR+EN) | `pages/InventoryPage.tsx` | Tüm string'leri `t()` ile sar | 45dk |
| B8 | `ProtectedRoute` roles kullanılmıyor | `App.tsx` | RoleGuard ekle (inventory, staff, vb.) | 30dk |

---

## 🟡 BÖLÜM C: EKSİK UI/UX SAYFALARI (Öncelik 2)

### C1. PatientDetail Eksik Sekmeler

| # | Sekme | Durum | Ne Yapılacak | Backend | Süre |
|---|-------|-------|-------------|---------|------|
| C1.1 | **X-Ray / Medya Galerisi** | 🟡 | XrayWorkspace.tsx var (43KB), PatientDetail'e entegre et | Upload API var | 1s |
| C1.2 | **Reçete (Prescription)** | 🟡 | PrescriptionsTab.tsx var (10KB), backend endpoint kontrol | prescription.service var | 1s |
| C1.3 | **Treatment Plan** | ❌ | TreatmentRoadmapTimeline.tsx var (31KB), multi-visit bağla | treatment.service var | 2s |
| C1.4 | **Consent Forms** | ❌ | PDF form generate var, e-imza UI yok | patientFormsPdf.ts var | 2s |
| C1.5 | **Patient HMO** | ✅ | PatientHmoPanel.tsx var, entegre | hmo.service var | — |

### C2. Auth & Staff

| # | Sayfa | Durum | Süre |
|---|-------|-------|------|
| C2.1 | **Forgot/Reset Password** | ❌ Backend + Frontend | 2s |
| C2.2 | **StaffPage dolu içerik** | 🟡 790 bytes placeholder → StaffTeamPanel zaten Settings'te var | 1s |
| C2.3 | **Portal Register** (yeni hasta) | ❌ | 2s |

### C3. Raporlama

| # | Sayfa | Durum | Süre |
|---|-------|-------|------|
| C3.1 | **CSV export tüm listelere** | ❌ InventoryPage'de var, diğerlerinde yok | 2s |
| C3.2 | **BIR Journal Export** | ❌ PH yasal | 2s |
| C3.3 | **HMO Reconciliation raporu** | ❌ | 2s |

### C4. Bildirim & İletişim

| # | Sayfa | Durum | Süre |
|---|-------|-------|------|
| C4.1 | **Notification Settings** (şablon + quiet hours) | ❌ | 2s |
| C4.2 | **Email kanalı (Resend)** | ❌ | 3s |
| C4.3 | `services/notifications.ts` frontend refactor | ❌ Endpointler sayfaya gömülü | 1s |

---

## 🟢 BÖLÜM D: UX İYİLEŞTİRMELER (Öncelik 3)

| # | İyileştirme | Dosya | Süre |
|---|------------|-------|------|
| D1 | Odontogram optimistic update | DentalChart.tsx | 1.5s |
| D2 | Odontogram batch save endpoint | teeth.service.ts | 1s |
| D3 | Tooth history sayfalama | teeth.service.ts | 30dk |
| D4 | Homepage lazy load (37 bileşen) | HomePage.tsx | 1s |
| D5 | DashboardPage 94KB → widget'lara böl | DashboardPage.tsx | 3s |
| D6 | Dark mode toggle header'da net | AppLayout.tsx | 30dk |
| D7 | Dokunma hedefleri 36px → 44px (WCAG) | Global | 1s |
| D8 | ARIA labels (tablist, alert, pressed) | Portal + Perio | 1s |
| D9 | Fluid tipografi (clamp) | index.css | 30dk |
| D10 | `AppointmentDetailSidebar` silme confirm → modal | Component | 30dk |

---

## 📊 BÖLÜM E: SAYFA BAZLI KABUL KRİTERLERİ

### Dashboard ✅ → Polish
- [ ] 94KB dosyayı widget'lara böl
- [ ] Boş veri durumunda açıklayıcı mesajlar (zaten var, doğrula)
- [ ] Mobile summary satırı görünür olmalı
- [ ] Tüm para değerleri ₱ formatında

### Appointments ✅ → Polish
- [ ] Hafta/ay görünümü çalışıyor mu doğrula
- [ ] Mobile'de takvim listDay görünümü
- [ ] Çakışma UI mesajı (409 cevabında)

### Patient List ✅ → Polish
- [ ] Mobile tablo overflow fix
- [ ] HMO rozet kolonu (PatientHmoPanel zaten var)
- [ ] CSV export butonu

### Patient Detail ✅ → Extend
- [ ] Mevcut 8 sekme çalışıyor mu doğrula
- [ ] XrayWorkspace entegrasyonu
- [ ] PrescriptionsTab entegrasyonu
- [ ] TreatmentRoadmapTimeline entegrasyonu
- [ ] Treatment `toothIds` ham gösterimini etiketle

### Invoices ✅ → Fix
- [ ] Link bug fix (B2)
- [ ] HMO rozet render
- [ ] Senior/PWD indirimi (PH legal — ertelenebilir)

### HMO Claims ✅ → Doğrula
- [ ] Claim oluştur → onay → faturaya bağla akışı test
- [ ] Claim filtre + arama çalışıyor

### Inventory ✅ → Polish
- [ ] i18n karışıklık düzelt (B7)
- [ ] Barkod yazdır butonu (Zebra entegrasyonu sonrası)

### Settings ✅ → Doğrula
- [ ] Clinic profil kaydetme çalışıyor
- [ ] HMO Providers CRUD çalışıyor
- [ ] Staff Team paneli çalışıyor
- [ ] Dentist Licenses paneli çalışıyor

### Portal ✅ → Fix
- [ ] OTP akışı test (devCode ile)
- [ ] Book tarih bug fix (B3)
- [ ] History payment bug fix (B4)
- [ ] Mobile responsive doğrula

---

## 📋 TOPLAM ÖZET

| Kategori | Sayı | Tahmini Süre |
|----------|------|-------------|
| 🔴 Kritik Bug Fix | 8 | ~5 saat |
| 🟡 Eksik Sayfalar | 11 | ~20 saat |
| 🟢 UX İyileştirme | 10 | ~12 saat |
| Landing Tutarlılık | 7 düzeltme | ~3 saat |
| **TOPLAM** | **36 madde** | **~40 saat** |

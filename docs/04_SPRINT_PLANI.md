# DentEase PH — Bölüm 4: Haftalık Sprint Planı (Deployment Öncesi)

> **Başlangıç:** 2026-05-08 | **Süre:** 2 Hafta (10 iş günü)
> **Hedef:** Canlıya çıkış için tüm kritik eksiklerin kapatılması

---

## Sprint Özet Tablosu

| Hafta | Odak | Gün |
|-------|------|-----|
| **Hafta 1** | Güvenlik + Performans + Kritik UI | Gün 1-5 |
| **Hafta 2** | Entegrasyonlar + Test + Deploy | Gün 6-10 |

---

## HAFTA 1 — Temel Sağlamlaştırma

### 📅 GÜN 1 (Perşembe) — Güvenlik Sertleştirme

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 1.1 | PayMongo webhook HMAC imza doğrulaması | 2s | 🔴 | `invoice.service.ts` |
| 1.2 | `/auth/register` ALLOW_PUBLIC_REGISTER kilidi | 1s | 🔴 | `auth.routes.ts`, `.env` |
| 1.3 | CORS origin boşken prod'da başlatma engelle | 30dk | 🟡 | `app.ts` |
| 1.4 | Refresh token rotation (yeni refresh dön) | 1.5s | 🟡 | `auth.service.ts` |
| 1.5 | Global audit log middleware | 2s | 🟡 | `middleware/auditLog.ts` (yeni) |

**Çıktı:** Güvenlik kritik 5 madde kapatılmış, audit log middleware aktif.

---

### 📅 GÜN 2 (Cuma) — SQL & Backend Optimizasyonu

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 2.1 | Dashboard endpoint'i 4'e böl (summary/queue/charts/alerts) | 3s | 🔴 | `reports.service.ts`, `reports.routes.ts` |
| 2.2 | Analytics N+1 query düzeltme (12 döngü → tek sorgu) | 1.5s | 🟡 | `analytics.service.ts` |
| 2.3 | Veritabanı index migration oluştur | 1s | 🟡 | `prisma/migrations/` |
| 2.4 | Inventory alert'ı DB seviyesinde filtrele | 30dk | 🟢 | `reports.service.ts` |
| 2.5 | Revenue aggregation raw SQL'e çevir | 1s | 🟡 | `reports.service.ts` |

**Çıktı:** Dashboard response süresi %60-70 düşmüş, indeksler eklenmiş.

---

### 📅 GÜN 3 (Cumartesi) — Frontend Refactor & Bug Fix

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 3.1 | DashboardPage.tsx 94KB → 8 widget bileşene böl | 3s | 🔴 | `pages/DashboardPage.tsx` |
| 3.2 | InvoicesListPage `window.location.href` → `Link` | 15dk | 🔴 | `InvoicesListPage.tsx` |
| 3.3 | MedicalHistoryForm hata yutucu düzelt | 30dk | 🔴 | `MedicalHistoryForm.tsx` |
| 3.4 | 4 tabloda `overflow-x-auto` mobile fix | 1s | 🟡 | PatientList, Invoices, Inventory, Notifications |
| 3.5 | PortalBookPage tarih cache bug fix | 30dk | 🟡 | `PortalBookPage.tsx` |
| 3.6 | NotificationsPage → `services/notifications.ts` refactor | 1s | 🟡 | frontend/services/ |

**Çıktı:** Kritik frontend buglar kapatılmış, DashboardPage modüler.

---

### 📅 GÜN 4 (Pazar) — Eksik UI Sayfaları (Batch 1)

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 4.1 | X-Ray / Medya Galerisi sekmesi (PatientDetail) | 3s | 🔴 | `components/patient/MediaGalleryTab.tsx` |
| 4.2 | Forgot/Reset Password akışı (backend + frontend) | 2s | 🔴 | `auth.routes.ts` + `ForgotPasswordPage.tsx` |
| 4.3 | Portal Register sayfası (yeni hasta kaydı) | 2s | 🟡 | `portal/pages/PortalRegisterPage.tsx` |

**Çıktı:** X-ray galerisi çalışır, şifre sıfırlama aktif, portal kayıt mümkün.

---

### 📅 GÜN 5 (Pazartesi) — Eksik UI Sayfaları (Batch 2)

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 5.1 | Prescription (Reçete) sekmesi + PDF | 3s | 🔴 | `components/patient/PrescriptionForm.tsx` |
| 5.2 | Multi-Visit Treatment Plan sekmesi | 2s | 🟡 | `components/patient/TreatmentPlanTab.tsx` |
| 5.3 | Consent Forms (e-imza) paneli | 2s | 🟡 | `components/patient/ConsentPanel.tsx` |

**Çıktı:** PatientDetail sayfası 11 sekmeli (+ Rx, Treatment Plan, Consent).

---

## HAFTA 2 — Entegrasyonlar & Deploy

### 📅 GÜN 6 (Salı) — Zebra Yazıcı Entegrasyonu

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 6.1 | `services/zebraPrint.ts` — Browser Print SDK wrapper | 2s | 🔴 | frontend/services/ |
| 6.2 | ZPL şablonları (hasta etiketi, stok barkod, fatura) | 1.5s | 🔴 | frontend/services/ |
| 6.3 | Backend TCP proxy endpoint (ağ yazıcılar) | 1s | 🟡 | `routes/printer.routes.ts` |
| 6.4 | Inventory sayfasına "Barkod Yazdır" butonu | 1s | 🟡 | `InventoryPage.tsx` |
| 6.5 | PatientDetail'e "Etiket Yazdır" butonu | 30dk | 🟢 | `PatientDetailPage.tsx` |
| 6.6 | Yazıcı bağlantı testi + hata yönetimi | 1s | 🔴 | Test |

**Çıktı:** Zebra USB ve ağ yazıcılara yazdırma çalışır.

---

### 📅 GÜN 7 (Çarşamba) — AI Chatbot API Entegrasyonu

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 7.1 | Backend chatbot gateway endpoint | 2s | 🔴 | `routes/chatbot.routes.ts` |
| 7.2 | Chatbot query service (6 sorgu tipi) | 2s | 🔴 | `services/chatbot.service.ts` |
| 7.3 | API key + rate limit + data masking | 1s | 🔴 | middleware |
| 7.4 | Frontend ChatbotWidget (iframe embed) | 1s | 🟡 | `components/ChatbotWidget.tsx` |
| 7.5 | Next.js chatbot'ta tool calling config | 1s | 🟡 | Vercel projesi |

**Çıktı:** AI chatbot DentEase veritabanından güvenli sorgu yapabilir.

---

### 📅 GÜN 8 (Perşembe) — SVG Odontogram İyileştirme + i18n

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 8.1 | Odontogram optimistic update | 1.5s | 🟡 | `DentalChart.tsx` |
| 8.2 | Batch teeth save endpoint | 1s | 🟡 | `patient.routes.ts` |
| 8.3 | Tooth history sayfalama (200 limit kaldır) | 1s | 🟢 | `teeth.service.ts` |
| 8.4 | Staff UI i18n taraması — en az 10 kritik sayfa | 3s | 🟡 | Tüm staff sayfalar |

**Çıktı:** Odontogram daha hızlı, history sayfalanır, 10 sayfa i18n'li.

---

### 📅 GÜN 9 (Cuma) — Smoke Test & Integration Test

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 9.1 | End-to-end akış testi: Kayıt → Randevu → Tedavi → Fatura → Ödeme | 2s | 🔴 | Manuel test |
| 9.2 | HMO claim akışı testi: Oluştur → Onayla → Faturaya bağla | 1s | 🔴 | Manuel test |
| 9.3 | Portal akışı: OTP giriş → Randevu al → Geçmiş gör | 1s | 🔴 | Manuel test |
| 9.4 | Zebra yazıcı fiziksel test (USB + ağ) | 1s | 🔴 | Donanım |
| 9.5 | AI chatbot tool calling testi (6 sorgu tipi) | 1s | 🟡 | Vercel |
| 9.6 | Mobile responsive test (5 ekran boyutu) | 1s | 🟡 | DevTools |

**Çıktı:** Tüm kritik akışlar doğrulanmış, bug listesi çıkarılmış.

---

### 📅 GÜN 10 (Cumartesi) — Deployment & Go-Live

| # | Görev | Süre | Öncelik | Dosya |
|---|-------|------|---------|-------|
| 10.1 | `.env.production` hazırla (tüm secret'lar) | 1s | 🔴 | Backend + Frontend |
| 10.2 | PostgreSQL prod migration çalıştır | 30dk | 🔴 | `prisma db push` |
| 10.3 | Frontend prod build + Vercel/Netlify deploy | 1s | 🔴 | `npm run build` |
| 10.4 | Backend prod deploy (Railway/Render/VPS) | 1s | 🔴 | Docker/PM2 |
| 10.5 | CORS_ORIGIN prod domain'leri ayarla | 15dk | 🔴 | `.env` |
| 10.6 | SSL sertifika doğrula | 15dk | 🔴 | Hosting |
| 10.7 | Gün 9 bug listesindeki P0 buglar düzelt | 2s | 🔴 | Çeşitli |
| 10.8 | Smoke test prod ortamında | 1s | 🔴 | Canlı |

**Çıktı:** Sistem canlıda, tüm akışlar çalışıyor.

---

## Sprint Metrikleri

```
Toplam Görev:     ~52
Kritik (🔴):       28
Yüksek (🟡):       18
Normal (🟢):        6

Tahmini Toplam:    ~80 saat (2 hafta × 8 saat/gün)
```

## Risk Tablosu

| Risk | Olasılık | Etki | Mitigasyon |
|------|----------|------|------------|
| Zebra Browser Print uyumsuzluk | Orta | Yüksek | Backend TCP proxy fallback |
| PayMongo staging→prod geçiş sorunu | Düşük | Yüksek | Sandbox'ta detaylı test |
| AI chatbot rate limit / maliyet | Orta | Orta | Query cache + günlük limit |
| PostgreSQL prod migration hatası | Düşük | Kritik | Backup + rollback planı |
| i18n eksik key runtime hatası | Yüksek | Düşük | Fallback dil (en) aktif |

---

## Öncelik Sıralaması (Eğer Zaman Yetmezse)

1. ✅ Güvenlik sertleştirme (Gün 1) — **MUTLAKA**
2. ✅ SQL optimizasyon (Gün 2) — **MUTLAKA**
3. ✅ Kritik bug fix (Gün 3) — **MUTLAKA**
4. ⚡ X-Ray galeri + Şifre sıfırlama (Gün 4) — **ÇOK ÖNEMLİ**
5. ⚡ Zebra entegrasyonu (Gün 6) — **ÖNEMLİ**
6. 🔄 AI chatbot (Gün 7) — **ERTELENEBİLİR** (v1.1)
7. 🔄 Reçete + Treatment Plan (Gün 5) — **ERTELENEBİLİR** (v1.1)
8. 🔄 i18n tam kapsam (Gün 8) — **ERTELENEBİLİR** (aşamalı)

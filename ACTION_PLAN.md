# DentEase PH — Hızlı Eylem Planı

> Son güncelleme: 2026-04-26
> Hedef: Kritik eksikleri kapat, sistemi satışa hazır hale getir.

## ✅ Zaten Tamamlanan (Yeniden yapma)

| # | Öğe | Durum |
|---|-----|-------|
| 1 | 6 Görselleştirme Modülü (Perio, X-Ray, Timeline, Floor Plan, Before/After, TMJ) | ✅ Tamam |
| 2 | `GET /api/auth/me` endpoint | ✅ Tamam |
| 3 | `NotFoundPage` + `ProtectedRoute` roles aktif | ✅ Tamam |
| 4 | Tablolar `overflow-x-auto` | ✅ Tamam |
| 5 | `MedicalHistoryForm` hata gösterimi (GAP-053) | ✅ Tamam |
| 6 | `PortalBookPage` tarih refresh bug'ı (GAP-049) | ✅ Tamam |
| 7 | CORS allowlist + rate limiting | ✅ Tamam |
| 8 | PayMongo webhook HMAC doğrulama (GAP-002) | ✅ Tamam |
| 9 | GAP-001: Public static dosyalar kaldırıldı, signed URL yorumu eklendi | ✅ Tamam |
| 10 | AuditLog + PhiAccessLog middleware | ✅ Tamam |
| 11 | Dashboard kuyruk + operasyon widget'ları | ✅ Tamam |
| 12 | HMO claim durum makinesi + ek dosya yükleme | ✅ Tamam |
| 13 | i18n staff sayfaları (çoğu tamam) | ✅ Tamam |
| 14 | `npm run lint` + `npm run build` yeşil | ✅ Tamam |

---

## 🔴 Kritik — Satış Blocker (Hemen Yapılacak)

### P1: BIR / PH Yasal Uyum (~2 saat)

| # | Görev | Dosya(lar) | Açıklama |
|---|-------|-----------|----------|
| P1.1 | `Clinic` modeline `tin`, `birPtuNo`, `birAccreditationNo` ekle | `prisma/schema.prisma` | BIR zorunlu alanlar |
| P1.2 | `Invoice` modeline VAT/indirim alanları ekle | `prisma/schema.prisma` | `vatRate`, `vatAmount`, `seniorDiscount`, `pwdDiscount`, `vatExempt` |
| P1.3 | Prisma migration oluştur + seed güncelle | `prisma/`, `seed.ts` | Yeni alanlar için migration |
| P1.4 | Invoice PDF'te `₱` sembolü fix | `services/invoicePdf.ts` | NotoSans font embed ile `±` sorununu çöz |
| P1.5 | Invoice PDF'te watermark ekle | `services/invoicePdf.ts` | UNPAID/DRAFT/VOID çapraz watermark |
| P1.6 | Invoice PDF'te TIN + PTU no. göster | `services/invoicePdf.ts` | BIR-compliant header |
| P1.7 | Invoice oluşturmada Senior/PWD auto-discount | `services/invoice.service.ts` | `isSeniorCitizen` / `pwdIdNo` kontrolü + %20 indirim |

### P2: Güvenlik Sertleştirme (~30 dk)

| # | Görev | Dosya(lar) | Açıklama |
|---|-------|-----------|----------|
| P2.1 | `ALLOW_PUBLIC_REGISTER` env ile `/auth/register` kilitle | `routes/auth.routes.ts` | GAP-003 |
| P2.2 | Portal OTP ayrı rate limit | `app.ts` veya `routes/portal.routes.ts` | GAP-004 ek |
| P2.3 | Webhook IP allowlist opsiyonu | `app.ts` | GAP-002 ek |

### P3: UI/UX Hızlı Fix (~1 saat)

| # | Görev | Dosya(lar) | Açıklama |
|---|-------|-----------|----------|
| P3.1 | `InvoicePage` "Pay with GCash / Maya" düzeltme | `pages/InvoicePage.tsx` | Sadece GCASH değil, MAYA da seçilebilir olsun |
| P3.2 | `LoginPage` i18n kullanımı | `pages/LoginPage.tsx` | `auth.*` key'leri kullan |
| P3.3 | `DashboardPage` dark mode + widget tutarlılığı | `pages/DashboardPage.tsx` | Fuchsia/violet kaldır |

---

## 🟡 Yüksek Öncelik — Hafta Sonu

### P4: HMO UI Tamamlama (~4 saat)

| # | Görev | Dosya(lar) |
|---|-------|-----------|
| P4.1 | `HmoProvidersPage` CRUD UI | `pages/HmoProvidersPage.tsx` (yeni) |
| P4.2 | `PatientHmoTab` hasta detayda | `pages/PatientDetailPage.tsx` sekmesi |
| P4.3 | `HmoClaimDetailPage` derinlemesine | `pages/HmoClaimDetailPage.tsx` |
| P4.4 | Dashboard "Pending HMO Claims" widget | `pages/DashboardPage.tsx` |

### P5: PDF/Excel Altyapı (~6 saat)

| # | Görev | Dosya(lar) |
|---|-------|-----------|
| P5.1 | PDF tema sistemi (theme.ts, fonts.ts, components/) | `lib/pdf/` (yeni) |
| P5.2 | Z-Report + X-Report PDF | `services/zReportPdf.ts` |
| P5.3 | Reçete (Rx) PDF | `services/prescriptionPdf.ts` |
| P5.4 | 8 yeni PDF türü (MedCert, Referral, HMO, PhilHealth, SOA, TreatmentPlan, SterilLog, LabOrder) | `services/*.ts` |
| P5.5 | Excel export altyapısı (exceljs) | `lib/xlsx/` |
| P5.6 | Patient + Appointment export | `routes/exports.routes.ts` |

### P6: İletişim Genişletme (~3 saat)

| # | Görev | Dosya(lar) |
|---|-------|-----------|
| P6.1 | Email kanalı (Resend adapter) | `lib/resend.ts`, `services/notification/email.ts` |
| P6.2 | SMS şablon yönetimi UI | `pages/NotificationSettingsPage.tsx` |
| P6.3 | 15 bildirim şablonu (3 dil × 5 template) | `templates/sms/*.ts`, `templates/email/*.html` |

---

## 🟢 Orta Öncelik — Sonraki Sprint

### P7: Klinik Akışı Genişletme

- Recalls, Waitlist, Treatment Plan modelleri
- Prescription (Rx) yazma UI
- Consent e-imza
- X-ray + intraoral galeri
- Lab order tracking

### P8: Landing Tutarlılığı

- Footer linkleri gerçek sayfalara yönlendir
- Fake testimonial temizliği
- Mockup "illustrative" etiketi
- Cookie consent banner

### P9: Design System

- 18 ortak UI bileşeni
- Tailwind tema token'ları
- Dark mode staff
- Storybook

---

## 📊 İlerleme Takibi

| Faz | Tamamlanan | Toplam | Durum |
|-----|-----------|--------|-------|
| P0 Quick Wins | 14 | 14 | ✅ %100 |
| P1 BIR Yasal | 0 | 7 | 🔴 %0 |
| P2 Güvenlik | 0 | 3 | 🔴 %0 |
| P3 UI Fix | 0 | 3 | 🟡 %0 |
| P4 HMO UI | 0 | 4 | 🟡 %0 |
| P5 PDF/Excel | 0 | 6 | 🟡 %0 |
| P6 İletişim | 0 | 3 | 🟡 %0 |
| P7-P9 Yol Haritası | - | - | 🟢 Plan |

**Toplam Kritik:** 13 görev
**Tahmini Süre:** ~8-10 saat (1 geliştirici)

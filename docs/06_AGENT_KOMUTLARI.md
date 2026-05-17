# DentEase PH — Agent Görev Komutları

> Bu dosyadaki komutları diğer AI agent'lara (Claude, Gemini, vb.) doğrudan yapıştırarak görev verebilirsin.
> Her görev bağımsızdır, paralel çalıştırılabilir.

---

## 🔴 GÖREV 1: Kritik Bug Fix (Öncelik: EN YÜKSEK)

```
Proje: C:\Users\TP2\Documents\filipin mvp
Görev: Aşağıdaki 8 kritik bug'ı düzelt. Her düzeltme için dosya yolunu ve sorunu veriyorum:

1. frontend/src/components/patient/MedicalHistoryForm.tsx — `.catch(() => { /* ignore */ })` hata yutuyor. Hata durumunda error state göster + retry butonu ekle.

2. frontend/src/pages/InvoicesListPage.tsx — Satır tıklama `window.location.href` ile full page reload yapıyor. React Router `<Link to={...}>` kullan.

3. frontend/src/portal/pages/PortalBookPage.tsx — `nextNDays(14)` `useMemo(() => ..., [])` mount'a kilitli. Dependency array'e gün bazlı key ekle.

4. frontend/src/portal/pages/PortalHistoryPage.tsx — Backend `url` dönüyor ama frontend `checkoutUrl` bekliyor olabilir. Response field'ını kontrol et, uyumsuzluk varsa düzelt.

5. frontend/src/components/perio/PeriodontalChart.tsx — `updatePerioExam` backend'de var ama UI çağırmıyor. Edit mode ekle, `recession` ve `suppuration` input alanlarını UI'a ekle.

6. 4 tabloda mobile overflow kırık: PatientList.tsx, InvoicesListPage.tsx, InventoryPage.tsx, NotificationsPage.tsx — Dış wrapper'lara `overflow-x-auto` ekle, tabloya `min-w-[800px]` ekle.

7. frontend/src/pages/InventoryPage.tsx — i18n karışık (Türkçe "Stok uyarıları" + İngilizce "Inventory" aynı ekranda). Tüm hard-coded string'leri `t()` ile sar.

8. frontend/src/App.tsx — ProtectedRoute `roles` prop'u kullanılmıyor. /inventory rotasına `RoleGuard roles={["ADMIN","DENTIST"]}` ekle. /staff zaten var, doğrula.

Kabul kriteri: Tüm 8 bug düzeltilmiş, TypeScript hata vermemeli, mevcut fonksiyonalite bozulmamalı.
```

---

## 🔴 GÖREV 2: Güvenlik Sertleştirme

```
Proje: C:\Users\TP2\Documents\filipin mvp
Referans doküman: docs/02_DARBOGAZLAR.md

Görev: Aşağıdaki 5 güvenlik açığını kapat:

1. PayMongo webhook HMAC imza doğrulaması — backend/src/services/invoice.service.ts veya ilgili webhook handler'da `Paymongo-Signature` header'ını HMAC SHA256 ile doğrula. `PAYMONGO_WEBHOOK_SECRET` env değişkeni zorunlu olsun. İmzasız istekleri 400 ile reddet.

2. `/auth/register` kilitle — backend/src/routes/auth.routes.ts'de `ALLOW_PUBLIC_REGISTER` env değişkeni `true` olmadıkça register endpoint'i 403 dönsün.

3. CORS origin production'da boşken uyar — backend/src/app.ts — zaten uyarı var, prod'da boşken app başlatmayı engelle (process.exit veya throw).

4. Refresh token rotation — backend/src/services/auth.service.ts — `/auth/refresh` endpoint'i yeni bir refresh token da dönsün, eski refresh token'ı invalidate etsin.

5. Global audit log middleware — backend/src/middleware/auditLog.ts oluştur. Her mutasyon (POST/PUT/PATCH/DELETE) için `AuditLog` tablosuna kayıt at: userId, clinicId, method, path, entity, entityId, timestamp, ip. Prisma schema'ya `AuditLog` modeli ekle.

Kabul kriteri: `npm run build` hatasız, güvenlik açıkları kapatılmış.
```

---

## 🟡 GÖREV 3: SQL & Backend Optimizasyon

```
Proje: C:\Users\TP2\Documents\filipin mvp
Referans doküman: docs/02_DARBOGAZLAR.md

Görev:

1. backend/src/services/reports.service.ts — `buildDashboard()` fonksiyonunu 4 ayrı endpoint'e böl:
   - GET /api/reports/dashboard/summary (4 metrik kart)
   - GET /api/reports/dashboard/queue (kuyruk satırları)
   - GET /api/reports/dashboard/charts (revenueByDay, revenueByMonth, topProcedures)
   - GET /api/reports/dashboard/alerts (inventoryAlerts, pendingHmoClaims)
   Frontend DashboardPage'de bu 4 endpoint'i paralel çağır.

2. backend/src/services/analytics.service.ts — `getAnalyticsOverview()` içindeki 12 aylık for döngüsünü tek raw SQL sorgusuna çevir. N+1 pattern'i kaldır.

3. Prisma migration ile performans indeksleri ekle:
   - Appointment(clinicId, scheduledAt)
   - Appointment(dentistId, status)
   - Payment(paidAt)
   - Payment(invoiceId, paidAt)
   - Treatment(patientId, procedure)
   - HmoClaim(clinicId, status)

4. Inventory alert hesabını JS filtresinden DB WHERE clause'a taşı.

Kabul kriteri: Dashboard endpoint response süresi ölçülebilir şekilde düşmüş, build hatasız.
```

---

## 🟡 GÖREV 4: Eksik PatientDetail Sekmeleri

```
Proje: C:\Users\TP2\Documents\filipin mvp
Referans doküman: docs/05_UI_UX_YAPILACAKLAR.md — Bölüm C1

Görev: PatientDetail sayfasına eksik sekmeleri entegre et. NOT: Bazı bileşenler ZATEN VAR, sadece entegrasyon gerekiyor.

1. X-Ray / Medya Galerisi — frontend/src/components/patient/XrayWorkspace.tsx (43KB) zaten mevcut. PatientDetailPage.tsx'teki sekmeler arasına bu bileşeni ekle. Backend'de `patientFileStorage.ts` ile dosya yükleme zaten var.

2. Reçete (Prescriptions) — frontend/src/components/patient/PrescriptionsTab.tsx (10KB) zaten mevcut. Backend'de prescription.service.ts + prescription.controller.ts var. PatientDetail sekmelerine entegre et.

3. Treatment Plan — frontend/src/components/patient/TreatmentRoadmapTimeline.tsx (31KB) zaten mevcut. PatientDetail sekmelerine entegre et.

4. Treatment `toothIds` ham gösterimi düzelt — tedavi listesinde `toothIds` dizisi ham gösteriliyor, diş numaralarını okunabilir etiketlere çevir (ör. "#14, #15 (Premolar)").

Kabul kriteri: PatientDetail sayfasında 11 çalışan sekme: Overview, Medical, Dental, Perio, X-Ray, Prescriptions, Treatment Plan, Appointments, Treatments, Invoices, Documents. Her sekme veri yükleyebilmeli.
```

---

## 🟡 GÖREV 5: Landing Sayfa Tutarlılık Düzeltmeleri

```
Proje: C:\Users\TP2\Documents\filipin mvp
Referans doküman: docs/05_UI_UX_YAPILACAKLAR.md — Bölüm A

Görev: Landing sayfasındaki vaatleri gerçek durumla eşitle.

1. frontend/src/pages/HomePage.tsx ve ilgili landing bileşenlerinde:
   - "Offline-first" / "PWA" / "works offline" ifadelerini kaldır veya "Cloud-based" ile değiştir
   - "Multi-branch" özelliğine "Coming Soon" rozeti ekle
   - "Google Calendar sync" ifadesini kaldır
   - "CSV import" ifadesine "Coming Soon" rozeti ekle
   - "AI" özelliklerine "Coming Soon" rozeti ekle

2. Landing footer linkleri: Privacy, Terms, About, Contact, FAQ, Pricing sayfaları ZATEN VAR (App.tsx'te rotalar mevcut). Footer'daki linklerin doğru rotalara gittiğini doğrula, `to="/"` olanları düzelt.

3. frontend/src/components/landing/DeviceMockups.tsx — Fake metrikler ("HMO claims: 6" vb.) yanına küçük "Illustrative" etiketi ekle.

4. Testimonials bileşeninde uydurma isimler varsa "Sample scenario" etiketi ekle.

Kabul kriteri: Landing'de vaat edilen her şey ya gerçekten çalışıyor ya da açıkça "Coming Soon" olarak işaretli.
```

---

## 🟢 GÖREV 6: Zebra Yazıcı Entegrasyonu

```
Proje: C:\Users\TP2\Documents\filipin mvp
Referans doküman: docs/03_ENTEGRASYONLAR.md — Bölüm 1

Görev: Zebra barkod/etiket yazıcı entegrasyonu.

1. frontend/src/services/zebraPrint.ts oluştur:
   - getAvailablePrinters() — Zebra Browser Print SDK (localhost:9100)
   - printZpl(printerUid, zpl) — ZPL komutu gönder
   - patientLabelZpl(patient) — hasta bilgi etiketi
   - inventoryBarcodeZpl(item) — stok barkod etiketi

2. InventoryPage.tsx'e "Barkod Yazdır" butonu ekle — seçili stok öğesi için ZPL gönder.

3. PatientDetailPage.tsx'e "Etiket Yazdır" butonu ekle — hasta bilgi etiketi.

4. Backend TCP proxy (opsiyonel): backend/src/routes/printer.routes.ts — ağ yazıcılar için net.Socket ile doğrudan TCP bağlantısı.

5. Yazıcı bulunamazsa kullanıcıya "Zebra Browser Print uygulamasını yükleyin" mesajı göster.

Kabul kriteri: USB Zebra yazıcıya hasta etiketi ve stok barkodu yazdırılabilmeli. Yazıcı yoksa graceful error.
```

---

## Paralel Çalışma Matrisi

```
Görev 1 (Bug Fix)      → BAĞIMSIZ, hemen başla
Görev 2 (Güvenlik)      → BAĞIMSIZ, hemen başla
Görev 3 (SQL)           → BAĞIMSIZ, hemen başla
Görev 4 (PatientDetail) → BAĞIMSIZ, hemen başla
Görev 5 (Landing)       → BAĞIMSIZ, hemen başla
Görev 6 (Zebra)         → BAĞIMSIZ, hemen başla

Hepsi paralel çalışabilir. Çakışma riski düşük — farklı dosyalara dokunuyorlar.
```

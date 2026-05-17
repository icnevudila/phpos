# DentEase PH — Bölüm 2: Mimari Darboğaz Analizi

> **Tarih:** 2026-05-08 | **Proje:** `C:\Users\TP2\Documents\filipin mvp`

---

## 1. Backend Performans Darboğazları

### 1.1 Dashboard Mega-Query (reports.service.ts — 930 satır)

**Sorun:** `buildDashboard()` fonksiyonu tek bir çağrıda **15 ayrı Prisma sorgusu** çalıştırıyor (`Promise.all` ile paralel). Her klinik sayfası yüklenişinde bu devasa sorgu seti çalışır.

```typescript
// Mevcut durum — 15 sorgu tek seferde
const [
  todayAppointments,     // COUNT
  todayCompleted,        // COUNT  
  todayPayments,         // findMany
  monthAppointments,     // COUNT
  monthNewPatients,      // COUNT
  monthPayments,         // findMany
  last30Payments,        // findMany
  topProcedures,         // findMany (YTD tüm tedaviler!)
  statusGroups,          // groupBy
  todayList,             // findMany + include
  pendingHmoClaims,      // COUNT
  inventoryRows,         // findMany (TÜM stok!)
  activePlan,            // findFirst + include treatments
  waitlistRowsRaw,       // findMany
  last12MonthsPayments,  // findMany (12 AYLIK veri!)
] = await Promise.all([...]);
```

**Etki:** 
- 500+ hasta/10K+ tedavi olan klinik: response süresi 3-8 saniye
- `last12MonthsPayments` + `topProcedures` YTD tüm veriyi çekiyor
- `inventoryRows` TÜM stok satırlarını çekip JS'de filtreliyor

**Çözüm Önerisi:**
```typescript
// 1. Dashboard'u segment'lere böl
GET /api/dashboard/summary     // Sadece 4 metrik kart
GET /api/dashboard/queue       // Kuyruk satırları
GET /api/dashboard/charts      // Grafikler (cache'lenebilir)
GET /api/dashboard/alerts      // Stok + HMO uyarıları

// 2. Stok uyarısını DB seviyesinde filtrele
const inventoryAlerts = await prisma.inventory.count({
  where: {
    clinicId,
    OR: [
      { quantity: { lte: prisma.inventory.fields.minimumStock } },
      { expiryDate: { gte: now, lte: thirtyDaysLater } }
    ]
  }
});

// 3. Revenue aggregation'ı raw SQL ile yap (JS loop yerine)
const revenueByDay = await prisma.$queryRaw`
  SELECT DATE(p."paidAt" AT TIME ZONE 'Asia/Manila') as day,
         SUM(p.amount) as total
  FROM "Payment" p
  JOIN "Invoice" i ON i.id = p."invoiceId"
  WHERE i."clinicId" = ${clinicId}
    AND p."paidAt" >= ${thirtyDaysAgo}
  GROUP BY day ORDER BY day
`;
```

### 1.2 Analytics N+1 Query (analytics.service.ts)

**Sorun:** `getAnalyticsOverview()` içinde 12 aylık hasta büyümesi için **döngü içinde sorgu** var:

```typescript
// ❌ N+1 pattern — 12 ay x 2 sorgu = 24 sorgu
for (let i = 11; i >= 0; i--) {
  const [newCount, returningCount] = await Promise.all([
    prisma.patient.count({...}),
    prisma.appointment.findMany({...})
  ]);
}
```

**Çözüm:**
```typescript
// ✅ Tek sorgu ile 12 ay
const patientGrowth = await prisma.$queryRaw`
  SELECT 
    TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon YY') as month,
    COUNT(*) as "newPatients"
  FROM "Patient"
  WHERE "clinicId" = ${clinicId}
    AND "createdAt" >= ${twelveMonthsAgo}
  GROUP BY DATE_TRUNC('month', "createdAt")
  ORDER BY DATE_TRUNC('month', "createdAt")
`;
```

### 1.3 Raw SQL İnjection Riski

**Sorun:** `reports.service.ts` içinde `$queryRaw` template literal kullanılıyor (güvenli), ama `ANY(${procedures}::text[])` gibi array parametreleri dikkatli kontrol gerektirir.

**Durum:** ✅ Prisma tagged template ile güvenli, ama `procedures` kullanıcı girdisi değil DB'den geliyor — OK.

---

## 2. Frontend Performans Darboğazları

### 2.1 DashboardPage.tsx — 94KB Tek Dosya

**Sorun:** 94KB'lık tek bir TSX dosyası. React'in bundle splitting'ini yok eder, initial load'u ağırlaştırır.

**Çözüm:**
```
DashboardPage.tsx (94KB) → Bölünmeli:
├── DashboardPage.tsx          (orchestrator, ~5KB)
├── MetricCards.tsx             (4 KPI kartı)
├── RevenueCharts.tsx          (Recharts grafikleri)
├── QueueWidget.tsx            (bugünkü kuyruk)
├── WaitlistWidget.tsx         (bekleme listesi)
├── OperationalAlerts.tsx      (stok + HMO uyarıları)
├── TopProceduresWidget.tsx    (prosedür istatistikleri)
├── DentistPerformance.tsx     (hekim performansı)
└── ActiveTreatmentPlan.tsx    (aktif tedavi planı)
```

### 2.2 HomePage.tsx — 39KB Landing

**Sorun:** 37 bileşenli landing sayfası tek dosyada import ediliyor. Code splitting yok.

**Çözüm:** `React.lazy()` ile bölümleri lazy load:
```typescript
const FeaturePreviews = lazy(() => import('../components/landing/FeaturePreviews'));
const DeviceShowcase = lazy(() => import('../components/landing/DeviceShowcase'));
```

### 2.3 Tablo Overflow Mobile Bug (4 sayfa)

**Etkilenen:** PatientList, InvoicesListPage, InventoryPage, NotificationsPage
**Sorun:** Dış wrapper `overflow-hidden` — mobile'de sütunlar kırpılıyor
**Çözüm:** `overflow-x-auto` + `min-w-[...]` ekle

### 2.4 InvoicesListPage — Full Page Reload Bug

```typescript
// ❌ Mevcut — sayfayı tamamen yeniden yükler
onClick={() => window.location.href = `/invoices/${inv.id}`}

// ✅ Olması gereken — SPA navigasyonu
import { Link } from 'react-router-dom';
<Link to={`/invoices/${inv.id}`}>...</Link>
```

---

## 3. Veritabanı Darboğazları

### 3.1 Eksik İndeksler

```sql
-- Randevu performansı için
CREATE INDEX idx_appointment_clinic_scheduled 
  ON "Appointment"("clinicId", "scheduledAt");

CREATE INDEX idx_appointment_dentist_status 
  ON "Appointment"("dentistId", "status");

-- Ödeme raporları için
CREATE INDEX idx_payment_paidat 
  ON "Payment"("paidAt");

CREATE INDEX idx_payment_invoice_paidat 
  ON "Payment"("invoiceId", "paidAt");

-- Tedavi istatistikleri için
CREATE INDEX idx_treatment_patient_procedure 
  ON "Treatment"("patientId", "procedure");

-- HMO claim takibi için
CREATE INDEX idx_hmoclaim_clinic_status 
  ON "HmoClaim"("clinicId", "status");
```

### 3.2 Büyük Veri Seti Riski

| Tablo | Risk | Önlem |
|-------|------|-------|
| Payment | 12 ay veri tek seferde çekiliyor | Sayfalama + tarih aralığı zorunlu |
| Treatment | YTD groupBy tüm kayıtlar | Materialized view / cache |
| ToothAuditLog | `take: 200` sabit limit | Sayfalama + tarih filtresi |
| Inventory | Tüm satırlar çekilip JS'de filtre | WHERE clause'a taşı |

---

## 4. Güvenlik Darboğazları (Özet)

| # | Sorun | Seviye | Dosya |
|---|-------|--------|-------|
| 1 | PayMongo webhook imza doğrulaması | 🔴 CRITICAL | invoice.service.ts |
| 2 | `/auth/register` herkese açık | 🔴 HIGH | auth.routes.ts |
| 3 | CORS origin boşken `true` | 🟡 HIGH | app.ts |
| 4 | Refresh token rotation yok | 🟡 MEDIUM | auth.service.ts |
| 5 | Global audit log yok (DPA) | 🟡 HIGH | middleware/ |
| 6 | MedicalHistoryForm hata yutuyor | 🟡 HIGH | frontend |

> **Not:** Güvenlik maddeleri `app.ts` içinde rate limit ve CORS zaten eklenmiş. PayMongo webhook imzası ve register kilidi hâlâ açık.

---

## 5. SVG Odontogram Asenkron Veri Akışı

### Mevcut Mimari (İyi)
```
ToothSvg.tsx (memo) → DentalChart.tsx → apiFetch PUT → teeth.service.ts → Prisma upsert + AuditLog
```

### Potansiyel Darboğazlar
1. **Her tıklamada tam PUT:** Tek diş güncellemesi için `PUT /patients/:id/teeth/:n` çağrılıyor — OK ama batch update yok
2. **History 200 limit:** `listToothHistory` sabit `take: 200` — büyük geçmişte sayfalama gerek
3. **Optimistic update yok:** Kaydet butonuna basınca sunucu yanıtı bekleniyor, UX gecikme hissedilebilir

### Önerilen İyileştirme
```typescript
// Optimistic update pattern
async function handleSave(toothNumber, payload) {
  // 1. Önce local state güncelle (anında UX)
  const optimisticTeeth = teeth.map(t => 
    t.toothNumber === toothNumber ? { ...t, ...payload } : t
  );
  setTeeth(optimisticTeeth);
  
  // 2. Sonra API'ye gönder
  try {
    await apiFetch(`/patients/${patientId}/teeth/${toothNumber}`, {
      method: 'PUT', body: JSON.stringify(payload)
    });
    toast.success('Saved');
  } catch {
    // 3. Hata olursa geri al
    setTeeth(originalTeeth);
    toast.error('Failed — reverted');
  }
}
```

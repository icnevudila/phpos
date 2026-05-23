# DentQL Full Redesign Package

## 0) Net pozisyon

Bu ürünün problemi “birkaç renk kötü olmuş” değil. Asıl sorun şu: ekranlar aynı ürüne ait gibi davranmıyor. Navigasyon, kart yoğunluğu, tablo düzeni, boş durumlar, hata durumları, çeviri sistemi, operasyon akışları ve backend state yönetimi tek bir sistem altında birleşmemiş.

Bu paketin amacı sıfırdan bir ürün dili kurmak: UI, UX, backend akışı, veri modeli, yetki, hata yönetimi ve operasyon mantığı birlikte tasarlanacak.

Varsayımlar:

- Frontend React / Next.js veya Vite tabanlı.
- Styling Tailwind veya CSS module benzeri.
- Backend REST API ya da Next API routes üzerinden çalışıyor.
- Klinik bağlamı dental/clinic SaaS: appointment, waitlist, invoice, HMO claims, PhilHealth e-claims, inventory, notifications, staff, settings, kiosk, queue display.
- Çoklu dil gerekiyor: en az English + ileride Tagalog/Türkçe opsiyonu.

Güven: Orta. Ekran görüntülerinden ürün akışı okunuyor ama repo, DB şeması ve API sözleşmeleri görülmediği için bazı backend alanları öneri düzeyindedir.

---

# 1) Ürün vizyonu

## Ürün hissi

DentQL bir demo dashboard gibi değil, klinik operasyon merkezi gibi görünmeli.

Ana his:

- Temiz
- Klinik güven veren
- Hızlı okunur
- Az ama anlamlı renkli
- Masabaşı personelin 8 saat kullanabileceği kadar sakin
- Kiosk/TV tarafında hastanın 5 metreden okuyabileceği kadar net

## Ana kullanıcı rolleri

### Admin

- Klinik ayarlarını yönetir.
- Staff/role düzenler.
- Billing, claims, inventory, compliance raporlarını görür.
- PECWS/PhilHealth sync gibi hassas aksiyonları yapar.

### Dentist / Doctor

- Günlük randevuları, hasta geçmişini, tedavi notlarını görür.
- Invoice veya claim detayını sınırlı görür.
- Klinik operasyon ayarlarını değiştirmez.

### Receptionist

- Randevu oluşturur.
- Waitlist yönetir.
- Hasta kaydı, ödeme alma, SMS gönderme işlerini yapar.
- Kritik finansal ayarlara erişmez.

### Billing Staff

- Invoice, payment, HMO claim, PhilHealth claim süreçlerini yürütür.
- Klinik ayarlarını değiştirmez.

### Patient / Kiosk User

- Randevu alır veya giriş yapar.
- Kendi bilgilerini doğrular.
- Staff ekranına erişemez.

---

# 2) Ana UX prensipleri

## 2.1 Her ekran tek ana işe hizmet etmeli

Kullanıcı ekranı açınca 3 saniyede şunu anlamalı:

- Bu ekran ne için?
- Bugün neyi tamamlamalıyım?
- Kritik sorun var mı?
- Ana aksiyon hangisi?

## 2.2 Renk dekor değil, anlam taşımalı

- Teal: ana aksiyon / marka / başarılı operasyon
- Mavi: bilgi / entegrasyon / sistem
- Turuncu: bekleyen / dikkat
- Kırmızı: kritik / hata / reddedilen
- Gri: pasif / ikincil / boş durum

## 2.3 Boş ekran da tasarlanmış olmalı

Boş tablo sadece spinner veya beyaz alan olmamalı. Her empty state:

- Ne olmadığını söyler.
- Neden önemli olduğunu açıklar.
- Bir sonraki aksiyonu verir.

Örnek:

“No invoices yet. Create a visit or record a procedure to generate the first invoice.”

## 2.4 Hata hastaya gösterilmez

Kiosk/TV ekranlarında teknik hata asla ham gösterilmez.

Kötü:

- HTTP 503
- undefined
- pages.kiosk.begincta

Doğru:

- “Display temporarily unavailable. Please check with the front desk.”
- İçeride log: HTTP 503, endpoint, token, clinicId, timestamp.

## 2.5 Backend state görünür olmalı

Her kritik operasyonun durumu olmalı:

- idle
- loading
- success
- warning
- failed
- retrying
- synced
- stale

Bunlar UI’da küçük ama net gösterilmeli.

---

# 3) Information Architecture

## Sol menü önerisi

### Overview

- Dashboard
- Marketing site
- Reports hub

### Clinical

- Appointments
- Waitlist
- Patients
- Compliance

### Billing & Finance

- Invoices
- HMO Claims
- A/R Aging
- HMO Providers
- PhilHealth E-Claims

### Operations

- Inventory
- Notifications

### Administration

- Staff
- Settings

## Kural

Sol menü genişliği:

- Expanded: 260px
- Collapsed: 72px

Aktif menü:

- Sol border veya pill highlight
- Daha güçlü text color
- İkon background değil, text ile uyumlu olmalı

---

# 4) Layout sistemi

## 4.1 AppShell

Tüm admin ekranları şu yapıyı kullanmalı:

```txt
AppShell
 ├─ Sidebar
 └─ Main
    ├─ Topbar
    └─ PageContainer
       ├─ PageHeader
       ├─ PageActions
       └─ PageContent
```

## 4.2 PageContainer

Önerilen ölçüler:

```css
.page-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 32px 64px;
}
```

1920px ekranda tüm içerik sonsuza yayılmamalı. Şu an birçok ekran bu yüzden boş ve zayıf görünüyor.

## 4.3 Grid sistemi

- KPI kartları: 4 kolon
- Ana içerik: 12 kolon
- Sol operasyon paneli: 4 kolon
- Ana tablo/liste: 8 kolon

Responsive:

- Desktop: 12 kolon
- Tablet: 6 kolon
- Mobile: 1 kolon

---

# 5) Design tokens

```css
:root {
  --bg: #F6F8FA;
  --surface: #FFFFFF;
  --surface-soft: #F9FAFB;
  --surface-muted: #F2F4F7;
  --border: #E5E7EB;
  --border-strong: #D0D5DD;

  --text: #111827;
  --text-soft: #344054;
  --muted: #667085;
  --muted-2: #98A2B3;

  --primary: #008C8C;
  --primary-hover: #007777;
  --primary-soft: #E6F7F6;

  --success: #12B76A;
  --success-soft: #ECFDF3;

  --warning: #F79009;
  --warning-soft: #FFFAEB;

  --danger: #F04438;
  --danger-soft: #FEF3F2;

  --info: #2E90FA;
  --info-soft: #EFF8FF;

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;

  --shadow-card: 0 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-popover: 0 12px 32px rgba(16, 24, 40, 0.14);
}
```

## Typography

Önerilen font:

- Inter
- Geist
- Manrope

Boyut sistemi:

```txt
Page title: 28px / 36px / 700
Section title: 18px / 28px / 700
Card title: 14px / 20px / 700
Body: 14px / 20px / 400
Small: 12px / 18px / 500
KPI value: 30px / 38px / 700
Table header: 11px / 16px / 700 / uppercase
```

Harf aralığı sadece küçük label’larda kullanılmalı. Şu an ürünün birçok yerinde fazla letter-spacing var; bu okunurluğu düşürüyor.

---

# 6) Component sistemi

## 6.1 Button

Variant:

- primary
- secondary
- ghost
- danger
- warning
- link

Size:

- sm: 32px
- md: 40px
- lg: 48px

Kural:

- Sayfa başına maksimum 1 primary ana aksiyon.
- Destructive aksiyonlar confirmation ister.

## 6.2 Card

Kartlar sade olmalı:

```txt
border: 1px solid border
radius: 16px
shadow: çok hafif
padding: 20px / 24px
```

Aşırı shadow ürünü ucuz gösteriyor.

## 6.3 MetricCard

Alanlar:

- title
- value
- delta
- description
- icon
- status
- href

Örnek:

```txt
Today's Appointments
12
3 waiting now
[calendar icon]
```

## 6.4 StatusBadge

Tipler:

- Draft
- Submitted
- Approved
- Paid
- Partial
- Rejected
- Critical
- Low
- OK
- Active
- Inactive

Kural:

- Badge text kısa olmalı.
- Renk tek başına anlam taşımamalı, metin de olmalı.

## 6.5 DataTable

Her tablo şunları desteklemeli:

- Loading state
- Empty state
- Error state
- Pagination
- Column alignment
- Row action menu
- Bulk select opsiyonel
- Responsive compact mode

Para kolonları sağa hizalanmalı.

## 6.6 FilterBar

Alanlar:

- Search
- Status select
- Provider/Dentist select
- Date range
- Export

Kural:

- Filtreler sayfa içeriğine yakın durmalı.
- Disabled export butonunun neden disabled olduğu tooltip ile açıklanmalı.

## 6.7 EmptyState

Props:

- icon
- title
- description
- primaryAction
- secondaryAction

Örnek:

```txt
No one on the waitlist
Patients added here will appear when a slot opens.
[Add patient] [Open appointments]
```

## 6.8 ErrorState

Admin ekranında teknik detay isteğe bağlı gösterilebilir.

Kiosk/TV ekranında teknik detay gösterilmez.

---

# 7) Backend genel mimari

## 7.1 Modül yapısı

```txt
/modules
  /appointments
  /waitlist
  /patients
  /billing
  /claims
  /philhealth
  /inventory
  /compliance
  /notifications
  /staff
  /settings
  /reports
  /kiosk
```

Her modülde:

```txt
api.ts
schema.ts
service.ts
repository.ts
permissions.ts
audit.ts
```

## 7.2 Ortak backend kuralları

Her API response standardı:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "req_...",
    "timestamp": "2026-05-22T12:00:00Z"
  }
}
```

Hata:

```json
{
  "ok": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice not found.",
    "details": {}
  },
  "meta": {
    "requestId": "req_...",
    "timestamp": "2026-05-22T12:00:00Z"
  }
}
```

## 7.3 Audit log

Kritik işlemler loglanmalı:

- Invoice created/updated/deleted
- Payment recorded/refunded
- HMO claim submitted/approved/rejected
- PhilHealth sync/export
- Staff role changed
- Inventory stock adjusted
- Compliance cycle logged
- Clinic settings changed

Audit alanları:

```txt
id
clinicId
actorUserId
action
entityType
entityId
beforeJson
afterJson
ipAddress
userAgent
createdAt
```

## 7.4 Role Based Access Control

Örnek permission map:

```txt
appointments.read
appointments.write
waitlist.manage
patients.read
patients.write
billing.read
billing.write
claims.read
claims.write
philhealth.sync
inventory.read
inventory.write
staff.manage
settings.manage
reports.read
```

Frontend menü gizleme yetmez. Backend de permission kontrolü yapmalı.

---

# 8) Veri modeli taslağı

## Clinic

```txt
clinics
- id
- name
- phone
- address
- city
- logoUrl
- timezone
- currency
- locale
- createdAt
- updatedAt
```

## User / Staff

```txt
users
- id
- clinicId
- name
- email
- role
- status
- encryptedProfileJson
- lastLoginAt
- createdAt
- updatedAt
```

## Patient

```txt
patients
- id
- clinicId
- fullName
- phone
- email
- birthDate
- gender
- address
- hmoProviderId
- philHealthNo
- createdAt
- updatedAt
```

## Appointment

```txt
appointments
- id
- clinicId
- patientId
- dentistId
- startAt
- endAt
- status
- type
- notes
- source
- createdBy
- createdAt
- updatedAt
```

Status:

```txt
scheduled
confirmed
checked_in
in_chair
completed
cancelled
no_show
```

## Waitlist

```txt
waitlist_entries
- id
- clinicId
- patientId
- preferredDate
- preferredTimeWindow
- urgency
- notes
- status
- queuedAt
- bookedAppointmentId
- createdBy
```

Status:

```txt
waiting
contacted
booked
cancelled
expired
```

## Invoice

```txt
invoices
- id
- clinicId
- patientId
- appointmentId
- orNo
- status
- subtotal
- discount
- tax
- total
- paidAmount
- balance
- issuedAt
- createdBy
- createdAt
- updatedAt
```

Status:

```txt
draft
issued
partial
paid
void
refunded
```

## Invoice Items

```txt
invoice_items
- id
- invoiceId
- procedureCode
- description
- toothNo
- qty
- unitPrice
- discount
- total
```

## Payment Ledger

```txt
payments
- id
- clinicId
- invoiceId
- patientId
- method
- amount
- referenceNo
- paidAt
- receivedBy
- status
```

## HMO Provider

```txt
hmo_providers
- id
- clinicId
- name
- code
- phone
- email
- status
```

## HMO Claim

```txt
hmo_claims
- id
- clinicId
- invoiceId
- patientId
- providerId
- claimNo
- status
- requestedAmount
- approvedAmount
- submittedAt
- approvedAt
- rejectedAt
- rejectionReason
```

Status:

```txt
draft
submitted
under_review
approved
rejected
paid
cancelled
```

## PhilHealth Claim

```txt
philhealth_claims
- id
- clinicId
- patientId
- admissionDate
- dischargeDate
- amount
- eclaimId
- status
- cf4Status
- encryptedPayloadRef
- submittedAt
- responseJson
```

## Inventory Item

```txt
inventory_items
- id
- clinicId
- name
- supplier
- category
- stock
- minStock
- unit
- unitCost
- expiryDate
- status
- createdAt
- updatedAt
```

## Inventory Movement

```txt
inventory_movements
- id
- itemId
- type
- qty
- reason
- referenceType
- referenceId
- createdBy
- createdAt
```

Type:

```txt
stock_in
stock_out
adjustment
expired
transfer
```

## Compliance Cycle

```txt
compliance_cycles
- id
- clinicId
- autoclaveName
- cycleNo
- operatorId
- cycleAt
- parametersJson
- biResult
- status
- notes
```

## Notification

```txt
notifications
- id
- clinicId
- recipientPhone
- message
- kind
- status
- provider
- providerMessageId
- scheduledAt
- sentAt
- failedReason
```

---

# 9) API endpoint taslağı

## Dashboard

```txt
GET /api/dashboard/summary?date=YYYY-MM-DD
GET /api/dashboard/alerts
GET /api/dashboard/activity
```

## Appointments

```txt
GET /api/appointments?date=&dentistId=&status=
POST /api/appointments
GET /api/appointments/:id
PATCH /api/appointments/:id
DELETE /api/appointments/:id
POST /api/appointments/:id/check-in
POST /api/appointments/:id/complete
```

## Waitlist

```txt
GET /api/waitlist?status=&search=
POST /api/waitlist
PATCH /api/waitlist/:id
POST /api/waitlist/:id/book
POST /api/waitlist/:id/contacted
DELETE /api/waitlist/:id
```

## Patients

```txt
GET /api/patients?search=&page=
POST /api/patients
GET /api/patients/:id
PATCH /api/patients/:id
GET /api/patients/:id/timeline
```

## Invoices

```txt
GET /api/invoices?search=&status=&from=&to=
POST /api/invoices
GET /api/invoices/:id
PATCH /api/invoices/:id
POST /api/invoices/:id/items
POST /api/invoices/:id/payments
POST /api/invoices/:id/void
GET /api/invoices/export.csv
```

## HMO Claims

```txt
GET /api/hmo/claims?status=&providerId=&search=
POST /api/hmo/claims
GET /api/hmo/claims/:id
POST /api/hmo/claims/:id/submit
POST /api/hmo/claims/:id/approve
POST /api/hmo/claims/:id/reject
POST /api/hmo/claims/:id/mark-paid
```

## HMO Providers

```txt
GET /api/hmo/providers
POST /api/hmo/providers
PATCH /api/hmo/providers/:id
DELETE /api/hmo/providers/:id
```

## PhilHealth

```txt
GET /api/philhealth/claims?status=&search=
POST /api/philhealth/claims
POST /api/philhealth/claims/:id/validate-cf4
POST /api/philhealth/claims/:id/submit
POST /api/philhealth/sync
GET /api/philhealth/export-batch
```

## Inventory

```txt
GET /api/inventory?search=&category=&lowStock=&status=
POST /api/inventory
PATCH /api/inventory/:id
POST /api/inventory/:id/adjust
GET /api/inventory/alerts
GET /api/inventory/export.csv
```

## Compliance

```txt
GET /api/compliance/cycles?from=&to=&autoclave=
POST /api/compliance/cycles
GET /api/compliance/summary
```

## Notifications

```txt
GET /api/notifications?status=&search=
POST /api/notifications/test
POST /api/notifications/dispatch/morning
POST /api/notifications/dispatch/live
GET /api/notifications/system-status
```

## Staff

```txt
GET /api/staff
POST /api/staff
PATCH /api/staff/:id
POST /api/staff/:id/deactivate
PATCH /api/staff/:id/role
```

## Settings

```txt
GET /api/settings/clinic
PATCH /api/settings/clinic
GET /api/settings/kiosk
PATCH /api/settings/kiosk
GET /api/settings/security
PATCH /api/settings/security
```

## Kiosk / Queue

```txt
GET /api/kiosk/config?slug=
POST /api/kiosk/intake
POST /api/kiosk/patient-login
POST /api/kiosk/staff-login
GET /api/queue/display?clinicId=&token=
GET /api/queue/live
```

---

# 10) Sayfa sayfa redesign

## 10.1 Reports Hub

### Şu anki sorun

- İlk ekran görsel olarak fazla deneysel.
- “Insight Portal” gibi isim güzel ama gerçek operasyon kartları belirsiz.
- Report builder preview alanı bozuk/başarısız hissi veriyor.
- Küçük yazılar fazla, okunurluk düşük.

### Yeni amaç

Reports Hub, kullanıcının finans, klinik ve operasyon raporlarına hızlı eriştiği merkez olmalı.

### Yeni layout

```txt
PageHeader:
Reports Hub
Operational, financial and compliance reports for the clinic.

Top Actions:
[Create report] [Schedule report] [Export all]

Content:
Left: Report categories
Right: Featured reports / Recent reports
Bottom: Scheduled reports
```

### Kart grupları

Financial:

- A/R Aging
- Daily Collections
- Revenue by Procedure
- HMO Revenue Share

Clinical:

- Appointment Utilization
- No-show Rate
- Treatment Plan Conversion

Compliance:

- Sterilization Logs
- BI Test History
- Audit Exceptions

Operations:

- Stock Alerts
- SMS Delivery
- Staff Activity

### Backend

```txt
GET /api/reports/catalog
GET /api/reports/recent
POST /api/reports/run
POST /api/reports/schedule
GET /api/reports/:id/export
```

### UX kuralı

Rapor çalışmadığında kartın içinde kırmızı hata değil, sakin error state:

```txt
Preview unavailable
The report query failed. Try again or open query details.
[Retry] [View details]
```

---

## 10.2 Dashboard

### Şu anki sorun

- KPI kartları var ama iş emri gibi çalışmıyor.
- Critical actions ayrı ayrı dağılmış.
- PH claim radar iyi fikir ama karmaşık görünüyor.

### Yeni amaç

Dashboard klinikte “bugün ne yapılacak?” sorusuna cevap vermeli.

### Yeni layout

```txt
Top:
PageHeader + Refresh + Date selector

KPI Row:
Appointments Today | Waiting Now | Pending Claims | Stock Alerts

Main Grid:
Left 8 columns:
- Today's Schedule
- Active Treatment Plan / Next Patients

Right 4 columns:
- Action Center
- Critical Alerts
- Sync Status

Bottom:
- Cashflow Snapshot
- Claim Radar
- Inventory Risk
```

### KPI kart metinleri

- Today’s Appointments: `12 scheduled · 3 checked in`
- Waiting Now: `4 patients · avg 18 min`
- Pending Claims: `8 claims · ₱42,000`
- Stock Alerts: `2 critical · 4 low`

### Action Center

```txt
Needs attention
1. Submit 4 draft HMO claims
2. Reorder 2 critical inventory items
3. Review 1 failed SMS dispatch
```

### Backend

```txt
GET /api/dashboard/summary?date=2026-05-22
GET /api/dashboard/action-center
GET /api/dashboard/sync-status
```

### Veri hesapları

Dashboard backend tarafında tek endpoint ile gelmeli. Frontend 10 ayrı endpoint çağırmasın.

Response örneği:

```json
{
  "date": "2026-05-22",
  "appointments": {
    "total": 12,
    "checkedIn": 3,
    "completed": 2
  },
  "waitlist": {
    "active": 4,
    "avgDwellMinutes": 18
  },
  "claims": {
    "pending": 8,
    "requestedTotal": 42000
  },
  "inventory": {
    "critical": 2,
    "low": 4,
    "expiringSoon": 1
  }
}
```

---

## 10.3 Appointments Calendar

### Şu anki sorun

- Takvim alanı aşırı büyük ve boş.
- Saat grid’i kullanıcıya operasyonel bilgi vermiyor.
- Sağ panel yok, seçilen randevu deneyimi eksik.

### Yeni amaç

Receptionist randevuyu hızlı oluşturmalı, doktor müsaitliğini hızlı görmeli.

### Yeni layout

```txt
PageHeader:
Appointments
Schedule visits, manage chair time and check-ins.

Toolbar:
[Day] [Week] [Month] [Today] [Date] [Dentist filter] [+ New Appointment]

Main:
Left: Calendar grid
Right: Day summary / selected appointment drawer
```

### Calendar slot UX

- Müsait slot: açık gri
- Dolu slot: renkli blok
- Check-in: mavi/teal
- Completed: yeşil
- No-show: kırmızı sol border
- Cancelled: gri çizgili

### Randevu oluşturma akışı

1. Slot seç
2. Patient search veya new patient
3. Procedure type seç
4. Dentist seç
5. SMS reminder opsiyonunu işaretle
6. Save

### Backend

```txt
GET /api/appointments/day?date=&dentistId=
GET /api/appointments/week?from=&to=&dentistId=
POST /api/appointments
PATCH /api/appointments/:id/status
```

### Kritik validasyon

- Aynı dentist aynı saatte iki randevu alamaz.
- Klinik çalışma saati dışına randevu verilemez.
- Hasta aynı saat aralığında tekrar randevu alamaz.
- Overbooking sadece Admin izniyle yapılır.

---

## 10.4 Waitlist

### Şu anki sorun

- Form çok yatay ve boşluk fazla.
- Empty/loading state tutarsız.
- `Waiting only` ve `Show all` segmentleri görsel olarak ağır.

### Yeni amaç

Slot açıldığında en doğru hastayı en hızlı bulmak.

### Yeni layout

```txt
Header:
Waitlist
Fill cancellations faster with first-in, first-served queueing.

Top card:
Add to waitlist
[Patient search] [Preferred time] [Urgency] [Notes] [Add]

Controls:
[Waiting] [Contacted] [Booked] [All]      Search

Table:
Patient | Phone | Preference | Queued since | Urgency | Status | Actions
```

### Aksiyonlar

- Contact
- Book
- Remove
- Add note

### Backend

```txt
GET /api/waitlist?status=waiting
POST /api/waitlist
POST /api/waitlist/:id/contacted
POST /api/waitlist/:id/book
```

### İş kuralı

Hasta booked olunca waitlist entry status `booked`, appointmentId dolmalı.

---

## 10.5 Patients

### Bu ekran görüntülerde detaylı yok ama menüde var

### Yeni amaç

Hasta klinik tarihçesinin merkezi.

### Layout

```txt
Patients
Search and manage patient profiles.

[Search by name, phone, OR number] [+ New Patient]

Table:
Patient | Phone | Last visit | Balance | HMO | Status | Actions
```

### Hasta detay sayfası

Sekmeler:

- Overview
- Appointments
- Treatments
- Invoices
- Claims
- Documents
- Notes

### Backend

```txt
GET /api/patients
POST /api/patients
GET /api/patients/:id/timeline
PATCH /api/patients/:id
```

---

## 10.6 Compliance

### Şu anki sorun

- KPI kartları iyi ama sterilization history boş gibi.
- Loading state zayıf.
- Log cycle aksiyonu güzel ama form akışı tanımlı değil.

### Yeni amaç

Sterilizasyon ve BI test geçmişini denetlenebilir hale getirmek.

### Yeni layout

```txt
Header:
Clinical Compliance
Sterilization cycles, BI tests and safety audit logs.

KPI:
Pass Rate | Cycles This Month | Next BI Test | Failed Cycles

Main:
Sterilization History table
Right drawer/form: Log cycle
```

### Log Cycle formu

Alanlar:

- Autoclave
- Cycle no
- Date/time
- Operator
- Temperature
- Pressure
- Duration
- BI result
- Notes
- Attachment/photo optional

### Backend

```txt
GET /api/compliance/summary
GET /api/compliance/cycles
POST /api/compliance/cycles
```

### Audit

Her cycle kaydı audit log’a düşmeli.

---

## 10.7 Invoices List

### Şu anki sorun

- Empty ve dolu state arasında kalite farkı var.
- KPI kartları daha kompakt olmalı.
- Filtre barı iyi ama biraz yüksek.
- Liste satırları daha okunabilir olabilir.

### Yeni amaç

Kullanıcı faturaları, tahsilatı ve açık bakiyeyi hızlı yönetmeli.

### Layout

```txt
Header:
Invoices
Official receipts, payments and HMO-linked billing.

KPI:
Invoices | Billed | Collected | Outstanding

FilterBar:
Search | Status | Date Range | HMO only | Export CSV

Table:
OR No | Patient | Issued | Total | Paid | Balance | Status | Actions
```

### Para formatı

- Sağ hizalı
- Font tabular-nums
- ₱9,040.00 gibi standardize

### Backend

```txt
GET /api/invoices/summary?from=&to=
GET /api/invoices?search=&status=&from=&to=&hmoOnly=
GET /api/invoices/export.csv
```

---

## 10.8 Invoice Detail

### Şu anki sorun

- Üst bilgi kopuk.
- Sağ panelde ödeme/HMO entegrasyonu var ama hiyerarşi zayıf.
- Tedavi/prosedür listesi iyi ama toplam alanı daha okunaklı olmalı.

### Yeni amaç

Bir faturanın tüm finansal yaşam döngüsü tek ekranda görünmeli.

### Yeni layout

```txt
Top:
Breadcrumb: Invoices / OR-2026-0001
Status badge
Actions: Print | Send | Void

Main left:
Patient summary
Treatments & Procedures
Payment Ledger
Notes / Audit trail

Right sticky panel:
Balance summary
Payment actions
HMO integration
Claim status
```

### İş akışı

1. Invoice draft oluşur.
2. Procedure eklenir.
3. Invoice issued olur.
4. Payment alınır.
5. Balance 0 ise paid.
6. HMO bağlıysa claim başlatılır.

### Backend

```txt
GET /api/invoices/:id
POST /api/invoices/:id/items
POST /api/invoices/:id/payments
POST /api/invoices/:id/hmo-claim
POST /api/invoices/:id/void
```

### Validasyon

- Paid invoice item değişimi yasak veya credit note gerekir.
- Void için reason zorunlu.
- Overpayment engellenmeli veya unapplied credit olarak ayrılmalı.

---

## 10.9 HMO Claims

### Şu anki sorun

- Runbook fikri iyi, ama fazla basit.
- Claim list yatay scroll yapıyor; kötü sinyal.
- Status flow görünür değil.

### Yeni amaç

HMO claim’lerin draft → submitted → approved → paid akışını disipline etmek.

### Yeni layout

```txt
Header:
HMO Claims
Track provider reimbursements and claim approvals.

KPI:
Pending | Approved | Rejected | Requested Total

Main:
Left: Claim Runbook
Right: Claims table
Bottom: Reconciliation export card
```

### Runbook

```txt
1. Clear critical follow-ups
2. Submit draft claims
3. Collect approved claims
```

Her adım:

- count
- primary action
- last run time

### Table

```txt
Claim | Patient | Provider | Requested | Approved | Status | Age | Actions
```

### Backend

```txt
GET /api/hmo/claims/summary
GET /api/hmo/claims/runbook
POST /api/hmo/claims/:id/submit
POST /api/hmo/claims/:id/approve
POST /api/hmo/claims/:id/mark-paid
```

### Status flow

```txt
Draft → Submitted → Under Review → Approved → Paid
Draft → Submitted → Rejected
```

---

## 10.10 HMO Providers

### Şu anki sorun

- Inline edit satırı biraz ham duruyor.
- Tablo container genişliği iyi ama form alanları fazla büyük.

### Yeni amaç

Sigorta/HMO sağlayıcılarını temiz yönetmek.

### Layout

```txt
HMO Providers
Manage insurance organizations and reimbursement contacts.

[+ Add Provider]

Table:
Provider | Code | Contact | Email | SLA days | Status | Actions
```

### Add/Edit modal

Alanlar:

- Name
- Code
- Phone
- Email
- Address
- Default approval SLA days
- Active

### Backend

```txt
GET /api/hmo/providers
POST /api/hmo/providers
PATCH /api/hmo/providers/:id
```

---

## 10.11 PhilHealth E-Claims

### Şu anki sorun

- Klinik olarak kritik ama demo tablo gibi duruyor.
- “DPA compliance reminder” iyi ama daha sistematik olmalı.
- PECWS sync aksiyonu riskli; durum ve log görünmeli.

### Yeni amaç

PhilHealth CF4/e-claims sürecini güvenli, izlenebilir ve hataya dayanıklı yapmak.

### Layout

```txt
Header:
PhilHealth E-Claims v3.0
Validate CF4, submit batches and track reimbursement status.

KPI:
Pending Validation | Submitted Claims | Approved YTD | Returned / Rejected

Tabs:
Active Claims | History | Failed Syncs | Settings

Table:
Patient | Admission | Amount | EClaim ID | CF4 | Status | Last Sync | Actions

Bottom:
Compliance checklist
```

### Compliance checklist

- Consent form uploaded
- CF4 notes encrypted
- Facility cipher key configured
- Required fields complete

### Backend

```txt
GET /api/philhealth/summary
GET /api/philhealth/claims
POST /api/philhealth/claims/:id/validate-cf4
POST /api/philhealth/claims/:id/submit
GET /api/philhealth/sync-log
POST /api/philhealth/sync
```

### Önemli güvenlik

- Cipher key plaintext DB’de tutulmamalı.
- Encryption/decryption sonuçları log’a ham yazılmamalı.
- PECWS response ayrı saklanmalı ama PHI maskeleme uygulanmalı.

---

## 10.12 Inventory

### Şu anki sorun

- Görsel olarak en toparlanabilir ekranlardan biri.
- Uyarı banner’ı fazla büyük.
- Satır aksiyonları çok kalabalık.

### Yeni amaç

Stok bitmeden önce aksiyon aldırmak.

### Layout

```txt
Inventory
Track medication, materials and supplies.

Top:
Stock Risk Banner if critical exists

Controls:
Search | Category | Low stock only | Expiring soon | Export

Table:
Item | Category | Stock | Min | Unit Cost | Expiry | Status | Actions
```

### Satır UX

- Critical stock satırı hafif kırmızı sol border
- Low stock turuncu badge
- Expiring soon küçük warning chip
- Row actions hover’da görünür

### Backend

```txt
GET /api/inventory/summary
GET /api/inventory
POST /api/inventory
PATCH /api/inventory/:id
POST /api/inventory/:id/adjust
GET /api/inventory/reorder-suggestions
```

### İş kuralları

- Stock < minStock ise low/critical.
- Stock = 0 ise critical.
- Expiry <= 30 gün ise expiring_soon.
- Stok değişimi movement tablosuna yazılmalı.

---

## 10.13 Notifications

### Şu anki sorun

- SMS test ve cron açıklamaları teknik kullanıcıya göre yazılmış.
- Sağ kart çok boş.
- Mesaj geçmişi loading state zayıf.

### Yeni amaç

SMS hatırlatma sistemi anlaşılır, güvenilir ve test edilebilir olmalı.

### Layout

```txt
Notifications
SMS reminders and patient communication delivery.

Top right:
System status: Healthy / Degraded / Down

Left:
Send Test SMS

Right:
Scheduled dispatches
- Morning reminders
- Live sentinel

Bottom:
Message log table
```

### Mesaj log table

```txt
Recipient | Kind | Message | Status | Scheduled | Sent | Provider | Actions
```

### Backend

```txt
GET /api/notifications/status
POST /api/notifications/test
POST /api/notifications/dispatch/morning
POST /api/notifications/dispatch/live
GET /api/notifications/logs
```

### UX kuralı

Dry-run açıkça görünmeli:

```txt
Dry run mode: messages are logged but not sent.
```

---

## 10.14 Staff

### Şu anki sorun

- Tablo çok büyük ve boşluklu.
- Role dropdown satır içinde ağır duruyor.
- Staff Data Encrypted badge’i anlamsız yerde.

### Yeni amaç

Klinik personeli, roller ve erişim yönetimi net olmalı.

### Layout

```txt
Staff
Manage clinic team access and permissions.

Top:
Search | Role filter | Status filter | [+ Invite Staff]

Table:
Name | Email | Role | Last login | Status | Actions
```

### Role edit UX

Satır içi dropdown yerine action menü veya modal daha iyi:

- Change role
- Reset password
- Deactivate
- View audit

### Backend

```txt
GET /api/staff
POST /api/staff/invite
PATCH /api/staff/:id/role
POST /api/staff/:id/deactivate
GET /api/staff/:id/audit
```

---

## 10.15 Settings

### Şu anki sorun

- Form tarafı iyi ama sağ kiosk panelinde metin ve aksiyonlar dağınık.
- Portal integrity gibi sistem bilgileri iyi ama daha düzenli olmalı.

### Yeni amaç

Klinik profil, kiosk, team, notification, security/API ayarları tek merkezden yönetilmeli.

### Tabs

- Clinic
- HMO Providers
- Team
- Notifications
- Security & API

### Clinic tab

Alanlar:

- Clinic name
- Phone
- Address
- City
- Logo URL
- Timezone
- Currency

### Kiosk panel

```txt
Kiosk Access
Patient-facing tablet login for intake and visit check-in.

Kiosk link
[Copy link] [Open preview]

TV Queue Display
Fullscreen waiting-room display.

TV link
[Copy TV link] [Open TV preview]

Integrity: Stable
Last heartbeat: 2 minutes ago
```

### Backend

```txt
GET /api/settings/clinic
PATCH /api/settings/clinic
GET /api/settings/kiosk
PATCH /api/settings/kiosk
POST /api/settings/kiosk/rotate-token
```

---

## 10.16 Kiosk

### Şu anki sorun

- Büyük kart fikri doğru.
- Kontrast zayıf.
- i18n key’leri kullanıcıya görünüyor.
- CTA yazıları okunmuyor.
- Staff ve Patient akışı daha net ayrılmalı.

### Yeni amaç

Hasta veya personel tablet üzerinden hızlı ve hatasız giriş yapmalı.

### Yeni layout

```txt
Top:
Clinic logo + Clinic name + Kiosk active
Language selector

Hero:
Welcome to [Clinic Name]
How can we help you today?

Cards:
1. Check in for appointment
2. Book or manage visits
3. Staff workstation
```

### Card standardı

Her kart:

- Büyük ikon
- Başlık
- Açıklama
- CTA
- Role badge

### Backend

```txt
GET /api/kiosk/config?slug=
POST /api/kiosk/check-in
POST /api/kiosk/book-request
POST /api/kiosk/staff-login
```

### Hata yönetimi

Kiosk config alınamazsa:

```txt
We can’t load this kiosk right now.
Please ask the front desk for help.
```

Teknik detay console/server log’da kalır.

---

## 10.17 TV Queue Display

### Şu anki sorun

- HTTP 503 ham gösteriliyor.
- Ekran aşırı boş.
- Operational standby çok silik.
- Bekleyen yoksa bile klinik ekranı güven vermeli.

### Yeni amaç

Bekleme salonunda uzaktan okunabilir, sakin, güven veren ekran.

### Yeni layout

```txt
Top:
Clinic Live Queue      05:29 PM
Patient Flow Display   Friday, May 22

Main:
Now Serving panel
Waiting panel

Empty:
No patients waiting right now.
Please check in at the front desk.

Bottom ticker:
Clinic announcements / hygiene reminders
```

### Yazı boyutları

- Saat: 64px
- Başlık: 48px
- Now serving patient code: 72px
- Waiting list rows: 36px
- Ticker: 22px

### Backend

```txt
GET /api/queue/display?token=&clinicId=
GET /api/queue/events SSE veya WebSocket
```

### Teknik kural

Queue display polling 5–10 saniye olabilir. Ama en iyi çözüm SSE/WebSocket.

503 durumunda:

- Son başarılı veri local cache’den gösterilir.
- Sağ üstte küçük “Reconnecting…” çıkar.
- Teknik hata hastaya gösterilmez.

---

# 11) i18n çözümü

## Problem

Ekranlarda translation key görünüyor:

- common.refresh
- pages.kiosk.begincta
- pages.reportbuilder.title

Bu production için kırmızı alarm.

## Çözüm

Translation helper fallback sistemi:

```ts
function t(key: string, fallback: string) {
  const value = i18n.t(key);
  if (!value || value === key) return fallback;
  return value;
}
```

Kullanım:

```tsx
<Button>{t('common.refresh', 'Refresh')}</Button>
```

## Eksik key audit script

Build sırasında eksik key raporu üretilmeli.

```txt
npm run i18n:audit
```

Bulunacaklar:

- Kullanılan ama dosyada olmayan key
- Dosyada olan ama kullanılmayan key
- Key değeri boş olanlar

---

# 12) Loading / Empty / Error state standardı

Her data alanı şu 4 durumu desteklemeli:

```txt
loading
empty
error
ready
```

## Loading

- Skeleton tercih edilmeli.
- Spinner tek başına sadece kısa işlemlerde.

## Empty

- Icon
- Başlık
- Açıklama
- Aksiyon

## Error

Admin ekranında:

```txt
Couldn’t load invoices
The server returned an error. Try again.
[Retry]
```

Kiosk/TV ekranında:

```txt
This display is temporarily unavailable.
Please ask the front desk for help.
```

---

# 13) Backend işleyiş: operasyon akışları

## Appointment → Check-in → Invoice akışı

```txt
Appointment scheduled
→ Patient confirms via SMS or front desk
→ Patient checks in
→ Treatment completed
→ Invoice generated
→ Payment recorded
→ If HMO: claim draft created
```

## Waitlist → Appointment akışı

```txt
Patient added to waitlist
→ Slot opens
→ Staff contacts patient
→ Patient accepts
→ Appointment created
→ Waitlist entry marked booked
```

## Invoice → HMO Claim akışı

```txt
Invoice issued
→ HMO eligible selected
→ Claim draft generated
→ Staff verifies documents
→ Submit claim
→ Provider approves/rejects
→ Payment collected
→ Claim marked paid
```

## PhilHealth akışı

```txt
Patient claim created
→ Required fields checked
→ CF4 validated
→ Payload encrypted
→ PECWS submit
→ Response stored
→ Status updated
→ Failed submissions queued for retry
```

## Inventory akışı

```txt
Item added
→ Stock movement recorded
→ If below minStock, alert generated
→ Reorder suggestion shown
→ Stock-in closes alert
```

## Compliance akışı

```txt
Cycle logged
→ BI status evaluated
→ If failed, alert generated
→ Audit trail locked
```

---

# 14) Güvenlik ve KVKK/DPA yaklaşımı

## Temel kurallar

- Patient data gereksiz yere frontend state’te tutulmamalı.
- Kiosk token public olabilir ama scope dar olmalı.
- Queue display token read-only olmalı.
- Staff role değişimleri audit log’a düşmeli.
- Sensitive claim payload maskelenmeli.
- Encrypted field varsa arama için ayrıca safe normalized alan düşünülmeli.

## Session

- Admin panel JWT/session cookie
- Kiosk scoped token
- TV display read-only token

## Rate limit

- Kiosk login
- Staff login
- SMS test
- PECWS sync

---

# 15) Performance planı

## Frontend

- Page-level skeleton
- DataTable virtualization gerekirse
- React Query/SWR cache
- Route based code splitting
- Debounced search
- Pagination server-side

## Backend

- Dashboard için aggregate endpoint
- Claims/invoices için indexed query
- Audit log async write opsiyonel
- Queue display için cache/SSE

## DB index önerileri

```sql
-- Appointments
CREATE INDEX idx_appointments_clinic_start ON appointments (clinicId, startAt);
CREATE INDEX idx_appointments_dentist_start ON appointments (dentistId, startAt);
CREATE INDEX idx_appointments_patient ON appointments (patientId);

-- Waitlist
CREATE INDEX idx_waitlist_clinic_status ON waitlist_entries (clinicId, status, queuedAt);

-- Invoices
CREATE INDEX idx_invoices_clinic_issued ON invoices (clinicId, issuedAt);
CREATE INDEX idx_invoices_status ON invoices (clinicId, status);
CREATE INDEX idx_invoices_patient ON invoices (patientId);

-- HMO Claims
CREATE INDEX idx_hmo_claims_clinic_status ON hmo_claims (clinicId, status);
CREATE INDEX idx_hmo_claims_provider ON hmo_claims (providerId, status);

-- Inventory
CREATE INDEX idx_inventory_clinic_status ON inventory_items (clinicId, status);
CREATE INDEX idx_inventory_expiry ON inventory_items (clinicId, expiryDate);

-- Notifications
CREATE INDEX idx_notifications_clinic_status ON notifications (clinicId, status, scheduledAt);
```

---

# 16) Teknik frontend dosya yapısı önerisi

```txt
src/
  app/
    dashboard/
    appointments/
    waitlist/
    patients/
    compliance/
    invoices/
    hmo-claims/
    hmo-providers/
    philhealth-eclaims/
    inventory/
    notifications/
    staff/
    settings/
    kiosk/
    queue-display/
  components/
    app-shell/
    ui/
    data-table/
    forms/
    empty-state/
    status-badge/
    metric-card/
  modules/
    appointments/
    billing/
    claims/
    inventory/
    philhealth/
    compliance/
  lib/
    api-client.ts
    permissions.ts
    i18n.ts
    format.ts
    errors.ts
  styles/
    globals.css
    tokens.css
```

---

# 17) Kritik format helper’ları

## Currency

```ts
export function formatCurrency(value: number, currency = 'PHP') {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value || 0);
}
```

## Date

```ts
export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}
```

## Phone display

```ts
export function maskPhone(phone?: string) {
  if (!phone) return '—';
  return phone;
}
```

---

# 18) Geliştirme sprint planı

## Sprint 1 — Foundation

Hedef: ürünün kemiğini düzeltmek.

İşler:

- Design tokens
- AppShell
- Sidebar
- Topbar
- PageHeader
- Button/Card/Input/Badge/Table standardı
- Empty/Error/Loading componentleri
- i18n fallback

Çıktı:

- Tüm ekranlar aynı layout’a oturur.
- Translation key görünme sorunu azalır.

## Sprint 2 — Core Operations

Hedef: günlük klinik akışı.

İşler:

- Dashboard redesign
- Appointments redesign
- Waitlist redesign
- Patients temel liste/detay

Çıktı:

- Receptionist günlük işi yapabilir.

## Sprint 3 — Billing & Claims

Hedef: para ve claim süreçleri.

İşler:

- Invoices list/detail
- Payment ledger
- HMO claims
- HMO providers
- A/R Aging

Çıktı:

- Billing tarafı profesyonel görünür ve izlenebilir olur.

## Sprint 4 — PhilHealth / Compliance / Inventory

Hedef: regülasyon ve operasyon güvenliği.

İşler:

- PhilHealth E-Claims
- Compliance
- Inventory
- Notifications

Çıktı:

- Klinik operasyon riski takip edilebilir.

## Sprint 5 — Kiosk / TV / polish

Hedef: hasta yüzü ve son kalite.

İşler:

- Kiosk redesign
- TV Queue redesign
- Offline/reconnect state
- Accessibility check
- Responsive QA

Çıktı:

- Ürün demo değil gerçek saha ürünü gibi durur.

---

# 19) Kabul kriterleri

## UI kabul kriterleri

- Sayfa container max genişliği tutarlı.
- Tüm butonlar aynı sistemden geliyor.
- Tüm badge’ler aynı componentten geliyor.
- Tüm tablolarda loading/empty/error var.
- Para alanları sağa hizalı.
- Boş alanlar azaltılmış.
- i18n key kullanıcıya görünmüyor.

## UX kabul kriterleri

- Kullanıcı her ekranda ana aksiyonu 3 saniyede anlıyor.
- Kritik hata/hasta ekranlarında teknik detay görünmüyor.
- Destructive aksiyonlar confirmation istiyor.
- Kiosk 5 metreden okunuyor.
- TV Queue network kesilince son veriyi gösteriyor.

## Backend kabul kriterleri

- Her kritik işlem audit log’a düşüyor.
- Permission backend’de kontrol ediliyor.
- Dashboard tek aggregate endpointten besleniyor.
- Claim/invoice state transition kuralları backend’de korunuyor.
- SMS/PECWS gibi entegrasyonlarda retry ve log var.

---

# 20) Öncelikli yapılacaklar listesi

## En acil 10 madde

1. i18n key fallback düzelt.
2. Sidebar + Topbar standardize et.
3. PageContainer max-width uygula.
4. Component token sistemini kur.
5. DataTable standardı çıkar.
6. Dashboard’u action center mantığıyla yeniden kur.
7. Invoice list/detail para hizalarını ve status flow’u düzelt.
8. HMO Claims yatay scroll problemini çöz.
9. Kiosk/TV hata durumlarını kullanıcı dostu yap.
10. Backend audit + permission standardını oturt.

## En riskli noktalar

- PhilHealth/PECWS güvenlik ve encryption.
- HMO claim state transition.
- Invoice paid/void/refund muhasebe mantığı.
- Kiosk token güvenliği.
- Translation key eksikleri.

---

# 21) Test planı

## UI smoke test

Her sayfada:

- Loading state görünüyor mu?
- Empty state düzgün mü?
- Error state düzgün mü?
- Primary action doğru mu?
- Mobil/tablet kırılıyor mu?

## İş akışı testi

1. Yeni hasta oluştur.
2. Randevu oluştur.
3. Check-in yap.
4. Randevuyu complete yap.
5. Invoice oluştur.
6. Payment kaydet.
7. HMO claim başlat.
8. Claim submit/approve/paid yap.
9. Audit log kontrol et.

## Kiosk testi

- Token geçerli
- Token hatalı
- API down
- Hasta check-in
- Staff login
- Dil değişimi

## TV Queue testi

- 0 hasta
- 1 now serving
- 10 waiting
- API 503
- Network reconnect

---

# 22) Uygulama notu

Bu paketi doğrudan koda geçirmek için ilk ihtiyaçlar:

1. `package.json`
2. `src` klasör yapısı
3. Mevcut `Layout/Sidebar` componentleri
4. Bir örnek sayfa: Dashboard veya Invoices
5. Backend API route yapısı
6. DB şeması veya ORM modelleri

Bu dosyalar geldikten sonra ilk teslimat şöyle yapılmalı:

- Yeni AppShell
- Yeni Sidebar
- Yeni PageHeader
- Yeni MetricCard
- Yeni DataTable
- Yeni Dashboard sayfası

Bunlar oturduktan sonra diğer sayfalar aynı sisteme taşınır.


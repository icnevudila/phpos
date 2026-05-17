/** Paylaşılan GAP / paket / EXT listesi — checklist + AGENT_STATUS.json için */
export const GAPS = [
  { id: "GAP-001", title: "Signed URL for patient files", files: "backend/src/app.ts + patientFileStorage.ts", priority: "Kritik" },
  { id: "GAP-002", title: "PayMongo webhook HMAC imza", files: "backend/src/services/invoice.service.ts", priority: "Kritik" },
  { id: "GAP-003", title: "`/auth/register` kilitle", files: "backend/src/routes/auth.routes.ts", priority: "Yüksek" },
  { id: "GAP-004", title: "Rate limiting (express-rate-limit)", files: "backend/src/app.ts", priority: "Yüksek" },
  { id: "GAP-005", title: "CORS allowlist", files: "backend/src/app.ts", priority: "Yüksek" },
  { id: "GAP-006", title: "Refresh token rotation", files: "backend/src/services/auth.service.ts", priority: "Orta" },
  { id: "GAP-007", title: "Dev OTP yanıtta", files: "backend/src/controllers/portal.controller.ts", priority: "Orta" },
  { id: "GAP-008", title: "Event log hassas veri", files: "backend/src/events/*.ts", priority: "Orta" },
  { id: "GAP-009", title: "Global audit log middleware", files: "backend/src/middleware/ (yeni)", priority: "Yüksek" },
  { id: "GAP-010", title: "Access log (DPA)", files: "backend/src/middleware/ (yeni)", priority: "Orta" },
  { id: "GAP-011", title: "`GET /api/auth/me`", files: "backend + frontend", priority: "Yüksek" },
  { id: "GAP-012", title: "Forgot + reset password", files: "backend + frontend", priority: "Yüksek" },
  { id: "GAP-013", title: "MFA / 2FA", files: "backend + frontend", priority: "Düşük" },
  { id: "GAP-014", title: "Staff / user management", files: "backend + frontend", priority: "Yüksek" },
  { id: "GAP-015", title: "Clinic settings API", files: "backend + frontend", priority: "Yüksek" },
  { id: "GAP-016", title: "404 sayfası", files: "frontend/src/App.tsx", priority: "Yüksek" },
  { id: "GAP-017", title: "ProtectedRoute `roles` kullan", files: "frontend/src/App.tsx", priority: "Yüksek" },
  { id: "GAP-018", title: "LoginPage i18n", files: "frontend/src/pages/LoginPage.tsx", priority: "Orta" },
  { id: "GAP-019", title: "Staff UI full i18n", files: "tüm frontend/src", priority: "Yüksek" },
  { id: "GAP-020", title: "Theme switcher UI", files: "frontend", priority: "Düşük" },
  { id: "GAP-021", title: "HmoProvider CRUD UI", files: "frontend (yeni)", priority: "Kritik" },
  { id: "GAP-022", title: "HmoClaim workflow UI", files: "frontend (yeni)", priority: "Kritik" },
  { id: "GAP-023", title: "PatientHmo tab", files: "PatientDetailPage", priority: "Kritik" },
  { id: "GAP-024", title: "Invoice HMO rozeti", files: "InvoicePage", priority: "Kritik" },
  { id: "GAP-025", title: "Dashboard HMO Pending widget", files: "DashboardPage", priority: "Yüksek" },
  { id: "GAP-026", title: "Senior Citizen %20 + VAT muafiyet", files: "invoice.service + PatientForm", priority: "Kritik" },
  { id: "GAP-027", title: "PWD %20 + VAT muafiyet", files: "invoice.service + PatientForm", priority: "Kritik" },
  { id: "GAP-028", title: "TIN alanı patient + clinic", files: "Prisma migration", priority: "Yüksek" },
  { id: "GAP-029", title: "BIR PTU no. invoice PDF", files: "invoicePdf.ts + Clinic", priority: "Yüksek" },
  { id: "GAP-030", title: "BIR journal export", files: "reports (yeni)", priority: "Orta" },
  { id: "GAP-031", title: "PhilHealth üyelik tipi", files: "Patient + UI", priority: "Orta" },
  { id: "GAP-032", title: "PhilHealth Claim Form 1-2", files: "patientFormsPdf.ts", priority: "Düşük" },
  { id: "GAP-033", title: "Invoice Maya seçim UI", files: "InvoicePage", priority: "Orta" },
  { id: "GAP-034", title: "Aged receivables raporu", files: "reports (yeni)", priority: "Orta" },
  { id: "GAP-035", title: "Refunds", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-036", title: "Recalls (6 ay check-up)", files: "backend + UI", priority: "Orta" },
  { id: "GAP-037", title: "Waitlist", files: "backend + UI", priority: "Orta" },
  { id: "GAP-038", title: "Treatment Plan multi-visit", files: "backend + UI", priority: "Orta" },
  { id: "GAP-039", title: "Prescription (Rx)", files: "backend + UI", priority: "Yüksek" },
  { id: "GAP-040", title: "Consent e-sign", files: "backend + UI", priority: "Yüksek" },
  { id: "GAP-041", title: "X-ray + intraoral galeri", files: "PatientDetailPage", priority: "Yüksek" },
  { id: "GAP-042", title: "Patient photo/avatar", files: "PatientForm", priority: "Orta" },
  { id: "GAP-043", title: "Family linking", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-044", title: "Referral (sevk)", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-045", title: "Lab orders (tplab ref)", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-046", title: "Calendar week/month view", files: "AppointmentsPage", priority: "Orta" },
  { id: "GAP-047", title: "Room/chair assignment", files: "Prisma + UI", priority: "Düşük" },
  { id: "GAP-048", title: "Drag-drop reschedule", files: "AppointmentsPage", priority: "Orta" },
  { id: "GAP-049", title: "Appointment conflict UI", files: "AppointmentsPage", priority: "Orta" },
  { id: "GAP-050", title: "Dentist self-filter", files: "appointment.service", priority: "Orta" },
  { id: "GAP-051", title: "Perio recession+suppuration UI", files: "PeriodontalChart", priority: "Orta" },
  { id: "GAP-052", title: "Perio edit (update çağır)", files: "PeriodontalChart", priority: "Orta" },
  { id: "GAP-053", title: "MedicalHistoryForm hata yutma", files: "MedicalHistoryForm", priority: "Yüksek" },
  { id: "GAP-054", title: "CSV patient bulk import", files: "backend + UI", priority: "Orta" },
  { id: "GAP-055", title: "CSV patient bulk export", files: "PatientList", priority: "Düşük" },
  { id: "GAP-056", title: "Bulk SMS", files: "PatientList", priority: "Düşük" },
  { id: "GAP-057", title: "FDI notation toggle", files: "DentalChart", priority: "Düşük" },
  { id: "GAP-058", title: "Treatment toothIds etiket", files: "PatientDetailPage", priority: "Orta" },
  { id: "GAP-059", title: "Birthday greeting", files: "Scheduler", priority: "Düşük" },
  { id: "GAP-060", title: "Feedback / NPS", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-061", title: "Patient Queue widget", files: "DashboardPage", priority: "Yüksek" },
  { id: "GAP-062", title: "Düşük stok widget", files: "DashboardPage", priority: "Orta" },
  { id: "GAP-063", title: "Doğum günü listesi", files: "DashboardPage", priority: "Düşük" },
  { id: "GAP-064", title: "Alerts merkezi", files: "DashboardPage", priority: "Orta" },
  { id: "GAP-065", title: "Standalone ReportsPage", files: "frontend (yeni)", priority: "Orta" },
  { id: "GAP-066", title: "Revenue aging raporu", files: "reports", priority: "Orta" },
  { id: "GAP-067", title: "Procedure frequency raporu", files: "reports", priority: "Düşük" },
  { id: "GAP-068", title: "HMO reconciliation", files: "reports", priority: "Yüksek" },
  { id: "GAP-069", title: "Recall compliance", files: "reports", priority: "Düşük" },
  { id: "GAP-070", title: "CSV export (tüm raporlar)", files: "reports", priority: "Orta" },
  { id: "GAP-076", title: "Email kanalı (Resend)", files: "backend/src/lib/resend.ts (yeni)", priority: "Yüksek" },
  { id: "GAP-077", title: "SMS şablon düzenleme UI", files: "NotificationSettingsPage", priority: "Orta" },
  { id: "GAP-078", title: "Quiet hours (sessiz saat)", files: "scheduler", priority: "Orta" },
  { id: "GAP-079", title: "Klinik-bazlı bildirim ayarı", files: "backend + UI", priority: "Orta" },
  { id: "GAP-080", title: "`services/notifications.ts` refactor", files: "frontend (yeni)", priority: "Orta" },
  { id: "GAP-081", title: "SMS multi-provider", files: "backend/src/services/notification/", priority: "Düşük" },
  { id: "GAP-082", title: "Portal register akışı", files: "portal (yeni)", priority: "Orta" },
  { id: "GAP-091", title: "Tablolarda overflow-x-auto", files: "4 staff sayfası", priority: "Yüksek" },
  { id: "GAP-092", title: "Dokunma hedefi 44px", files: "Tüm ikon butonları", priority: "Yüksek" },
  { id: "GAP-093", title: "AppointmentsPage mobile özet", files: "AppointmentsPage", priority: "Orta" },
  { id: "GAP-094", title: "FullCalendar mobile liste view", files: "AppointmentsPage", priority: "Orta" },
  { id: "GAP-095", title: "Fluid tipografi", files: "index.css", priority: "Düşük" },
  { id: "GAP-096", title: "ARIA label sistematik", files: "tüm UI", priority: "Orta" },
  { id: "GAP-097", title: "role=alert hata kutuları", files: "LoginPage + Portal", priority: "Orta" },
  { id: "GAP-098", title: "role=tablist portal sekmeleri", files: "PortalAppointmentsPage", priority: "Düşük" },
  { id: "GAP-099", title: "aria-pressed seçili butonlar", files: "PortalBookPage", priority: "Düşük" },
  { id: "GAP-100", title: "Klavye kısayolları", files: "global", priority: "Düşük" },
  { id: "GAP-101", title: "Pricing enum ↔ landing", files: "schema.prisma + HomePage", priority: "Yüksek" },
  { id: "GAP-102", title: "Footer Privacy link", files: "HomePage + yeni /privacy", priority: "Kritik" },
  { id: "GAP-103", title: "Footer Terms link", files: "HomePage + yeni /terms", priority: "Yüksek" },
  { id: "GAP-104", title: "About/Contact/Pricing/Features sayfaları", files: "frontend (yeni)", priority: "Orta" },
  { id: "GAP-105", title: "Mockup illustrative etiket", files: "DeviceMockups", priority: "Orta" },
  { id: "GAP-106", title: "Mockup gerçek screenshot", files: "DeviceMockups", priority: "Düşük" },
  { id: "GAP-107", title: "f6 Reports kartı", files: "HomePage", priority: "Düşük" },
  { id: "GAP-108", title: "Fake testimonial etiketle", files: "HomePage", priority: "Orta" },
  { id: "GAP-109", title: "Offline PWA vaadi", files: "landing + service worker", priority: "Orta" },
  { id: "GAP-110", title: "Multi-branch vaadi", files: "landing", priority: "Orta" },
  { id: "GAP-111", title: "CSV import vaadi", files: "landing", priority: "Orta" },
  { id: "GAP-112", title: "Waitlist vaadi", files: "landing", priority: "Orta" },
  { id: "GAP-113", title: "Google Calendar entegrasyonu", files: "landing", priority: "Düşük" },
  { id: "GAP-114", title: "DeviceMockups Türkçe karışımı", files: "DeviceMockups", priority: "Düşük" },
  { id: "GAP-115", title: "Newsletter backend bağla", files: "HomePage", priority: "Düşük" },
  { id: "GAP-116", title: "Nav HMO + Staff + Settings", files: "navItems.tsx", priority: "Yüksek" },
  { id: "GAP-117", title: "Patient Queue (mockup vs dashboard)", files: "DashboardPage", priority: "Yüksek" },
  { id: "GAP-118", title: "Staff UI i18n (mockup 3 dil)", files: "tüm sayfalar", priority: "Yüksek" },
  { id: "GAP-119", title: "Mobile-first metni ile uyumluluk", files: "tablolar + dokunma", priority: "Yüksek" },
  { id: "GAP-120", title: "pages/index.ts barrel", files: "frontend/src/pages/index.ts", priority: "Düşük" },
  { id: "GAP-121", title: "Tailwind marka tema token", files: "tailwind.config.js", priority: "Düşük" },
  { id: "GAP-122", title: "Dark mode toggler header", files: "AppTopbar", priority: "Düşük" },
  { id: "GAP-123", title: "PWA / service worker", files: "vite PWA plugin", priority: "Orta" },
  { id: "GAP-124", title: "ClinicGroup / Multi-branch", files: "Prisma + UI", priority: "Düşük" },
  { id: "GAP-125", title: "Split payment", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-126", title: "QR Ph ödeme", files: "backend + UI", priority: "Orta" },
  { id: "GAP-127", title: "GrabPay ödeme", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-128", title: "BPI/BDO direct", files: "backend + UI", priority: "Düşük" },
  { id: "GAP-129", title: "Intl.DateTimeFormat TZ Manila", files: "PortalHomePage", priority: "Orta" },
  { id: "GAP-130", title: "PHP ₱ format tutarlılığı", files: "tüm UI", priority: "Orta" },
];


export function parallelNote(id) {
  if (SHARED_APP.has(id)) return "`app.ts` — GAP-001,004,005 aynı dosya; **tek agent sırayla** veya tek PR.";
  if (SHARED_INVOICE_SVC.has(id)) return "`invoice.service` — GAP-002,026,027,033 çakışabilir; sıra veya tek PR.";
  if (SHARED_PATIENT_DETAIL.has(id)) return "`PatientDetailPage` — 023,041,058 koordine.";
  if (SHARED_APPOINTMENTS.has(id)) return "`AppointmentsPage` — 046,048,049,093,094 koordine.";
  if (SHARED_DASHBOARD.has(id)) return "`DashboardPage` — 025,061-064,117 koordine.";
  if (SHARED_INVOICE_PAGE.has(id)) return "`InvoicePage` — 024,033 koordine.";
  if (SHARED_HOME.has(id)) return "`HomePage` + routing — 101-104,107,108,115 koordine.";
  if (SHARED_DEVICE.has(id)) return "`DeviceMockups` — 105,106,114 koordine.";
  if (id === "GAP-019" || id === "GAP-118") return "Geniş kapsam — alt-modüllere böl veya tek uzun sprint.";
  if (id === "GAP-130") return "Tüm UI — **son aşama** veya `formatPHP` helper tek PR.";
  return "**İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).";
}

function promptFor(g) {
  return [
    `Repo: filipin mvp. Görev: **${g.id}** — ${g.title}.`,
    `Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: ${g.files}.`,
    `Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.`,
  ].join(" ");
}


export const RESERVED_RANGES = [
  { range: "GAP-071 — GAP-075", note: "Bölüm 13 tablosunda atlanmış (070 → 076)." },
  { range: "GAP-083 — GAP-090", note: "Bölüm 13 tablosunda atlanmış (082 → 091)." },
];

export const PACKAGE_TASKS = [
  { id: "PKG-A", title: "Bölüm 17 Paket A — PH Yasal + Güvenlik", kind: "package" },
  { id: "PKG-B", title: "Bölüm 17 Paket B — HMO tam akış", kind: "package" },
  { id: "PKG-C", title: "Bölüm 17 Paket C — Staff deneyimi", kind: "package" },
  { id: "PKG-D", title: "Bölüm 17 Paket D — Klinik akışı", kind: "package" },
  { id: "PKG-E", title: "Bölüm 17 Paket E — Dashboard+", kind: "package" },
  { id: "PKG-F", title: "Bölüm 17 Paket F — Kanal + ödeme", kind: "package" },
];

export const EXT_TASKS = [
  { id: "EXT-18", title: "Bölüm 18 — Kararların kodlanması", kind: "ext" },
  { id: "EXT-19", title: "Bölüm 19 — Login rework", kind: "ext" },
  { id: "EXT-20", title: "Bölüm 20 — Landing rework", kind: "ext" },
  { id: "EXT-21", title: "Bölüm 21 — PDF/Excel", kind: "ext" },
  { id: "EXT-22", title: "Bölüm 22 — i18n 5 dil", kind: "ext" },
  { id: "EXT-23", title: "Bölüm 23 — Design system + PDF görsel", kind: "ext" },
  { id: "EXT-24", title: "Bölüm 24 — Otomasyon + event bus", kind: "ext" },
];

export const RESERVED_SLOTS = [
  { id: "RES-071-075", title: "Rezerve GAP-071–075 (tabloda satır yok)", kind: "reserved" },
  { id: "RES-083-090", title: "Rezerve GAP-083–090 (tabloda satır yok)", kind: "reserved" },
];

export function getAllTaskMeta() {
  const rows = [];
  for (const g of GAPS) {
    rows.push({ id: g.id, title: g.title, kind: "gap", files: g.files, priority: g.priority });
  }
  for (const p of PACKAGE_TASKS) {
    rows.push({ id: p.id, title: p.title, kind: p.kind });
  }
  for (const e of EXT_TASKS) {
    rows.push({ id: e.id, title: e.title, kind: e.kind });
  }
  for (const r of RESERVED_SLOTS) {
    rows.push({ id: r.id, title: r.title, kind: r.kind });
  }
  return rows;
}

export function getAllTaskIds() {
  return getAllTaskMeta().map((r) => r.id);
}

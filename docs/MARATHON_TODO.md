# DentQL — Maraton TODO

> `[x]` = bitti  
> **Tam master liste (A→Z):** [`AGENT_MASTER_TODO_AZ.md`](AGENT_MASTER_TODO_AZ.md)

## A — Auth & güvenlik
- [x] Şifremi unuttum / sıfırlama
- [x] `ALLOW_PUBLIC_REGISTER` kilidi
- [x] Refresh token rotation
- [x] Global audit log
- [x] Auth smoke script (`scripts/smoke-api.mjs`)

## B — Portal
- [x] Portal hasta kayıt
- [x] Portal book / history
- [x] Portal mobil responsive (kiosk + max-width; cihazda manuel QA önerilir)

## C — Kritik bug & UX
- [x] Fatura SPA navigate
- [x] MedicalHistoryForm retry
- [x] RoleGuard
- [x] Randevu 409
- [x] Perio kaydet + doğrulama
- [x] Tablo mobile overflow

## D — Raporlama
- [x] Hasta / fatura CSV
- [x] HMO mutabakat
- [x] BIR journal CSV
- [x] Dashboard summary API + frontend

## E — Performans
- [x] Analytics N+1
- [x] Prisma index migration (SQL hazır — deploy sizde)
- [x] Dashboard summary hızlı KPI
- [x] HomePage lazy

## F — Klinik UI
- [x] PatientDetail sekmeler
- [x] ElectronicConsent + DocumentsTab
- [x] Treatment timeline
- [x] HMO rozet
- [x] Inventory i18n + Zebra yazdır

## G — Bildirim
- [x] Bildirim ayarları (Settings)
- [x] notifications.ts refactor
- [x] Resend HTML şablonları (`emailTemplates.ts`)

## H — Landing
- [x] IntegrationsStrip / metinler / coming soon
- [x] Testimonials + DeviceMockups illustrative

## I — Deploy & ops
- [x] Prod `.env` checklist (`docs/PROD_ENV_CHECKLIST.md`)
- [x] CI build yeşil (backend + frontend `tsc`)
- [x] E2E smoke (`scripts/smoke-api.mjs`)

## J — Append
- [x] Odontogram batch save
- [x] `pages.tr.json` ana yeni anahtarlar (sürekli senkron önerilir)

## İsteğe bağlı (v2)
- [x] Dashboard endpoint tam bölme (queue/charts ayrı sorgular)
- [x] Perio grid inline edit (recession/sup — `PerioMeasurementEditor`)
- [x] Tedavi planı sekmesi (`TreatmentPlanTab`)
- [x] Dashboard ağır bileşenler lazy (`ClinicFloorPlanBoard`, `FinancialOverview`, `HmoClaimRadar`)
- [x] CSV hasta import (API + PatientList)
- [ ] PWA offline sync (manifest hazır; service worker yok)

# AGENT_DASHBOARD — İlerleme Özeti

> Otomatik üretim: `node scripts/agent-dashboard.mjs`  
> Son güncelleme: **2026-04-19T01:28:50.340Z**  

| Metrik | Değer |
|--------|-------|
| Toplam görev | 132 |
| Tamamlanan | 16 |
| Bekleyen | 116 |
| İlerleme | **12.1%** |

## Bekleyenler (ilk 50)

| ID | Başlık | Öncelik |
|----|--------|---------|
| GAP-006 | Refresh token rotation | Orta |
| GAP-007 | Dev OTP yanıtta | Orta |
| GAP-008 | Event log hassas veri | Orta |
| GAP-011 | `GET /api/auth/me` | Yüksek |
| GAP-012 | Forgot + reset password | Yüksek |
| GAP-013 | MFA / 2FA | Düşük |
| GAP-014 | Staff / user management | Yüksek |
| GAP-015 | Clinic settings API | Yüksek |
| GAP-018 | LoginPage i18n | Orta |
| GAP-019 | Staff UI full i18n | Yüksek |
| GAP-020 | Theme switcher UI | Düşük |
| GAP-021 | HmoProvider CRUD UI | Kritik |
| GAP-024 | Invoice HMO rozeti | Kritik |
| GAP-028 | TIN alanı patient + clinic | Yüksek |
| GAP-029 | BIR PTU no. invoice PDF | Yüksek |
| GAP-030 | BIR journal export | Orta |
| GAP-031 | PhilHealth üyelik tipi | Orta |
| GAP-032 | PhilHealth Claim Form 1-2 | Düşük |
| GAP-033 | Invoice Maya seçim UI | Orta |
| GAP-034 | Aged receivables raporu | Orta |
| GAP-035 | Refunds | Düşük |
| GAP-036 | Recalls (6 ay check-up) | Orta |
| GAP-037 | Waitlist | Orta |
| GAP-038 | Treatment Plan multi-visit | Orta |
| GAP-039 | Prescription (Rx) | Yüksek |
| GAP-040 | Consent e-sign | Yüksek |
| GAP-041 | X-ray + intraoral galeri | Yüksek |
| GAP-042 | Patient photo/avatar | Orta |
| GAP-043 | Family linking | Düşük |
| GAP-044 | Referral (sevk) | Düşük |
| GAP-045 | Lab orders (tplab ref) | Düşük |
| GAP-046 | Calendar week/month view | Orta |
| GAP-047 | Room/chair assignment | Düşük |
| GAP-048 | Drag-drop reschedule | Orta |
| GAP-049 | Appointment conflict UI | Orta |
| GAP-050 | Dentist self-filter | Orta |
| GAP-051 | Perio recession+suppuration UI | Orta |
| GAP-052 | Perio edit (update çağır) | Orta |
| GAP-054 | CSV patient bulk import | Orta |
| GAP-055 | CSV patient bulk export | Düşük |
| GAP-056 | Bulk SMS | Düşük |
| GAP-057 | FDI notation toggle | Düşük |
| GAP-058 | Treatment toothIds etiket | Orta |
| GAP-059 | Birthday greeting | Düşük |
| GAP-060 | Feedback / NPS | Düşük |
| GAP-061 | Patient Queue widget | Yüksek |
| GAP-062 | Düşük stok widget | Orta |
| GAP-063 | Doğum günü listesi | Düşük |
| GAP-064 | Alerts merkezi | Orta |
| GAP-065 | Standalone ReportsPage | Orta |

## Son tamamlananlar (20)

| ID | Tamamlanma | Özet |
|----|------------|------|
| GAP-053 | 2026-04-19T01:28:50.340Z | MedicalHistoryForm: reset on null API data; apiFetch central network/offline and |
| GAP-080 | 2026-04-18T13:21:04.689Z | services/notifications.ts + sayfa refactor |
| GAP-025 | 2026-04-18T13:21:04.504Z | Dashboard pending HMO + link |
| GAP-023 | 2026-04-18T13:21:04.273Z | PatientHmoPanel sekmesi |
| GAP-022 | 2026-04-18T13:21:03.953Z | HmoClaimsPage workflow |
| GAP-017 | 2026-04-18T13:21:03.766Z | Inventory RoleGuard ile korunuyor |
| GAP-016 | 2026-04-18T13:21:03.570Z | NotFoundPage ve catch-all route |
| GAP-005 | 2026-04-18T13:21:03.384Z | CORS_ORIGIN allowlist; prod boşta reddet |
| GAP-004 | 2026-04-18T13:21:03.200Z | API prefix altında express-rate-limit |
| GAP-003 | 2026-04-18T13:21:02.998Z | Kayıt yalnızca ALLOW_PUBLIC_REGISTER=true |
| GAP-002 | 2026-04-18T13:21:02.780Z | Paymongo-Signature + PAYMONGO_WEBHOOK_SECRET (prod zorunlu) |
| GAP-001 | 2026-04-18T13:21:02.638Z | JWT ile dosya indirme; public static kaldırıldı |
| GAP-010 | 2026-04-18T13:10:06.941Z | PhiAccessLog + phiAccessLogMiddleware: /patients* GET erişimleri (DPA izi), pati |
| GAP-027 | 2026-04-18T13:01:26.544Z | PWD: hasta pwdIdNo + invoice.service ile aynı statutory %20 tabanı. |
| GAP-026 | 2026-04-18T13:01:26.084Z | Senior: hasta isSeniorCitizen/oscaIdNo + invoice.service statutory %20 tabanı (c |
| GAP-009 | 2026-04-18T13:01:02.795Z | auditTrailMiddleware + Prisma AuditLog; apiRouter üzerinde mutasyonlar req.user  |

---

Tamamlama kaydı için: [`AGENT_COMPLETION_LOG.md`](AGENT_COMPLETION_LOG.md)
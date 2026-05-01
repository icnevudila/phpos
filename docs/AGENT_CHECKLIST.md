# AGENT_CHECKLIST — Tam GAP Listesi (Otomatik Üretim)

> **Üretim:** `node scripts/generate-agent-checklist.mjs`  
> **Durum / ilerleme:** `docs/AGENT_DASHBOARD.md` + `docs/AGENT_STATUS.json` — `node scripts/agent-dashboard.mjs`  
> **Tamamlanınca kayıt:** `node scripts/log-agent-completion.mjs --id GAP-001 --summary "..."`  
> **Protokol:** `docs/AGENT_PROTOCOL.md`  
> **Kaynak:** `scripts/gap-data.mjs` + `docs/GAP_ANALYSIS.md` Bölüm 13.  
> **Not:** Başlıkta "GAP-240" yazıyor; Bölüm 13'te **131–240 satır yok**. Rezerve aralıklar aşağıda.

---

## Kurallar (tüm sub-agent'lar)

1. Önce `docs/GAP_ANALYSIS.md` ilgili GAP satırını oku.
2. **Minimal diff** — başka modülleri bozma.
3. Çakışma notu varsa aynı batch'te paralel çalıştırma; sıralı veya tek agent.
4. **İş bitince zorunlu:** `node scripts/log-agent-completion.mjs --id <ID> --summary "kısa özet" [--files "a.ts,b.ts"] [--agent isim]`
5. İsteğe bağlı: bu dosyada ilgili **Agent özeti** satırını elle doldur (script tekrar çalışınca üzerine yazılabilir).

---

## Paralellik özeti

| Grup | GAP ID | Not |
|------|--------|-----|
| A | 001,004,005 | `app.ts` — tek sıra |
| B | 002,026,027,033 | `invoice.service` / InvoicePage |
| C | 023,041,058 | PatientDetailPage |
| D | 046,048,049,093,094 | AppointmentsPage |
| E | 025,061–064,117 | DashboardPage |
| F | 101–104,107,108,115 | HomePage + yeni rotalar |
| G | 105,106,114 | DeviceMockups |

---

## GAP-001 … GAP-130 — Sub-agent görevleri

### GAP-001 — Signed URL for patient files

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** backend/src/app.ts + patientFileStorage.ts  
- **Paralellik / çakışma:** `app.ts` — GAP-001,004,005 aynı dosya; **tek agent sırayla** veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-001** — Signed URL for patient files. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/app.ts + patientFileStorage.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-002 — PayMongo webhook HMAC imza

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** backend/src/services/invoice.service.ts  
- **Paralellik / çakışma:** `invoice.service` — GAP-002,026,027,033 çakışabilir; sıra veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-002** — PayMongo webhook HMAC imza. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/services/invoice.service.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-003 — `/auth/register` kilitle

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend/src/routes/auth.routes.ts  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-003** — `/auth/register` kilitle. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/routes/auth.routes.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-004 — Rate limiting (express-rate-limit)

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend/src/app.ts  
- **Paralellik / çakışma:** `app.ts` — GAP-001,004,005 aynı dosya; **tek agent sırayla** veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-004** — Rate limiting (express-rate-limit). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/app.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-005 — CORS allowlist

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend/src/app.ts  
- **Paralellik / çakışma:** `app.ts` — GAP-001,004,005 aynı dosya; **tek agent sırayla** veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-005** — CORS allowlist. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/app.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-006 — Refresh token rotation

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend/src/services/auth.service.ts  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-006** — Refresh token rotation. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/services/auth.service.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-007 — Dev OTP yanıtta

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend/src/controllers/portal.controller.ts  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-007** — Dev OTP yanıtta. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/controllers/portal.controller.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-008 — Event log hassas veri

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend/src/events/*.ts  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-008** — Event log hassas veri. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/events/*.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-009 — Global audit log middleware

- [x] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend/src/middleware/ (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-009** — Global audit log middleware. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/middleware/ (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** Prisma `AuditLog`, `auditTrailMiddleware` (mutasyonlar, `req.user` varken), `apiRouter` başına bağlandı.

---

### GAP-010 — Access log (DPA)

- [x] **Öncelik:** Orta  
- **Hedef dosyalar:** backend/src/middleware/ (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-010** — Access log (DPA). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/middleware/ (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** Prisma `PhiAccessLog`, `phiAccessLogMiddleware` — `/patients` altındaki tüm `GET` (auth + role sonrası) yanıt bittikten sonra; `patientId` `req.params.id` varsa.

---

### GAP-011 — `GET /api/auth/me`

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend + frontend  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-011** — `GET /api/auth/me`. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + frontend. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-012 — Forgot + reset password

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend + frontend  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-012** — Forgot + reset password. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + frontend. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-013 — MFA / 2FA

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + frontend  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-013** — MFA / 2FA. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + frontend. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-014 — Staff / user management

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend + frontend  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-014** — Staff / user management. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + frontend. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-015 — Clinic settings API

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend + frontend  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-015** — Clinic settings API. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + frontend. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-016 — 404 sayfası

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** frontend/src/App.tsx  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-016** — 404 sayfası. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend/src/App.tsx. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-017 — ProtectedRoute `roles` kullan

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** frontend/src/App.tsx  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-017** — ProtectedRoute `roles` kullan. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend/src/App.tsx. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-018 — LoginPage i18n

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** frontend/src/pages/LoginPage.tsx  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-018** — LoginPage i18n. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend/src/pages/LoginPage.tsx. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-019 — Staff UI full i18n

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** tüm frontend/src  
- **Paralellik / çakışma:** Geniş kapsam — alt-modüllere böl veya tek uzun sprint.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-019** — Staff UI full i18n. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: tüm frontend/src. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-020 — Theme switcher UI

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** frontend  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-020** — Theme switcher UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-021 — HmoProvider CRUD UI

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** frontend (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-021** — HmoProvider CRUD UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-022 — HmoClaim workflow UI

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** frontend (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-022** — HmoClaim workflow UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-023 — PatientHmo tab

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** PatientDetailPage  
- **Paralellik / çakışma:** `PatientDetailPage` — 023,041,058 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-023** — PatientHmo tab. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PatientDetailPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-024 — Invoice HMO rozeti

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** InvoicePage  
- **Paralellik / çakışma:** `InvoicePage` — 024,033 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-024** — Invoice HMO rozeti. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: InvoicePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-025 — Dashboard HMO Pending widget

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** DashboardPage  
- **Paralellik / çakışma:** `DashboardPage` — 025,061-064,117 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-025** — Dashboard HMO Pending widget. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DashboardPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-026 — Senior Citizen %20 + VAT muafiyet

- [x] **Öncelik:** Kritik  
- **Hedef dosyalar:** invoice.service + PatientForm  
- **Paralellik / çakışma:** `invoice.service` — GAP-002,026,027,033 çakışabilir; sıra veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-026** — Senior Citizen %20 + VAT muafiyet. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: invoice.service + PatientForm. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-027 — PWD %20 + VAT muafiyet

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** invoice.service + PatientForm  
- **Paralellik / çakışma:** `invoice.service` — GAP-002,026,027,033 çakışabilir; sıra veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-027** — PWD %20 + VAT muafiyet. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: invoice.service + PatientForm. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** `pwdIdNo` şema + API + invoice statutory %20; PatientForm’da PWD ID alanı. VAT ayrı satır henüz yok.

---

### GAP-028 — TIN alanı patient + clinic

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** Prisma migration  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-028** — TIN alanı patient + clinic. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: Prisma migration. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-029 — BIR PTU no. invoice PDF

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** invoicePdf.ts + Clinic  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-029** — BIR PTU no. invoice PDF. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: invoicePdf.ts + Clinic. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-030 — BIR journal export

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** reports (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-030** — BIR journal export. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-031 — PhilHealth üyelik tipi

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** Patient + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-031** — PhilHealth üyelik tipi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: Patient + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-032 — PhilHealth Claim Form 1-2

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** patientFormsPdf.ts  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-032** — PhilHealth Claim Form 1-2. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: patientFormsPdf.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-033 — Invoice Maya seçim UI

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** InvoicePage  
- **Paralellik / çakışma:** `invoice.service` — GAP-002,026,027,033 çakışabilir; sıra veya tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-033** — Invoice Maya seçim UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: InvoicePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-034 — Aged receivables raporu

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** reports (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-034** — Aged receivables raporu. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-035 — Refunds

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-035** — Refunds. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-036 — Recalls (6 ay check-up)

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-036** — Recalls (6 ay check-up). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-037 — Waitlist

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-037** — Waitlist. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-038 — Treatment Plan multi-visit

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-038** — Treatment Plan multi-visit. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-039 — Prescription (Rx)

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-039** — Prescription (Rx). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-040 — Consent e-sign

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-040** — Consent e-sign. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-041 — X-ray + intraoral galeri

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** PatientDetailPage  
- **Paralellik / çakışma:** `PatientDetailPage` — 023,041,058 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-041** — X-ray + intraoral galeri. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PatientDetailPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-042 — Patient photo/avatar

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** PatientForm  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-042** — Patient photo/avatar. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PatientForm. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-043 — Family linking

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-043** — Family linking. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-044 — Referral (sevk)

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-044** — Referral (sevk). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-045 — Lab orders (tplab ref)

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-045** — Lab orders (tplab ref). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-046 — Calendar week/month view

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** AppointmentsPage  
- **Paralellik / çakışma:** `AppointmentsPage` — 046,048,049,093,094 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-046** — Calendar week/month view. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: AppointmentsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-047 — Room/chair assignment

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** Prisma + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-047** — Room/chair assignment. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: Prisma + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-048 — Drag-drop reschedule

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** AppointmentsPage  
- **Paralellik / çakışma:** `AppointmentsPage` — 046,048,049,093,094 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-048** — Drag-drop reschedule. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: AppointmentsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-049 — Appointment conflict UI

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** AppointmentsPage  
- **Paralellik / çakışma:** `AppointmentsPage` — 046,048,049,093,094 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-049** — Appointment conflict UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: AppointmentsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-050 — Dentist self-filter

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** appointment.service  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-050** — Dentist self-filter. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: appointment.service. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-051 — Perio recession+suppuration UI

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** PeriodontalChart  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-051** — Perio recession+suppuration UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PeriodontalChart. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-052 — Perio edit (update çağır)

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** PeriodontalChart  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-052** — Perio edit (update çağır). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PeriodontalChart. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-053 — MedicalHistoryForm hata yutma

- [x] **Öncelik:** Yüksek  
- **Hedef dosyalar:** MedicalHistoryForm  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-053** — MedicalHistoryForm hata yutma. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: MedicalHistoryForm. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** Yüklemede `data: null` iken önceki hasta formunun kalması giderildi (`MedicalHistoryForm`). Staff API çağrıları için `apiFetch` merkezi ağ/500/i18n (`errors.networkOffline`, `errors.serverError`); `ph`/`tl`/`hil` locale eşlemesi eklendi.

---

### GAP-054 — CSV patient bulk import

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-054** — CSV patient bulk import. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-055 — CSV patient bulk export

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** PatientList  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-055** — CSV patient bulk export. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PatientList. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-056 — Bulk SMS

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** PatientList  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-056** — Bulk SMS. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PatientList. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-057 — FDI notation toggle

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** DentalChart  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-057** — FDI notation toggle. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DentalChart. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-058 — Treatment toothIds etiket

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** PatientDetailPage  
- **Paralellik / çakışma:** `PatientDetailPage` — 023,041,058 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-058** — Treatment toothIds etiket. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PatientDetailPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-059 — Birthday greeting

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** Scheduler  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-059** — Birthday greeting. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: Scheduler. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-060 — Feedback / NPS

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-060** — Feedback / NPS. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-061 — Patient Queue widget

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** DashboardPage  
- **Paralellik / çakışma:** `DashboardPage` — 025,061-064,117 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-061** — Patient Queue widget. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DashboardPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-062 — Düşük stok widget

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** DashboardPage  
- **Paralellik / çakışma:** `DashboardPage` — 025,061-064,117 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-062** — Düşük stok widget. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DashboardPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-063 — Doğum günü listesi

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** DashboardPage  
- **Paralellik / çakışma:** `DashboardPage` — 025,061-064,117 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-063** — Doğum günü listesi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DashboardPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-064 — Alerts merkezi

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** DashboardPage  
- **Paralellik / çakışma:** `DashboardPage` — 025,061-064,117 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-064** — Alerts merkezi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DashboardPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-065 — Standalone ReportsPage

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** frontend (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-065** — Standalone ReportsPage. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-066 — Revenue aging raporu

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** reports  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-066** — Revenue aging raporu. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-067 — Procedure frequency raporu

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** reports  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-067** — Procedure frequency raporu. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-068 — HMO reconciliation

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** reports  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-068** — HMO reconciliation. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-069 — Recall compliance

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** reports  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-069** — Recall compliance. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-070 — CSV export (tüm raporlar)

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** reports  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-070** — CSV export (tüm raporlar). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: reports. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-076 — Email kanalı (Resend)

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** backend/src/lib/resend.ts (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-076** — Email kanalı (Resend). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/lib/resend.ts (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-077 — SMS şablon düzenleme UI

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** NotificationSettingsPage  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-077** — SMS şablon düzenleme UI. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: NotificationSettingsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-078 — Quiet hours (sessiz saat)

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** scheduler  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-078** — Quiet hours (sessiz saat). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: scheduler. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-079 — Klinik-bazlı bildirim ayarı

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-079** — Klinik-bazlı bildirim ayarı. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-080 — `services/notifications.ts` refactor

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** frontend (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-080** — `services/notifications.ts` refactor. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-081 — SMS multi-provider

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend/src/services/notification/  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-081** — SMS multi-provider. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend/src/services/notification/. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-082 — Portal register akışı

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** portal (yeni)  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-082** — Portal register akışı. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: portal (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-091 — Tablolarda overflow-x-auto

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** 4 staff sayfası  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-091** — Tablolarda overflow-x-auto. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: 4 staff sayfası. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-092 — Dokunma hedefi 44px

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** Tüm ikon butonları  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-092** — Dokunma hedefi 44px. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: Tüm ikon butonları. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-093 — AppointmentsPage mobile özet

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** AppointmentsPage  
- **Paralellik / çakışma:** `AppointmentsPage` — 046,048,049,093,094 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-093** — AppointmentsPage mobile özet. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: AppointmentsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-094 — FullCalendar mobile liste view

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** AppointmentsPage  
- **Paralellik / çakışma:** `AppointmentsPage` — 046,048,049,093,094 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-094** — FullCalendar mobile liste view. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: AppointmentsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-095 — Fluid tipografi

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** index.css  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-095** — Fluid tipografi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: index.css. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-096 — ARIA label sistematik

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** tüm UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-096** — ARIA label sistematik. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: tüm UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-097 — role=alert hata kutuları

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** LoginPage + Portal  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-097** — role=alert hata kutuları. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: LoginPage + Portal. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-098 — role=tablist portal sekmeleri

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** PortalAppointmentsPage  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-098** — role=tablist portal sekmeleri. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PortalAppointmentsPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-099 — aria-pressed seçili butonlar

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** PortalBookPage  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-099** — aria-pressed seçili butonlar. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PortalBookPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-100 — Klavye kısayolları

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** global  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-100** — Klavye kısayolları. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: global. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-101 — Pricing enum ↔ landing

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** schema.prisma + HomePage  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-101** — Pricing enum ↔ landing. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: schema.prisma + HomePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-102 — Footer Privacy link

- [ ] **Öncelik:** Kritik  
- **Hedef dosyalar:** HomePage + yeni /privacy  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-102** — Footer Privacy link. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: HomePage + yeni /privacy. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-103 — Footer Terms link

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** HomePage + yeni /terms  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-103** — Footer Terms link. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: HomePage + yeni /terms. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-104 — About/Contact/Pricing/Features sayfaları

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** frontend (yeni)  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-104** — About/Contact/Pricing/Features sayfaları. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend (yeni). Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-105 — Mockup illustrative etiket

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** DeviceMockups  
- **Paralellik / çakışma:** `DeviceMockups` — 105,106,114 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-105** — Mockup illustrative etiket. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DeviceMockups. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-106 — Mockup gerçek screenshot

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** DeviceMockups  
- **Paralellik / çakışma:** `DeviceMockups` — 105,106,114 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-106** — Mockup gerçek screenshot. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DeviceMockups. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-107 — f6 Reports kartı

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** HomePage  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-107** — f6 Reports kartı. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: HomePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-108 — Fake testimonial etiketle

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** HomePage  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-108** — Fake testimonial etiketle. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: HomePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-109 — Offline PWA vaadi

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** landing + service worker  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-109** — Offline PWA vaadi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: landing + service worker. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-110 — Multi-branch vaadi

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** landing  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-110** — Multi-branch vaadi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: landing. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-111 — CSV import vaadi

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** landing  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-111** — CSV import vaadi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: landing. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-112 — Waitlist vaadi

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** landing  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-112** — Waitlist vaadi. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: landing. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-113 — Google Calendar entegrasyonu

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** landing  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-113** — Google Calendar entegrasyonu. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: landing. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-114 — DeviceMockups Türkçe karışımı

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** DeviceMockups  
- **Paralellik / çakışma:** `DeviceMockups` — 105,106,114 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-114** — DeviceMockups Türkçe karışımı. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DeviceMockups. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-115 — Newsletter backend bağla

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** HomePage  
- **Paralellik / çakışma:** `HomePage` + routing — 101-104,107,108,115 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-115** — Newsletter backend bağla. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: HomePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-116 — Nav HMO + Staff + Settings

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** navItems.tsx  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-116** — Nav HMO + Staff + Settings. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: navItems.tsx. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-117 — Patient Queue (mockup vs dashboard)

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** DashboardPage  
- **Paralellik / çakışma:** `DashboardPage` — 025,061-064,117 koordine.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-117** — Patient Queue (mockup vs dashboard). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: DashboardPage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-118 — Staff UI i18n (mockup 3 dil)

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** tüm sayfalar  
- **Paralellik / çakışma:** Geniş kapsam — alt-modüllere böl veya tek uzun sprint.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-118** — Staff UI i18n (mockup 3 dil). Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: tüm sayfalar. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-119 — Mobile-first metni ile uyumluluk

- [ ] **Öncelik:** Yüksek  
- **Hedef dosyalar:** tablolar + dokunma  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-119** — Mobile-first metni ile uyumluluk. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: tablolar + dokunma. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-120 — pages/index.ts barrel

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** frontend/src/pages/index.ts  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-120** — pages/index.ts barrel. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: frontend/src/pages/index.ts. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-121 — Tailwind marka tema token

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** tailwind.config.js  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-121** — Tailwind marka tema token. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: tailwind.config.js. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-122 — Dark mode toggler header

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** AppTopbar  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-122** — Dark mode toggler header. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: AppTopbar. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-123 — PWA / service worker

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** vite PWA plugin  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-123** — PWA / service worker. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: vite PWA plugin. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-124 — ClinicGroup / Multi-branch

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** Prisma + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-124** — ClinicGroup / Multi-branch. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: Prisma + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-125 — Split payment

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-125** — Split payment. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-126 — QR Ph ödeme

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-126** — QR Ph ödeme. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-127 — GrabPay ödeme

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-127** — GrabPay ödeme. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-128 — BPI/BDO direct

- [ ] **Öncelik:** Düşük  
- **Hedef dosyalar:** backend + UI  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-128** — BPI/BDO direct. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: backend + UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-129 — Intl.DateTimeFormat TZ Manila

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** PortalHomePage  
- **Paralellik / çakışma:** **İzole** — diğer GAP ile dosya çakışması düşük (yine de merge öncesi `git pull`).

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-129** — Intl.DateTimeFormat TZ Manila. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: PortalHomePage. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

### GAP-130 — PHP ₱ format tutarlılığı

- [ ] **Öncelik:** Orta  
- **Hedef dosyalar:** tüm UI  
- **Paralellik / çakışma:** Tüm UI — **son aşama** veya `formatPHP` helper tek PR.

**Agent prompt (kopyala):**
```
Repo: filipin mvp. Görev: **GAP-130** — PHP ₱ format tutarlılığı. Kaynak: docs/GAP_ANALYSIS.md Bölüm 13 (satır tablosu). Hedef dosyalar: tüm UI. Sadece bu GAP'i kapat; kapsam dışı refactor yok. Bitince test/build ve checklist'te özet yaz.
```

**Agent özeti:** _yapılmadı_

---

## Bölüm 17 — Paket A–F (özet sub-agent)

Paralel ekip için bir paket = tek büyük agent prompt.

### PKG-A — PH Yasal + Güvenlik
- [ ] **GAP:** 001,002,009,026,027,028,029,102,103  
**Prompt:** `docs/GAP_ANALYSIS.md Bölüm 17 Paket A'yı uygula. Çıktı: signed URL/webhook/audit/Senior-PWD/TIN/Privacy Terms.`

### PKG-B — HMO tam akış
- [ ] **GAP:** 021,022,023,024,025,068  
**Prompt:** `Bölüm 17 Paket B. HMO UI + reconciliation.`

### PKG-C — Staff deneyimi
- [ ] **GAP:** 011,012,014,015,016,017,018,019  
**Prompt:** `Bölüm 17 Paket C. Auth me, password reset, settings, 404, roles, i18n başlangıç.`

### PKG-D — Klinik akışı
- [ ] **GAP:** 036,037,038,039,040,041,042  
**Prompt:** `Bölüm 17 Paket D. Recalls, waitlist, treatment plan, Rx, consent, galeri, foto.`

### PKG-E — Dashboard+
- [ ] **GAP:** 061,062,063,064,065 (025 ile koordine)  
**Prompt:** `Bölüm 17 Paket E. Queue, stok, doğum günü, alerts, ReportsPage.`

### PKG-F — Kanal + ödeme
- [ ] **GAP:** 076,077,078,079,081,126,127,128  
**Prompt:** `Bölüm 17 Paket F. Email, SMS şablon, quiet hours, QR Ph, GrabPay, banka.`

---

## Bölüm 18–24 — Ek sub-agent (GAP tablosunda ID’si olmayan maddeler)

Her biri `docs/GAP_ANALYSIS.md` ilgili bölümde detaylı; **birbirini etkilememesi** için dosya öneklerine göre ayırıldı.

| ID | Konu | Agent prompt |
|----|------|----------------|
| EXT-18 | Kararların kodu (pricing enum BETA/…) | `Bölüm 18 yanıtlı kararları uygula: PricingPlan enum migration; multi-branch Branch modeli; clinic.settings.dentistCanSeeOthers; landing 8 yasal route.` |
| EXT-19 | Login rework tam paket | `Bölüm 19 tüm kabul kriterleri: forgot password UI placeholder, rate limit login, i18n, a11y, branding.` |
| EXT-20 | Landing rework tam paket | `Bölüm 20: LND tablosu + yasal blocker; fake testimonial; integrations strip; SEO.` |
| EXT-21 | PDF/Excel tam paket | `Bölüm 21: tüm PDF iyileştirmeleri + exceljs CSV/XLSX + BIR alanları.` |
| EXT-22 | i18n 5 dil + staff | `Bölüm 22: en/fil/ceb/ilo/tr; TR dev-only; landing TR sızıntısı 0.` |
| EXT-23 | Design system + PDF görsel | `Bölüm 23: tailwind token, ui/*, invoice PDF polish, GCash UI.` |
| EXT-24 | Otomasyon + event bus | `Bölüm 24: PatientAutocomplete Enter + QuickAdd; event bus; cron SMS; RULE-01/02.` |

- [ ] EXT-18 — Özet: _  
- [ ] EXT-19 — Özet: _  
- [ ] EXT-20 — Özet: _  
- [ ] EXT-21 — Özet: _  
- [ ] EXT-22 — Özet: _  
- [ ] EXT-23 — Özet: _  
- [ ] EXT-24 — Özet: _  

---

## Numarası tabloda olmayan GAP aralıkları (placeholder sub-agent)

| Aralık | Açıklama | [ ] |
|--------|----------|-----|
| GAP-071 — GAP-075 | Bölüm 13 tablosunda atlanmış (070 → 076). | [ ] |
| GAP-083 — GAP-090 | Bölüm 13 tablosunda atlanmış (082 → 091). | [ ] |

**Prompt (genel):** `GAP_ANALYSIS Bölüm 13 numaralandırmasını kontrol et; eksik ID'leri ya sil ya da yeni satırla doldur; sonra bu checklist'i yeniden üret.`

---

## GAP-131 … GAP-240 — Tabloda tanım yok

Başlıkta "GAP-240" geçiyor; Bölüm 13'te **131–240 için satır yok**. Kapsam pratikte:

- **EXT-18 … EXT-24** satırları (aşağıda) Bölüm 18–24 ile örtüşür.
- İstersen GAP_ANALYSIS'e yeni tablo eklendiğinde `scripts/gap-data.mjs` içindeki `GAPS` dizisini genişlet ve script'leri yeniden çalıştır.

---

*Bu dosya `node scripts/generate-agent-checklist.mjs` ile üretilir. Elle düzenleme yerine `gap-data.mjs` güncelle.*

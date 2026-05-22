# 🏁 DentEase PH: Comprehensive Production & v2 TODO List

This is the master list of all remaining tasks, fixes, and feature additions required to elevate **DentEase PH** from its current MVP state to a polished, enterprise-grade, commercial SaaS.

---

## 🔒 A — Security, Authentication & Audit Logs
- [ ] **Two-Factor Authentication (2FA / TOTP):** Implement optional authenticator app verification for staff logins.
- [ ] **Active Sessions Management:** Display a list of active login sessions/devices in settings and allow users to terminate all other sessions.
- [ ] **API Keys & Service Accounts:** Implement API key generation and scopes for external integrations.
- [ ] **Penetration Testing & Hardening:**
  - Audit rate limiting on sensitive routes.
  - Test for IDOR (Insecure Direct Object Reference) vulnerabilities (e.g., verifying a clinic cannot access patients or invoices belonging to another `clinicId`).

---

## ⚕️ B — Clinical Workflows & Odontogram
- [ ] **Interactive X-Ray Workspace Integration:**
  - Embed the `XrayAnnotatePanel` directly into the Patient Detail page under the X-Ray tab.
  - Link upload -> gallery list -> click to annotate -> save annotations to backend (`xrayDrawings` JSON).
- [ ] **DICOM Image Support:** Investigate library options (e.g., Cornerstone.js) to view medical-grade DICOM files (v2).
- [ ] **Odontogram Historical Version Diff:**
  - Allow dentists to view timeline snapshots of a patient's odontogram and compare old states with new states.
- [ ] **Loyalty Points UI:** Display patient loyalty points balance on `PatientHeader` and treatment completion screen.

---

## 📨 C — Notifications, E-mails & SMS
- [ ] **Multi-Channel Notification Selection:** Let staff choose whether to send random alerts/reminders via SMS, E-mail, or both.
- [ ] **Birthday & Recall E-mail Campaigns:**
  - Automated worker to check for upcoming patient birthdays or patients whose last visit was > 6 months ago.
- [ ] **Google Review Invite System:** Automated SMS/Email invite sent 24h after appointment completion.
- [ ] **Quiet Hours Backend Enforcement:** Prevent outgoing SMS notifications between 9:00 PM and 8:00 AM (Manila Time).
- [ ] **SMS Template Preview:** Live preview card showing how variables populate inside SMS settings.
- [ ] **Notification Delivery Log:** Dedicated panel to view status (SENT, DELIVERED, FAILED) of outgoing messages with a retry button for failures.

---

## 🏦 D — HMO, PhilHealth & Insurance
- [ ] **PhilHealth Worksheet Edge-Case QA:** Audit the `philhealth-worksheet` PDF generator against complex multiple-procedure claims and patient types.
- [ ] **Automatic Claim Status Webhooks:** Setup mock webhook endpoints to simulate status updates from HMO providers (v2).
- [ ] **HMO Pre-Authorization:** Add fields in the HMO claim form for pre-auth/pre-approval tracking.
- [ ] **Claims Deductibles & Co-pay sync:** Define automated rules to sync approved HMO coverage directly to the patient's billing card.

---

## 🧾 E — Billing, Finance & BIR Compliance
- [ ] **Refund/Reversal Workflow:** Support voiding payments and issuing refunds with automatic adjustments to outstanding balances.
- [ ] **Proforma Invoices:** Create a printable "Treatment Estimate" PDF that lists proposed treatments before they are finalized.
- [ ] **Monthly Senior/PWD Discount Report:** Create a summary table showing total discounts given and tax exemptions under the statutory laws.
- [ ] **OR (Official Receipt) Serial Gap Audit:** Tool to audit invoice numbers and flag any missing sequential IDs (BIR compliance).
- [ ] **Dynamic Clinic Brand Settings:** Enable uploading custom logos and setting primary colors in clinic settings to reflect on generated PDFs.

---

## ⚙️ F — System Settings & Staff Controls
- [ ] **Shift & Roster Scheduling:** Visual calendar to configure working hours and shifts for dentists.
- [ ] **Role-Based Dynamic Sidebar:** Filter sidebar navigation links dynamically based on user role permission sets on the client side.
- [ ] **Zebra Label Printing Documentation:** Create step-by-step IT guidelines for clinics to connect local Zebra printers.

---

## 🌐 G — i18n & Localization
- [ ] **Complete Hardcoded Strings Audit:** Grep search the frontend code to replace remaining hardcoded English text with `t()` keys.
- [ ] **Tagalog (fil) Locale Translation:** Complete translation files for Tagalog language support (v2).
- [ ] **Help Center Integration:** Add video embed modals and link to documentation within settings.

---

## 🧪 H — Quality Assurance & Testing
- [ ] **End-to-End Playwright Tests:** Expand `smoke.spec.ts` to cover full workflows (login -> patient register -> dental chart treatment save -> invoice payment checkout).
- [ ] **Unit Testing:** Write Unit tests for critical functions inside `invoice.service.ts` and `reports.service.ts`.
- [ ] **Performance Load Testing:** Run a load test of 50 concurrent requests against key dashboard endpoints.
- [ ] **CVE Vulnerability Audit:** Resolve npm package warning flags (`npm audit fix`).

---

## 🚀 I — DevOps & Deployment
- [ ] **Staging Pipeline:** Configure a Railway/Render staging environment separate from production.
- [ ] **Secret Manager Integration:** Move environment variables to GitHub Actions and Vercel secrets.
- [ ] **Database Migration Plan:** Runbook for applying schema changes on a live production DB.
- [ ] **Status Page & Monitoring:** Set up UptimeRobot or Better Stack to monitor system availability.
- [ ] **Error Logging:** Wire up Sentry in both frontend and backend for real-time crash reports.

# DentQL Production Readiness Plan

Currently, DentQL operates on an entirely mocked data layer in the frontend to facilitate rapid UI/UX validation, testing, and marketing deployment. To launch in a live clinical environment, the following infrastructure layers must be replaced and configured.

## 1. Backend & Database
- [ ] **Provision Relational Database**: Spin up a PostgreSQL instance (e.g., via Supabase or AWS RDS).
- [ ] **Migrate Mock Services**: Replace all mock adapters in `src/services/` with real HTTP clients (e.g., Axios/Fetch) calling the backend API.
- [ ] **Data Modeling**: Map existing frontend Types (`Patient`, `Invoice`, `Appointment`) to robust backend DTOs.

## 2. Authentication & Identity
- [ ] **Connect Auth Provider**: Integrate Supabase Auth, Firebase Auth, or Auth0.
- [ ] **Role Permissions**: Enforce server-side RBAC (Role-Based Access Control) to strictly separate Admin, Dentist, and Staff actions. Currently, `isAdmin` is only checked client-side.
- [ ] **Session Security**: Implement secure HttpOnly cookies for JWTs to prevent XSS exfiltration.

## 3. Integrations (API Gateways)
- [ ] **Connect SMS Provider**: Replace mock SMS toasts with Twilio or equivalent REST APIs for patient appointment reminders.
- [ ] **Connect Payment Provider**: Integrate Stripe Elements or PayMaya Checkout for real credit card processing.
- [ ] **Connect Claim Gateways**: Register for official PhilHealth/HMO API access and replace the simulated success transmissions with encrypted SOAP/REST payloads.

## 4. Security & Compliance (HIPAA / DPA)
- [ ] **Configure Audit Logs**: Every write operation (Create/Update/Delete patient record, invoice, clinical note) MUST write to an immutable backend audit log.
- [ ] **Privacy/Security Review**: Conduct a formal vulnerability scan and penetration test. Ensure PHI (Protected Health Information) is encrypted at rest.
- [ ] **Configure Backups**: Setup automated daily point-in-time recovery (PITR) for the database.

## 5. Deployment & DevOps
- [ ] **Environment Variables**: Move all sensitive keys (Stripe PK, Auth Domain) to secure `.env` files injected at build/runtime.
- [ ] **Error Logging**: Connect Sentry or Datadog for client-side unhandled exception tracking.
- [ ] **CI/CD Pipeline**: Configure GitHub Actions to automatically run `vitest` and `tsc --noEmit` before allowing merges to main, blocking deployments on failure.

---
### Summary of Mock Code Paths

If you are a developer taking over this project, pay attention to the following areas:
- **`src/services/api.ts` & `src/services/mockData.ts`**: Contain hardcoded JSON arrays simulating the database. These arrays currently reset on browser refresh.
- **`src/utils/`**: All hardware/print logic currently returns synthetic Promises resolving to `true`. 
- **`src/pages/InvoicePage.tsx`**: The "Submit to HMO" and "Record Payment" buttons dispatch local state updates rather than triggering HTTP requests.

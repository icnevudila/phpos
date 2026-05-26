# Backend API Audit & Completion

**Status:** Completed (Phase 3)
**Date:** 2026-05-24

## Architecture Change Note
The project has migrated from a mocked REST API (`apiBaseUrl`) to **Supabase Backend-as-a-Service (BaaS)**.
As a result, we no longer maintain custom Node.js Express/Nest API endpoints. All CRUD operations will be routed through the `@supabase/supabase-js` client directly to PostgreSQL, secured by Row Level Security (RLS).

## Endpoint Mapping (Supabase Equivalent)

### Patients
- GET /patients -> `supabase.from('patients').select('*')`
- POST /patients -> `supabase.from('patients').insert(...)`
- GET /patients/:id -> `supabase.from('patients').select('*').eq('id', id)`
- PATCH /patients/:id -> `supabase.from('patients').update(...).eq('id', id)`

### Appointments
- GET /appointments -> `supabase.from('appointments').select('*, patients(*), profiles(*)')`
- POST /appointments -> `supabase.from('appointments').insert(...)`
- PATCH /appointments/:id -> `supabase.from('appointments').update(...).eq('id', id)`

### Invoices & Payments
- GET /invoices -> `supabase.from('invoices').select('*, patients(*)')`
- POST /payments -> `supabase.from('payments').insert(...)` *(Database trigger handles balance update automatically)*

### Authentication
- POST /auth/login -> `supabase.auth.signInWithPassword()`
- POST /auth/register -> `supabase.auth.signUp()`
- GET /auth/me -> `supabase.auth.getSession()`

## Missing/Unimplemented Endpoints
- **HMO Claims:** Remains in Demo Mode (Mocked).
- **Sterilization/Compliance:** Remains in Demo Mode (Mocked).
- **Reports:** Client-side aggregation or Edge Functions needed. Currently Mocked.
- **Inventory:** Table exists, but API adapter wiring is pending Phase 4.

*Conclusion:* The backend API architecture is fully defined. We can now proceed to Phase 4 (Service Adapter Wiring) to replace the `api.ts` Axios requests with `supabase` JS calls.

# Database Schema Review

**Status:** Completed (Phase 2)
**Date:** 2026-05-24

## Implemented Tables
The core schema has been successfully migrated to Supabase with the following entities:
- `clinics`: Tenant scoping entity.
- `profiles`: Extends `auth.users` for RBAC (ADMIN, DENTIST, STAFF) and ties users to clinics.
- `patients`: Core patient records scoped to `clinic_id`.
- `appointments`: Schedules tied to `clinic_id`, `patient_id`, and optionally `provider_id`.
- `invoices`: Billing records tied to `patient_id`.
- `invoice_items`: Line items for invoices.
- `payments`: Tracks incoming payments and triggers balance updates via PostgreSQL Triggers.
- `inventory_items`: Tracks stock levels and thresholds scoped to `clinic_id`.

## Security Model
- **Row Level Security (RLS)** is strictly enforced across all tables ensuring that any data requested or inserted is isolated to the authenticated user's `clinic_id`.

## Missing Tables (To be implemented later based on need)
- `waitlist_entries`
- `clinical_notes` / `soap_notes`
- `treatment_plans`
- `hmo_claims`
- `sterilization_cycles`
- `notification_dispatches`

*Currently, missing tables will continue to operate via Demo Mode (in-memory mock) until they are sequentially migrated during the Service Adapter Wiring phase.*

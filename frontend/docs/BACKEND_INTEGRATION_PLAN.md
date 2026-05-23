# DentQL Backend Integration Plan

This document outlines the concrete backend requirements for replacing the DentQL frontend mock layer with a live database.

## 1. Core Modules

### Patients
- **Table:** `patients`
- **Key Fields:** `id (UUID)`, `clinic_id`, `name`, `email`, `phone`, `dob`, `status (enum: ACTIVE, ARCHIVED)`, `balance (numeric)`
- **Relationships:** `clinic_id -> clinics.id`
- **Endpoints:** `GET /patients`, `POST /patients`, `GET /patients/:id`, `PATCH /patients/:id`
- **Validation:** Phone formatting, required name, valid DOB.

### Appointments & Chair Schedule
- **Table:** `appointments`
- **Key Fields:** `id`, `patient_id`, `provider_id`, `date`, `time`, `duration`, `status (enum: BOOKED, WAITING, TRIAGE, IN_CHAIR, COMPLETED, NO_SHOW, CANCELLED)`, `type`, `notes`
- **Relationships:** `patient_id -> patients.id`, `provider_id -> users.id`
- **Endpoints:** `GET /appointments (with date range filter)`, `POST /appointments`, `PATCH /appointments/:id/status`
- **Events:** Changing status to `WAITING` triggers the waitlist display. Changing to `COMPLETED` may trigger invoice draft generation.

### Billing: Invoices & Payments
- **Tables:** `invoices`, `invoice_items`, `payments`
- **Key Fields:** `invoices (id, patient_id, total, balance, status)`, `invoice_items (id, invoice_id, name, price, qty)`, `payments (id, invoice_id, amount, method, date)`
- **Validation:** Total must equal sum of items. Payment amount cannot exceed remaining balance.
- **Events:** Creating a payment auto-updates the `balance` field on the `invoices` table. If `balance == 0`, status becomes `PAID`.

### Claims (HMO / PhilHealth)
- **Table:** `claims`
- **Key Fields:** `id`, `invoice_id`, `patient_id`, `type (HMO, PHILHEALTH)`, `amount_claimed`, `status (DRAFT, SUBMITTED, REJECTED, PAID)`
- **Endpoints:** `POST /claims`, `POST /claims/:id/transmit`
- **Automations:** `transmit` should trigger a background job (e.g. queue) to hit the real HMO SOAP/REST gateway securely.

### Inventory & Sterilization (Compliance)
- **Tables:** `inventory_items`, `sterilization_logs`
- **Inventory Fields:** `id`, `name`, `sku`, `qty_in_stock`, `low_stock_threshold`
- **Sterilization Fields:** `id`, `machine_id`, `operator_id`, `cycle_date`, `status (PASSED, FAILED)`
- **Automations:** If `qty_in_stock <= low_stock_threshold`, push notification/alert to Dashboard.

### Waitlist & Kiosk (Queue Management)
- **Mechanism:** Can derive waitlist dynamically via `GET /appointments?status=in(WAITING,TRIAGE)`.
- **Kiosk:** `POST /kiosk/check-in` payload (name, phone) either updates an existing appointment to `WAITING` or creates a walk-in appointment.

## 2. Infrastructure & Security
- **Row Level Security (RLS):** For multi-tenant clinics, every query MUST enforce `clinic_id = current_user.clinic_id`.
- **RBAC:** Endpoints must validate JWT claims (e.g., only Admin can delete invoices).

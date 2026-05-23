# DentQL Functional QA Checklist

This document tracks the manual quality assurance steps required to verify core clinic operations. Ensure these steps are executed before any major release.

## Patient Operations
- [ ] **Patient Creation**: Navigate to `/patients` -> Click "New Patient" -> Fill mandatory fields -> Submit. Verify patient appears in the list.
- [ ] **Patient Detail**: Click a patient row. Verify Header, Tabs (Overview, Treatments, X-Rays, Invoices) load without throwing undefined errors.

## Appointment & Schedule
- [ ] **Appointment Creation**: Navigate to `/appointments`. Click on a calendar slot. Select a patient, provider, and procedure. Save.
- [ ] **Chair Schedule**: Navigate to `/dashboard`. Ensure the "Chair Schedule" widget accurately reflects the newly booked appointment.
- [ ] **Public Booking**: Navigate to `/portal/book`. Complete the wizard. Confirm the appointment appears in the internal `/waitlist` or `/appointments`.
- [ ] **Waitlist to Chair**: Navigate to `/waitlist`. Click "Move to Chair" on a waiting patient. Ensure status transitions to `IN_CHAIR`.

## Billing & Claims
- [ ] **Invoice Creation**: From a Patient File, navigate to the "Treatments" tab. Complete a treatment. Click "Generate Invoice". Verify it routes to the Draft Invoice page.
- [ ] **Record Payment**: Open an unpaid invoice. Click "Record Payment". Input partial amount (e.g. 500).
- [ ] **Balance Update**: Confirm the remaining balance auto-recalculates immediately after the payment is recorded.
- [ ] **HMO Claim**: Navigate to an Invoice. Click "Submit Claim". Navigate to `/claims/hmo`. Verify the claim appears in the "Submitted" column.

## Clinic Operations
- [ ] **Inventory Low Stock**: Navigate to `/inventory`. Edit a consumable item's quantity to drop below 10. Verify a red warning appears on the Dashboard Risk Shelf.
- [ ] **Sterilization Log**: Navigate to `/compliance`. Miss a daily autoclave log check. Verify the Dashboard highlights a compliance warning.
- [ ] **Notifications**: Trigger a mock SMS alert. Verify the top-right Notification bell increments.

## Displays & Reporting
- [ ] **Reports**: Navigate to `/reports`. Select "BIR Sales Journal" and date range. Verify the "Live Preview" table populates correctly.
- [ ] **Kiosk**: Navigate to `/kiosk`. Complete the digital intake form. Ensure form submits without redirecting away from the kiosk loop.
- [ ] **TV Queue**: Navigate to `/public/queue`. Ensure names appear obfuscated (e.g. `J. Doe`) and UI refreshes gracefully.
- [ ] **Landing CTAs**: Navigate to `/`. Click primary CTAs ("Get Started", "View Demo"). Ensure they route to the appropriate Portal/Login screens.

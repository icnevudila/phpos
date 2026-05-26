# Post-Backend Marathon: UI/UX Regression & Form Audit

*This document is the queued checklist for Phases 8-12, to be executed strictly AFTER the backend wiring is fully complete.*

==================================================
PHASE 8 — UI/UX REGRESSION AFTER BACKEND WIRING
==================================================
Backend wiring often breaks UI. Audit UI again after wiring. Check all major pages:
- Today Board
- Chair Schedule
- Waiting Room
- Patient list
- Patient detail
- Invoice list
- Invoice detail
- Claims
- Inventory
- Compliance
- Notifications
- Reports
- Kiosk
- TV Queue
- Public Booking
- Landing

Fix:
- broken loading states
- infinite spinners
- empty states with real backend
- incorrect counts
- misaligned tables due to real data
- long names breaking layout
- dates overflowing
- money values misaligned
- null/undefined values
- raw backend errors leaking to UI
- mobile overflow

Keep the Clinical Workbench style:
- no redesign from scratch
- no generic SaaS regression
- no random gradients/purple
- no huge empty cards
- no pill badge overdose
- no dead buttons

Missing backend data should show:
- Not provided
- No record yet
- No appointment scheduled
- No payments recorded
- No claim submitted
- No stock movement yet

Never show:
- undefined
- null
- NaN
- [object Object]
- raw stack trace
- raw i18n key

==================================================
PHASE 9 — FORM / MODAL / ACTION AUDIT
==================================================
Audit all forms and modals end-to-end.
Forms:
- create/edit patient
- create/edit appointment
- add to waitlist
- send to chair
- add treatment/procedure
- generate invoice
- record payment
- create claim
- inventory add/edit
- stock movement
- sterilization log
- SMS test/retry
- staff add/edit
- settings save
- report builder
- public booking
- kiosk check-in

For each:
- opens correctly
- required fields clear
- validation messages readable
- submit works
- cancel works
- loading state works
- success state works
- error state works
- duplicate submit prevented
- backend errors handled
- form resets appropriately
- context prefilled where launched from related module

If action cannot be real yet:
- disable clearly
- show Not Configured
- do not silently do nothing

==================================================
PHASE 10 — TESTING MARATHON
==================================================
Expand tests beyond current 5 unit tests.
Unit tests:
- invoice totals
- payment/balance status
- low stock threshold
- expiry risk
- appointment status transitions
- claim status transitions
- queue status transitions
- report filter helpers
- date/time formatting
- money formatting

Integration tests if feasible:
- service adapters call correct endpoints
- API payload validation
- patient create mapping
- appointment create mapping
- invoice create mapping
- payment create mapping

E2E tests if Playwright/Cypress exists or can be safely added:
- dashboard loads
- patient create → detail
- patient detail → new appointment
- appointment appears in chair schedule
- waitlist → send to chair
- invoice detail → record payment
- public booking reaches confirmation
- reports preview handles no data/error
- kiosk check-in creates queue item
- TV queue loads

If E2E setup is too large:
- create docs/MANUAL_E2E_QA.md with exact steps and expected results

Do not spend forever installing huge infrastructure if it risks breaking the project. But improve test coverage where safe.
Run:
- npm run test
- npm run build
- npx tsc --noEmit
- npm run lint if available
Fix failures.

==================================================
PHASE 11 — PRODUCTION READINESS CHECK
==================================================
Update production readiness docs.
Check:
- env.example
- database migrations
- seed data
- auth setup
- RBAC
- audit logs
- backups
- error logging
- monitoring
- deployment target
- PWA behavior
- file storage
- privacy/security
- external integrations (SMS, payments, claims gateways, printers, X-ray/sensor, email)
- rate limits for public routes
- data export/delete
- tenant scoping

Create or update: docs/PRODUCTION_READINESS.md
Clearly mark:
- Done
- Partially Done
- Not Done
- Production Blocker

Do not claim production-ready unless all blockers are actually resolved.

==================================================
PHASE 12 — FINAL DELIVERY REPORT
==================================================
After all work, produce final report.
Create or update: docs/FULLSTACK_DELIVERY_REPORT.md

Include:
1. Backend status
2. Database/schema status
3. API status
4. Frontend wiring status
5. Module workflow status
6. Automation status
7. UI/UX regression status
8. Tests added
9. Commands run
10. Build/typecheck/lint/test status
11. Remaining demo-only areas
12. Production blockers
13. Next recommended steps

Also provide a concise terminal summary:
- files changed
- tests passed
- build passed
- known limitations

Final validation commands:
- npm run build
- npm run test
- npx tsc --noEmit
- npm run lint if available
If backend has separate commands, run them too.
Do not finish with broken build.
Do not finish with unknown route failures.
Do not finish with dead buttons.
Do not finish with misleading success messages.

Final target: DentQL should be a coherent full-stack dental clinic automation prototype.
A clinic user should be able to:
- create/find patients
- book appointments
- manage chair schedule
- check patients into waiting room
- move patients to chair
- add treatments/procedures
- generate invoices
- record payments
- track balances
- create/track claims
- monitor inventory risks
- log sterilization cycles
- manage notifications
- view reports
- use kiosk and TV queue
- allow patients to book online

And the system should clearly say which parts are:
- real backend-backed
- demo/simulated
- not configured
- production blockers

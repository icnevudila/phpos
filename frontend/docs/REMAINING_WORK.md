# DentQL Remaining Work

## Production Blockers
The frontend is visually and functionally complete but operates entirely on a client-side mock data layer. The following must be resolved before production launch:

1. **Database Provisioning:** A real relational database (PostgreSQL/Supabase) must be connected.
2. **Authentication Provider:** Local storage JWT mocks must be replaced with secure HttpOnly cookies and a real Identity Provider.
3. **API Routing:** `src/services/api.ts` must be stripped of JSON mock arrays and rewritten to execute actual HTTP `fetch` or SDK calls to the backend.

## Recommended Next Steps
1. **Schema Design:** Finalize the PostgreSQL schema based on `docs/BACKEND_INTEGRATION_PLAN.md`.
2. **Backend Scaffold:** Stand up a Node.js/NestJS/Supabase Edge Functions layer.
3. **Iterative Swapping:** Replace mock adapters one domain at a time (e.g. Patients first, then Appointments, then Invoices).

## Testing Gaps
- **Playwright E2E:** Currently, `npm run test` only covers unit calculations. End-to-end user flows (Patient creation -> Booking -> Payment) should be automated in Playwright to prevent regressions during the backend integration phase.

## External Integration Tasks
- **SMS Gateway:** Obtain Twilio/MessageBird API keys.
- **Payments:** Obtain Stripe/PayMaya API keys and implement secure Webhook processing.
- **Claims:** Obtain official DOH/PhilHealth sandbox API credentials to test SOAP payload transmission.
- **Hardware:** Test Zebra label printing via WebUSB or local proxy server.

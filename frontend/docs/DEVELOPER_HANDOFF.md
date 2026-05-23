# DentQL Developer Handoff

## Project Overview
DentQL is a premium, product-led dental clinic operating system. The frontend is currently in a "Controlled Demo / Prototype" phase. It accurately reflects all complex clinical workflows, patient management, charting, scheduling, and billing state natively in the browser using a mock data layer. The visual architecture, component structure, CSS tokens, and i18n are fully production-ready.

## How to Run Locally
```bash
cd frontend
npm install
npm run dev
```

## Testing Commands
```bash
npm run typecheck    # Runs tsc --noEmit
npm run lint         # Runs ESLint
npm run test         # Runs Vitest (Unit tests)
npm run build        # Generates production bundle
```

## Mock Data Architecture
Currently, the app relies on singleton in-memory mock datasets and service layers.
- **Mock Data Source:** `src/services/mockData.ts` (contains seed JSON)
- **API Adapters:** `src/services/api.ts` and `src/services/clinic.ts` (methods returning Promises resolving mock data)
- **State Management:** Handled largely via local component state or URL state, supplemented by these singleton mock datasets.
- **Persistence:** None. Hard refreshing the browser resets the data to its original mock state.

## Replacing Mock Data with Real Backend
To integrate a real backend (e.g. Supabase, PostgreSQL + Node.js), you must update the service layers:
1. Locate `src/services/api.ts`.
2. Swap out `async fetchPatients()` to use `axios.get('/api/patients')` or `supabase.from('patients').select('*')`.
3. Do this iteratively for all CRUD operations.
4. Ensure the DTOs (Data Transfer Objects) returned by your backend match the Typescript Interfaces defined at the top of `api.ts` (e.g. `Patient`, `Appointment`, `Invoice`).

## Known Production Blockers
- **Authentication:** `getAuthProfile()` currently reads a hardcoded JWT from `localStorage`. A real Auth Provider (Supabase Auth/Auth0) must be integrated.
- **Role-Based Access Control:** `isAdmin` and `isDentist` are determined client-side. This must be validated by the server via JWT claims on every request.
- **External Services:** SMS, Payments, claims, and printing are entirely simulated in "Demo Mode".

## Demo Mode Behavior
A global banner exists in `AppLayout.tsx` explicitly stating "Demo Mode". All success messages indicating external integration operations (like submitting a claim) have been replaced to explicitly indicate they are simulated mock actions.

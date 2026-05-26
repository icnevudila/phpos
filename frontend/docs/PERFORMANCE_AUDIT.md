# DentQL Performance & Smooth Navigation Audit

This document summarizes the performance audits, loading state optimizations, caching strategies, and navigation refinements applied to DentQL to ensure a seamless "Clinical Workbench" user experience.

---

## 1. Route Transition & App Shell Persistence
- **AppShell Stability**: The global navigation rail, top command bar, and sidebar layout are persistent layouts. Routing transitions occur inside the nested main content container, preventing full-page redraws or sidebar flickers.
- **Lazy Loading**: Route-level code splitting is handled by React's lazy loading boundary, ensuring the core dashboard and today board load instantly while heavier pages (e.g., Reports, Dental Chart, and Perio Visualizer) load their chunks dynamically on-demand.
- **Custom Loading Copy**: Generic "Loading..." spinners have been replaced with context-aware text strings:
  - *Today Board*: "Loading chair schedule..."
  - *Patient Details*: "Opening patient file..."
  - *Invoices*: "Preparing invoice ledger..."
  - *Reports*: "Building report preview..."

---

## 2. Caching & Data Fetching Optimization
- **TanStack/React Query**: Configured with a `staleTime` of 5 minutes (`300000ms`) for read-heavy resources (like patient details, staff lists, and historic invoices) to eliminate waterfall API requests during frequent route transitions.
- **Tab-Level Isolation**: Navigating between inner tabs in the Patient File view (e.g., switching from *Dental Chart* to *Prescriptions*) does not force a full reload of the patient masthead or background profiles.
- **Payment & Invoice Mutators**: Invalidation queries are targeted specifically to the mutated resources, preserving unmodified cache lines elsewhere.

---

## 3. Loading Skeletons & Progressive Rendering
- **Table Skeletons**: Standard skeleton loaders replace blank areas in all key tables:
  - Patients List table rows.
  - Active Treatments grid.
  - Financial Ledger lines.
- **Independent Loading**: Slow widgets (like charts on the Dashboard or periodontal canvases) load asynchronously without blocking the parent page's primary buttons or search bars.

---

## 4. Table & Search Input Performance
- **Search Debouncing**: The global search filter for patients and inventory utilizes a debounced delay of `300ms` to prevent rapid API requests and input lag while typing.
- **Pagination & Sorting**: Sorted lists are memoized via `useMemo` on the client side for datasets under 100 rows, and paginated on the database level for larger collections (e.g. claims logs).

---

## 5. Modal & Drawer Responsiveness
- Modals for creating appointments, record payments, and adding treatments open instantly.
- Form controls visually respond to clicks, and save buttons are disabled during active submission states to prevent double-posting.

---

## 6. Landing Page & Mobile Polish
- **Image Optimization**: Hero previews and screenshots are compressed, avoiding heavy layouts.
- **Mobile Fluidity**: Fixed touch layout issues, keyboard viewport shifts, and hidden overflows in the public booking system.

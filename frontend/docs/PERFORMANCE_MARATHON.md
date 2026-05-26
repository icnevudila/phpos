Performance is a product feature. Do not treat loading as an afterthought.
DentQL should feel fast even when data is loading.
Use persistent layout, progressive rendering, smart caching, and honest section-level loading states.

==================================================
PHASE 19.5 — PERFORMANCE, SMOOTH NAVIGATION, AND LOADING UX MARATHON
==================================================

After backend wiring and module workflow fixes, perform a full performance and navigation smoothness audit.

This task is about making DentQL feel fast, smooth, and responsive.

Do not redesign the product.
Do not change the Clinical Workbench visual identity.
Do not remove functionality.
Do not fake loading states.
Do not hide real backend slowness with misleading success messages.

Goal:
Page transitions, route changes, module switching, detail pages, modals, drawers, tables, booking flow, and patient record navigation should feel smooth and responsive.

DentQL should feel like an operating desk that flows, not a slow admin panel that blocks the user.

Audit:
- route transitions
- page loading
- detail page loading
- data fetching
- cache behavior
- skeleton states
- Suspense/loading boundaries
- table performance
- search/filter performance
- modal/drawer open speed
- chart/report rendering
- patient detail heavy sections
- dental chart rendering
- invoice detail rendering
- reports preview rendering
- public booking responsiveness
- kiosk/TV display refresh behavior
- mobile performance

==================================================
1. ROUTE TRANSITION AUDIT
==================================================

Audit every major route transition:

- /dashboard
- /patients
- /patients/:id
- /appointments
- /waitlist
- /invoices
- /invoices/:id
- /reports
- /inventory
- /compliance
- /notifications
- /staff
- /settings
- /kiosk
- /public/queue or TV route
- /portal/book or public booking route
- landing page

For each route:
- does navigation feel instant?
- is there a long blank screen?
- is there layout shift?
- is there an ugly global spinner?
- does AppShell remount unnecessarily?
- does sidebar/rail/topbar flicker?
- does data loading block the whole page?
- can the user still understand what is happening?

Fix:
- avoid full-page blank states
- keep AppShell persistent
- use page-level skeletons
- use section-level skeletons
- avoid unmounting global layout
- use route-level lazy loading carefully
- prefetch important routes where safe
- show meaningful loading copy

Preferred loading copy:
- Loading patient records…
- Opening patient file…
- Loading chair schedule…
- Preparing invoice…
- Building report preview…
- Loading inventory risks…
- Opening patient terminal…

Never show:
- raw i18n keys
- generic “Loading…”
- long blank white screen
- infinite spinner without context

==================================================
2. APP SHELL PERSISTENCE
==================================================

Ensure AppShell, navigation rail/sidebar, topbar/command bar, and global layout remain stable between route changes.

The user should not feel like the whole app reloads when moving between modules.

Fix if needed:
- AppShell should wrap routes consistently.
- Topbar should not flicker.
- Sidebar/rail should not remount.
- Active nav should update smoothly.
- Main content should transition while shell remains stable.
- Avoid full-screen loading fallback for nested pages.

If using React Router:
- keep layout routes stable.
- use nested route loading boundaries.
- avoid putting global providers inside frequently remounted route components.

If using Next.js:
- keep layouts persistent.
- use loading.tsx thoughtfully.
- avoid forcing dynamic rendering unnecessarily.

If using Vite/React SPA:
- ensure route chunks load smoothly.
- prefetch heavy routes if possible.

==================================================
3. DATA FETCHING AND CACHE STRATEGY
==================================================

Audit all data fetching.

If React Query / TanStack Query / SWR or similar exists:
- use it consistently.
- configure sensible staleTime/cacheTime.
- avoid refetching everything on every navigation.
- preserve previous data while loading new data.
- use optimistic updates where safe.
- invalidate only relevant queries after mutations.

If no query library exists:
- consider adding lightweight query/cache abstraction only if safe.
- otherwise centralize request caching in service adapters where practical.
- avoid duplicated fetches across components.

Rules:
- Patient list should not refetch unnecessarily when opening/closing modals.
- Patient detail should not reload every section if only one tab/section changes.
- Dashboard should not refetch every widget separately if a combined endpoint exists.
- Invoice detail should not reload all data after recording payment; update local/cache state or invalidate invoice only.
- Reports preview should fetch only when filters are submitted or intentionally changed.
- Public booking availability should be cached per service/provider/date.
- Kiosk/TV queue can refresh on interval but should not hammer backend.

Audit and fix:
- duplicate network requests
- waterfall fetching
- components fetching same data independently
- fetch on every render
- over-invalidating caches
- refetching on focus if it hurts UX
- slow sequential calls that can be parallelized
- unhandled slow/error states

==================================================
4. LOADING SKELETONS AND PROGRESSIVE RENDERING
==================================================

Replace heavy blocking loaders with progressive page rendering.

Use:
- skeleton rows for tables
- skeleton panels for dashboard cards
- skeleton ledger rows for invoices
- skeleton patient masthead
- skeleton patient file nav
- skeleton appointment blocks
- skeleton report preview
- skeleton inventory rows

Do not:
- block whole page for one slow widget
- show giant centered spinner for every page
- leave blank panels
- show layout jumps after data loads

Page-specific guidance:

Today Board:
- render shell immediately
- skeleton chair schedule
- skeleton waiting tickets
- skeleton action center
- load risk stack independently

Patient Detail:
- show masthead skeleton first
- patient file nav should appear quickly
- load heavy sections lazily:
  - dental chart
  - periodontal
  - x-ray/files
  - timeline
- do not block the entire patient page for dental chart or files

Appointments:
- render toolbar immediately
- show chair schedule skeleton
- lazy-load heavy calendar/grid if needed
- preserve previous date view while new date loads

Invoice Detail:
- render header and collection panel skeleton
- treatment ledger skeleton rows
- payment ledger skeleton
- avoid blank receipt card

Reports:
- render builder immediately
- preview panel can load separately
- do not block report library while preview loads

Inventory:
- render toolbar immediately
- table skeleton rows
- risk cards skeleton if needed

Public Booking:
- service selection should appear fast
- availability slots can load separately
- show “Checking available times…” only inside the time section

Kiosk / TV Queue:
- should load fast and show offline/refreshing states gracefully
- no scary blank screen on TV

==================================================
5. PREFETCHING AND ANTICIPATED NAVIGATION
==================================================

Add safe prefetching for likely next routes.

Examples:
- On Patients list hover/focus/click preparation, prefetch patient detail if feasible.
- From patient detail, prefetch appointment form data.
- From invoice list, prefetch invoice detail on row hover/focus.
- From Today Board action center, prefetch destination module when action is visible.
- From landing page, prefetch public booking route.
- From public booking service selection, prefetch availability/dentist data.

Do not over-prefetch huge data.
Do not prefetch sensitive data into public routes.
Do not prefetch every patient detail in large lists.

Use safe strategy:
- prefetch route chunks
- prefetch small metadata
- lazy fetch heavy private data only after navigation/auth check

==================================================
6. CODE SPLITTING AND LAZY LOADING
==================================================

Audit bundle size and heavy modules.

Heavy candidates:
- dental chart
- periodontal chart
- reports/charts
- x-ray/files tools
- calendar/chair schedule
- PDF/export tools
- kiosk/TV display
- landing screenshots/components
- rich text/SOAP editor if present

Use lazy loading where safe:
- React.lazy / Suspense
- dynamic imports
- route-based splitting
- section-based lazy loading for heavy patient detail modules

Rules:
- keep initial app shell fast.
- do not load reports/charting libraries on every route.
- do not load dental chart code unless patient chart section is opened.
- do not load PDF/export libs until export is requested.
- do not load landing heavy screenshots in admin app bundle if separable.

After code splitting:
- ensure loading states are polished.
- ensure no flicker.
- ensure build still passes.

==================================================
7. TABLE, SEARCH, FILTER, AND LARGE LIST PERFORMANCE
==================================================

Audit large lists:
- patients
- appointments
- invoices
- claims
- inventory
- notification dispatches
- reports
- staff
- audit/timeline if present

Fix:
- slow search input
- filter lag
- expensive sorting on every render
- large lists rendering all rows
- table row rerenders
- pagination not working
- no virtualization where needed
- debounce missing for search
- backend search vs frontend search confusion

Use:
- debounce search input, around 250–400ms
- server-side pagination if backend supports it
- memoized derived data where useful
- virtualization for very large lists if already available or safe to add
- stable keys
- avoid inline heavy functions in row rendering where causing issues

Do not over-engineer small lists.

==================================================
8. MODALS, DRAWERS, AND ACTION RESPONSIVENESS
==================================================

Audit all modals/drawers:
- new appointment
- add patient
- record payment
- create claim
- add inventory
- stock movement
- log sterilization cycle
- SMS test
- staff form
- settings save
- report export
- public booking confirmation

Requirements:
- open instantly
- show skeleton only for content that needs fetch
- do not wait for all remote data before opening shell
- prefill context quickly
- submit button has loading state
- duplicate submit prevented
- success/error feedback appears
- modal closes or updates intentionally after success
- no layout jank

Fix dead feeling:
- button should visually respond immediately
- if backend call is slow, show inline loading
- use optimistic UI only where safe

==================================================
9. OPTIMISTIC UPDATES AND MICRO-FEEDBACK
==================================================

Add safe optimistic or immediate feedback where appropriate.

Good candidates:
- toggles
- queue status change
- send patient to chair
- mark notification read
- local form save pending state
- appointment status update
- inventory reorder request marked locally
- small settings toggles

Be careful with:
- payments
- claims
- destructive actions
- medical records
- invoice totals
- DPA erasure
- live integrations

For critical actions:
- show pending state
- wait for server confirmation
- show clear success/error
- rollback on failure where optimistic update used

Micro-feedback:
- button pressed state
- subtle route transition progress
- section-level loading
- toast or inline message
- disable repeated click during submission

==================================================
10. BACKEND LATENCY AND API PERFORMANCE
==================================================

Audit backend/API response times where possible.

Check:
- are endpoints doing too much?
- are dashboard widgets making many requests?
- are N+1 queries present?
- are detail pages fetching relationships one by one?
- are reports doing expensive calculations on the client?
- are list endpoints unpaginated?
- are filters handled server-side where needed?
- are indexes missing?

Fix or document:
- add pagination/limit
- add query filters
- add indexes where schema/migrations exist
- combine dashboard summary endpoint if helpful
- parallelize independent requests
- avoid fetching huge payloads for list pages
- use lightweight list payloads and detailed payloads separately

Example:
Patients list should not fetch full dental chart, invoices, notes, and files for every patient.
Invoice list should not fetch all payment ledger details unless needed.
Dashboard should fetch summarized data, not entire module datasets.

Create or update:
docs/PERFORMANCE_AUDIT.md

Include:
- slow routes
- slow endpoints
- duplicate fetches fixed
- caching strategy
- remaining bottlenecks
- recommended indexes
- payload improvements

==================================================
11. PERCEIVED PERFORMANCE AND TRANSITIONS
==================================================

Improve perceived speed.

Use:
- subtle content fade/slide only if already consistent and not distracting
- skeletons
- persistent shell
- previous data while refreshing
- small “Refreshing…” state instead of blank reload
- optimistic local update for safe actions
- route prefetch

Avoid:
- overanimated UI
- long fade transitions
- blocking spinners
- layout shifts
- whole-page remounts
- slow fancy effects

Page transitions should feel like:
- app shell stable
- content changes smoothly
- data loads progressively
- user always knows what is happening

If adding animations:
- keep them short: 120–180ms
- use ease-out
- respect prefers-reduced-motion
- do not animate large tables heavily

==================================================
12. LANDING PAGE PERFORMANCE
==================================================

Audit landing page separately.

Fix:
- giant screenshots
- unoptimized images
- loading all product previews at once
- heavy below-fold components
- video/animation bloat if any
- route prefetch to booking/demo CTA
- mobile image overflow

Use:
- optimized images
- lazy loading below fold
- responsive image sizes
- compressed screenshots
- product previews without huge JS where possible

Landing should feel premium and fast.

==================================================
13. PWA AND SERVICE WORKER SAFETY
==================================================

If PWA/service worker is enabled:
- ensure it does not cache stale app shell incorrectly
- ensure new builds update safely
- ensure API responses are not cached incorrectly unless intended
- ensure demo data is not confused with real data
- ensure offline state is clear
- ensure TV Queue/Kiosk refresh behavior is sane

If service worker causes stale UI or slow reload:
- adjust caching strategy
- document expected behavior

==================================================
14. MOBILE SMOOTHNESS
==================================================

Audit mobile performance.

Check:
- route transitions
- public booking flow
- patient file nav
- tables
- chair schedule
- invoice detail
- modal open/close
- keyboard pushing forms
- sticky actions
- kiosk touch mode

Fix:
- heavy tables freezing mobile
- horizontal overflow
- large screenshots
- too many animated elements
- slow input typing
- dropdown lag
- date/time selector lag

Mobile must feel usable, especially:
- patient booking
- kiosk
- patient detail quick view
- record payment
- appointment creation

==================================================
15. MEASUREMENT AND VALIDATION
==================================================

Run available performance checks.

If Lighthouse is available:
- run Lighthouse or equivalent for landing/public booking
- document scores or key issues

If browser dev tooling automation exists:
- check route transition feel manually
- measure obvious slow routes
- record bottlenecks in docs

Run:
- npm run build
- npm run test
- npx tsc --noEmit
- npm run lint if available

Check build output:
- chunk size warnings
- bundle warnings
- PWA warnings
- dead code warnings

Fix safe issues.

Create or update:
docs/PERFORMANCE_AUDIT.md

Include:
- route transition improvements
- caching strategy
- loading state improvements
- lazy-loaded modules
- remaining bottlenecks
- recommended future work

==================================================
16. FINAL ACCEPTANCE CRITERIA
==================================================

DentQL navigation should feel smooth.

Acceptance criteria:
- AppShell does not flicker between internal routes.
- No major route shows long blank screen.
- Patient detail opens with useful skeleton/progressive layout.
- Invoice detail opens without blank centered loader.
- Reports builder loads shell before preview.
- Public booking feels fast on mobile.
- Tables do not lag with realistic data.
- Search input does not freeze.
- Modals open immediately.
- Buttons show immediate feedback.
- Slow backend calls show section-level loading.
- No raw loading keys.
- No generic spinner-only pages unless unavoidable.
- Build/test/typecheck pass.

Final output:
Provide a concise performance report:
- what was optimized
- route transitions improved
- caches/prefetching added
- lazy-loaded modules
- loading states improved
- slow endpoints or components found
- remaining bottlenecks
- commands run
- build/test/typecheck status

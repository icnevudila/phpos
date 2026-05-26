# Architecture Map

## Frontend Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router v6 (`react-router-dom`)
- **State & Data Fetching:** TanStack Query v5 (`@tanstack/react-query`)
- **Forms & Validation:** React Hook Form + Zod (`@hookform/resolvers`)
- **Styling:** Tailwind CSS + PostCSS
- **i18n:** `react-i18next`
- **Charts:** Recharts
- **Calendar:** FullCalendar (`@fullcalendar/react`)
- **Canvas/Dental Charting:** Konva (`react-konva`)
- **Toasts/Alerts:** Sonner
- **Icons:** Lucide React
- **PWA:** `vite-plugin-pwa`
- **Testing:** Vitest, Playwright, React Testing Library

## Backend & Services
- **Backend-as-a-Service (BaaS):** Supabase
- **Database:** PostgreSQL (with Row-Level Security for Multi-Tenancy)
- **Authentication:** Supabase Auth (`supabase.auth`)
- **API Client:** Axios (legacy, mostly being migrated to direct Supabase JS client)
- **External Dependencies:** Optionally Sentry for error tracking.

## Folder Structure
```text
src/
├── components/          # Reusable UI elements, categorized by module
│   ├── ui/              # Generic foundational UI (buttons, inputs)
│   ├── layout/          # AppShell, Topbar, Sidebar
│   ├── dashboard/       # Today Board components
│   ├── patient/         # Patient-related components
│   └── [domain]/        # Domain-specific components (reports, inventory, etc.)
├── constants/           # Global constants (e.g., auth keys)
├── hooks/               # Custom React hooks (useAuth, etc.)
├── i18n/                # Localization configurations and translations
├── lib/                 # Core library initializations (e.g., supabase.ts)
├── pages/               # Top-level page components mapping to routes
├── portal/              # Public-facing booking and patient portal pages
├── routes/              # Route definitions and layouts
├── services/            # API adapters, Supabase integrations, and legacy mockData
├── theme/               # Theming utilities (if any)
├── types/               # TypeScript type definitions for the domain models
├── utils/               # Utility functions (date formatting, math, etc.)
└── validation/          # Zod schema definitions
```

## Module Ownership & Boundary
- **State:** Component-level state uses `useState`. Server state is managed by `@tanstack/react-query` calling into `src/services`.
- **Services:** All components should call functions from `src/services/` rather than invoking `supabase` or `axios` directly in the UI.
- **Mock Data:** Currently resides heavily in `src/services/mockData.ts` and `src/services/api.ts`. These are targeted for replacement during the Backend Wiring Phase.

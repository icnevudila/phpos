# 23-Hour Marathon TODO List

## Phase 1: X-Ray Canvas Enhancements & Fixes
- [x] Fix XRayCanvas Brightness & Contrast logic (use proper Konva Filters instead of opacity)
- [x] Implement Zoom to Pointer (Scale from mouse position rather than top-left)
- [x] Add Window Leveling presets for different bone densities
- [x] Add persistent local storage for XRay configurations
- [x] Add Image Invert filter option
- [x] Support saving X-Ray annotations to backend database
- [x] Implement undo/redo stack for annotations

## Phase 2: Invoice Service & BIR Compliance
- [x] Fix `finalizeTreatmentsToInvoice` in Invoice Service to support Senior/PWD/VAT calculations
- [x] Update Invoice PDF generator to use "PHP " instead of "₱"
- [x] Add UNPAID/DRAFT/VOID watermark to Invoice PDFs
- [x] Show full VAT/discount breakdown in PDF
- [x] Add BIR footer text in PDF
- [x] Add clinic TIN/PTU/Accreditation to Invoice PDF

## Phase 3: Patient Portal Enhancements
- [x] Secure patient portal file access (X-rays, PDFs)
- [x] Add patient medical history editing flow in portal
- [x] Implement mobile-responsive tables in patient portal
- [x] Add real-time appointment status updates via WebSocket/Polling

## Phase 4: Clinic Management & Analytics
- [ ] Create Revenue by Month chart on dashboard
- [ ] Implement Clinic Inventory stock alerts (Low stock warnings)
- [ ] Add bulk SMS notification capability for waitlisted patients
- [ ] Build end-of-day reconciliation report (PDF export)

## Phase 5: UI/UX Polish
- [ ] Add loading skeletons for all list views
- [ ] Standardize confirmation modals across the app
- [ ] Fix contrast ratios on disabled buttons
- [ ] Add keyboard shortcuts for common actions (e.g., Ctrl+S to save)

## Phase 6: Code Quality & Tech Debt
- [ ] Convert all remaining ANY types to proper TypeScript interfaces
- [ ] Refactor redundant Prisma queries in Patient controller
- [ ] Add unit tests for Invoice calculations
- [ ] Add smoke tests for PDF generation endpoints
- [ ] Update all stale npm packages

## Phase 7: Optimization & Security
- [ ] Implement rate limiting on auth endpoints
- [ ] Add audit logging for PHI (Protected Health Information) access
- [ ] Optimize initial bundle size for frontend Vite build
- [ ] Implement database query caching for static lookups

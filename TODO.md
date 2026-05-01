# P1 BIR/PH Legal Compliance — Execution Tracker

## Phase 1: Schema Fix
- [x] Add `vatExempt` boolean to Invoice model
- [x] Create Prisma migration

## Phase 2: Seed Update
- [x] Add demo TIN/PTU/Accreditation to clinic
- [x] Add Senior + PWD demo patients
- [x] Update invoice seed with VAT/discount fields

## Phase 3: Invoice Service Logic
- [x] Update `createInvoice` to calculate/store `seniorDiscount`, `pwdDiscount`, `vatAmount`, `vatRate`, `vatExempt`
- [x] Update `updateInvoice` with same logic
- [x] Update `finalizeTreatmentsToInvoice` with same logic — DONE (2026-04-26)

## Phase 4: Invoice PDF BIR Compliance
- [x] Fix `₱` rendering (use "PHP " prefix) — DONE (2026-04-26)
- [x] Add UNPAID/DRAFT/VOID watermark — DONE (2026-04-26)
- [x] Fetch clinic TIN/PTU/Accreditation — DONE (2026-04-26)
- [x] Show full VAT/discount breakdown — DONE (2026-04-26)
- [x] Add BIR footer text — DONE (2026-04-26)

## Phase 5: Test & Verify
- [ ] `prisma db push`
- [ ] `prisma db seed`
- [ ] `npm run lint && npm run build`

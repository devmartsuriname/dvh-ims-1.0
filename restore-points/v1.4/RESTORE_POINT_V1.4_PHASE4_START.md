# RESTORE POINT — V1.4 Phase 4 Start

**Created:** 2026-02-07
**Phase:** V1.4 Phase 4 — Director Review, Ministerial Advisor, and Minister Decision Interfaces
**Type:** Pre-Implementation

## Current State

### Completed Phases
- V1.4 Phase 1: Control Queue & My Visits — COMPLETE
- V1.4 Phase 2: Schedule Visits (Read Only) — COMPLETE
- V1.4 Phase 3: Review Interfaces (Social + Technical) — COMPLETE

### Files in Scope (Before Changes)
| File | State |
|------|-------|
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Existing — 668 lines, 5 tabs (Overview, Documents, Social Report, Technical Report, History, Raadvoorstel) |
| `src/app/(admin)/subsidy-cases/[id]/components/SocialReviewForm.tsx` | Existing — Phase 3 |
| `src/app/(admin)/subsidy-cases/[id]/components/TechnicalReviewForm.tsx` | Existing — Phase 3 |

### Database State
- No schema changes pending
- All existing RLS policies intact
- Transition engine enforces full 8-step decision chain (V1.3 Phase 4F)

### Files to Create in Phase 4
- `src/app/(admin)/subsidy-cases/[id]/components/DirectorReviewPanel.tsx`
- `src/app/(admin)/subsidy-cases/[id]/components/AdvisorReviewPanel.tsx`
- `src/app/(admin)/subsidy-cases/[id]/components/MinisterDecisionPanel.tsx`

### Files to Modify in Phase 4
- `src/app/(admin)/subsidy-cases/[id]/page.tsx` (add 3 new tabs)

## Governance
- No schema, RLS, role, or workflow changes authorized
- Decision motivations stored ONLY in status_history + audit_event

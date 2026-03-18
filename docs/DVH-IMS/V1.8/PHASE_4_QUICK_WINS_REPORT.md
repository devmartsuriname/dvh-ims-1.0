# Phase 4 — Quick Wins Report

**Date:** 2026-03-18
**Authority:** Delroy
**Executed By:** Claude (Governance-Controlled Fix Execution)
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Status:** COMPLETE

---

## Objective

Deliver low-risk, high-value improvements that increase maintainability and reduce duplication without changing business logic, workflows, schema, RLS, or UI design language.

---

## 1. Issue → Improvement Mapping

### QW-01 — Status Badge Duplication (Primary Quick Win)

**Severity:** MEDIUM — any label/color change requires touching multiple files with no single source of truth

**Finding:** Through codebase analysis, 5 distinct badge constant groups were found duplicated across 11 files:

| Badge Group | Duplicate Count | Files |
|-------------|----------------|-------|
| Housing registration statuses (`STATUS_BADGES`, 8 entries) | 4 copies | `housing-registrations/[id]/page.tsx`, `housing-registrations/components/RegistrationTable.tsx`, `housing-waiting-list/page.tsx`, `archive/housing/[id]/page.tsx` |
| Full subsidy case statuses (`STATUS_BADGES`, 27 entries) | 2 copies | `subsidy-cases/[id]/page.tsx`, `archive/subsidy/[id]/page.tsx` |
| Visit type badges (`VISIT_TYPE_BADGES`, 3 entries) | 2 copies | `schedule-visits/page.tsx`, `my-visits/page.tsx` |
| Allocation decision outcomes (`DECISION_BADGES`, 3 entries) | 2 copies | `allocation-decisions/components/DecisionTable.tsx`, `allocation-runs/[id]/page.tsx` |
| Allocation run statuses (`STATUS_BADGES`, 4 entries) | 2 copies | `allocation-runs/components/RunTable.tsx`, `allocation-runs/[id]/page.tsx` |

**Total duplicated constant declarations removed:** 12 (5 badge groups × average 2.4 copies, keeping 1 each in the shared module)

**Fix:** Created `src/constants/statusBadges.ts` with 5 named exports. Each consuming file now imports from the shared module using `as` aliasing to preserve the local variable name in the file body — zero changes to any rendering logic.

**Shared module exports:**
```typescript
export const HOUSING_STATUS_BADGES    // 8-entry housing workflow
export const SUBSIDY_STATUS_BADGES    // 27-entry subsidy workflow
export const VISIT_TYPE_BADGES        // 3-entry visit types
export const DECISION_BADGES          // 3-entry allocation decisions
export const ALLOCATION_RUN_STATUS_BADGES  // 4-entry run statuses
```

**Import pattern used (no rename in file body):**
```typescript
import { HOUSING_STATUS_BADGES as STATUS_BADGES } from '@/constants/statusBadges'
import { SUBSIDY_STATUS_BADGES as STATUS_BADGES } from '@/constants/statusBadges'
import { VISIT_TYPE_BADGES } from '@/constants/statusBadges'  // same name
import { DECISION_BADGES } from '@/constants/statusBadges'    // same name
import { ALLOCATION_RUN_STATUS_BADGES as STATUS_BADGES } from '@/constants/statusBadges'
```

---

### QW-02 — Dead Code Removal: Unused `session` Variable

**File:** `src/app/(admin)/allocation-runs/components/RunExecutorModal.tsx`
**Severity:** LOW — dead code, no functional impact
**Finding:** Line 60 destructured a `session` variable from `supabase.auth.getSession()` that was never used. The `supabase.functions.invoke()` call on the next line uses the Supabase client's built-in auth session — it does not require the `session` variable to be passed explicitly.

**Before:**
```tsx
// 2. Call the edge function to execute the run
const { data: { session } } = await supabase.auth.getSession()

const response = await supabase.functions.invoke('execute-allocation-run', {
```

**After:**
```tsx
// 2. Call the edge function to execute the run
const response = await supabase.functions.invoke('execute-allocation-run', {
```

**Effect:** Removes one unnecessary async call to `supabase.auth.getSession()` per allocation run execution. The edge function invocation behavior is unchanged.

---

## 2. Files Changed

### New Files Created

| File | Purpose |
|------|---------|
| `src/constants/statusBadges.ts` | Shared badge constant module — single source of truth for all status/badge mappings |

### Modified Files — Status Badge Consolidation

| File | Change |
|------|--------|
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | Removed local `STATUS_BADGES` (8 entries); added `import { HOUSING_STATUS_BADGES as STATUS_BADGES }` |
| `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx` | Same |
| `src/app/(admin)/housing-waiting-list/page.tsx` | Same |
| `src/app/(admin)/archive/housing/[id]/page.tsx` | Same |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | Removed local `STATUS_BADGES` (27 entries); added `import { SUBSIDY_STATUS_BADGES as STATUS_BADGES }` |
| `src/app/(admin)/archive/subsidy/[id]/page.tsx` | Same |
| `src/app/(admin)/schedule-visits/page.tsx` | Removed local `VISIT_TYPE_BADGES`; added `import { VISIT_TYPE_BADGES }` |
| `src/app/(admin)/my-visits/page.tsx` | Same |
| `src/app/(admin)/allocation-decisions/components/DecisionTable.tsx` | Removed local `DECISION_BADGES`; added `import { DECISION_BADGES }` |
| `src/app/(admin)/allocation-runs/components/RunTable.tsx` | Removed local `STATUS_BADGES` (4 entries); added `import { ALLOCATION_RUN_STATUS_BADGES as STATUS_BADGES }` |
| `src/app/(admin)/allocation-runs/[id]/page.tsx` | Removed local `STATUS_BADGES` (4 entries) and `DECISION_BADGES` (3 entries); added combined import |

### Modified Files — Dead Code

| File | Change |
|------|--------|
| `src/app/(admin)/allocation-runs/components/RunExecutorModal.tsx` | Removed unused `const { data: { session } } = await supabase.auth.getSession()` |

**Total files changed: 12 (11 modified + 1 created)**
**Lines of duplicated code removed: ~130 lines across 12 removed constant blocks**

---

## 3. Before/After Summary

| Aspect | Before | After |
|--------|--------|-------|
| Housing STATUS_BADGES definition | 4 identical copies across 4 files | 1 definition in `statusBadges.ts`, 4 imports |
| Subsidy STATUS_BADGES definition | 2 identical copies across 2 files | 1 definition, 2 imports |
| VISIT_TYPE_BADGES definition | 2 identical copies across 2 files | 1 definition, 2 imports |
| DECISION_BADGES definition | 2 identical copies across 2 files | 1 definition, 2 imports |
| Allocation run STATUS_BADGES | 2 identical copies across 2 files | 1 definition, 2 imports |
| Unused `getSession()` call in RunExecutorModal | Present — wasted async call | Removed |
| Badge rendering behavior | N/A | Unchanged — same label, color, fallback logic |
| Visual output | N/A | Identical — no visual change |

---

## 4. Skipped Items and Reasoning

### NOT Consolidated: `control-queue/page.tsx` STATUS_BADGES
The `control-queue` page has its own 19-entry `STATUS_BADGES` with deliberately shorter labels (e.g., `'Social Review'` vs `'In Social Review'`, `'Awaiting Director'` vs `'Awaiting Director Approval'`). These differences appear intentional for the denser control queue layout. Consolidating this would change displayed text — **skipped to preserve behavior**.

### NOT Consolidated: `subsidy-cases/components/CaseTable.tsx` STATUS_BADGES
`CaseTable.tsx` has a simplified 8-entry subset of the full 27-entry subsidy badges (only the original pre-advanced-workflow statuses). Replacing it with the full 27-entry `SUBSIDY_STATUS_BADGES` would add no risk but the simplified set is intentional for the list view context. **Skipped** — no duplication savings since it's a different mapping.

### NOT Consolidated: `archive/page.tsx` SUBSIDY/HOUSING_STATUS_BADGES
`archive/page.tsx` defines tiny 2-entry badge sets (only `finalized` and `rejected`). These are a deliberate subset for the archive list view and not duplicates of the full badge sets. **Skipped** — not duplicates.

### Task 3 — Naming Consistency
After analysis, no naming inconsistencies were found that could be safely normalized without risk. Label differences between pages (e.g., control-queue vs case detail) appear intentional for context. **Skipped — no safe normalizations identified.**

### Task 4 — Small Safe Component Splits
No safe split candidates were identified within the quick-win scope. The only candidate (the 997-line `subsidy-cases/[id]/page.tsx`) is explicitly out of scope for this phase. **Skipped.**

### Task 5 — Accessibility Quick Wins (aria-labels)
After full scan, no icon-only buttons without `aria-label` were found. All action buttons contain both an icon and visible text labels. **No changes needed — already compliant.**

---

## 5. Documentation Notes

- `docs/backend.md` — does not exist at this path. No equivalent at a V1.8 path.
- `docs/architecture.md` — does not exist at this path. Architecture documentation lives in `docs/DVH-IMS-V1.2/DVH-IMS-V1.2_Architecture_Overview_Logical.md` (version-scoped). The new `src/constants/statusBadges.ts` file is a UI-layer constants module that does not require architecture documentation.
- `docs/DVH-IMS/V1.8/SYSTEM_STATUS_AUDIT_V1.8.md` — amended below.

---

## 6. Regression Check

**Badge rendering unchanged:** The `as STATUS_BADGES` aliasing means zero changes to variable references in any file body. The fallback pattern (`STATUS_BADGES[cell] || { bg: 'secondary', label: cell }`) is preserved in all files.

**No authorized flow broken:** Badge consolidation is read-only — no data fetch, state, or routing logic touched.

**No public/citizen flow affected:** All changes are in admin pages and a new constants module.

**Dead code removal:** The removed `getSession()` call in `RunExecutorModal` had no effect on the allocation run execution flow — the edge function invocation is unchanged.

**Build compatibility:** TypeScript type is preserved — `Record<string, { bg: string; label: string }>` and `Record<string, string>` types match exactly between the shared module and the consuming files.

---

## 7. Conclusion

Phase 4 is complete. The primary quick win — status badge consolidation — eliminates 12 duplicate constant blocks (~130 lines) across 11 files and establishes a single source of truth in `src/constants/statusBadges.ts`. One dead code removal reduces unnecessary async calls. No visual or behavioral regressions were introduced.

**Phase 4 Status: COMPLETE**
**Authorized next step: Await Phase 5 authorization.**

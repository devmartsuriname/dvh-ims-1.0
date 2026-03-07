

# Documentation Update Report — VolksHuisvesting IMS

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Summary

After scanning all `/docs/` subdirectories, the following documents require updates to reflect the current project state (post Phase 7 Security Hardening, v1.8).

---

## CRITICAL — Severely Outdated

### 1. `docs/DVH-IMS-V1.0_1.1/Tasks.md`
- **Problem:** Shows "Current Phase: Pre-Phase 0 (Documentation)". All phases 0-7 are marked as unchecked `[ ]`. No phase completion is recorded.
- **Reality:** All phases through Phase 7 (Security Hardening) are COMPLETE.
- **Action:** Full rewrite. Update current status, mark all completed phases, record all restore points, remove "Pending" items that are done.

### 2. `docs/DVH-IMS-V1.0_1.1/RLS_POLICY_MATRIX.md`
- **Problem:** Last updated 2026-01-07. Still references "Phase 1 (Allowlist)" security model with hardcoded `info@devmart.sr` email patterns. Lists RBAC as "Deferred to Phase 10+". Shows `public_status_access` as "Admin Only" SELECT.
- **Reality:** Full RBAC is implemented. Allowlist pattern replaced. `public_status_access` anon policy was just removed in Phase 7. `housing_document_upload` INSERT policy was added.
- **Action:** Full rewrite to reflect current RBAC-based RLS model with `has_role()`, `get_user_district()`, and all Phase 7 changes.

### 3. `docs/DVH-IMS-V1.0_1.1/SECURITY_RLS_ROLES_STATUS.md`
- **Problem:** Version v1.1, last updated 2026-01-24. Does not reflect Phase 7 migrations (dropped `anon_can_select_public_status_access`, restricted `app_user_profile` update, added `housing_document_upload` INSERT policy).
- **Action:** Update to include Phase 7 hardening changes, new policy list, and updated verification checklist.

---

## HIGH — Needs Update

### 4. `docs/DVH-IMS-V1.0_1.1/Execution_Plan.md`
- **Problem:** Deadline listed as "30 January 2026" (past). No record of phase completions.
- **Action:** Update phase completion status. Mark deadline as met or revised.

### 5. `docs/DVH-IMS-V1.0_1.1/Database_RLS.md`
- **Problem:** Original specification from pre-implementation. Does not reflect actual implemented schema additions (e.g., `housing_document_upload`, `housing_document_requirement`, storage buckets) or current RLS policies.
- **Action:** Update table inventory and RLS policy descriptions to match production.

### 6. `docs/DVH-IMS-V1.0_1.1/Architecture_Security.md`
- **Problem:** Deadline "30 January 2026" (past). Does not mention Edge Functions, storage buckets, or Phase 7 hardening.
- **Action:** Update with implemented architecture components and security posture.

### 7. `docs/DVH-IMS/V1.7/changelog.md`
- **Problem:** Only covers V1.7.0 (WizardProgress fix) and a won't-fix item. Missing all V1.7.x cleanup phases (3-5) and V1.8.x security hardening.
- **Action:** Add entries for Phase 3 (dead code removal), Phase 4 (structure cleanup), Phase 5 (accessibility), Phase 6 (verification), Phase 7 (security hardening).

---

## MEDIUM — Should Be Updated

### 8. `docs/DVH-IMS-V1.0_1.1/Program_Planning_Phase_Gates.md`
- **Problem:** All gate criteria still appear as planning-only. No gate pass/fail records.
- **Action:** Add gate completion records for all passed phases.

### 9. `docs/DVH-IMS-V1.0_1.1/Master_PRD.md`
- **Problem:** Original planning document. Generally stable but deadline reference is outdated.
- **Action:** Minor update — mark as "Implemented" rather than "Planned".

### 10. `docs/DVH-IMS-V1.2/DVH-IMS-V1.2_Tasks_and_Phases.md`
- **Problem:** V1.2 era task tracking. Likely fully superseded but never marked as archived.
- **Action:** Add archive header noting superseded by V1.8 state.

---

## LOW — Optional Cleanup

### 11. Duplicate `restore_points/` vs `restore-points/`
- Two directories exist: `docs/restore_points/` (contains V1.8 restore point) and `docs/restore-points/` (contains V1.5/V1.7 restore points).
- **Action:** Consolidate into single `docs/restore-points/` per repository structure standard.

### 12. `docs/backend.md` (root-level duplicate)
- A `backend.md` exists at `docs/backend.md` AND at `docs/DVH-IMS-V1.0_1.1/Backend.md`.
- **Action:** Remove duplicate or add redirect note.

---

## Documents That Are Current (No Update Needed)

| Document | Status |
|----------|--------|
| `docs/restore_points/RESTORE_POINT_V1.8_PHASE_7_SECURITY_HARDENING.md` | Current |
| `docs/migrations/v1.8/PHASE_7_SECURITY_HARDENING_MIGRATIONS.sql` | Current |
| `docs/migrations/v1.8/ROLLBACK_PHASE_7_SECURITY_HARDENING.sql` | Current |
| `docs/manual/*` (16 Ministerial Manual files) | Current |
| `docs/DVH-IMS-V1.3/V1.3_CLOSURE_STATEMENT.md` | Archived/Final |
| `docs/proposals/DVH-IMS_PREMIUM_LANDING_LAYOUT_PROPOSAL.md` | Reference |

---

## Recommended Priority Order

1. **Tasks.md** — most visible tracking doc, completely wrong
2. **RLS_POLICY_MATRIX.md** — security-critical, references removed policies
3. **SECURITY_RLS_ROLES_STATUS.md** — security-critical, missing Phase 7
4. **Changelog** — missing 5+ phases of changes
5. **Execution_Plan.md** — outdated completion status
6. **Database_RLS.md** — outdated schema inventory
7. **Architecture_Security.md** — outdated architecture description
8. **Program_Planning_Phase_Gates.md** — missing gate records
9. **Consolidate restore point directories**
10. **Remove duplicate backend.md**

---

Awaiting instruction on which documents to update, and in what order.


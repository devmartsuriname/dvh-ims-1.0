# ⛔ INVALID DOCUMENT — DO NOT USE

**Status:** ❌ CREATED WITHOUT AUTHORIZATION — NOT VALID  
**Created:** 2026-01-24  
**Invalidated:** 2026-01-24  
**Reason:** Document created without explicit Phase 1 planning authorization from Project Owner

---

## Governance Violation Notice

This document was created prematurely without explicit authorization from Delroy (Project Owner).

**This document:**
- Is NOT approved
- Is NOT complete
- Is NOT accepted
- Must NOT be referenced
- Must NOT be carried forward

**Correct Project State:**
- Smoke Test: CLOSED
- V1.2 Documentation Baseline: APPROVED
- Phase 1: NOT OPENED
- Phase 1 Planning: NOT AUTHORIZED

---

## Original Content (INVALIDATED)

The content below was created without authorization and is preserved for audit purposes only.

## 1. Phase Objective

Establish the foundational access control and authority enforcement layer for DVH-IMS-V1.2.

This phase implements the normative role model, departmental boundaries, and authority matrix defined in the approved V1.2 documentation baseline.

**Primary Goal:** Ensure that every system action is governed by explicit role-based permissions, with no implicit access and no hardcoded bypasses.

---

## 2. In-Scope Items

| Category | Item | Source Document |
|----------|------|-----------------|
| Roles | Implement 6 normative roles in database | Roles_and_Authority_Matrix.md |
| Roles | DVH Operator, DVH Reviewer, DVH Decision Officer | Roles_and_Authority_Matrix.md |
| Roles | DVH Supervisor, Auditor, System Administrator | Roles_and_Authority_Matrix.md |
| Authority | Role-to-action mapping (Create, Edit, Review, Approve, Reject, Audit, Configure) | Roles_and_Authority_Matrix.md |
| RLS | Update RLS policies to enforce role-based access | Database_RLS.md (V1.1 baseline) |
| RLS | Implement department/district isolation | Roles_and_Authority_Matrix.md |
| Functions | Create helper functions for role verification | Architecture_Overview_Logical.md |
| Admin UI | Role-aware UI state (hide/show actions per role) | Roles_and_Authority_Matrix.md |

---

## 3. Explicit Exclusions

| Item | Reason | Reference |
|------|--------|-----------|
| Public Wizard | Out of V1.2 scope | Gap_Analysis_From_V1.1.md (Category D) |
| Workflow state enforcement | Phase 2 scope | Implementation_Roadmap.md |
| Audit event emission | Phase 3 scope | Implementation_Roadmap.md |
| Notification triggers | Phase 4 scope | Implementation_Roadmap.md |
| UI refactors | Darkone Admin 1:1 enforced | Guardian Rules |
| Schema changes beyond roles | Phase 2+ scope | Implementation_Roadmap.md |
| Performance optimizations | Not authorized | Guardian Rules |

---

## 4. Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| V1.1 Frozen Baseline | ✅ CONFIRMED | No modifications permitted |
| V1.2 Documentation Approved | ✅ CONFIRMED | 2026-01-24 |
| Demo Data Reset Complete | ✅ CONFIRMED | Clean state verified |
| Smoke Test Passed | ✅ CONFIRMED | System stable |
| Existing `user_roles` table | ✅ EXISTS | Contains `app_role` enum |
| Existing `app_user_profile` table | ✅ EXISTS | 7 profiles preserved |
| Existing RLS helper functions | ✅ EXISTS | `has_role()`, `has_any_role()`, `is_national_role()` |

---

## 5. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Role mapping conflicts with V1.1 code | Medium | High | Test against existing admin modules; document any conflicts |
| RLS policy breaks existing functionality | Medium | High | Staged rollout; test each table individually |
| New roles not matching existing enum | Low | High | Verify against `app_role` enum before implementation |
| UI permissions break module access | Medium | Medium | Test all 11 admin modules after changes |
| Missing role assignments for test users | Low | Medium | Verify `app_user_profile` records post-implementation |

---

## 6. Exit Criteria

Phase 1 is COMPLETE when:

| Criterion | Verification Method |
|-----------|---------------------|
| All 6 normative roles defined in database | SQL query verification |
| Role-to-action matrix implemented | RLS policy audit |
| Existing admin modules remain functional | Module smoke test |
| No unauthorized access paths identified | Security scan |
| Role-based UI visibility working | Manual UI test |
| No console errors introduced | Browser console check |
| Restore point created | Restore point document |

---

## 7. Implementation Artifacts (Planned)

**To be created during execution (NOT NOW):**

| Artifact | Type | Location |
|----------|------|----------|
| Role migration SQL | Migration | `supabase/migrations/` |
| Updated RLS policies | Migration | `supabase/migrations/` |
| Role verification functions | Migration | `supabase/migrations/` |
| Role-aware UI hooks | Frontend | `src/hooks/` |
| Phase 1 restore point | Documentation | `restore-points/v1.2/` |

---

## 8. Governance Confirmation

| Rule | Status |
|------|--------|
| No implementation performed in this document | ✅ CONFIRMED |
| No code changes made | ✅ CONFIRMED |
| No schema changes made | ✅ CONFIRMED |
| No RLS changes made | ✅ CONFIRMED |
| No UI changes made | ✅ CONFIRMED |
| Darkone Admin 1:1 parity maintained | ✅ CONFIRMED |
| Public Wizard excluded | ✅ CONFIRMED |
| Execution awaits explicit authorization | ✅ CONFIRMED |

---

## 9. Authorization Gate

**Phase 1 Execution Status:** ⏳ AWAITING AUTHORIZATION

| Requirement | Status |
|-------------|--------|
| Planning outline complete | ✅ COMPLETE |
| Scope boundaries defined | ✅ COMPLETE |
| Exclusions documented | ✅ COMPLETE |
| Risks identified | ✅ COMPLETE |
| Exit criteria defined | ✅ COMPLETE |
| Project Owner authorization | ⏳ PENDING |

**Next Action Required:** Explicit authorization from Delroy (Project Owner) to begin Phase 1 execution.

---

**END OF PHASE 1 PLANNING OUTLINE**

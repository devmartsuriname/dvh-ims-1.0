# DVH-IMS V1.3 — Phase Tracking

**Project:** VolksHuisvesting IMS (DVH-IMS)  
**Version:** V1.3  
**Authorization:** OPTION 2 → OPTION 1 Path  
**Last Updated:** 2026-01-30

---

## Phase Status Overview

| Phase | Scope | Status | Closure Date |
|-------|-------|--------|--------------|
| Phase 1 | Backend Enforcement + Audit Hardening | **CLOSED** | 2026-01-30 |
| Phase 2 | Admin Notifications (S-03) | **CLOSED** | 2026-01-30 |
| Phase 3 | Role & Workflow Preparation | **CLOSED** | 2026-01-30 |
| Phase 4A | Social Field Worker Activation | **CLOSED** | 2026-01-30 |
| Phase 4B | Technical Inspector Activation | **CLOSED** | 2026-01-30 |

---

## Phase 1 — CLOSED

**Deliverables:**

| ID | Deliverable | Status |
|----|-------------|--------|
| D-01 | Backend Transition Enforcement | **FINAL** |
| D-02 | Audit Hardening (correlation_id) | **FINAL** |

**Documentation:**

| Document | Location | Status |
|----------|----------|--------|
| Scope & Execution Plan | [PHASE-1-Scope-and-Execution-Plan.md](./PHASE-1-Scope-and-Execution-Plan.md) | FINAL |
| Verification Report | [PHASE-1-Verification-Report.md](./PHASE-1-Verification-Report.md) | FINAL |
| Closure Report | [phase-1/PHASE-1-Closure-Report.md](./phase-1/PHASE-1-Closure-Report.md) | FINAL |

**Restore Point:** `RESTORE_POINT_V1.3_PHASE1_D01_D02_START`

---

## Phase 2 — CLOSED

**Deliverables:**

| ID | Deliverable | Status |
|----|-------------|--------|
| S-03 | Admin Notifications | **FINAL** |

**Documentation:**

| Document | Location | Status |
|----------|----------|--------|
| Scope & Execution Plan | [PHASE-2-Scope-and-Execution-Plan.md](./PHASE-2-Scope-and-Execution-Plan.md) | FINAL |
| Closure Report | [phase-2/PHASE-2-Closure-Report.md](./phase-2/PHASE-2-Closure-Report.md) | FINAL |

**Restore Point:** `RESTORE_POINT_V1.3_PHASE2_S03_START`

---

## Phase 3 — CLOSED

**Scope:** Role & Workflow Activation Preparation (STRUCTURE ONLY)

**Governing Principle:** No operational activation, no UI exposure, no account assignment

**Deliverables:**

| ID | Deliverable | Status |
|----|-------------|--------|
| P3-DOC-1 | Role Preparation Document | **FINAL** |
| P3-DOC-2 | Workflow Preparation Document | **FINAL** |
| P3-DOC-3 | RBAC Policy Templates | **FINAL** |
| P3-DOC-4 | Audit Hooks Mapping | **FINAL** |
| P3-DOC-5 | Risk and Activation Notes | **FINAL** |
| P3-TS-1 | TypeScript Role Definitions (v12-roles.ts) | **FINAL** |

**Documentation:**

| Document | Location | Status |
|----------|----------|--------|
| Role Preparation | [PHASE-3/PHASE-3-ROLE-PREPARATION.md](./PHASE-3/PHASE-3-ROLE-PREPARATION.md) | FINAL |
| Workflow Preparation | [PHASE-3/PHASE-3-WORKFLOW-PREPARATION.md](./PHASE-3/PHASE-3-WORKFLOW-PREPARATION.md) | FINAL |
| RBAC Policy Templates | [PHASE-3/PHASE-3-RBAC-POLICY-TEMPLATES.md](./PHASE-3/PHASE-3-RBAC-POLICY-TEMPLATES.md) | FINAL |
| Audit Hooks Mapping | [PHASE-3/PHASE-3-AUDIT-HOOKS-MAPPING.md](./PHASE-3/PHASE-3-AUDIT-HOOKS-MAPPING.md) | FINAL |
| Risk and Activation Notes | [PHASE-3/PHASE-3-RISK-AND-ACTIVATION-NOTES.md](./PHASE-3/PHASE-3-RISK-AND-ACTIVATION-NOTES.md) | FINAL |
| Closure Report | [PHASE-3/PHASE-3-CLOSURE-REPORT.md](./PHASE-3/PHASE-3-CLOSURE-REPORT.md) | FINAL |

**TypeScript Artifact:**

| File | Location | Status |
|------|----------|--------|
| v12-roles.ts | src/types/v12-roles.ts | FINAL (NOT IMPORTED) |

**Restore Points:**
- `RESTORE_POINT_V1.3_PHASE3_START`
- `RESTORE_POINT_V1.3_PHASE3_COMPLETE`

---

## Phase 4A — CLOSED

**Scope:** Social Field Worker Activation (Bouwsubsidie Only)

**Deliverables:**

| ID | Deliverable | Status |
|----|-------------|--------|
| P4A-DB-1 | app_role enum extension (social_field_worker) | **FINAL** |
| P4A-DB-2 | Updated subsidy_case transition trigger | **FINAL** |
| P4A-DB-3 | 12 RLS policies for social_field_worker | **FINAL** |
| P4A-TS-1 | AppRole type update | **FINAL** |
| P4A-UI-1 | Status transitions and badges | **FINAL** |

**Documentation:**

| Document | Location | Status |
|----------|----------|--------|
| Activation Report | [PHASE-4A/PHASE-4A-ACTIVATION-REPORT.md](./PHASE-4A/PHASE-4A-ACTIVATION-REPORT.md) | FINAL |
| Verification Checklist | [PHASE-4A/PHASE-4A-VERIFICATION-CHECKLIST.md](./PHASE-4A/PHASE-4A-VERIFICATION-CHECKLIST.md) | FINAL |
| Risk Observations | [PHASE-4A/PHASE-4A-RISK-OBSERVATIONS.md](./PHASE-4A/PHASE-4A-RISK-OBSERVATIONS.md) | FINAL |

**Restore Points:**
- `RESTORE_POINT_V1.3_PHASE4A_START`
- `RESTORE_POINT_V1.3_PHASE4A_COMPLETE`

**Activated Role:**

| Role | Enum Value | Service | Status |
|------|------------|---------|--------|
| Social Field Worker | social_field_worker | Bouwsubsidie Only | ✅ ACTIVE |

---

## Phase 4B — CLOSED

**Scope:** Technical Inspector Activation (Bouwsubsidie Only)

**Deliverables:**

| ID | Deliverable | Status |
|----|-------------|--------|
| P4B-DB-1 | app_role enum extension (technical_inspector) | **FINAL** |
| P4B-DB-2 | Updated subsidy_case transition trigger (technical review states) | **FINAL** |
| P4B-DB-3 | 12 RLS policies for technical_inspector | **FINAL** |
| P4B-TS-1 | AppRole type update | **FINAL** |
| P4B-TS-2 | AuditAction type update | **FINAL** |
| P4B-UI-1 | Status transitions and badges | **FINAL** |

**Documentation:**

| Document | Location | Status |
|----------|----------|--------|
| Activation Report | [PHASE-4B/PHASE-4B-ACTIVATION-REPORT.md](./PHASE-4B/PHASE-4B-ACTIVATION-REPORT.md) | FINAL |
| Verification Checklist | [PHASE-4B/PHASE-4B-VERIFICATION-CHECKLIST.md](./PHASE-4B/PHASE-4B-VERIFICATION-CHECKLIST.md) | FINAL |
| Risk Observations | [PHASE-4B/PHASE-4B-RISK-OBSERVATIONS.md](./PHASE-4B/PHASE-4B-RISK-OBSERVATIONS.md) | FINAL |

**Restore Points:**
- `RESTORE_POINT_V1.3_PHASE4B_START`
- `RESTORE_POINT_V1.3_PHASE4B_COMPLETE`

**Activated Role:**

| Role | Enum Value | Service | Status |
|------|------------|---------|--------|
| Technical Inspector | technical_inspector | Bouwsubsidie Only | ✅ ACTIVE |

**New Status Values (Bouwsubsidie):**

| Status | Description |
|--------|-------------|
| in_technical_review | Case in technical inspection |
| technical_approved | Technical inspection completed |
| returned_to_social | Returned to social field worker |

---

## Current Active Roles (9 Total)

| Role | Enum Value | Service | Phase Activated |
|------|------------|---------|-----------------|
| System Admin | system_admin | Both | V1.1 |
| Minister | minister | Both | V1.1 |
| Project Leader | project_leader | Both | V1.1 |
| Frontdesk Bouwsubsidie | frontdesk_bouwsubsidie | Bouwsubsidie | V1.1 |
| Frontdesk Housing | frontdesk_housing | Woningregistratie | V1.1 |
| Admin Staff | admin_staff | Both | V1.1 |
| Audit | audit | Both | V1.1 |
| Social Field Worker | social_field_worker | Bouwsubsidie Only | V1.3 Phase 4A |
| Technical Inspector | technical_inspector | Bouwsubsidie Only | V1.3 Phase 4B |

---

## Explicit Exclusions (V1.3 Scope)

The following remain NOT authorized for V1.3:

| Item | Status |
|------|--------|
| Scale/Performance (SP-A/B/C) | NOT TOUCHED |
| Service refactors (S-01, S-02) | NOT TOUCHED |
| UI changes | NOT TOUCHED |
| Director activation | NOT YET AUTHORIZED |
| Ministerial Advisor activation | NOT YET AUTHORIZED |
| Woningregistratie workflow changes | NOT TOUCHED |
| Public wizard changes | NOT TOUCHED |

---

## Governance Confirmation

| Rule | Status |
|------|--------|
| No scope creep occurred | ✓ CONFIRMED |
| V1.2 remains read-only | ✓ CONFIRMED |
| V1.1 remains operational and unchanged | ✓ CONFIRMED |
| Phase 1 is LOCKED from further modification | ✓ ENFORCED |
| Phase 2 is LOCKED from further modification | ✓ ENFORCED |
| Phase 3 is LOCKED from further modification | ✓ ENFORCED |
| Phase 4A is LOCKED from further modification | ✓ ENFORCED |
| Phase 4B is LOCKED from further modification | ✓ ENFORCED |
| Woningregistratie unchanged after Phase 4B | ✓ CONFIRMED |

---

## Next Phase (Requires Authorization)

**Phase 4C: Director Activation (Bouwsubsidie Only)**

Prerequisites:
- Explicit authorization from Delroy
- Database enum extension (director)
- RLS policy creation
- TypeScript updates
- Trigger update for director approval states

**Status:** AWAITING AUTHORIZATION

---

**END OF V1.3 PHASE TRACKING**


# DVH-IMS V1.3 — Phase 3 Preparation Plan

## Document Type: Phase Scope & Execution Plan
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 3 — Role & Workflow Activation Preparation (STRUCTURE ONLY)
## Authorization: OPTION 2 → OPTION 1 Path

---

## 1. Authorization Context

| Item | Status |
|------|--------|
| DVH-IMS V1.1 | OPERATIONAL (LIVE) |
| DVH-IMS V1.2 | CLOSED (Documentation Only) |
| V1.3 Phase 1 (D-01 + D-02) | CLOSED & LOCKED |
| V1.3 Phase 2 (S-03) | CLOSED & LOCKED |
| V1.3 Phase 3 | OPEN — PREPARATION ONLY |

**Governing Principle:** No operational activation, no UI exposure, no account assignment.

---

## 2. Current Role Inventory

### 2.1 Active Roles (Current app_role Enum)

| Enum Value | V1.2 Mapping | Account Exists | Service Applicability |
|------------|--------------|----------------|----------------------|
| `system_admin` | System Administrator | Yes | Technical Only |
| `minister` | Minister | Yes | Bouwsubsidie (Decision) |
| `project_leader` | Project Leader/Deputy Director | Yes | Both Services |
| `frontdesk_bouwsubsidie` | Frontdesk (BS) | Yes | Bouwsubsidie |
| `frontdesk_housing` | Frontdesk (WR) | Yes | Woningregistratie |
| `admin_staff` | Administrative Officer | Yes | Both Services |
| `audit` | Auditor | Yes | Read-Only |

### 2.2 Missing Roles (V1.2 Documented, Not Instantiated)

| V1.2 Role | Proposed Enum Value | Service Applicability | Decision Chain Position |
|-----------|---------------------|----------------------|------------------------|
| Social Field Worker | `social_field_worker` | Both (Parallel) | Step 1 (Parallel) |
| Technical Inspector | `technical_inspector` | Bouwsubsidie Only | Step 2 |
| Director | `director` | Both | Step 5 |
| Ministerial Advisor | `ministerial_advisor` | Bouwsubsidie Only | Step 6 |

---

## 3. Phase 3 Objective

**Prepare the structural foundation for the full V1.2 role and workflow model WITHOUT activating it.**

### 3.1 What "Preparation" Means

| Allowed | Not Allowed |
|---------|-------------|
| Define TypeScript type extensions (parallel types) | Modify existing `AppRole` type |
| Create preparatory documentation | Modify database enum |
| Map state transitions per role (documentation) | Add RLS policies referencing new roles |
| Define future RBAC policy templates | Expose new roles in UI |
| Create role-to-workflow mapping | Assign roles to accounts |
| Document audit logging hooks | Create new user accounts |

### 3.2 System Behavior Guarantee

**The system MUST behave EXACTLY as before for all users after Phase 3 completion.**

- No new permissions become effective
- No new roles become selectable in admin UI
- No existing access is reduced or expanded
- All existing workflows function unchanged

---

## 4. Implementation Strategy

### 4.1 Approach: Documentation + TypeScript Definitions Only

Since this is PREPARATION ONLY with no operational change, the implementation will:

1. **Create documentation** for the prepared role model
2. **Create TypeScript type definitions** for future roles (not replacing current types)
3. **Document RBAC policy templates** (SQL comments, not applied)
4. **Map workflow transitions per role** (documentation only)
5. **Document audit hooks** (not triggered)

### 4.2 No Database Changes

The PostgreSQL `app_role` enum will NOT be modified. New roles will be documented as "PREPARED — NOT ACTIVE" with migration scripts provided for future activation.

---

## 5. Deliverables Structure

All outputs will be placed under: `phases/DVH-IMS-V1.3/PHASE-3/`

### 5.1 Required Artifacts

| # | Artifact | Purpose |
|---|----------|---------|
| 1 | `RESTORE_POINT_V1.3_PHASE3_START.md` | Pre-phase restore point |
| 2 | `PHASE-3-ROLE-PREPARATION.md` | Full role definition document |
| 3 | `PHASE-3-WORKFLOW-PREPARATION.md` | Role-to-workflow mapping |
| 4 | `PHASE-3-RISK-AND-ACTIVATION-NOTES.md` | Activation risks and prerequisites |
| 5 | `PHASE-3-RBAC-POLICY-TEMPLATES.md` | Prepared RLS policy templates |
| 6 | `PHASE-3-AUDIT-HOOKS-MAPPING.md` | Audit event definitions per role |
| 7 | `RESTORE_POINT_V1.3_PHASE3_COMPLETE.md` | Post-phase restore point |
| 8 | `PHASE-3-CLOSURE-REPORT.md` | Phase closure documentation |

### 5.2 TypeScript Definitions (Non-Breaking)

A new file will be created: `src/types/v12-roles.ts`

This file will contain:
- Type definitions for V1.2 roles
- Role-to-service applicability mapping
- Decision chain position constants
- Workflow transition permissions

**Critical:** This file will NOT be imported by any operational code. It is documentation in TypeScript form.

---

## 6. Role Preparation Details

### 6.1 Social Field Worker

| Attribute | Value |
|-----------|-------|
| Proposed Enum | `social_field_worker` |
| Service Applicability | Both (Bouwsubsidie + Woningregistratie) |
| Decision Chain Position | Step 1 (Parallel with Frontdesk) |
| Core Authority | Social assessment, household evaluation |
| Workflow States | SUBMITTED → REVIEW_APPROVED (parallel reviewer) |
| Audit Actions | SOCIAL_ASSESSMENT_STARTED, SOCIAL_ASSESSMENT_COMPLETED |
| Activation Status | **PREPARED — NOT ACTIVE** |

### 6.2 Technical Inspector

| Attribute | Value |
|-----------|-------|
| Proposed Enum | `technical_inspector` |
| Service Applicability | Bouwsubsidie Only |
| Decision Chain Position | Step 2 |
| Core Authority | Technical assessment, budget verification |
| Workflow States | REVIEW_APPROVED → APPROVED (technical gate) |
| Audit Actions | TECHNICAL_INSPECTION_STARTED, TECHNICAL_INSPECTION_COMPLETED |
| Activation Status | **PREPARED — NOT ACTIVE** |

### 6.3 Director

| Attribute | Value |
|-----------|-------|
| Proposed Enum | `director` |
| Service Applicability | Both Services |
| Decision Chain Position | Step 5 |
| Core Authority | Organizational approval, policy compliance |
| Workflow States | (After Project Leader review) → APPROVED |
| Audit Actions | DIRECTOR_REVIEW_STARTED, DIRECTOR_APPROVED, DIRECTOR_REJECTED |
| Activation Status | **PREPARED — NOT ACTIVE** |

### 6.4 Ministerial Advisor

| Attribute | Value |
|-----------|-------|
| Proposed Enum | `ministerial_advisor` |
| Service Applicability | Bouwsubsidie Only |
| Decision Chain Position | Step 6 |
| Core Authority | Advisory review, paraaf (initialing) |
| Workflow States | (After Director approval) → Minister decision |
| Audit Actions | MINISTERIAL_ADVICE_STARTED, MINISTERIAL_ADVICE_COMPLETED |
| Activation Status | **PREPARED — NOT ACTIVE** |

---

## 7. Service-Specific Role Chains

### 7.1 Bouwsubsidie (Full Chain — 7 Steps)

```text
Step 1: Frontdesk (intake)
        ↓
Step 1P: Social Field Worker (parallel)
        ↓
Step 2: Technical Inspector (technical review)
        ↓
Step 3: Administrative Officer (completeness)
        ↓
Step 4: Project Leader / Deputy Director (policy)
        ↓
Step 5: Director (organizational)
        ↓
Step 6: Ministerial Advisor (advice + paraaf)
        ↓
Step 7: Minister (final decision)
```

### 7.2 Woningregistratie (Reduced Chain — 5 Steps)

```text
Step 1: Frontdesk (intake)
        ↓
Step 1P: Social Field Worker (parallel)
        ↓
Step 3: Administrative Officer (completeness)
        ↓
Step 4: Project Leader / Deputy Director (policy)
        ↓
Step 5: Director (organizational — final decision)
```

**Note:** Woningregistratie explicitly EXCLUDES:
- Technical Inspector (no technical inspection required)
- Ministerial Advisor (no ministerial advice required)
- Minister final decision (Director is final authority)

---

## 8. RBAC Policy Templates (Prepared, Not Applied)

### 8.1 Template Structure

Each new role will have prepared policy templates for:
- `has_role()` function inclusion
- `is_national_role()` function inclusion (if applicable)
- Table-specific SELECT/INSERT/UPDATE policies
- Service-specific filtering

### 8.2 Sample Template (Social Field Worker)

```sql
-- PREPARED POLICY TEMPLATE — NOT APPLIED
-- Role: social_field_worker
-- Activation Phase: Future (requires explicit authorization)

-- Policy: SELECT on subsidy_case
-- CREATE POLICY "social_field_worker_select_subsidy_case" ON public.subsidy_case
-- FOR SELECT
-- USING (
--   has_role(auth.uid(), 'social_field_worker'::app_role)
--   AND district_code = get_user_district(auth.uid())
-- );

-- Policy: SELECT on housing_registration
-- CREATE POLICY "social_field_worker_select_housing_registration" ON public.housing_registration
-- FOR SELECT
-- USING (
--   has_role(auth.uid(), 'social_field_worker'::app_role)
--   AND district_code = get_user_district(auth.uid())
-- );
```

---

## 9. Audit Hook Mapping (Prepared, Not Triggered)

### 9.1 New Audit Actions per Role

| Role | Audit Actions |
|------|---------------|
| Social Field Worker | SOCIAL_ASSESSMENT_STARTED, SOCIAL_ASSESSMENT_COMPLETED, SOCIAL_ASSESSMENT_RETURNED |
| Technical Inspector | TECHNICAL_INSPECTION_STARTED, TECHNICAL_INSPECTION_COMPLETED, TECHNICAL_INSPECTION_FAILED |
| Director | DIRECTOR_REVIEW_STARTED, DIRECTOR_APPROVED, DIRECTOR_REJECTED, DIRECTOR_ESCALATED |
| Ministerial Advisor | MINISTERIAL_ADVICE_STARTED, MINISTERIAL_ADVICE_COMPLETED, MINISTERIAL_PARAAF_APPLIED |

### 9.2 Audit Integration Pattern

```typescript
// PREPARED — NOT ACTIVE
// These audit hooks will be activated in the future activation phase

interface AuditHookDefinition {
  role: 'social_field_worker' | 'technical_inspector' | 'director' | 'ministerial_advisor';
  action: string;
  entityType: 'subsidy_case' | 'housing_registration';
  requiredMetadata: string[];
}

const PREPARED_AUDIT_HOOKS: AuditHookDefinition[] = [
  // Social Field Worker
  { role: 'social_field_worker', action: 'SOCIAL_ASSESSMENT_STARTED', entityType: 'subsidy_case', requiredMetadata: ['assessment_type'] },
  { role: 'social_field_worker', action: 'SOCIAL_ASSESSMENT_COMPLETED', entityType: 'subsidy_case', requiredMetadata: ['assessment_result', 'recommendation'] },
  // ... additional definitions
];
```

---

## 10. Activation Prerequisites (Future Phase)

### 10.1 Database Changes Required for Activation

| Change | SQL Statement | Risk Level |
|--------|---------------|------------|
| Extend app_role enum | `ALTER TYPE app_role ADD VALUE 'social_field_worker';` | Medium |
| Extend app_role enum | `ALTER TYPE app_role ADD VALUE 'technical_inspector';` | Medium |
| Extend app_role enum | `ALTER TYPE app_role ADD VALUE 'director';` | Medium |
| Extend app_role enum | `ALTER TYPE app_role ADD VALUE 'ministerial_advisor';` | Medium |
| Add RLS policies | Multiple CREATE POLICY statements | High |
| Update security definer functions | ALTER has_role, has_any_role | High |

### 10.2 TypeScript Changes Required for Activation

| Change | File | Risk Level |
|--------|------|------------|
| Update AppRole type | `src/hooks/useUserRole.ts` | Medium |
| Update Constants | `src/integrations/supabase/types.ts` | Medium |
| Update role guards | Various UI components | Medium |

### 10.3 UI Changes Required for Activation

| Change | Component | Risk Level |
|--------|-----------|------------|
| Add role to user management | User management pages | Medium |
| Add role-specific views | Dossier detail pages | Medium |
| Add role-specific actions | Status change handlers | High |

---

## 11. Implementation Steps

### Step 3A: Create Restore Point

Create `RESTORE_POINT_V1.3_PHASE3_START.md` before any implementation.

### Step 3B: Create Phase 3 Directory Structure

```text
phases/DVH-IMS-V1.3/PHASE-3/
├── PHASE-3-ROLE-PREPARATION.md
├── PHASE-3-WORKFLOW-PREPARATION.md
├── PHASE-3-RISK-AND-ACTIVATION-NOTES.md
├── PHASE-3-RBAC-POLICY-TEMPLATES.md
├── PHASE-3-AUDIT-HOOKS-MAPPING.md
└── PHASE-3-CLOSURE-REPORT.md
```

### Step 3C: Create TypeScript Definitions

Create `src/types/v12-roles.ts` with prepared role definitions.

### Step 3D: Create Role Preparation Document

Document all 4 prepared roles with complete specifications.

### Step 3E: Create Workflow Preparation Document

Document role-to-workflow mapping for both services.

### Step 3F: Create RBAC Policy Templates

Document prepared RLS policies (SQL comments, not applied).

### Step 3G: Create Audit Hooks Mapping

Document audit event definitions per role.

### Step 3H: Create Risk and Activation Notes

Document activation prerequisites and risks.

### Step 3I: Verification

Verify system behavior is unchanged.

### Step 3J: Create Completion Restore Point

Create `RESTORE_POINT_V1.3_PHASE3_COMPLETE.md`.

### Step 3K: Create Closure Report

Create `PHASE-3-CLOSURE-REPORT.md`.

---

## 12. Verification Matrix

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| P3-T01 | app_role enum unchanged | 7 values only |
| P3-T02 | RLS policies unchanged | No new policies |
| P3-T03 | UI role selectors unchanged | 7 roles only |
| P3-T04 | Existing workflows functional | All status changes work |
| P3-T05 | New TypeScript file created | v12-roles.ts exists |
| P3-T06 | New TypeScript file not imported | No import statements |
| P3-T07 | Documentation complete | All artifacts created |
| P3-T08 | No new audit events triggered | Audit log unchanged |

---

## 13. Explicit Constraints

### 13.1 Allowed Actions

| Action | Authorized |
|--------|------------|
| Create documentation files | ✅ |
| Create TypeScript type definitions | ✅ |
| Create SQL template comments | ✅ |
| Document workflow mappings | ✅ |
| Document audit hook definitions | ✅ |
| Create restore points | ✅ |

### 13.2 Forbidden Actions

| Action | Status |
|--------|--------|
| Modify app_role database enum | ❌ FORBIDDEN |
| Add RLS policies | ❌ FORBIDDEN |
| Assign roles to accounts | ❌ FORBIDDEN |
| Expose roles in UI | ❌ FORBIDDEN |
| Import new TypeScript file in operational code | ❌ FORBIDDEN |
| Create new user accounts | ❌ FORBIDDEN |
| Migrate live data | ❌ FORBIDDEN |
| Modify existing permissions | ❌ FORBIDDEN |

---

## 14. End-of-Phase Checklist

### Implemented (Structure Only)

- [ ] Restore Point (Start) created
- [ ] Phase 3 directory created
- [ ] TypeScript role definitions created
- [ ] Role Preparation document created
- [ ] Workflow Preparation document created
- [ ] RBAC Policy Templates document created
- [ ] Audit Hooks Mapping document created
- [ ] Risk and Activation Notes document created
- [ ] Restore Point (Complete) created
- [ ] Closure Report created

### Explicitly NOT Activated

- [ ] app_role enum NOT modified
- [ ] RLS policies NOT added
- [ ] Roles NOT assigned to accounts
- [ ] Roles NOT exposed in UI
- [ ] TypeScript file NOT imported in operational code
- [ ] No new audit events triggered

### System Behavior Unchanged

- [ ] All 7 current roles functional
- [ ] All existing workflows operational
- [ ] All existing RLS policies unchanged
- [ ] All existing UI unchanged

### Activation Ready Statement

- [ ] Phase 3 is READY for controlled activation (future phase)

---

## 15. Final Governance Statement

**V1.3 Phase 3 is strictly limited to PREPARATION ONLY.**

**No operational activation is authorized.**

**The system MUST behave EXACTLY as before after Phase 3 completion.**

**This phase prepares the structural foundation for the full V1.2 role model.**

**Activation requires explicit authorization (OPTION 1 — Future Phase).**

---

## 16. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE3_START.md` | CREATE | Pre-phase restore point |
| `phases/DVH-IMS-V1.3/PHASE-3/PHASE-3-ROLE-PREPARATION.md` | CREATE | Role definitions |
| `phases/DVH-IMS-V1.3/PHASE-3/PHASE-3-WORKFLOW-PREPARATION.md` | CREATE | Workflow mapping |
| `phases/DVH-IMS-V1.3/PHASE-3/PHASE-3-RBAC-POLICY-TEMPLATES.md` | CREATE | RLS templates |
| `phases/DVH-IMS-V1.3/PHASE-3/PHASE-3-AUDIT-HOOKS-MAPPING.md` | CREATE | Audit definitions |
| `phases/DVH-IMS-V1.3/PHASE-3/PHASE-3-RISK-AND-ACTIVATION-NOTES.md` | CREATE | Activation notes |
| `src/types/v12-roles.ts` | CREATE | TypeScript definitions (not imported) |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE3_COMPLETE.md` | CREATE | Post-phase restore point |
| `phases/DVH-IMS-V1.3/PHASE-3/PHASE-3-CLOSURE-REPORT.md` | CREATE | Closure documentation |
| `phases/DVH-IMS-V1.3/README.md` | MODIFY | Add Phase 3 status |

---

**PHASE 3 — PREPARATION ONLY — NO OPERATIONAL CHANGE**

**Awaiting approval to create Restore Point and begin implementation.**

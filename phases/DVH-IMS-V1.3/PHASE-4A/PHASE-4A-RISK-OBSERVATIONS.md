# DVH-IMS V1.3 Phase 4A — Risk Observations

## Document Type: Risk Assessment
## Version: 1.0
## Date: 2026-01-30
## Phase: Phase 4A — Social Field Worker Activation (Bouwsubsidie Only)

---

## 1. Risks Encountered

### 1.1 Enum Extension Transaction Limitation

**Risk:** PostgreSQL enum extensions cannot be used in the same transaction as statements that reference the new value.

**Impact:** Initial migration failed with error:
```
unsafe use of new value "social_field_worker" of enum type app_role
HINT: New enum values must be committed before they can be used.
```

**Mitigation Applied:** Split migration into two separate transactions:
1. First migration: `ALTER TYPE public.app_role ADD VALUE 'social_field_worker'`
2. Second migration: Trigger update and RLS policies

**Status:** ✅ RESOLVED

---

## 2. Pre-Existing Security Warnings

### 2.1 Anonymous Insert Policies

**Observation:** Security linter reported 11 warnings about `WITH CHECK (true)` policies.

**Analysis:** These are pre-existing policies for the public wizard feature, allowing anonymous users to submit applications. They are:
- `anon_can_insert_person`
- `anon_can_insert_household`
- `anon_can_insert_household_member`
- `anon_can_insert_address`
- `anon_can_insert_contact_point`
- `anon_can_insert_subsidy_case`
- `anon_can_insert_housing_registration`
- `anon_can_insert_subsidy_status_history`
- `anon_can_insert_housing_status_history`
- `anon_can_insert_public_status_access`
- `anon_can_insert_audit_event`

**Status:** ⚠️ PRE-EXISTING (NOT INTRODUCED BY PHASE 4A)

**Recommendation:** These should be reviewed in a future security hardening phase.

---

## 3. Rollback Readiness

### 3.1 Database Rollback

**Note:** Enum values cannot be removed from PostgreSQL once added. However, the `social_field_worker` value can be made inert by:
1. Dropping all RLS policies referencing it
2. Reverting the trigger to V1.1 transition matrix
3. Ensuring no user_roles rows reference it

**Rollback SQL Available:** Yes (documented in RESTORE_POINT_V1.3_PHASE4A_START.md)

### 3.2 Application Rollback

**Method:** Git revert of TypeScript changes
**Status:** ✅ READY

---

## 4. Observations for Future Phases

### 4.1 Transition Matrix Complexity

As more roles are activated, the transition matrix will grow. Consider:
- Documenting role-specific transition permissions
- Adding role validation in trigger (which roles can trigger which transitions)

### 4.2 Status Value Convention

Phase 4A introduced lowercase snake_case statuses (`in_social_review`, `social_completed`, `returned_to_intake`) consistent with existing V1.1 statuses.

---

## 5. Risk Summary

| Risk Category | Severity | Status |
|---------------|----------|--------|
| Enum transaction limitation | Medium | ✅ RESOLVED |
| Pre-existing security warnings | Low | ⚠️ PRE-EXISTING |
| Rollback complexity | Low | ✅ PREPARED |

---

**NO BLOCKING RISKS — PHASE 4A COMPLETE**

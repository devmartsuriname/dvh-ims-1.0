# Restore Point: V1.2 Phase 1 — Access & Authority Foundation

**Created:** 2026-01-29
**Context ID:** PHASE1-ACCESS-AUTH-2026-01-29
**Type:** Post-Implementation Checkpoint

---

## Intent Statement

Phase 1 of DVH-IMS V1.2 establishes the foundational access control and authority enforcement layer. This phase assigns roles to all 7 DVH user accounts, activates them, and applies district scoping to district-bound roles.

---

## Implementation Summary

### Database Changes (DATA ONLY — NO SCHEMA CHANGES)

| Operation | Table | Records Affected |
|-----------|-------|------------------|
| INSERT | user_roles | 6 new role assignments |
| UPDATE | app_user_profile | 7 users activated |
| UPDATE | app_user_profile | 3 users assigned district_code = 'PAR' |
| UPDATE | app_user_profile | 4 users confirmed district_code = NULL |

### Role Assignments (Final State)

| Email | Role | is_active | district_code |
|-------|------|-----------|---------------|
| admin.staff@volkshuisvesting.sr | admin_staff | true | PAR |
| audit@volkshuisvesting.sr | audit | true | NULL |
| frontdesk.bs@volkshuisvesting.sr | frontdesk_bouwsubsidie | true | PAR |
| frontdesk.wr@volkshuisvesting.sr | frontdesk_housing | true | PAR |
| info@devmart.sr | system_admin | true | NULL |
| minister@volkshuisvesting.sr | minister | true | NULL |
| projectleider@volkshuisvesting.sr | project_leader | true | NULL |

---

## Scope Compliance

| Rule | Status |
|------|--------|
| No app_role enum changes | ✅ CONFIRMED |
| No RLS policy changes | ✅ CONFIRMED |
| No UI changes | ✅ CONFIRMED |
| No routing changes | ✅ CONFIRMED |
| No workflow logic changes | ✅ CONFIRMED |
| No legacy roles activated | ✅ CONFIRMED |
| No new permissions introduced | ✅ CONFIRMED |

---

## Pre-existing Security Warnings (NOT NEW)

The database linter reports 11 WARN-level issues for "RLS Policy Always True" on anonymous INSERT policies. These are:
- Required for public wizard submissions (bouwsubsidie/housing)
- Documented as accepted risk in `docs/DVH-IMS-V1.0_1.1/SECURITY_HYGIENE_SUMMARY_PHASE_12_1.md`
- NOT introduced by Phase 1

---

## Smoke Test Status

| Test | Status | Notes |
|------|--------|-------|
| Database verification | ✅ PASSED | All 7 users verified with correct roles, activation, and district scoping |
| Enum integrity | ✅ PASSED | 7 roles unchanged: system_admin, minister, project_leader, frontdesk_bouwsubsidie, frontdesk_housing, admin_staff, audit |
| Browser login test | ⚠️ BLOCKED | Requires manual verification with known test credentials |
| Menu visibility | ⚠️ PENDING | Requires login - manual verification needed |
| Route access | ⚠️ PENDING | Requires login - manual verification needed |

**Action Required:** Manual smoke test with known credentials to complete verification.

---

## Rollback Instructions

If rollback is required:

```sql
-- Remove role assignments (except system_admin which existed before)
DELETE FROM user_roles WHERE role != 'system_admin';

-- Deactivate users
UPDATE app_user_profile SET is_active = false;

-- Clear district codes
UPDATE app_user_profile SET district_code = NULL;
```

---

## Files Changed

| File | Change Type |
|------|-------------|
| (Database only) | DATA INSERT/UPDATE |
| restore-points/v1.2/RESTORE_POINT_V1.2_PHASE1_ACCESS_AUTHORITY.md | NEW |

---

**END OF RESTORE POINT**

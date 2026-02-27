# Production Restore Point — Security Hardening: Remove Redundant Anonymous RLS Policies

**Version:** v1.7.x
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Execution Details

| Field | Value |
|-------|-------|
| **Execution Timestamp** | `_________________ (UTC)` |
| **Executor** | `_________________` |
| **Authorization Reference** | `_________________` |
| **Environment** | PRODUCTION |

---

## Migration Applied

**Script:** `docs/migrations/v1.7/PROD_SECURITY_HARDENING_ANON_RLS.sql`

### Policies Removed

| Policy Name | Table | Type |
|-------------|-------|------|
| `anon_can_select_person_for_status` | `person` | SELECT |
| `anon_can_select_subsidy_case_status` | `subsidy_case` | SELECT |
| `anon_can_select_housing_registration_status` | `housing_registration` | SELECT |
| `anon_can_select_subsidy_status_history` | `subsidy_case_status_history` | SELECT |
| `anon_can_select_housing_status_history` | `housing_registration_status_history` | SELECT |
| `anon_can_insert_audit_event` | `audit_event` | INSERT |

### Policies Retained (Design-Intentional)

| Policy Name | Table | Type |
|-------------|-------|------|
| `anon_can_select_public_status_access` | `public_status_access` | SELECT |

---

## Snapshots

| Snapshot | Reference |
|----------|-----------|
| **Before Migration** (pg_policies dump) | `_________________` |
| **After Migration** (pg_policies dump) | `_________________` |

---

## Security Scan References

| Scan | ID / Reference |
|------|----------------|
| **Pre-Migration Scan** | `_________________` |
| **Post-Migration Scan** | `_________________` |
| **Staging Scan (comparison baseline)** | Phase 4 — see `RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md` |

---

## Validation Checklist Reference

**Completed Checklist:** `docs/checklists/v1.7/PROD_VALIDATION_CHECKLIST_SECURITY_HARDENING.md`

| Section | Status |
|---------|--------|
| A) Pre-Execution Checks | `_________________` |
| B) Execution Verification | `_________________` |
| C) Post-Execution Security Scan | `_________________` |
| D) Rollback Criteria Reviewed | `_________________` |

---

## Rollback

| Field | Value |
|-------|-------|
| **Rollback Script** | `docs/migrations/v1.7/ROLLBACK_SECURITY_HARDENING_ANON_RLS.sql` |
| **Rollback Required** | ☐ Yes / ☐ No |
| **Rollback Executed At** | `_________________` |
| **Rollback Reason** | `_________________` |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Executor** | `_________________` | `_________________` | `_________________` |
| **Authorizer** | `_________________` | `_________________` | `_________________` |

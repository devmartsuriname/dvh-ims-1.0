# Production Validation Checklist — Security Hardening: Remove Redundant Anonymous RLS Policies

**Version:** v1.7.x
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Migration Script:** `docs/migrations/v1.7/PROD_SECURITY_HARDENING_ANON_RLS.sql`
**Rollback Script:** `docs/migrations/v1.7/ROLLBACK_SECURITY_HARDENING_ANON_RLS.sql`

---

## A) Pre-Execution Checks

| # | Check | Status | Notes |
|---|-------|--------|-------|
| A1 | Staging migration validated (Phase 3 PASS) | ☐ | |
| A2 | Staging security scan clean (Phase 4 PASS, no new HIGH/CRITICAL) | ☐ | |
| A3 | Staging restore point exists (`RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md`) | ☐ | |
| A4 | No open HIGH/CRITICAL security findings | ☐ | |
| A5 | Edge Function `lookup-public-status` healthy (200 response) | ☐ | |
| A6 | Edge Function `submit-bouwsubsidie-application` healthy | ☐ | |
| A7 | Edge Function `submit-housing-registration` healthy | ☐ | |
| A8 | Production rollback script reviewed and available | ☐ | |
| A9 | Written production authorization received from Delroy | ☐ | |

---

## B) Execution Verification

Run immediately after executing the migration script.

| # | Check | Status | Notes |
|---|-------|--------|-------|
| B1 | Run `SELECT policyname, tablename FROM pg_policies WHERE policyname LIKE 'anon_%' ORDER BY tablename;` — confirm 6 policies are absent | ☐ | |
| B2 | Confirm `anon_can_select_public_status_access` still present on `public_status_access` | ☐ | |
| B3 | Anonymous SELECT on `person` returns 0 rows | ☐ | |
| B4 | Anonymous SELECT on `subsidy_case` returns 0 rows | ☐ | |
| B5 | Anonymous SELECT on `housing_registration` returns 0 rows | ☐ | |
| B6 | Anonymous SELECT on `subsidy_case_status_history` returns 0 rows | ☐ | |
| B7 | Anonymous SELECT on `housing_registration_status_history` returns 0 rows | ☐ | |
| B8 | Edge Function `lookup-public-status` returns expected status response | ☐ | |
| B9 | Authenticated admin SELECT on `person` returns expected rows | ☐ | |
| B10 | Authenticated admin SELECT on `subsidy_case` returns expected rows | ☐ | |
| B11 | Authenticated admin SELECT on `audit_event` returns expected rows | ☐ | |

---

## C) Post-Execution Security Scan

| # | Check | Status | Notes |
|---|-------|--------|-------|
| C1 | Security scan executed on production | ☐ | |
| C2 | `anon_can_select_person_for_status` finding — REMOVED | ☐ | |
| C3 | `anon_can_select_subsidy_case_status` finding — REMOVED | ☐ | |
| C4 | `anon_can_select_housing_registration_status` finding — REMOVED | ☐ | |
| C5 | `anon_can_select_subsidy_status_history` finding — REMOVED | ☐ | |
| C6 | `anon_can_select_housing_status_history` finding — REMOVED | ☐ | |
| C7 | `anon_can_insert_audit_event` finding — REMOVED | ☐ | |
| C8 | `anon_can_select_public_status_access` — UNCHANGED (design-intentional) | ☐ | |
| C9 | No new HIGH/CRITICAL findings introduced | ☐ | |
| C10 | Scan results match staging scan results | ☐ | |

---

## D) Rollback Criteria

### Failure Triggers (any one triggers rollback consideration)

| Trigger | Description |
|---------|-------------|
| Edge Function failure | `lookup-public-status` returns errors or timeouts post-migration |
| Admin access denied | Authenticated admin users receive 401/403 on dashboard queries |
| New HIGH/CRITICAL finding | Post-migration security scan reveals new high-severity issues |
| Data access regression | Any authenticated role loses expected data access |

### Rollback Authorization

- **Authorized by:** Delroy (explicit written authorization required)
- **Executed by:** Designated DBA or system administrator
- **Script:** `docs/migrations/v1.7/ROLLBACK_SECURITY_HARDENING_ANON_RLS.sql`

### Rollback Time Window

- **Window:** 1 hour post-migration execution
- **After window:** Rollback still possible but requires additional impact assessment
- **Escalation:** If rollback is needed after the window, notify Delroy immediately

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Authorizer | _________________ | _________________ | _________________ |
| Executor | _________________ | _________________ | _________________ |
| Validator | _________________ | _________________ | _________________ |

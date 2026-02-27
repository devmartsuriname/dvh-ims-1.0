# DVH-IMS v1.7.x — Security Hardening Execution Plan

## Hard Gate: CLEARED

All 3 public Edge Functions (`lookup-public-status`, `submit-bouwsubsidie-application`, `submit-housing-registration`) use `SUPABASE_SERVICE_ROLE_KEY` to write audit events. The service role key bypasses RLS entirely. The `anon_can_insert_audit_event` policy is confirmed redundant and safe to drop.

**Evidence:**

- `lookup-public-status/index.ts` line 181-182: `createClient(supabaseUrl, supabaseServiceKey)`
- `submit-bouwsubsidie-application/index.ts` line 269-270: same pattern
- `submit-housing-registration/index.ts` line 286-287: same pattern

No browser-side anonymous audit inserts exist anywhere in the codebase.

---

## Phase 2 — Execute Migration (STAGING)

Run a single transactional SQL migration via the migration tool:

```sql
BEGIN;
DROP POLICY IF EXISTS "anon_can_select_person_for_status" ON person;
DROP POLICY IF EXISTS "anon_can_select_subsidy_case_status" ON subsidy_case;
DROP POLICY IF EXISTS "anon_can_select_housing_registration_status" ON housing_registration;
DROP POLICY IF EXISTS "anon_can_select_subsidy_status_history" ON subsidy_case_status_history;
DROP POLICY IF EXISTS "anon_can_select_housing_status_history" ON housing_registration_status_history;
DROP POLICY IF EXISTS "anon_can_insert_audit_event" ON audit_event;
COMMIT;
```

NOT dropped: `anon_can_select_public_status_access` (design-intentional, no PII).

---

## Phase 3 — Functional Validation (STAGING)

After migration, validate via read queries and Edge Function invocations:

1. **Public status lookup** — invoke `lookup-public-status` Edge Function with test data to confirm subsidy and housing lookups still return expected status fields (service role bypasses RLS).
2. **Admin dashboard** — run authenticated SELECT queries against `person`, `subsidy_case`, `audit_event` to confirm no new denials for admin roles.
3. **Audit logging** — confirm authenticated role-based INSERT policies still work (e.g., `role_insert_audit_event` for system_admin).
4. **Negative tests** — run anonymous SELECT queries against `person`, `subsidy_case`, `housing_registration`, `subsidy_case_status_history`, `housing_registration_status_history` to confirm RLS denial (0 rows returned).

---

## Phase 4 — Post-Migration Security Scan

Re-run security scan tool and compare:


| Finding                                       | Before             | After     |
| --------------------------------------------- | ------------------ | --------- |
| `anon_can_select_person_for_status`           | ERROR              | REMOVED   |
| `anon_can_select_subsidy_case_status`         | ERROR              | REMOVED   |
| `anon_can_select_housing_registration_status` | ERROR              | REMOVED   |
| `anon_can_select_subsidy_status_history`      | ERROR              | REMOVED   |
| `anon_can_select_housing_status_history`      | ERROR              | REMOVED   |
| `anon_can_insert_audit_event`                 | WARN               | REMOVED   |
| `anon_can_select_public_status_access`        | DESIGN-INTENTIONAL | UNCHANGED |


---

## Documentation Deliverables

1. **Restore point**: `docs/restore-points/v1.7/RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md`
2. **Update**: `docs/backend.md` — note removal of redundant anon policies
3. **Update**: `docs/DVH-IMS-V1.0_1.1/architecture.md` — update RLS section

---

## Files Changed


| File                                                                         | Action                               |
| ---------------------------------------------------------------------------- | ------------------------------------ |
| SQL migration                                                                | Drop 6 policies (via migration tool) |
| `docs/restore-points/v1.7/RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md` | Created                              |
| `docs/backend.md`                                                            | Updated                              |
| `docs/DVH-IMS-V1.0_1.1/architecture.md`                                      | Updated                              |


No source code changes. No Edge Function changes. No routing changes.  
  
DVH-IMS v1.7.x — Security Hardening: Execute Migration (STAGING) + Validate + Scan

DOCUMENTATION + CHECKLIST REQUIRED. HARD STOP AFTER PHASE 4.

Scope:

- STAGING only.

- Execute the approved SQL migration to drop redundant anonymous RLS policies.

- Perform functional + negative validation.

- Re-run security scan and report before/after.

- Do NOT change any source code or Edge Function code.

Phase 2 — Execute Migration (STAGING)

1) Run a single transactional SQL migration via the migration tool EXACTLY as defined:

   BEGIN;

   DROP POLICY IF EXISTS "anon_can_select_person_for_status" ON person;

   DROP POLICY IF EXISTS "anon_can_select_subsidy_case_status" ON subsidy_case;

   DROP POLICY IF EXISTS "anon_can_select_housing_registration_status" ON housing_registration;

   DROP POLICY IF EXISTS "anon_can_select_subsidy_status_history" ON subsidy_case_status_history;

   DROP POLICY IF EXISTS "anon_can_select_housing_status_history" ON housing_registration_status_history;

   DROP POLICY IF EXISTS "anon_can_insert_audit_event" ON audit_event;

   COMMIT;

2) Confirm explicitly that policy "anon_can_select_public_status_access" remains UNCHANGED.

Phase 3 — Functional Validation (STAGING)

A) Public status lookup (critical):

   - Invoke Edge Function `lookup-public-status` with known test data.

   - Confirm response fields and status values match pre-migration behavior.

B) Admin dashboard:

   - Authenticated admin role can still SELECT from person, subsidy_case, audit_event without new denials.

C) Audit logging:

   - Confirm role-based INSERT into audit_event still works (admin/system role).

D) Negative tests (anon):

   - Anonymous SELECT queries against person, subsidy_case, housing_registration, subsidy_case_status_history, housing_registration_status_history return 0 rows / denied.

Phase 4 — Post-Migration Security Scan

- Re-run the security scan tool.

- Provide a before/after comparison showing the 6 policies are REMOVED.

- Confirm no new HIGH/CRITICAL findings were introduced.

Documentation Deliverables

1) Create restore point:

   docs/restore-points/v1.7/RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_[RLS.md](http://RLS.md)

   Include: what changed, why safe, exact SQL, validation results, rollback note.

2) Update:

   docs/[backend.md](http://backend.md) — note removal of redundant anon policies + rationale (service role Edge Functions bypass RLS).

3) Update:

   docs/DVH-IMS-V1.0_1.1/[architecture.md](http://architecture.md) — update RLS/security section accordingly.

Rollback Note (must be included in restore point doc)

- If public status lookup validation fails, immediately STOP and re-create the dropped policies (same names) with prior logic, then report.

Checklist Report Format (required)

- IMPLEMENTED / PARTIAL / SKIPPED / VERIFICATION / BLOCKERS

- Include proof: function invocation results + scan screenshot/summary.

HARD STOP

- After Phase 4, stop and await explicit production authorization for any next phase.

## HARD STOP after Phase 4. Await explicit production authorization for Phase 5.
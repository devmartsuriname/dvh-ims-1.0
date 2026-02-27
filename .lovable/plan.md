# DVH-IMS v1.7.x — Phase 5: Production Promotion Package

## Overview

Create 4 governance documents for the production promotion of the security hardening migration. Documentation only — no execution, no source changes, no DB access.

## Deliverables

### 1. Production Migration Script

**File:** `docs/migrations/v1.7/PROD_SECURITY_HARDENING_ANON_RLS.sql`

Clean, transactional SQL matching the staging migration exactly:

- `BEGIN; ... COMMIT;` wrapper
- 6x `DROP POLICY IF EXISTS` statements (idempotent)
- Header comment block: version, context ID, date, purpose
- Labeled `PRODUCTION VERSION`

### 2. Production Rollback Script

**File:** `docs/migrations/v1.7/ROLLBACK_SECURITY_HARDENING_ANON_RLS.sql`

Recreates all 6 dropped policies with exact original USING/WITH CHECK clauses. Sourced directly from the existing rollback SQL in the staging restore point document. Includes:

- `BEGIN; ... COMMIT;` wrapper
- Header comment with rollback trigger criteria
- Safe to run independently (uses `CREATE POLICY` — will error if policies already exist, which is the correct safety behavior)

### 3. Production Validation Checklist

**File:** `docs/checklists/v1.7/PROD_VALIDATION_CHECKLIST_SECURITY_HARDENING.md`

Structured checklist with 4 sections:

- **A) Pre-Execution Checks** — staging PASS confirmed, restore point exists, no open HIGH findings, Edge Function health
- **B) Execution Verification** — `pg_policies` query to confirm removal, anon SELECT denial test, Edge Function lookup test
- **C) Post-Execution Security Scan** — run scan, compare with staging, confirm no new HIGH/CRITICAL
- **D) Rollback Criteria** — failure triggers (Edge Function errors, admin access denied, new HIGH findings), authorization (Delroy), time window (1 hour post-migration)

### 4. Production Restore Point Template

**File:** `docs/restore-points/v1.7/PROD_RESTORE_POINT_TEMPLATE_SECURITY_HARDENING.md`

Template with placeholders for:

- Execution timestamp, executor name
- Before/after snapshot references
- Security scan ID references
- Sign-off block (executor + authorizer)

## Files Created (4 total)


| File                                                                         | Purpose                     |
| ---------------------------------------------------------------------------- | --------------------------- |
| `docs/migrations/v1.7/PROD_SECURITY_HARDENING_ANON_RLS.sql`                  | Production migration script |
| `docs/migrations/v1.7/ROLLBACK_SECURITY_HARDENING_ANON_RLS.sql`              | Production rollback script  |
| `docs/checklists/v1.7/PROD_VALIDATION_CHECKLIST_SECURITY_HARDENING.md`       | Validation checklist        |
| `docs/restore-points/v1.7/PROD_RESTORE_POINT_TEMPLATE_SECURITY_HARDENING.md` | Restore point template      |


## NOTE — Production Promotion Deferred

Phase 5 documentation is accepted.

However:

We are NOT proceeding with Production Promotion at this stage.

The following applies:

1. Production migration will remain on HOLD.

2. No production SQL execution is authorized.

3. No production environment changes are permitted.

4. Production promotion will only be reconsidered after:

   - Remaining open tasks are completed

   - Wizard enhancement refinements are finalized

   - ApexCharts TS1540 issue is resolved

   - Full UI polish pass is completed

   - Additional security backlog items are reviewed

Immediate focus returns to:

- Remaining frontend enhancements

- Open technical warnings

- UX refinement backlog

- Stability improvements

Production phase is LOCKED until explicitly reopened.  
  
Constraints

- No SQL execution against any environment
- No source code changes
- No Edge Function modifications
- HARD STOP after documentation delivery
- Await explicit written production authorization
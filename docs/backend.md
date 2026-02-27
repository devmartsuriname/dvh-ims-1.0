# Backend Documentation — DVH-IMS

## Edge Functions

### Public-Facing Edge Functions

| Function | Purpose | Auth | Rate Limit |
|----------|---------|------|------------|
| `lookup-public-status` | Public status lookup for subsidy/housing cases | None (verify_jwt=false) | 20/hour per IP |
| `submit-bouwsubsidie-application` | Public bouwsubsidie application intake | None (verify_jwt=false) | 5/hour per IP |
| `submit-housing-registration` | Public housing registration intake | None (verify_jwt=false) | 5/hour per IP |

All 3 public Edge Functions use `SUPABASE_SERVICE_ROLE_KEY` to interact with the database, bypassing RLS entirely. This is intentional: citizens submit anonymously, and the Edge Function performs server-side validation (Zod), rate limiting, and secure token handling (SHA-256).

### Administrative Edge Functions

| Function | Purpose | Auth |
|----------|---------|------|
| `execute-allocation-run` | Execute housing allocation algorithm | JWT + role check |

Administrative Edge Functions enforce JWT validation and role-based allowlist checks. Security standards documented in this file serve as the mandatory baseline.

---

## Security Hardening Log

### v1.7.x — Remove Redundant Anonymous RLS Policies (2026-02-27)

**Rationale:** Since all public intake and status lookup flows use Edge Functions with `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS), the following anonymous RLS policies were redundant and only increased attack surface:

| Dropped Policy | Table | Type |
|----------------|-------|------|
| `anon_can_select_person_for_status` | `person` | SELECT |
| `anon_can_select_subsidy_case_status` | `subsidy_case` | SELECT |
| `anon_can_select_housing_registration_status` | `housing_registration` | SELECT |
| `anon_can_select_subsidy_status_history` | `subsidy_case_status_history` | SELECT |
| `anon_can_select_housing_status_history` | `housing_registration_status_history` | SELECT |
| `anon_can_insert_audit_event` | `audit_event` | INSERT |

**Retained:** `anon_can_select_public_status_access` on `public_status_access` — design-intentional, contains no PII.

**Restore Point:** `docs/restore-points/v1.7/RESTORE_POINT_V1.7_SECURITY_HARDENING_ANON_RLS.md`

### v1.5.x — Remove Redundant Anonymous INSERT Policies (prior)

12 anonymous INSERT policies removed. All public intake handled via Edge Functions with service role key.

---

## Audit Event Table

- **Immutable:** No UPDATE or DELETE allowed.
- **Append-only:** All writes are INSERT-only.
- **Preserved during resets:** Audit events are never cleared during data resets.
- **Access:** Authenticated roles (`audit`, `system_admin`, `minister`, `project_leader`) can SELECT. Role-specific INSERT policies enforce `actor_user_id = auth.uid()`.

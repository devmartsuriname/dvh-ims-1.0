# RLS Policy Matrix — VolksHuisvesting IMS

**Version:** 1.0
**Last Updated:** 2026-01-07
**Phase:** 8 — Security + Audit Readiness

---

## Security Model Overview

| Attribute | Value |
|-----------|-------|
| Security Phase | Phase 1 (Allowlist) |
| Allowlist Email | `info@devmart.sr` |
| RLS Enforcement | Mandatory on all tables |
| Default Access | Deny all unless explicitly permitted |

---

## RLS Policy Summary by Table

### Shared Core Tables (Person / Household)

| Table | RLS Enabled | Access Intent | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-------------|---------------|--------|--------|--------|--------|-------|
| `person` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Immutable delete |
| `household` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Immutable delete |
| `household_member` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Immutable delete |
| `contact_point` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Immutable delete |
| `address` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Immutable delete |

### Bouwsubsidie Module Tables

| Table | RLS Enabled | Access Intent | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-------------|---------------|--------|--------|--------|--------|-------|
| `subsidy_case` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Case lifecycle |
| `subsidy_case_status_history` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |
| `subsidy_document_requirement` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Reference data |
| `subsidy_document_upload` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Document records |
| `social_report` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Report lifecycle |
| `technical_report` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Report lifecycle |
| `generated_document` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |

### Woning Registratie & Allocatie Module Tables

| Table | RLS Enabled | Access Intent | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-------------|---------------|--------|--------|--------|--------|-------|
| `housing_registration` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Registration lifecycle |
| `housing_registration_status_history` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |
| `housing_urgency` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |
| `district_quota` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Quota management |
| `allocation_run` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Run lifecycle |
| `allocation_candidate` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |
| `allocation_decision` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |
| `assignment_record` | ✅ | Admin Only | Allowlist | Allowlist | ❌ | ❌ | Append-only |

### Public Access Tables

| Table | RLS Enabled | Access Intent | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-------------|---------------|--------|--------|--------|--------|-------|
| `public_status_access` | ✅ | Admin Only | Allowlist | Allowlist | Allowlist | ❌ | Token-based access |

### System Tables

| Table | RLS Enabled | Access Intent | SELECT | INSERT | UPDATE | DELETE | Notes |
|-------|-------------|---------------|--------|--------|--------|--------|-------|
| `app_user_profile` | ✅ | User Self | Own only | ❌ | Own only | ❌ | Auto-created by trigger |
| `audit_event` | ✅ | System Only | ❌ | Allowlist | ❌ | ❌ | Append-only, no read |

---

## Policy Expression Patterns

### Allowlist Pattern (Most Tables)

```sql
-- SELECT/UPDATE Using Expression
(((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text)

-- INSERT With Check Expression
(((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text)
```

### Alternate Allowlist Pattern (Newer Tables)

```sql
-- SELECT/UPDATE Using Expression
(( SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'::text)

-- INSERT With Check Expression
(( SELECT (auth.jwt() ->> 'email'::text)) = 'info@devmart.sr'::text)
```

### User Self Pattern (app_user_profile)

```sql
-- SELECT/UPDATE Using Expression
(user_id = auth.uid())
```

### Audit Event Pattern (Append-Only)

```sql
-- INSERT With Check Expression
((actor_user_id = auth.uid()) AND (((current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text) = 'info@devmart.sr'::text))
```

---

## Design Decisions (By Design)

| Decision | Rationale |
|----------|-----------|
| No DELETE policies | Immutable records for audit compliance |
| No UPDATE on history tables | Append-only pattern for status tracking |
| No SELECT on audit_event | Audit logs are write-only (admin read via dashboard) |
| Allowlist security model | Phase 1 simplification; RBAC deferred to later phase |

---

## Gaps and Deferred Items

| Gap | Status | Target Phase |
|-----|--------|--------------|
| Public wizard submission (anon INSERT) | Deferred | Phase 9+ |
| Role-based access control (RBAC) | Deferred | Phase 10+ |
| District-level access scoping | Deferred | Phase 10+ |
| Admin read access to audit_event | Deferred | Phase 10+ |

---

## Verification Checklist

- [x] All 23 tables have RLS enabled
- [x] All policies use allowlist pattern correctly
- [x] No accidental broad SELECT for anon
- [x] Append-only tables have no UPDATE/DELETE
- [x] audit_event has INSERT only (no SELECT)
- [x] app_user_profile uses user self pattern

---

## Change History

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Initial RLS matrix created | Phase 8 security audit |

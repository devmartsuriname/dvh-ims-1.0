# Security Hygiene Summary — Phase 12.1

**Date:** 2026-01-09  
**Phase:** 12.1 — Security Hygiene & Platform Constraint Documentation  
**Executor:** Lovable AI  
**Authorizer:** Delroy (DEVMART)

---

## 1. Current Supabase Configuration

| Property | Value |
|----------|-------|
| Project ID | `okfqnqsvsesdpkpvltpr` |
| Tier | **Free** |
| RLS | Enabled on all 24 tables |
| RBAC | Active (Phase 11) |
| Storage | Private bucket with RLS |

---

## 2. Linter Warning Classification

| # | Warning | Policy/Location | Classification | Justification |
|---|---------|-----------------|----------------|---------------|
| 1 | RLS Policy Always True | `anon_can_insert_person` | ACCEPTED RISK | Phase 9 public wizard submission. Anonymous INSERT required for citizen applications. No UPDATE/DELETE. Audited. |
| 2 | RLS Policy Always True | `anon_can_insert_household` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 3 | RLS Policy Always True | `anon_can_insert_household_member` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 4 | RLS Policy Always True | `anon_can_insert_address` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 5 | RLS Policy Always True | `anon_can_insert_contact_point` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 6 | RLS Policy Always True | `anon_can_insert_subsidy_case` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 7 | RLS Policy Always True | `anon_can_insert_subsidy_case_status_history` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 8 | RLS Policy Always True | `anon_can_insert_housing_registration` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 9 | RLS Policy Always True | `anon_can_insert_housing_registration_status_history` | ACCEPTED RISK | Phase 9 public wizard submission. |
| 10 | RLS Policy Always True | `anon_can_insert_public_status_access` | ACCEPTED RISK | Phase 9 public status lookup token generation. |
| 11 | Leaked Password Protection | Supabase Auth | DEFERRED | Free tier limitation. Required before Go-Live. |

---

## 3. Security Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Row Level Security | ENABLED | All 24 tables |
| RBAC (Role-Based Access) | ENABLED | 7 roles defined |
| District Scoping | ENABLED | RLS-enforced |
| Audit Logging | ENABLED | Append-only |
| Edge Function Authorization | ENABLED | RBAC integrated |
| Storage RLS | ENABLED | Role-based access |
| Leaked Password Protection | DEFERRED | Requires Pro tier |

---

## 4. Deferred Security Features

| Feature | Reason | Required Action | Timeline |
|---------|--------|-----------------|----------|
| Leaked Password Protection | Supabase Free tier limitation | Enable via Dashboard after upgrading to Pro | Pre–Go-Live prerequisite |

---

## 5. Password Security Confirmation

- Application does NOT store user passwords directly
- All authentication handled by Supabase Auth
- Password hashing managed by Supabase (bcrypt)
- No password exposure in application logs or audit trail

---

## 6. Summary

- **Total Linter Warnings:** 11
- **Accepted Risk (by design):** 10
- **Deferred (platform tier):** 1
- **Resolved:** 0 (none required resolution)

All security controls are functioning as designed. The single deferred feature (Leaked Password Protection) is a pre–Go-Live prerequisite to be enabled after Supabase Pro upgrade.

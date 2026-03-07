# Restore Point — Phase 7: Security Hardening

**Version:** v1.8.x
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Date:** 2026-03-07
**Phase:** 7 — Security Hardening

---

## Migrations Executed

| # | Migration | Severity | Status |
|---|-----------|----------|--------|
| A | Drop `anon_can_select_public_status_access` on `public_status_access` | HIGH | ✅ APPLIED |
| B | Replace `Users can update own profile` on `app_user_profile` (restrict `district_code` + `is_active`) | MEDIUM | ✅ APPLIED |
| C | Add `role_insert_housing_document_upload` on `housing_document_upload` | MEDIUM | ✅ APPLIED |

---

## Verification Results

### RLS Policy Verification
- `anon_can_select_public_status_access` — **REMOVED** ✅
- No remaining `anon_` policies on application tables ✅
- Only `anon_` policies remaining: storage bucket policies (`anon_can_read_citizen_documents`, `anon_can_upload_citizen_documents`) — design-intentional ✅
- `Users can update own profile` — **REPLACED** with column-restricted version ✅
- `role_insert_housing_document_upload` — **CREATED** ✅

### Edge Function Verification
- `lookup-public-status` — Returns structured error for invalid tokens ✅
- Service role key bypass confirmed — unaffected by policy removal ✅

### Additional Resolved Items
- Leaked password protection — **ENABLED** (Supabase Pro tier, Dashboard setting) ✅

---

## Rollback
- Script: `docs/migrations/v1.8/ROLLBACK_PHASE_7_SECURITY_HARDENING.sql`
- Each migration independently reversible

---

## End-of-Phase Report

### IMPLEMENTED
- Migration A: Dropped `anon_can_select_public_status_access` (HIGH severity resolved)
- Migration B: Restricted `app_user_profile` self-update to prevent `district_code`/`is_active` modification (MEDIUM severity resolved)
- Migration C: Added `role_insert_housing_document_upload` INSERT policy (MEDIUM severity resolved)

### PARTIAL
- None

### SKIPPED
- Leaked password protection migration — NOT NEEDED (already enabled via Dashboard)

### VERIFICATION
- RLS policy state verified via `pg_policies` query
- Confirmed zero `anon_` policies on application tables
- Edge Function `lookup-public-status` tested — responds correctly
- Storage bucket anon policies confirmed design-intentional

### RESTORE POINT
- `RESTORE_POINT_V1.8_PHASE_7_SECURITY_HARDENING.md`

### BLOCKERS / ERRORS
- NONE
- Build warning: pre-existing apexcharts type declaration issue (not related to Phase 7)

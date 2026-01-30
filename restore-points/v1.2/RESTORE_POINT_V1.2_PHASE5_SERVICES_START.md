# Restore Point: V1.2 Phase 5 — Services Module Decomposition

**Status:** ACTIVE  
**Created:** 2026-01-30  
**Phase:** 5 — Services Module Decomposition  
**Type:** Verification (No Implementation)

---

## Restore Point Context

This restore point marks the start of Phase 5 verification activities.

### Phase 5 Scope

- Service implementation inventory
- V1.2 documentation alignment verification
- Edge Function code review
- Service boundary validation
- Gap documentation

---

## Pre-Verification Baseline

### Edge Functions Verified

| Function | Service Mapping | RBAC | Audit | Status |
|----------|-----------------|------|-------|--------|
| execute-allocation-run | Registry Recording | ✅ system_admin, project_leader | ✅ CREATE event | Verified |
| generate-raadvoorstel | Raadvoorstel Generation | ✅ 4 roles | ✅ document_generated | Verified |
| get-document-download-url | Document Access | ✅ 6 roles | ✅ document_downloaded | Verified |
| submit-bouwsubsidie-application | Intake Service | N/A (public) | ✅ public_submission | Verified |
| submit-housing-registration | Intake Service | N/A (public) | ✅ public_submission | Verified |
| lookup-public-status | Status Lookup | N/A (public) | ✅ status_lookup | Verified |

### Audit Event Coverage

| Action | Entity Type | Count |
|--------|-------------|-------|
| status_lookup | public_status_access | 8 |
| public_submission | subsidy_case | 7 |
| public_submission | housing_registration | 6 |
| CREATE | allocation_run | 2 |
| status_lookup_failed | public_status_access | 2 |

---

## Files Reviewed

- `supabase/functions/execute-allocation-run/index.ts`
- `supabase/functions/generate-raadvoorstel/index.ts`
- `supabase/functions/get-document-download-url/index.ts`
- `supabase/functions/submit-bouwsubsidie-application/index.ts`
- `supabase/functions/submit-housing-registration/index.ts`
- `supabase/functions/lookup-public-status/index.ts`

---

## Verification Findings

### Service Alignment: CONFIRMED

All 6 Edge Functions align with V1.2 Services Module Decomposition:
- Intake Service: 2 public functions
- Decision/Review Services: Status handlers (client-side)
- Raadvoorstel Generation: Dedicated Edge Function
- Registry Recording: Allocation run Edge Function
- Audit Service: All functions emit audit events

### Module Boundaries: CONFIRMED

- Raadvoorstel Generation queries `subsidy_case` only (Bouwsubsidie-specific)
- Allocation Run queries `housing_registration` only (Housing-specific)
- No cross-module service violations detected

### RBAC Implementation: CONFIRMED

- All authenticated Edge Functions enforce role checks
- Public functions properly anonymize audit data (IP hash)

---

## Governance Compliance

| Rule | Status |
|------|--------|
| No schema changes | ✅ Compliant |
| No new Edge Functions | ✅ Compliant |
| No role modifications | ✅ Compliant |
| No /docs edits | ✅ Compliant |

---

**Restore Point ID:** V1.2-P5-START  
**Author:** DVH-IMS System  
**Verification Date:** 2026-01-30

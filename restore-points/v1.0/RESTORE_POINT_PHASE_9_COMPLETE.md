# RESTORE POINT: PHASE-9-COMPLETE

**Created:** 2026-01-08  
**Baseline:** PHASE-9-COMPLETE  
**Build Status:** Green  

---

## Phase 9 Summary

### Objective
Wire public wizard submissions to database via Edge Functions with secure token-based status tracking.

### Implementation Completed

#### Edge Functions (3 Created)
1. **submit-bouwsubsidie-application** — Processes Bouwsubsidie wizard submissions
2. **submit-housing-registration** — Processes Housing Registration wizard submissions  
3. **lookup-public-status** — Public status lookup with token validation

#### RLS Policies (11 Added)
- Anonymous INSERT on: `person`, `household`, `household_member`, `address`, `contact_point`, `subsidy_case`, `subsidy_case_status_history`, `housing_registration`, `housing_registration_status_history`, `public_status_access`, `audit_event`
- Anonymous SELECT on: `public_status_access` (for token-based lookup)

#### UI Wiring (3 Files Updated)
- `src/app/(public)/bouwsubsidie/apply/page.tsx` — Calls Edge Function
- `src/app/(public)/housing/register/page.tsx` — Calls Edge Function
- `src/app/(public)/status/page.tsx` — Calls Edge Function

---

## Verification Checklist

### Edge Function Verification
- [x] `submit-bouwsubsidie-application` deployed and operational
- [x] `submit-housing-registration` deployed and operational
- [x] `lookup-public-status` deployed and operational
- [x] Rate limiting implemented (5 submissions/hour, 20 lookups/hour)
- [x] Input validation via Zod schemas
- [x] Token hashing with SHA-256
- [x] IP anonymization in audit logs
- [x] Error sanitization (no internal details exposed)

### Database Verification
- [x] Person records created correctly
- [x] Household records created correctly
- [x] Household member records created correctly
- [x] Address records created correctly
- [x] Contact point records created correctly
- [x] Subsidy case records with initial status history
- [x] Housing registration records with initial status history
- [x] public_status_access records with hashed tokens
- [x] Reference number generation (BS-YYYY-NNNNNN, WR-YYYY-NNNNNN)

### RLS Verification
- [x] Anonymous INSERT policies active (11 policies)
- [x] Anonymous SELECT on public_status_access active
- [x] Admin access unchanged (allowlist model intact)
- [x] Expected linter warnings acknowledged (by design)

### UI Verification
- [x] Bouwsubsidie wizard calls Edge Function
- [x] Housing registration wizard calls Edge Function
- [x] Status tracker calls Edge Function
- [x] Error handling with user-friendly messages
- [x] No visual/layout changes (forbidden scope compliance)

### Audit Verification
- [x] Submissions logged to audit_event
- [x] Lookups logged to audit_event
- [x] IP addresses hashed (not plaintext)
- [x] Metadata includes reference numbers

---

## Security Notes

The 11 "RLS Policy Always True" warnings are **expected and by design**:
- Public citizen submissions require anonymous INSERT access
- Rate limiting enforced at Edge Function level
- Token validation provides access control for lookups
- All operations logged to append-only audit_event table

---

## Forbidden Scope Compliance

| Forbidden Item | Status |
|----------------|--------|
| Admin UI changes | ✓ NOT modified |
| Dashboard changes | ✓ NOT modified |
| Reporting / KPIs | ✓ NOT modified |
| RBAC or role logic | ✓ NOT modified |
| Wizard layout/UX/styling | ✓ NOT modified |
| New tables or schema | ✓ NOT created |
| Document generation | ✓ NOT implemented |

---

## Project State

### Database
- **Tables:** 23 tables (unchanged)
- **RLS Model:** Allowlist + Anonymous INSERT for public submissions
- **Phase 7 Test Data:** Intact

### Edge Functions
- **Deployed:** 4 functions total
  - `execute-allocation-run` (Phase 7)
  - `submit-bouwsubsidie-application` (Phase 9)
  - `submit-housing-registration` (Phase 9)
  - `lookup-public-status` (Phase 9)

### Public Wizards
- **Bouwsubsidie Wizard:** Functional (database submission)
- **Housing Registration Wizard:** Functional (database submission)
- **Status Tracker:** Functional (database lookup)

### Admin Dashboard
- **State:** Unchanged from Phase 8
- **Status:** Darkone demo charts intact

---

## Rollback Instructions

If Phase 9 issues are discovered:
1. Revert code changes to PHASE-9-START
2. Drop Phase 9 RLS policies:
   - `anon_can_insert_*` policies on all affected tables
   - `anon_can_select_public_status` on public_status_access
3. Delete Edge Functions:
   - `submit-bouwsubsidie-application`
   - `submit-housing-registration`
   - `lookup-public-status`
4. Verify Phase 8 baseline integrity

---

**Authority:** Delroy  
**Executor:** Lovable AI  
**Phase Status:** COMPLETE

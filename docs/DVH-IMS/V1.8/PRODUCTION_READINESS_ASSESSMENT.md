# DVH-IMS — Production Readiness Assessment + Safe Data Reset Plan

**Date:** 2026-03-10
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Status:** APPROVED — Awaiting execution authorization

---

## SECTION 1 — PRODUCTION READINESS VERDICT

### READY FOR INTAKE (Housing Registration)

| Area | Status | Notes |
|------|--------|-------|
| **Wizard (11 steps)** | READY | All steps render, i18n active, validation in place |
| **Edge Function** | READY | `submit-housing-registration` handles person upsert, ref number retry, rate limiting (5/hr), input validation, document linking, audit logging |
| **File Uploads** | READY | `citizen-uploads` bucket (public), uploads via Supabase Storage SDK |
| **Admin Intake View** | READY | Housing registrations visible at `/admin/housing-registrations/[id]` |
| **Status Tracker** | READY | `lookup-public-status` Edge Function + `/status` page |
| **Authentication** | READY | Staff login via Supabase Auth, RBAC via `user_roles` + RLS |
| **Database Schema** | STABLE | No pending migrations |
| **RLS Policies** | COMPLETE | All tables protected with role-based policies |

### Remaining Concerns (non-blocking for intake)

| Item | Severity | Notes |
|------|----------|-------|
| `citizen-uploads` bucket is **public** | LOW | Acceptable for MVP |
| No email confirmation to citizen | INFO | By design (V1.5 boundary) |
| No file size limit enforcement in frontend | LOW | Supabase Storage has default limits |
| No automated monitoring/alerting | MEDIUM | BetterStack/Sentry not configured |
| Edge Functions not manually verified with real admin JWT | MEDIUM | Not needed for intake |

---

## SECTION 2 — REMAINING LAUNCH CHECKLIST

Pre-launch:
- [ ] Execute data reset (Section 4)
- [ ] Clear `citizen-uploads` storage bucket
- [ ] Verify post-reset smoke (Section 5)
- [ ] Confirm staff accounts active
- [ ] Verify published URL accessible

Post-launch:
- [ ] Consider making `citizen-uploads` bucket private
- [ ] Set up external monitoring
- [ ] Add frontend file size validation

---

## SECTION 3 — SAFE DATA RESET PLAN

### Tables to CLEAR (24)

| Table | Action |
|-------|--------|
| generated_document | CLEAR |
| subsidy_document_upload | CLEAR |
| housing_document_upload | CLEAR |
| social_report | CLEAR |
| technical_report | CLEAR |
| subsidy_case_status_history | CLEAR |
| housing_registration_status_history | CLEAR |
| public_status_access | CLEAR |
| allocation_decision | CLEAR |
| allocation_candidate | CLEAR |
| assignment_record | CLEAR |
| housing_urgency | CLEAR |
| allocation_run | CLEAR |
| inspection_visit | CLEAR |
| case_assignment | CLEAR |
| admin_notification | CLEAR |
| housing_registration | CLEAR |
| subsidy_case | CLEAR |
| address | CLEAR |
| district_quota | CLEAR |
| household_member | CLEAR |
| household | CLEAR |
| contact_point | CLEAR |
| person | CLEAR |

### Tables to PRESERVE (5)

| Table | Reason |
|-------|--------|
| audit_event | Immutable legal record — NEVER DELETE |
| app_user_profile | System/staff accounts |
| user_roles | RBAC foundation |
| subsidy_document_requirement | Configuration data |
| housing_document_requirement | Configuration data |

---

## SECTION 4 — RESET SQL SCRIPT (FK-Safe Order)

```sql
-- DVH-IMS Pre-Launch Data Reset
-- Authorization: Delroy (2026-03-10)

BEGIN;

DELETE FROM generated_document;
DELETE FROM subsidy_document_upload;
DELETE FROM housing_document_upload;
DELETE FROM social_report;
DELETE FROM technical_report;
DELETE FROM subsidy_case_status_history;
DELETE FROM housing_registration_status_history;
DELETE FROM public_status_access;
DELETE FROM allocation_decision;
DELETE FROM allocation_candidate;
DELETE FROM assignment_record;
DELETE FROM housing_urgency;
DELETE FROM inspection_visit;
DELETE FROM case_assignment;
DELETE FROM admin_notification;
DELETE FROM allocation_run;
DELETE FROM housing_registration;
DELETE FROM subsidy_case;
DELETE FROM address;
DELETE FROM district_quota;
DELETE FROM household_member;
DELETE FROM household;
DELETE FROM contact_point;
DELETE FROM person;

COMMIT;
```

**Also:** Clear `citizen-uploads` bucket via Supabase Dashboard > Storage.

---

## SECTION 5 — POST-RESET VERIFICATION CHECKLIST

| Check | Expected |
|-------|----------|
| Dashboard KPIs | All show 0, no errors |
| Housing Registrations list | Empty state |
| Subsidy Cases list | Empty state |
| Persons list | Empty state |
| Households list | Empty state |
| Waiting List | Empty state |
| Audit Log | Still contains 117 entries |
| Staff accounts | All 13 profiles intact |
| User roles | All 12 role assignments intact |
| Housing wizard | Loads and accepts new submission |
| Status tracker | Returns "not found" for any query |
| Console | No new errors |
| `citizen-uploads` bucket | Empty |

---

## SECTION 6 — POST-RESET VERIFICATION RESULTS (2026-03-10)

### 1. Tables Cleared — ✅ ALL 25 CONFIRMED EMPTY

| Table | Count |
|-------|-------|
| generated_document | 0 |
| subsidy_document_upload | 0 |
| housing_document_upload | 0 |
| social_report | 0 |
| technical_report | 0 |
| subsidy_case_status_history | 0 |
| housing_registration_status_history | 0 |
| public_status_access | 0 |
| allocation_decision | 0 |
| allocation_candidate | 0 |
| assignment_record | 0 |
| housing_urgency | 0 |
| inspection_visit | 0 |
| case_assignment | 0 |
| admin_notification | 0 |
| allocation_run | 0 |
| subsidy_household_child | 0 |
| housing_registration | 0 |
| subsidy_case | 0 |
| address | 0 |
| district_quota | 0 |
| household_member | 0 |
| household | 0 |
| contact_point | 0 |
| person | 0 |

### 2. Preserved Tables — ✅ ALL INTACT

| Table | Count | Status |
|-------|-------|--------|
| audit_event | 117 | ✅ INTACT |
| app_user_profile | 13 | ✅ INTACT |
| user_roles | 12 | ✅ INTACT |
| subsidy_document_requirement | 23 | ✅ INTACT |
| housing_document_requirement | 6 | ✅ INTACT |

### 3. Storage Bucket — ✅ CLEARED

citizen-uploads bucket: Files deleted (confirmed via screenshot evidence).
Empty `bouwsubsidie` and `housing` folders remain (no files inside).

### 4. Console — ✅ NO ERRORS

No console errors detected.

---

## SECTION 7 — SIGN-OFF

| Role | Name | Date | Status |
|------|------|------|--------|
| Approved By | Delroy | 2026-03-10 | ✅ PLAN APPROVED |
| Executed By | Delroy (Manual SQL) | 2026-03-10 | ✅ COMPLETE |
| Verified By | Lovable (Post-Reset) | 2026-03-10 | ✅ VERIFIED |

---

## FINAL STATUS: ✅ SYSTEM READY FOR INTAKE

All operational tables empty. All preserved tables intact. Storage cleared. No errors.

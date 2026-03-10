# DVH-IMS — Production Readiness Assessment + Safe Data Reset Plan

---

## SECTION 1 — PRODUCTION READINESS VERDICT

### READY FOR INTAKE (Housing Registration)

The Housing Registration module is functionally complete for receiving citizen applications.


| Area                  | Status   | Notes                                                                                                                                          |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wizard (11 steps)** | READY    | All steps render, i18n active, validation in place                                                                                             |
| **Edge Function**     | READY    | `submit-housing-registration` handles person upsert, ref number retry, rate limiting (5/hr), input validation, document linking, audit logging |
| **File Uploads**      | READY    | `citizen-uploads` bucket (public), uploads via Supabase Storage SDK                                                                            |
| **Admin Intake View** | READY    | Housing registrations visible at `/admin/housing-registrations/[id]`                                                                           |
| **Status Tracker**    | READY    | `lookup-public-status` Edge Function + `/status` page                                                                                          |
| **Authentication**    | READY    | Staff login via Supabase Auth, RBAC via `user_roles` + RLS                                                                                     |
| **Database Schema**   | STABLE   | No pending migrations                                                                                                                          |
| **RLS Policies**      | COMPLETE | All tables protected with role-based policies                                                                                                  |


### Remaining Concerns (non-blocking for intake)


| Item                                                     | Severity | Notes                                                                                                                  |
| -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `citizen-uploads` bucket is **public**                   | LOW      | Files are accessible by URL if path is known. Acceptable for MVP; consider making private with signed URLs post-launch |
| No email confirmation to citizen                         | INFO     | By design (V1.5 boundary: no notifications)                                                                            |
| No file size limit enforcement in frontend               | LOW      | Supabase Storage has default limits; no explicit frontend validation beyond file type                                  |
| No automated monitoring/alerting                         | MEDIUM   | BetterStack/Sentry not configured for production alerts                                                                |
| Edge Functions not manually verified with real admin JWT | MEDIUM   | `generate-raadvoorstel`, `execute-allocation-run` pending — but these are NOT needed for intake                        |


---

## SECTION 2 — REMAINING LAUNCH CHECKLIST

Pre-launch (before tomorrow):

- Execute data reset (Section 3 below)
- Verify post-reset smoke (Section 5)
- Confirm staff accounts are active and can log in
- Verify the published URL is accessible

Post-launch (can be done after intake starts):

- Consider making `citizen-uploads` bucket private
- Set up external monitoring (BetterStack/Sentry)
- Add frontend file size validation (optional hardening)

---

## SECTION 3 — SAFE DATA RESET PLAN

### Tables to CLEAR (test/demo data)


| Table                                 | Current Count | Action |
| ------------------------------------- | ------------- | ------ |
| `generated_document`                  | 1             | CLEAR  |
| `subsidy_document_upload`             | 56            | CLEAR  |
| `housing_document_upload`             | 12            | CLEAR  |
| `social_report`                       | 0             | CLEAR  |
| `technical_report`                    | 0             | CLEAR  |
| `subsidy_case_status_history`         | 32            | CLEAR  |
| `housing_registration_status_history` | 7             | CLEAR  |
| `public_status_access`                | 20            | CLEAR  |
| `allocation_decision`                 | 0             | CLEAR  |
| `allocation_candidate`                | 0             | CLEAR  |
| `assignment_record`                   | 0             | CLEAR  |
| `housing_urgency`                     | 0             | CLEAR  |
| `allocation_run`                      | 1             | CLEAR  |
| `inspection_visit`                    | 0             | CLEAR  |
| `case_assignment`                     | 0             | CLEAR  |
| `admin_notification`                  | 7             | CLEAR  |
| `housing_registration`                | 7             | CLEAR  |
| `subsidy_case`                        | 14            | CLEAR  |
| `address`                             | 26            | CLEAR  |
| `household_member`                    | 26            | CLEAR  |
| `household`                           | 26            | CLEAR  |
| `contact_point`                       | 52            | CLEAR  |
| `person`                              | 25            | CLEAR  |
| `district_quota`                      | 0             | CLEAR  |


### Tables to PRESERVE


| Table                          | Current Count | Reason                                |
| ------------------------------ | ------------- | ------------------------------------- |
| `audit_event`                  | 117           | Immutable legal record — NEVER DELETE |
| `app_user_profile`             | 13            | System/staff accounts                 |
| `user_roles`                   | 12            | RBAC foundation                       |
| `subsidy_document_requirement` | config        | Configuration data                    |
| `housing_document_requirement` | config        | Configuration data                    |


---

## SECTION 4 — RESET EXECUTION ORDER (FK-Safe)

```text
 1. generated_document
 2. subsidy_document_upload
 3. housing_document_upload
 4. social_report
 5. technical_report
 6. subsidy_case_status_history
 7. housing_registration_status_history
 8. public_status_access
 9. allocation_decision
10. allocation_candidate
11. assignment_record
12. housing_urgency
13. inspection_visit
14. case_assignment
15. admin_notification
16. allocation_run
17. housing_registration
18. subsidy_case
19. address
20. district_quota
21. household_member
22. household
23. contact_point
24. person
```

### SQL Script (for execution via Supabase SQL Editor with service role)

```sql
-- DVH-IMS Pre-Launch Data Reset
-- Authorization: Delroy (pending approval)
-- Date: 2026-03-10

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

**Also clear uploaded files from the `citizen-uploads` storage bucket** via Supabase Dashboard > Storage > citizen-uploads > select all > delete.

---

## SECTION 5 — POST-RESET VERIFICATION CHECKLIST


| Check                      | Expected                          |
| -------------------------- | --------------------------------- |
| Dashboard KPIs             | All show 0, no errors             |
| Housing Registrations list | Empty state                       |
| Subsidy Cases list         | Empty state                       |
| Persons list               | Empty state                       |
| Households list            | Empty state                       |
| Waiting List               | Empty state                       |
| Audit Log                  | Still contains 117 entries        |
| Staff accounts             | All 13 profiles intact            |
| User roles                 | All 12 role assignments intact    |
| Housing wizard             | Loads and accepts new submission  |
| Status tracker             | Returns "not found" for any query |
| Console                    | No new errors                     |
| `citizen-uploads` bucket   | Empty                             |


---

**NOTE — Storage Reset**

Before launch, also clear all files from the

Supabase Storage bucket:

citizen-uploads

This prevents test documents from being linked

to new real citizen registrations.

Verification:

Bucket must be empty before the first live submission.  
  
**SECTION 6 — FINAL SUMMARY**

1. **Production Readiness:** READY FOR INTAKE — Housing Registration wizard, Edge Function, admin views, and status tracker are all functional
2. **Remaining Checklist:** Data reset + post-reset smoke test required before launch
3. **Data Reset Plan:** 24 tables to clear, 5 tables preserved (audit, users, roles, config)
4. **Execution Order:** FK-safe 24-step deletion sequence provided
5. **Post-Reset Verification:** 14-point checklist

**Awaiting your authorization to execute the data reset.**
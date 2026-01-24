# RESTORE POINT: PRE V1.2 DEMO DATA RESET

**Created:** 2026-01-24  
**Reason:** Clean demo/test data before DVH-IMS V1.2 implementation  
**Authorization:** Delroy (Project Owner) — Explicit instruction received  
**Status:** READY FOR EXECUTION

---

## 1. Backup / Snapshot Confirmation

| Item | Status |
|------|--------|
| Supabase Project | okfqnqsvsesdpkpvltpr |
| Backup Method | Manual snapshot required (Free tier - no automated PITR) |
| Backup Recommendation | Use Supabase Dashboard > Settings > Database > Download backup |

**⚠️ IMPORTANT:** Before executing data reset, manually create a database backup via Supabase Dashboard.

---

## 2. Pre-Reset Record Counts

### Tables to be CLEARED (Demo/Test Data)

| Table | Pre-Reset Count |
|-------|----------------:|
| person | 39 |
| household | 38 |
| household_member | 13 |
| contact_point | 26 |
| address | 13 |
| subsidy_case | 57 |
| subsidy_case_status_history | 8 |
| housing_registration | 45 |
| housing_registration_status_history | 6 |
| allocation_run | 2 |
| allocation_candidate | 0 |
| allocation_decision | 0 |
| assignment_record | 0 |
| housing_urgency | 0 |
| public_status_access | 13 |
| social_report | 1 |
| technical_report | 1 |
| generated_document | 0 |
| subsidy_document_upload | 0 |
| district_quota | 0 |

### Tables to be PRESERVED (System Critical)

| Table | Count | Reason |
|-------|------:|--------|
| audit_event | 29 | Immutable audit log — NEVER DELETE |
| user_roles | 1 | RBAC foundation |
| app_user_profile | 7 | System/admin accounts |
| subsidy_document_requirement | 8 | Configuration data |

---

## 3. FK-Safe Delete Order

Deletions must occur in this exact order to avoid FK violations:

```
1.  generated_document
2.  subsidy_document_upload
3.  social_report
4.  technical_report
5.  subsidy_case_status_history
6.  housing_registration_status_history
7.  public_status_access
8.  allocation_decision
9.  allocation_candidate
10. assignment_record
11. housing_urgency
12. allocation_run
13. housing_registration
14. subsidy_case
15. address
16. household_member
17. household
18. contact_point
19. person
```

---

## 4. SQL Execution Script

**Run in Supabase SQL Editor with service role:**

```sql
-- DVH-IMS Demo Data Reset Script
-- Authorization: Delroy (2026-01-24)
-- WARNING: This deletes ALL demo/test operational data

BEGIN;

-- Step 1: Clear document/report tables
DELETE FROM generated_document;
DELETE FROM subsidy_document_upload;
DELETE FROM social_report;
DELETE FROM technical_report;

-- Step 2: Clear status history tables
DELETE FROM subsidy_case_status_history;
DELETE FROM housing_registration_status_history;

-- Step 3: Clear public access tokens
DELETE FROM public_status_access;

-- Step 4: Clear allocation tables
DELETE FROM allocation_decision;
DELETE FROM allocation_candidate;
DELETE FROM assignment_record;
DELETE FROM housing_urgency;
DELETE FROM allocation_run;

-- Step 5: Clear main case/registration tables
DELETE FROM housing_registration;
DELETE FROM subsidy_case;

-- Step 6: Clear address/household/person
DELETE FROM address;
DELETE FROM household_member;
DELETE FROM household;
DELETE FROM contact_point;
DELETE FROM person;

-- Verification (run after COMMIT to confirm)
-- SELECT 'person' as t, COUNT(*) FROM person
-- UNION ALL SELECT 'subsidy_case', COUNT(*) FROM subsidy_case
-- UNION ALL SELECT 'housing_registration', COUNT(*) FROM housing_registration;

COMMIT;
```

---

## 5. Post-Reset Verification Checklist

| Check | Expected Result |
|-------|-----------------|
| Dashboard KPIs | Show 0, no errors |
| Persons list | Empty state displayed |
| Households list | Empty state displayed |
| Subsidy Cases list | Empty state displayed |
| Housing Registrations list | Empty state displayed |
| Waiting List | Empty state displayed |
| Audit Log | Still contains 29 entries |
| Console | No errors |

---

## 6. Recovery Procedure

If reset causes issues:

1. Restore from Supabase backup created before reset
2. Or: Re-seed demo data using original seed scripts (if available)

---

## 7. Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Authorized By | Delroy | 2026-01-24 | __________ |
| Executed By | __________ | __________ | __________ |
| Verified By | __________ | __________ | __________ |

---

**Status:** Awaiting manual execution via Supabase SQL Editor

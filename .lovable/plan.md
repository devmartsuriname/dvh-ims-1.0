

# DVH-IMS — Pre-Launch QA Cleanup Plan

## Current State

3 QA test records exist across the system:

| Record | Person | Household | Source |
|--------|--------|-----------|--------|
| WR-2026-000001 | daabdf62 (housing QA) | fbf46c68 | Phase 10 Housing QA |
| BS-2026-000001 | 9f015acf (subsidy QA) | e82f3788 | Phase 10B Subsidy QA |
| — (validation test) | c7267dda ("Over Limit") | 2e5b06df | Phase 10B validation test |

Related records to delete:
- 1 housing_registration_status_history
- 1 subsidy_case_status_history  
- 3 subsidy_document_upload
- 2 subsidy_household_child
- 2 public_status_access
- 6 contact_point
- 3 address
- 3 household_member
- 3 household
- 3 person

## Execution — FK-Safe DELETE Script

You must execute this in the **Supabase SQL Editor** (I cannot run DELETE operations):

```sql
BEGIN;

-- Child records first
DELETE FROM subsidy_document_upload WHERE case_id = '037377e2-3d18-4dd9-8cf6-7aa3c2ba1eae';
DELETE FROM subsidy_household_child WHERE subsidy_case_id = '037377e2-3d18-4dd9-8cf6-7aa3c2ba1eae';
DELETE FROM subsidy_case_status_history WHERE case_id = '037377e2-3d18-4dd9-8cf6-7aa3c2ba1eae';
DELETE FROM housing_registration_status_history WHERE registration_id = '4954f7d5-32da-48e9-9395-e43eae4d946b';
DELETE FROM public_status_access WHERE reference_number IN ('WR-2026-000001', 'BS-2026-000001');

-- Parent case records
DELETE FROM housing_registration WHERE id = '4954f7d5-32da-48e9-9395-e43eae4d946b';
DELETE FROM subsidy_case WHERE id = '037377e2-3d18-4dd9-8cf6-7aa3c2ba1eae';

-- Identity records (all 3 QA persons)
DELETE FROM address WHERE household_id IN ('fbf46c68-032c-4464-8c97-5db1758fa82a', 'e82f3788-c59d-4162-bd86-8b7a32e4a02c', '2e5b06df-0ae7-48f2-9d7a-8d07d41e4fe4');
DELETE FROM household_member WHERE household_id IN ('fbf46c68-032c-4464-8c97-5db1758fa82a', 'e82f3788-c59d-4162-bd86-8b7a32e4a02c', '2e5b06df-0ae7-48f2-9d7a-8d07d41e4fe4');
DELETE FROM household WHERE id IN ('fbf46c68-032c-4464-8c97-5db1758fa82a', 'e82f3788-c59d-4162-bd86-8b7a32e4a02c', '2e5b06df-0ae7-48f2-9d7a-8d07d41e4fe4');
DELETE FROM contact_point WHERE person_id IN ('daabdf62-d9ed-41c3-88b2-18da795c4729', '9f015acf-10c0-4627-9dd3-eec0ece10bfc', 'c7267dda-87c5-4ce0-b6bf-939e374a8e3f');
DELETE FROM person WHERE id IN ('daabdf62-d9ed-41c3-88b2-18da795c4729', '9f015acf-10c0-4627-9dd3-eec0ece10bfc', 'c7267dda-87c5-4ce0-b6bf-939e374a8e3f');

COMMIT;
```

## Post-Cleanup Verification

After you execute the script, confirm here and I will verify:
1. All operational tables return 0 rows
2. Preserved tables (audit_event, app_user_profile, user_roles, document requirements) remain intact
3. citizen-uploads bucket status
4. Console clean

## Preserved Tables (NOT touched)

- audit_event — immutable legal record
- app_user_profile — 13 staff accounts
- user_roles — 12 role assignments
- subsidy_document_requirement — config
- housing_document_requirement — config


# Phase 5C: Public Wizard Document Upload — Implementation Report

**Phase:** 5C  
**Date:** 2026-02-01  
**Priority:** P0 (Blocking)  
**Scope:** Document Upload for Housing Registration (Woningregistratie) Public Wizard

---

## Executive Summary

Phase 5C implements mandatory document upload functionality for the Housing Registration public wizard. Citizens must now upload required documents (ID copy, income proof, residence proof) before submitting their registration.

---

## Implementation Status

### ✅ IMPLEMENTED

| Component | Description | Status |
|-----------|-------------|--------|
| Database: `housing_document_requirement` | Table for document requirements | ✅ Created |
| Database: `housing_document_upload` | Table for uploaded document records | ✅ Created |
| RLS Policies | Anon insert, staff select by district | ✅ Applied |
| Document Seed Data | 6 document types (3 mandatory, 3 optional) | ✅ Seeded |
| `types.ts` | Added `DocumentUpload` interface | ✅ Updated |
| `constants.ts` | Added `REQUIRED_DOCUMENTS` array | ✅ Updated |
| `Step8Documents.tsx` | New document upload step | ✅ Created |
| `Step9Review.tsx` | Renamed from Step8Review | ✅ Renamed |
| `Step10Receipt.tsx` | Renamed from Step9Receipt | ✅ Renamed |
| `page.tsx` | 11-step wizard flow | ✅ Updated |
| `nl.json` | Dutch translations for step8documents | ✅ Added |
| `en.json` | English translations for step8documents | ✅ Added |
| Edge Function | Document handling in submit-housing-registration | ✅ Updated |
| Audit Logging | Document count in submission audit | ✅ Implemented |

### ⚠️ PARTIAL

| Component | Description | Status |
|-----------|-------------|--------|
| None | All planned components implemented | N/A |

### ❌ SKIPPED

| Component | Reason |
|-----------|--------|
| Bouwsubsidie multi-file per doc type | Marked as optional in plan; existing single-file works correctly |
| Admin document visibility UI | Already implemented (reads from subsidy_document_upload pattern) |

---

## Technical Details

### Database Schema

**housing_document_requirement**
```sql
- id (uuid, PK)
- document_code (text, unique)
- document_name (text)
- description (text)
- is_mandatory (boolean)
- created_at (timestamptz)
```

**housing_document_upload**
```sql
- id (uuid, PK)
- registration_id (uuid, FK → housing_registration)
- requirement_id (uuid, FK → housing_document_requirement)
- file_path (text)
- file_name (text)
- uploaded_by (uuid, nullable)
- uploaded_at (timestamptz)
- is_verified (boolean)
- verified_by (uuid, nullable)
- verified_at (timestamptz, nullable)
```

### Document Requirements (Seeded)

| Code | Name | Mandatory |
|------|------|-----------|
| ID_COPY | Copy of ID | ✅ Yes |
| INCOME_PROOF | Proof of Income | ✅ Yes |
| RESIDENCE_PROOF | Proof of Current Residence | ✅ Yes |
| FAMILY_COMPOSITION | Family Composition | ❌ No |
| MEDICAL_CERT | Medical Certificate | ❌ No |
| EMERGENCY_PROOF | Emergency Documentation | ❌ No |

### File Validation

- **Types:** PDF, JPG, PNG only
- **Size:** Maximum 10MB per file
- **Storage:** `citizen-uploads` bucket
- **Path Pattern:** `housing/{session_id}/{doc_code}_{timestamp}.{ext}`

### Wizard Step Flow (Updated)

| Step | Component | Purpose |
|------|-----------|---------|
| 0 | Step0Introduction | Welcome and requirements |
| 1 | Step1PersonalInfo | ID, name, DOB, gender |
| 2 | Step2ContactInfo | Phone, email |
| 3 | Step3LivingSituation | Address, housing type |
| 4 | Step4HousingPreference | Interest type, preferred district |
| 5 | Step5Reason | Application reason |
| 6 | Step6Income | Income source and amounts |
| 7 | Step7Urgency | Disability, emergency flags |
| 8 | **Step8Documents** | **NEW: Document upload** |
| 9 | Step9Review | Review and declaration |
| 10 | Step10Receipt | Confirmation and token |

### Edge Function Changes

- Added `DocumentUploadInput` interface
- Added documents array validation (mandatory check)
- Added document upload record creation
- Added document count to audit metadata

---

## RLS Security Model

**housing_document_requirement**
- `SELECT`: anon + authenticated (public read for wizard)
- `INSERT/UPDATE`: system_admin, project_leader only

**housing_document_upload**
- `INSERT`: anon (public wizard submission)
- `SELECT`: national roles + district-scoped frontdesk_housing/admin_staff
- `UPDATE`: national roles + district-scoped staff (for verification)

---

## Files Changed

### New Files
- `src/app/(public)/housing/register/steps/Step8Documents.tsx`
- `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_START.md`
- `phases/DVH-IMS-V1.3/PHASE-5C/PHASE-5C-DOCUMENT-UPLOAD-REPORT.md` (this file)

### Modified Files
- `src/app/(public)/housing/register/types.ts`
- `src/app/(public)/housing/register/constants.ts`
- `src/app/(public)/housing/register/page.tsx`
- `src/app/(public)/housing/register/steps/Step9Review.tsx` (renamed from Step8Review)
- `src/app/(public)/housing/register/steps/Step10Receipt.tsx` (renamed from Step9Receipt)
- `src/i18n/locales/nl.json`
- `src/i18n/locales/en.json`
- `supabase/functions/submit-housing-registration/index.ts`

---

## Verification Checklist

| Test | Expected | Status |
|------|----------|--------|
| Housing wizard shows document step after Step 7 | Documents step visible at step 8 | ⏳ Pending |
| Mandatory documents block progression | Cannot proceed without 3 uploads | ⏳ Pending |
| Files upload to citizen-uploads bucket | Storage success | ⏳ Pending |
| Edge Function creates document records | Database entries created | ⏳ Pending |
| Admin can view uploaded documents | Documents visible in admin | ⏳ Pending |
| Bouwsubsidie wizard unchanged | No regression | ⏳ Pending |
| NL translations work on new step | Dutch text displays | ⏳ Pending |
| EN translations work on new step | English text displays | ⏳ Pending |

---

## Constraints Respected

| Constraint | Status |
|------------|--------|
| No public account creation | ✅ Respected |
| No role changes | ✅ Respected |
| No workflow state machine changes | ✅ Respected |
| Admin UI remains EN-only | ✅ Respected |
| Bouwsubsidie unchanged | ✅ Respected |

---

## Restore Points

| Restore Point | File |
|---------------|------|
| Pre-implementation | `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_START.md` |
| Post-implementation | `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_COMPLETE.md` |

---

## Notes

1. **RLS Warnings:** The linter flags `WITH CHECK (true)` policies for anon INSERT. This is intentional for public wizard submissions (same pattern as Bouwsubsidie).

2. **Session Storage:** The wizard uses `sessionStorage.setItem('housing_session_id')` to organize uploads before the registration ID exists. This is cleared on successful submission.

3. **Document Verification:** The `is_verified` flag on uploads is set to `false` by default. Staff verification workflow is deferred to a future phase.

---

**Phase 5C Implementation Complete — Awaiting Verification**

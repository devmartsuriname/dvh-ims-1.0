# Restore Point: V1.3 Phase 5C — Complete

**Created:** 2026-02-01  
**Phase:** 5C — Public Wizard Document Upload  
**Type:** Post-Implementation Restore Point  
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Purpose

This restore point marks the system state AFTER implementing Phase 5C (Document Upload for Housing Registration wizard).

## Implementation Summary

### Database Changes
- ✅ Created `housing_document_requirement` table
- ✅ Created `housing_document_upload` table
- ✅ Applied RLS policies (anon insert, staff select)
- ✅ Created performance indexes
- ✅ Seeded 6 document requirements (3 mandatory, 3 optional)

### Frontend Changes
- ✅ Added `DocumentUpload` interface to types.ts
- ✅ Added `REQUIRED_DOCUMENTS` to constants.ts
- ✅ Created `Step8Documents.tsx` (document upload step)
- ✅ Renamed `Step8Review.tsx` → `Step9Review.tsx`
- ✅ Renamed `Step9Receipt.tsx` → `Step10Receipt.tsx`
- ✅ Updated `page.tsx` for 11-step wizard flow
- ✅ Added NL translations for housing.step8documents
- ✅ Added EN translations for housing.step8documents

### Edge Function Changes
- ✅ Updated `submit-housing-registration` to accept documents array
- ✅ Added document upload record creation
- ✅ Added document count to audit metadata

## Files After Changes

### New Files
- `src/app/(public)/housing/register/steps/Step8Documents.tsx`
- `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_START.md`
- `phases/DVH-IMS-V1.3/PHASE-5C/PHASE-5C-DOCUMENT-UPLOAD-REPORT.md`
- `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_COMPLETE.md` (this file)

### Modified Files
- `src/app/(public)/housing/register/types.ts` — Added DocumentUpload interface
- `src/app/(public)/housing/register/constants.ts` — Added REQUIRED_DOCUMENTS, updated WIZARD_STEPS
- `src/app/(public)/housing/register/page.tsx` — 11-step flow with Step8Documents
- `src/app/(public)/housing/register/steps/Step9Review.tsx` — Renumbered from Step8
- `src/app/(public)/housing/register/steps/Step10Receipt.tsx` — Renumbered from Step9
- `src/i18n/locales/nl.json` — Added housing.step8documents section
- `src/i18n/locales/en.json` — Added housing.step8documents section
- `supabase/functions/submit-housing-registration/index.ts` — Document handling

## Database State

### New Tables
- `housing_document_requirement` — 6 rows (seeded)
- `housing_document_upload` — 0 rows (ready for submissions)

### RLS Policies Applied
- `anon_can_select_housing_document_requirement`
- `authenticated_can_select_housing_document_requirement`
- `role_insert_housing_document_requirement`
- `role_update_housing_document_requirement`
- `anon_can_insert_housing_document_upload`
- `role_select_housing_document_upload`
- `role_update_housing_document_upload`

## Rollback Instructions

To revert Phase 5C:

### 1. Database Rollback
```sql
-- Drop document upload table first (has FK)
DROP TABLE IF EXISTS public.housing_document_upload;
DROP TABLE IF EXISTS public.housing_document_requirement;
```

### 2. Frontend Rollback
- Delete `Step8Documents.tsx`
- Rename `Step9Review.tsx` → `Step8Review.tsx`
- Rename `Step10Receipt.tsx` → `Step9Receipt.tsx`
- Revert `page.tsx` to 10-step flow
- Revert `types.ts` (remove DocumentUpload interface)
- Revert `constants.ts` (remove REQUIRED_DOCUMENTS, revert WIZARD_STEPS)
- Remove `housing.step8documents` section from nl.json and en.json

### 3. Edge Function Rollback
- Revert `submit-housing-registration/index.ts` to remove document handling

---

## Verification Status

| Test | Status |
|------|--------|
| Document step visible in wizard | ⏳ Pending manual test |
| Mandatory enforcement working | ⏳ Pending manual test |
| File upload to storage | ⏳ Pending manual test |
| Edge function document linking | ⏳ Pending manual test |
| NL/EN translations working | ⏳ Pending manual test |

---

**STATUS:** Post-Implementation Restore Point Created

**NEXT ACTION:** Await verification and authorization for next phase

# Restore Point: V1.3 Phase 5C — Start

**Created:** 2026-02-01  
**Phase:** 5C — Public Wizard Document Upload  
**Type:** Pre-Implementation Restore Point  
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Purpose

This restore point marks the system state BEFORE implementing Phase 5C (Document Upload for Housing Registration wizard).

## Current State Summary

### Bouwsubsidie Wizard
- ✅ Document upload implemented (Step6Documents.tsx)
- ✅ Mandatory enforcement working
- ✅ File validation (PDF, JPG, PNG, 10MB)
- ✅ Storage upload to citizen-uploads bucket
- ✅ Edge function creates subsidy_document_upload records
- ✅ Admin visibility implemented

### Housing Registration Wizard
- ❌ No document upload step exists
- ❌ No housing_document_requirement table
- ❌ No housing_document_upload table
- ❌ Edge function does not handle documents
- Current steps: 0-9 (Introduction → Receipt)

### Database State
- `subsidy_document_requirement` table exists
- `subsidy_document_upload` table exists
- No housing document tables exist

### Storage
- `citizen-uploads` bucket exists (public: true)
- Bouwsubsidie uploads stored at: `bouwsubsidie/{session_id}/{doc_code}_{timestamp}.{ext}`

## Files Before Changes

### Housing Wizard Files
- `src/app/(public)/housing/register/page.tsx` — 10 steps (0-9)
- `src/app/(public)/housing/register/types.ts` — No document types
- `src/app/(public)/housing/register/constants.ts` — 10 wizard steps
- `src/app/(public)/housing/register/steps/Step8Review.tsx` — Review step
- `src/app/(public)/housing/register/steps/Step9Receipt.tsx` — Receipt step

### Edge Function
- `supabase/functions/submit-housing-registration/index.ts` — No document handling

### Translation Files
- `src/i18n/locales/nl.json` — No housing.step8 document keys
- `src/i18n/locales/en.json` — No housing.step8 document keys

## Implementation Plan

Phase 5C will:
1. Create `housing_document_requirement` table
2. Create `housing_document_upload` table with RLS
3. Add document upload step (Step8Documents.tsx)
4. Renumber Step8Review → Step9Review
5. Renumber Step9Receipt → Step10Receipt
6. Update wizard page.tsx for new step flow
7. Update types.ts and constants.ts
8. Add NL/EN translations for document step
9. Update Edge Function to handle documents

## Rollback Instructions

To restore to this point:
1. Remove housing document tables from database
2. Delete Step8Documents.tsx
3. Rename Step9Review.tsx → Step8Review.tsx
4. Rename Step10Receipt.tsx → Step9Receipt.tsx
5. Revert page.tsx to 10-step flow
6. Revert types.ts (remove DocumentUpload)
7. Revert constants.ts (remove REQUIRED_DOCUMENTS)
8. Remove housing.step8documents translations
9. Revert Edge Function (remove document handling)

---

**STATUS:** Pre-Implementation Restore Point Created

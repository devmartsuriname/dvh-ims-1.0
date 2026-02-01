# RESTORE POINT: V1.3 Phase 5A COMPLETE

**Created:** 2026-02-01
**Phase:** V1.3 Phase 5A — Public Wizard Hardening
**Status:** COMPLETE

---

## Post-Phase State

### i18n Framework
- **Status:** INSTALLED
- **react-i18next:** v16.5.4
- **i18next:** v25.8.0
- **i18next-browser-languagedetector:** v8.2.0
- **Translation files:** nl.json (224 lines), en.json (224 lines)
- **Language switcher:** LanguageSwitcher.tsx in PublicHeader

### Document Upload
- **Step6Documents.tsx:** Full file upload with react-dropzone
- **Storage bucket:** citizen-uploads (public, anon upload)
- **RLS policies:** anon INSERT/SELECT on storage.objects, anon INSERT on subsidy_document_upload
- **Edge Function:** Updated to link documents to case

### Wizard Components
- **Language:** NL default, EN via switcher
- **All step files:** Using useTranslation() with t() function
- **WizardStep.tsx:** Translated labels
- **PublicHeader.tsx:** Translated + LanguageSwitcher

---

## Files Created in Phase 5A

| File | Purpose |
|------|---------|
| src/i18n/config.ts | i18n framework configuration |
| src/i18n/locales/nl.json | Dutch translations (224 lines) |
| src/i18n/locales/en.json | English translations (224 lines) |
| src/components/public/LanguageSwitcher.tsx | Language toggle dropdown |

---

## Files Modified in Phase 5A

| File | Changes |
|------|---------|
| src/main.tsx | Added i18n config import |
| src/app/(public)/bouwsubsidie/apply/page.tsx | Added useTranslation |
| src/app/(public)/bouwsubsidie/apply/types.ts | Added DocumentUpload interface |
| src/app/(public)/bouwsubsidie/apply/constants.ts | Updated document structure |
| src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx | Localized |
| src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx | Localized |
| src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx | Localized |
| src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx | Localized |
| src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx | Localized |
| src/app/(public)/bouwsubsidie/apply/steps/Step5Context.tsx | Localized |
| src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx | Rebuilt with file upload |
| src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx | Localized + document display |
| src/app/(public)/bouwsubsidie/apply/steps/Step8Receipt.tsx | Localized |
| src/components/public/WizardStep.tsx | Localized |
| src/components/public/PublicHeader.tsx | Localized + LanguageSwitcher |
| supabase/functions/submit-bouwsubsidie-application/index.ts | Document linking |

---

## Database State

### Storage Buckets
- `generated-documents` — EXISTS (private, admin only)
- `citizen-uploads` — EXISTS (public, anon upload enabled)

### RLS Policies Added
- `anon_can_upload_citizen_documents` — storage.objects INSERT
- `anon_can_read_citizen_documents` — storage.objects SELECT
- `staff_can_read_citizen_documents` — storage.objects SELECT
- `anon_can_insert_document_upload` — subsidy_document_upload INSERT

---

## Scope Verification

| Item | Status |
|------|--------|
| Housing wizard unchanged | ☑ VERIFIED |
| Admin EN-only | ☑ VERIFIED |
| No public accounts | ☑ VERIFIED |
| No auth changes | ☑ VERIFIED |
| No role changes | ☑ VERIFIED |

---

## Rollback Instructions

If Phase 5A must be reverted:

1. **Database:**
```sql
DELETE FROM storage.buckets WHERE id = 'citizen-uploads';
DROP POLICY IF EXISTS "anon_can_upload_citizen_documents" ON storage.objects;
DROP POLICY IF EXISTS "anon_can_read_citizen_documents" ON storage.objects;
DROP POLICY IF EXISTS "staff_can_read_citizen_documents" ON storage.objects;
DROP POLICY IF EXISTS "anon_can_insert_document_upload" ON public.subsidy_document_upload;
```

2. **Application:**
- Remove i18n packages: `react-i18next`, `i18next`, `i18next-browser-languagedetector`
- Restore files from `RESTORE_POINT_V1.3_PHASE5A_START.md` state
- Remove `src/i18n/` directory
- Remove `LanguageSwitcher.tsx`

---

**Status:** PHASE 5A COMPLETE — RESTORE POINT CAPTURED

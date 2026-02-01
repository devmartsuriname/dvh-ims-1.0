# RESTORE POINT: V1.3 Phase 5A START

**Created:** 2026-02-01
**Phase:** V1.3 Phase 5A — Public Wizard Hardening
**Authorization:** P0 Blocking

---

## Pre-Phase State

### i18n Framework
- **Status:** NOT INSTALLED
- **react-i18next:** Not in package.json
- **Translation files:** Do not exist
- **Language switcher:** Does not exist

### Document Upload
- **Step6Documents.tsx:** Declaration-only (toggle checkbox)
- **Storage bucket:** citizen-uploads does not exist
- **RLS policies:** No anon upload policies exist
- **react-dropzone:** Installed but not used in wizard

### Wizard Components
- **Language:** English-only (hardcoded)
- **All step files:** Using English strings directly
- **WizardStep.tsx:** English labels
- **PublicHeader.tsx:** English only

---

## Files State Before Phase 5A

| File | State |
|------|-------|
| src/i18n/config.ts | Does not exist |
| src/i18n/locales/nl.json | Does not exist |
| src/i18n/locales/en.json | Does not exist |
| src/components/public/LanguageSwitcher.tsx | Does not exist |
| src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx | Declaration toggle only |

---

## Database State

### Storage Buckets
- `generated-documents` — EXISTS (private, admin only)
- `citizen-uploads` — DOES NOT EXIST

### RLS Policies on subsidy_document_upload
- No anonymous insert policy exists

---

## Scope for Phase 5A

### Part A: Mandatory Document Upload
1. Create `citizen-uploads` storage bucket
2. Add storage RLS policies for anonymous upload
3. Add anon insert policy on `subsidy_document_upload`
4. Rebuild Step6Documents with react-dropzone
5. Update Edge Function to handle document paths
6. Block submission without mandatory documents

### Part B: Dutch (NL) Localization
1. Install react-i18next, i18next, i18next-browser-languagedetector
2. Create i18n configuration
3. Create translation files (nl.json, en.json)
4. Add LanguageSwitcher component
5. Localize all wizard steps (Step0-Step8)
6. Set NL as default language

---

## Rollback Instructions

If Phase 5A fails:
1. Remove i18n packages from package.json
2. Revert all component changes
3. Delete `citizen-uploads` storage bucket
4. Drop anon RLS policies

---

**Status:** PRE-PHASE SNAPSHOT CAPTURED

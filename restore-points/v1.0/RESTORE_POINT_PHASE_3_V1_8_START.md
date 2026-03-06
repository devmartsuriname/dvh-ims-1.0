# Restore Point: Phase 3 V1.8 Start

**Created:** 2026-03-06
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Phase:** 3 — Supabase Persistence + Server Validation
**Status:** PRE-IMPLEMENTATION

## Previous Phase
- Phase 2 complete: Config + Step 6 Validation + Types
- Document validation_group enforcement live in frontend
- 14 document types configured with income_proof group

## Current State
- `subsidy_document_upload` table exists with correct schema
- Edge function `submit-bouwsubsidie-application` persists documents but has NO server-side income proof validation
- Frontend Step 6 enforces income proof rule (Phase 2)
- No admin or Housing changes

## Files to be Modified in Phase 3
- `supabase/functions/submit-bouwsubsidie-application/index.ts`
- `src/app/(public)/bouwsubsidie/apply/page.tsx`
- `src/i18n/locales/nl.json`
- `src/i18n/locales/en.json`

## Rollback
Revert the above files to their state at this restore point timestamp.

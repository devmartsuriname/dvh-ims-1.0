

# DVH-IMS V1.5 — Fix: Document Backfill for BS-2026-000001

**Type:** Data backfill (SQL migration)
**Severity:** Production-blocking (test data integrity)
**Scope:** One-time data INSERT only

---

## Root Cause

**Missing database records, NOT an access or UI issue.**

BS-2026-000001 (`d5106ad7-d39e-4946-b6cd-0cbbeae53052`) was submitted on 2026-02-09 16:29 UTC — **before** the edge function fix was deployed at ~21:49 UTC. The old code attempted flat access (`doc.file_path` instead of `doc.uploaded_file.file_path`), which resolved to `undefined` and violated the `NOT NULL` constraint on `subsidy_document_upload.file_path`. The INSERT failed silently.

**Result:** Zero rows in `subsidy_document_upload` for this case. The UI query is correct but returns an empty set.

| Evidence Point | BS-2026-000001 | BS-2026-000002 |
|----------------|----------------|----------------|
| Case exists | Yes | Yes |
| Document upload rows | **0** | 2 |
| Submitted before fix | Yes | No |
| Edge function version | Old (flat access) | Fixed (nested access) |

This is **not** an RLS issue, **not** a UI bug, and **not** a version gap in query logic. It is a one-time data loss caused by the pre-fix edge function.

---

## Fix

### Step 1 — Verify uploaded files exist in storage

Before inserting records, confirm the files were actually uploaded to the `citizen-uploads` bucket during the BS-2026-000001 submission. If files do not exist in storage, backfill records cannot be created (no orphan references).

### Step 2 — Backfill missing document records

If files exist, insert the corresponding `subsidy_document_upload` rows via SQL migration:

```sql
-- Backfill document records for BS-2026-000001
-- These were lost due to the pre-fix edge function flat-access bug
INSERT INTO public.subsidy_document_upload (case_id, requirement_id, file_path, file_name, uploaded_by, is_verified)
SELECT
  'd5106ad7-d39e-4946-b6cd-0cbbeae53052'::uuid,
  r.id,
  '<confirmed_storage_path>',
  '<confirmed_file_name>',
  NULL,
  false
FROM public.subsidy_document_requirement r
WHERE r.document_code = '<matching_code>';
-- One INSERT per confirmed file
```

The exact file paths and names will be confirmed from storage before execution.

### Step 3 — If files do NOT exist in storage

If the citizen did not actually upload files during the BS-2026-000001 submission (test may have been done before document upload was functional), then:

- No backfill is possible
- The case legitimately has zero documents
- The UI correctly shows "No documents uploaded yet"
- This is expected behavior, not a bug

In this scenario, the finding is reclassified as **expected test data state** and no fix is needed.

---

## What This Does NOT Change

- No schema changes
- No RLS policy changes
- No UI changes
- No edge function changes
- No workflow/status logic changes

---

## Recurrence Statement

**This issue cannot recur under the current architecture.**

The edge function fix (deployed 2026-02-09 21:49 UTC) correctly handles the nested `uploaded_file` structure. All future submissions — manual or system — use this single code path. There are no alternate submission paths. The backfill addresses the one-time historical gap only.

---

## Execution Order

1. Check `citizen-uploads` bucket for BS-2026-000001 files
2. If files exist: create SQL migration to insert missing rows
3. If files do not exist: report as expected state, no action needed
4. Verify documents appear in Admin Case Detail
5. Report


# Phase 3 — Supabase Persistence + Server Validation

## Restore Point

Create `restore-points/v1.0/RESTORE_POINT_PHASE_3_V1_8_START.md` before any changes.

## Current State Analysis

**Document persistence already exists.** The `subsidy_document_upload` table is present with columns: `id`, `case_id`, `requirement_id`, `file_path`, `file_name`, `uploaded_by`, `uploaded_at`, `is_verified`, `verified_by`, `verified_at`. RLS policies are in place. The edge function `submit-bouwsubsidie-application` already links uploaded documents to cases (lines 436-473) by looking up `requirement_id` from `subsidy_document_requirement` and inserting into `subsidy_document_upload`.

**What is missing:** Server-side income proof validation. The edge function currently accepts any submission regardless of which documents were uploaded.

## Scope — 3 Changes

### 1. Server-Side Income Proof Validation (Edge Function)

**File:** `supabase/functions/submit-bouwsubsidie-application/index.ts`

Add validation after input parsing (before any DB writes) that checks the submitted `documents` array:

```
Income proof codes: PAYSLIP, AOV_STATEMENT, PENSION_STATEMENT, EMPLOYER_DECLARATION
Mandatory codes: ID_COPY, BANK_STATEMENT
```

Validation logic:

- Extract documents that have `uploaded_file` with a non-empty `file_path`
- Check all mandatory codes have uploads
- Check at least one income proof code has an upload
- If validation fails, return 400 with structured error code `INCOME_PROOF_REQUIRED` or `MANDATORY_DOCUMENTS_MISSING`

### 2. Audit Logging for Validation Blocks

When server validation blocks a submission, log an audit event before returning the error:

```typescript
{
  actor_user_id: null,
  actor_role: 'public',
  entity_type: 'subsidy_case',
  entity_id: null, // no case created yet
  action: 'SUBMISSION_VALIDATION_BLOCKED',
  metadata_json: {
    validation_type: 'income_proof' | 'mandatory_documents',
    district_code: input.district,
    submission_ip_hash: ipHash,
    timestamp: new Date().toISOString()
  }
}
```

### 3. Frontend Error Handling

**File:** `src/app/(public)/bouwsubsidie/apply/page.tsx`

Update `getSafeErrorMessage` to recognize the new structured error codes and show appropriate translated messages. Add i18n keys for `INCOME_PROOF_REQUIRED` and `MANDATORY_DOCUMENTS_MISSING`.

## What This Does NOT Touch

- `subsidy_document_upload` table schema — no changes (already correct)
- Housing Registration — zero files changed
- Admin modules — zero files changed
- `household_member` table — zero changes
- Client-side Step 6 validation — already enforced in Phase 2, unchanged

## Files Affected


| File                                                          | Change                              |
| ------------------------------------------------------------- | ----------------------------------- |
| `supabase/functions/submit-bouwsubsidie-application/index.ts` | Add document validation + audit log |
| `src/app/(public)/bouwsubsidie/apply/page.tsx`                | Handle new error codes              |
| `src/i18n/locales/nl.json`                                    | Add error message keys              |
| `src/i18n/locales/en.json`                                    | Add error message keys              |
| `restore-points/v1.0/RESTORE_POINT_PHASE_3_V1_8_START.md`     | Restore point                       |


## NOTE — Final compatibility confirmation required before approval

The Phase 3 scope is acceptable in principle:

- no schema change to `subsidy_document_upload`

- server-side validation in `submit-bouwsubsidie-application`

- frontend handling of new structured error codes

- Housing untouched

- Admin untouched

However, before approval, confirm one compatibility point:

1. Audit logging compatibility

You propose logging:

- action = `SUBMISSION_VALIDATION_BLOCKED`

- entity_type = `subsidy_case`

- entity_id = null

- metadata_json includes `submission_ip_hash`

Before implementation, confirm that the current `audit_event` table and write path allow all of the above without schema or enum/check-constraint changes.

Specifically confirm:

- `action` accepts a new action string

- `entity_id` may be null

- `metadata_json` may include `submission_ip_hash`

- `ipHash` is already available in the edge function or will be derived without additional infrastructure changes

If any of these are not compatible, then adjust the plan before coding:

- either reuse an existing valid action name

- or skip audit write for blocked submissions in this phase and only return structured 400 errors

After this compatibility confirmation, Phase 3 can be approved.  
No Migration Required

The `subsidy_document_upload` table already exists with the correct schema. No new tables or columns needed.


# DVH-IMS V1.5 — Fix: Uploaded Documents Not Visible in Admin Case Detail

**Type:** Bug fix (data-layer mismatch)
**Severity:** Production-blocking
**Scope:** Edge function only (1 file)

---

## Root Cause

**Data structure mismatch between wizard and edge function.**

The wizard sends documents in this structure:
```text
documents: [
  {
    id: "ID_COPY",
    document_code: "ID_COPY",
    label: "...",
    is_mandatory: true,
    uploaded_file: {         <-- nested object
      file_path: "bouwsubsidie/abc/ID_COPY_123.pdf",
      file_name: "my-id.pdf",
      file_size: 12345,
      uploaded_at: "2026-02-09T..."
    }
  }
]
```

But the edge function reads `doc.file_path` and `doc.file_name` directly (flat access), which resolves to `undefined`.

Since `file_path` and `file_name` are `NOT NULL` columns in `subsidy_document_upload`, the INSERT fails with a constraint violation. The error is logged but execution continues, resulting in **zero document records** linked to the case.

**This is a bug, not by-design behavior.**

---

## Evidence

| Check | Result |
|-------|--------|
| `subsidy_document_upload` row count | **0 rows** (empty table) |
| `subsidy_document_requirement` rows | 8 rows present (correct) |
| `file_path` column constraint | `NOT NULL` |
| Wizard sends `uploaded_file.file_path` | Confirmed (nested) |
| Edge function reads `doc.file_path` | Confirmed (flat -- undefined) |
| RLS SELECT policies for admin roles | Correct (national roles + district-scoped frontdesk/admin) |
| Storage bucket `citizen-uploads` | Exists, public |
| UI query in case detail page | Correct (`subsidy_document_upload` by `case_id`) |

**Conclusion:** RLS, storage, and UI are all correct. The sole issue is the edge function not extracting from the nested `uploaded_file` object.

---

## Fix (Minimal)

### File: `supabase/functions/submit-bouwsubsidie-application/index.ts`

**Change 1 — Document extraction logic (lines 447-465)**

Replace flat property access with nested `uploaded_file` extraction. Also skip documents that have no uploaded file (optional documents the citizen didn't upload).

Before:
```typescript
for (const doc of input.documents) {
  const requirementId = requirementMap.get(doc.document_code)
  if (requirementId) {
    const { error: docError } = await supabase
      .from('subsidy_document_upload')
      .insert({
        case_id: caseId,
        requirement_id: requirementId,
        file_path: doc.file_path,
        file_name: doc.file_name,
        uploaded_by: null,
        is_verified: false
      })
```

After:
```typescript
for (const doc of input.documents) {
  // Skip documents without an uploaded file (optional docs not uploaded)
  const uploadedFile = (doc as any).uploaded_file
  if (!uploadedFile?.file_path) continue

  const requirementId = requirementMap.get(doc.document_code)
  if (requirementId) {
    const { error: docError } = await supabase
      .from('subsidy_document_upload')
      .insert({
        case_id: caseId,
        requirement_id: requirementId,
        file_path: uploadedFile.file_path,
        file_name: uploadedFile.file_name,
        uploaded_by: null,
        is_verified: false
      })
```

**Change 2 — Input validation mapping (line 146)**

Update the validation function to pass through the full document objects (including the nested `uploaded_file`) rather than casting to the flat `DocumentUploadInput` interface.

---

## What This Does NOT Change

- No schema changes
- No RLS policy changes
- No UI changes
- No workflow/status logic changes
- No storage bucket changes
- No new dependencies

---

## Verification Checklist

| Test | Expected |
|------|----------|
| Submit wizard with mandatory docs uploaded | Edge function logs "Linked 6 documents to case" |
| `subsidy_document_upload` rows exist for case | Rows with correct `file_path`, `file_name`, `case_id` |
| Admin case detail > Documents tab | Shows uploaded documents |
| Document download via signed URL | File downloads successfully |
| Optional docs not uploaded | Skipped gracefully (no errors) |
| Audit event logged | Upload event recorded |
| Security scan | No new warnings |

---

## Technical Details

- **Affected file:** `supabase/functions/submit-bouwsubsidie-application/index.ts`
- **Lines modified:** ~447-465 (document linking loop) and ~146 (validation mapping)
- **Deploy required:** Edge function redeployment
- **Restore point:** Will be created before changes


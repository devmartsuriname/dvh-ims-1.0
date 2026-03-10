# DVH-IMS — Phase 12: Secure Document Storage

## Current State

- `citizen-uploads` bucket is **public** — any file accessible via direct URL if path is known
- Housing admin detail page uses `getPublicUrl()` to display citizen documents (line 192-195)
- Subsidy admin detail page does **not** render citizen document links (only shows file_name, no download button)
- Existing `get-document-download-url` Edge Function handles **generated-documents** bucket only (private, signed URLs)
- Public wizard upload steps (Step8Documents for housing, Step6Documents for subsidy) use anonymous `supabase.storage.upload()` — must remain functional

## Implementation Plan

### Step 1 — New Edge Function: `get-citizen-document`

Create `supabase/functions/get-citizen-document/index.ts`:

- POST endpoint accepting `{ file_path: string }`
- JWT authentication via `getUser()`
- RBAC check: `system_admin`, `project_leader`, `minister`, `frontdesk_housing`, `frontdesk_bouwsubsidie`, `admin_staff`, `audit`, `director`, `ministerial_advisor`, `social_field_worker`, `technical_inspector`
- Validate `file_path` starts with `housing/` or `bouwsubsidie/` (prevent path traversal)
- Generate signed URL with 60-second expiry from `citizen-uploads` bucket using service role
- Audit log entry for document access
- Rate limit: 30 requests/IP/hour
- Register in `supabase/config.toml` with `verify_jwt = false`

### Step 2 — Update Frontend Document Access

**Housing admin detail** (`src/app/(admin)/housing-registrations/[id]/page.tsx`):

- Replace `getDocumentUrl()` (lines 192-195) with async function that calls `get-citizen-document` Edge Function
- Update the download button (line 496-504) to use `onClick` handler instead of `href`

**Subsidy admin detail** (`src/app/(admin)/subsidy-cases/[id]/page.tsx`):

- Add download button to citizen document rows (lines 678-691) using same Edge Function pattern

### Step 3 — Database Migration: Harden Bucket

SQL migration to:

1. Set `citizen-uploads` bucket to `public = false`
2. Set `file_size_limit = 10485760` (10MB) and `allowed_mime_types = ['application/pdf', 'image/jpeg', 'image/png']`
3. Add `no_citizen_document_deletion` RLS policy on `storage.objects` blocking DELETE for `citizen-uploads`
4. Keep anonymous INSERT policy (citizens must still upload)
5. Remove `anon_can_read_citizen_documents` SELECT policy (no longer needed — signed URLs via service role)

### Step 4 — Verification

After deployment:

- Test citizen upload still works (anonymous INSERT)
- Test admin document access via signed URL
- Confirm direct public URL returns 400/403
- Console clean check

**NOTE — Security Correction**

In Step 1 please change the Edge Function configuration.

Instead of:

verify_jwt = false

Use:

verify_jwt = true

The endpoint should only allow authenticated staff requests.

Additional validation requirement:

Validate that file_path matches the expected pattern:

housing/<case_id>/<filename>

or

bouwsubsidie/<case_id>/<filename>

This prevents path traversal or file enumeration attacks.

All other parts of the implementation plan are approved.  
  
**Files Changed**


| File                                                  | Action                               |
| ----------------------------------------------------- | ------------------------------------ |
| `supabase/functions/get-citizen-document/index.ts`    | CREATE                               |
| `supabase/config.toml`                                | ADD function entry                   |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | UPDATE document access               |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx`         | ADD download button for citizen docs |
| Database migration                                    | Bucket hardening + RLS               |

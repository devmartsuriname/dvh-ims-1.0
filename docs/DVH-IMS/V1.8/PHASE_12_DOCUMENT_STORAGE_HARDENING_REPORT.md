# DVH-IMS — Phase 12: Secure Document Storage Report

**Date:** 2026-03-10  
**Phase:** 12 — Document Storage Hardening  
**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## 1. Edge Function Implementation

**Function:** `get-citizen-document`

| Feature | Status |
|---------|--------|
| POST endpoint | ✅ |
| JWT authentication (verify_jwt = true) | ✅ |
| RBAC (all 11 staff roles) | ✅ |
| Path validation regex (housing/bouwsubsidie + UUID + filename) | ✅ |
| Signed URL (60-second expiry) | ✅ |
| Audit logging (CITIZEN_DOCUMENT_ACCESSED) | ✅ |
| Rate limiting (30/IP/hour) | ✅ |
| Structured logging with PII scrubbing | ✅ |
| CORS headers | ✅ |

**Deployment:** Confirmed — returns 401 for unauthenticated requests.

---

## 2. Storage Configuration Changes

| Setting | Before | After |
|---------|--------|-------|
| citizen-uploads public | true | **false** |
| file_size_limit | none | **10 MB** (10485760) |
| allowed_mime_types | none | **pdf, jpeg, png** |
| anon SELECT policy | active | **removed** |
| anon INSERT policy | active | **kept** (citizens must upload) |
| staff SELECT policy | active | **kept** (backup access) |
| no_citizen_document_deletion | none | **added** (DELETE blocked) |

---

## 3. Frontend Updates

| Page | Change |
|------|--------|
| Housing admin detail | Replaced `getPublicUrl()` with `handleDocumentDownload()` via Edge Function |
| Subsidy admin detail | Added download button with Edge Function signed URL access |

Both pages now request documents via `POST /get-citizen-document` with JWT bearer token.

---

## 4. Security Confirmation

- ✅ Direct public URL access blocked (bucket is private)
- ✅ Path traversal prevented (regex: `^(housing|bouwsubsidie)/<uuid>/<filename>$`)
- ✅ File enumeration prevented (no listing, no guessable paths)
- ✅ Document deletion blocked (RLS policy)
- ✅ Rate limiting active (30 requests/IP/hour)
- ✅ All access audited

---

## Final Verdict

### ✅ DOCUMENT STORAGE HARDENED

---

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/get-citizen-document/index.ts` | CREATED |
| `supabase/config.toml` | UPDATED (added function entry) |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | UPDATED (signed URL access) |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx` | UPDATED (added download button) |
| Database migration | EXECUTED (bucket hardening + RLS) |

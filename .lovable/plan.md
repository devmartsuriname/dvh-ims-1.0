

# DVH-IMS — Phase 11 Production Hardening Report

## SECTION 1 — Storage Security Review

**Current Configuration:**

| Bucket | Public | Size Limit | MIME Filter |
|--------|--------|------------|-------------|
| citizen-uploads | YES | None | None |
| generated-documents | NO | 10 MB | None |

**Storage RLS Policies (storage.objects):**

| Policy | Bucket | Command | Scope |
|--------|--------|---------|-------|
| anon_can_upload_citizen_documents | citizen-uploads | INSERT | Any anonymous user |
| anon_can_read_citizen_documents | citizen-uploads | SELECT | Any anonymous user |
| staff_can_read_citizen_documents | citizen-uploads | SELECT | Authenticated staff |
| role_upload_documents | generated-documents | INSERT | Admin/frontdesk roles |
| role_download_documents | generated-documents | SELECT | Admin/oversight roles |
| no_document_deletion | generated-documents | DELETE | Blocked (false) |

**Finding: MEDIUM RISK — citizen-uploads is fully public**

Files uploaded to `citizen-uploads` can be read by anyone who knows the file path. Since Edge Functions generate UUID-based paths, guessing is impractical, but this still exposes citizen documents if a URL leaks.

**Recommendations (post-launch hardening):**

1. Set `citizen-uploads` bucket to **private** (`public = false`)
2. Replace `anon_can_read_citizen_documents` with a signed-URL approach via a new Edge Function
3. Add `file_size_limit` (10 MB) and `allowed_mime_types` (pdf, jpg, png) to the bucket
4. Add a `no_deletion` policy matching `generated-documents`

These changes require a new Edge Function for citizen document retrieval and are recommended for Phase 12. Current state is functional but not hardened.

---

## SECTION 2 — Rate Limit & Abuse Protection

| Edge Function | Rate Limit | Window | Status |
|---------------|------------|--------|--------|
| submit-housing-registration | 5/IP | 1 hour | ACTIVE |
| submit-bouwsubsidie-application | 5/IP | 1 hour | ACTIVE |
| lookup-public-status | 20/IP | 1 hour | ACTIVE |

All three functions use `createRateLimiter()` from the shared module. Input validation via Zod schemas is confirmed. CORS headers applied. JWT verification disabled (by design for anonymous access).

**Verdict: PASS**

---

## SECTION 3 — Audit Logging Verification

**122 audit events** exist in the immutable `audit_event` table.

**Logged action types confirmed:**

| Action | Coverage |
|--------|----------|
| public_submission | Citizen registrations and subsidy applications |
| status_lookup | Public status tracker queries |
| status_lookup_failed | Invalid reference attempts |
| SUBMISSION_VALIDATION_BLOCKED | Rejected malformed submissions |
| STATUS_CHANGE | Admin status transitions |
| CREATE / UPDATE | Admin case modifications |
| DOCUMENT_VERIFIED | Document verification actions |
| document_generated | Council proposal generation |
| document_downloaded | Document download events |
| role_assigned | Role assignment changes |
| USER_ACTIVATED | Staff account activation |
| ARCHIVE_VIEWED | Archive access logging |

**RLS on audit_event:** INSERT restricted to authenticated roles with `actor_user_id = auth.uid()`. SELECT restricted to audit/admin/minister/project_leader. No UPDATE or DELETE permitted.

**Verdict: PASS**

---

## SECTION 4 — Error Visibility & Monitoring Readiness

| Component | Status |
|-----------|--------|
| Sentry SDK (frontend) | Conditional — active when VITE_SENTRY_DSN set |
| Structured logger (Edge Functions) | Active — JSON output with PII scrubbing |
| Health check endpoint | Active — returns HTTP 200 |
| Console errors (current) | Clean — no errors detected |

**Recommendations (optional, not blocking launch):**

1. Set `VITE_SENTRY_DSN` environment variable to activate frontend error tracking
2. Set `SENTRY_DSN` Edge Function secret for backend error forwarding
3. Configure BetterStack/UptimeRobot for 4 endpoints:
   - Health check: `POST /health-check`
   - Housing wizard page
   - Subsidy wizard page
   - Status tracker page

Monitoring configuration documented in `docs/DVH-IMS/V1.8/MONITORING_CONFIGURATION.md`.

**Verdict: PASS (monitoring optional but recommended)**

---

## SECTION 5 — RLS Data Safety Verification

| Table | RLS Policies | DELETE Blocked | Unauth Access |
|-------|-------------|----------------|---------------|
| housing_registration | 3 | YES | NO |
| subsidy_case | 11 | YES | NO |
| person | 7 | YES | NO |
| household | 7 | YES | NO |
| address | 3 | YES | NO |

All five critical tables enforce RBAC via `has_role()` / `is_national_role()` / `get_user_district()`. No anonymous access. No DELETE policies exist on any operational table.

**Verdict: PASS**

---

## SECTION 6 — System Health Checks

| Endpoint | Status |
|----------|--------|
| Health check Edge Function | HTTP 200 — `{"status":"ok"}` |
| Preview URL (wizards/dashboard) | Accessible |
| Console | Clean — no errors |
| Database | Responsive — all queries return |

**Verdict: PASS**

---

## SECTION 7 — Launch Readiness Checklist

| Check | Status |
|-------|--------|
| Database clean state (0 operational records) | CONFIRMED |
| citizen-uploads bucket functional | CONFIRMED |
| generated-documents bucket secured | CONFIRMED |
| Staff accounts active (12 active, 1 inactive) | CONFIRMED |
| Audit trail preserved (122 events) | CONFIRMED |
| Rate limiting on all public endpoints | CONFIRMED |
| Input validation on all public endpoints | CONFIRMED |
| RLS enforced on all operational tables | CONFIRMED |
| State machine triggers installed | CONFIRMED |
| Edge Functions deployed (7 functions) | CONFIRMED |
| Console clean | CONFIRMED |
| Health check responding | CONFIRMED |

---

## SECTION 8 — Final Verdict

### PRODUCTION HARDENING COMPLETE

**One advisory finding (non-blocking):**

The `citizen-uploads` storage bucket is public. This is functional and does not expose data through listing (paths are UUID-based), but a leaked URL would allow direct file access. Recommended to convert to private bucket with signed URLs in a future hardening phase.

**System is cleared for public intake.**

---

### Implementation Plan (if approved)

No code changes are required for this phase. The advisory finding (citizen-uploads bucket privacy) would require:
1. A database migration to set `citizen-uploads` to private
2. A new Edge Function for signed URL generation
3. Frontend updates to use signed URLs for document display

This is recommended as a post-launch improvement, not a launch blocker.


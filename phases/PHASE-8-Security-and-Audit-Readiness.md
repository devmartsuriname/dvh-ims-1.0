# Phase 8 — Security and Audit Readiness

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** COMPLETE  
**Authority:** Delroy (Final)  
**Baseline Restore Point:** PHASE-8-COMPLETE

---

## A. Phase Objective

Validate and harden the security posture to achieve government-grade compliance before proceeding with additional functionality:

- Complete RLS policy audit and documentation for all 23 tables
- Edge Function security hardening (input validation, error handling, log sanitization)
- Audit logging governance verification (append-only enforcement)
- Security documentation finalization
- Identification of deferred security items and dashboard action items

This phase ensures the existing implementation meets the security baseline required for a government system before expanding access or adding new public-facing integrations.

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Documentation | Create RLS Policy Matrix (docs/RLS_POLICY_MATRIX.md) |
| Documentation | Document Edge Functions Security Checklist |
| Documentation | Document Audit Logging Governance |
| Documentation | Document Security Model Overview (Phase 1 allowlist posture) |
| Edge Functions | Add UUID format validation for input parameters |
| Edge Functions | Implement structured error responses (no stack traces) |
| Edge Functions | Sanitize console logs (remove PII) |
| Verification | Confirm RLS enabled on all tables |
| Verification | Confirm allowlist policies in place |
| Verification | Confirm audit_event append-only enforcement |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Database | New table creation |
| Database | Schema modifications |
| Database | RLS policy changes (documentation only) |
| UI | Any UI modifications |
| Features | New functionality |
| Edge Functions | Business logic changes |
| Edge Functions | Output schema changes |
| RBAC | Role-based access implementation (deferred to Phase 11) |

---

## D. Database Impact

### Schema Changes
- **None** — This phase is documentation and verification only

### RLS Verification Scope
All 23 tables must be verified:

**Shared Core (6 tables):**
- person, household, household_member, address, contact_point, app_user_profile

**Bouwsubsidie Module (7 tables):**
- subsidy_case, subsidy_case_status_history, subsidy_document_requirement, subsidy_document_upload, social_report, technical_report, generated_document

**Housing Registration & Allocation Module (9 tables):**
- housing_registration, housing_registration_status_history, housing_urgency, allocation_run, allocation_candidate, allocation_decision, assignment_record, district_quota, public_status_access

**System Tables (1 table):**
- audit_event

### RLS Policy Posture
- Phase 1 Allowlist Model: `(auth.jwt() ->> 'email') = 'info@devmart.sr'`
- All tables must have RLS enabled with FORCE ROW LEVEL SECURITY
- Default deny-all with explicit allowlist policies

---

## E. Security & RLS Considerations

### Current Security Model (Phase 1)
- Single allowlist email: `info@devmart.sr`
- JWT email claim verification for all authenticated access
- Anonymous access denied on all tables (except specified public operations)
- RBAC deferred to Phase 11

### Edge Function Security
- Admin-only authorization via JWT email claim
- UUID format validation on all ID parameters
- District code format validation
- Structured error responses with safe error codes
- No internal system details in error messages
- Console log sanitization (no PII)

### Audit Event Protection
- INSERT only policy for allowlist
- UPDATE denied
- DELETE denied
- SELECT denied for authenticated users (deferred to Phase 11)

### Identified Security Items (Dashboard Actions Required)
- **Leaked Password Protection:** Must be enabled via Supabase Dashboard → Authentication → Settings
- This cannot be code-fixed; requires manual dashboard configuration

---

## F. Audit Trail Requirements

### Verification Required
- Confirm audit_event table is append-only (INSERT only)
- Confirm UPDATE policy denies all
- Confirm DELETE policy denies all
- Confirm all existing application-layer audit calls remain intact

### Governance Documentation
Document in docs/backend.md:
- Audit Logging Governance section
- Append-only enforcement rationale
- Actor identification requirements
- Metadata structure standards

---

## G. UI Impact

**None** — No UI changes permitted in Phase 8.

All existing UI remains unchanged. This phase focuses exclusively on security validation, documentation, and minimal Edge Function hardening.

---

## H. Verification Criteria

### RLS Verification
- [ ] All 23 tables documented in RLS_POLICY_MATRIX.md
- [ ] All tables have RLS enabled
- [ ] All tables have FORCE ROW LEVEL SECURITY
- [ ] Allowlist pattern verified on all policies
- [ ] No open SELECT/INSERT/UPDATE/DELETE policies

### Edge Function Verification
- [ ] execute-allocation-run has UUID validation
- [ ] execute-allocation-run has district code validation
- [ ] Structured error responses implemented
- [ ] Console logs sanitized
- [ ] No PII in error messages

### Audit Verification
- [ ] audit_event INSERT-only verified
- [ ] audit_event UPDATE denied verified
- [ ] audit_event DELETE denied verified
- [ ] Existing audit logging calls intact

### Documentation Verification
- [ ] docs/RLS_POLICY_MATRIX.md created
- [ ] docs/backend.md updated with security sections
- [ ] docs/architecture.md updated with RLS section
- [ ] Restore point documented

### Build Verification
- [ ] Build remains green
- [ ] No functional regressions
- [ ] Edge Function deploys successfully

---

## I. Restore Point Requirement

### Restore Point Name
`PHASE-8-COMPLETE`

### Restore Point Contents
- All security documentation created
- Edge Function hardening applied
- Verification checklist completed
- Clean build state
- No schema changes from Phase 7

### Rollback Procedure
If Phase 8 verification fails:
1. Revert Edge Function changes
2. Remove new documentation files
3. Report failure details
4. Await remediation instructions

---

## J. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 8 COMPLETION**

Upon completing Phase 8:
1. Execute all verification criteria
2. Submit completion report in standard format
3. Create restore point PHASE-8-COMPLETE
4. **STOP** — Do not proceed to Phase 9
5. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 9**

Phase 8 is complete. System is now at security-hardened baseline.

---

## K. Deferred Items

| Item | Target Phase | Rationale |
|------|--------------|-----------|
| RBAC Implementation | Phase 11 | Requires role table and policy replacement |
| District-level Access | Phase 11 | Requires RBAC foundation |
| Admin audit_event Read | Phase 11 | Requires Audit role definition |
| Leaked Password Protection | Phase 12 | Dashboard action item |

---

## L. Governance References

- Master PRD: Section 2 (Security Requirements)
- Architecture & Security: Section 11 (Guardian Rules), Section 13.2 (RLS)
- Database & RLS Specification: Full document
- Execution Plan: Global Execution Rules

---

**End of Phase 8 Documentation**

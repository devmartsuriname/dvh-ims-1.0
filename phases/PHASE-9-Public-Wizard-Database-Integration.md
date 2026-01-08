# Phase 9 — Public Wizard Database Integration

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** PHASE 9A COMPLETED | PHASE 9B PENDING  
**Authority:** Delroy (Final)  
**Prerequisite:** Phase 8 Complete

---

## Phase 9A — Wizard Logic Architecture Review

**Status:** ✅ COMPLETED (2026-01-08)  
**Restore Point:** PHASE-9A-ARCHITECTURE-COMPLETE  
**Deliverable:** `docs/PHASE-9A-Wizard-Logic-Architecture.md`

Phase 9A was an analysis and documentation phase that produced the architectural baseline for integrating Neonwizard UI shells (Phase 8.5) with existing IMS wizard logic. No code changes were made.

---

## Phase 9B — Implementation (PENDING AUTHORIZATION)

---

## A. Phase Objective

Connect the public wizard submissions to actual database storage, transforming the current mocked submission flow into a fully functional citizen intake system:

- Create Edge Functions for secure wizard submission processing
- Implement anonymous INSERT RLS policies for public submission tables
- Generate unique reference numbers and secure access tokens
- Enable real-time status tracking with actual database data
- Implement rate limiting and abuse prevention

This phase bridges the gap between the citizen-facing UI (completed in Phase 5) and the backend data layer, ensuring all public submissions are properly stored, audited, and trackable.

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Edge Functions | Create `submit-bouwsubsidie-application` |
| Edge Functions | Create `submit-housing-registration` |
| Edge Functions | Create `lookup-public-status` |
| RLS | Add anon INSERT policies for submission tables |
| RLS | Add anon SELECT policy for public_status_access (own record only) |
| UI | Wire wizard submission handlers to Edge Functions |
| UI | Wire status tracking to Edge Function |
| Security | Implement token hashing (SHA-256) |
| Security | Implement rate limiting on submissions |
| Security | Implement rate limiting on status lookups |
| Audit | Log all wizard submissions to audit_event |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Database | New table creation |
| Admin UI | Any modifications to admin pages |
| Features | Citizen accounts or login |
| Features | Citizen dashboards |
| UI | Wizard step changes (UI is frozen from Phase 5) |
| UI | Layout or styling changes |
| UI | Public landing page changes |
| RBAC | Role-based access (deferred to Phase 11) |

---

## D. Database Impact

### Schema Changes
- **None** — All required tables exist from previous phases

### RLS Policy Additions

#### Anonymous INSERT Policies (New)

| Table | Policy Name | Operation | Expression |
|-------|-------------|-----------|------------|
| person | anon_can_insert_person | INSERT | `true` (rate-limited at Edge) |
| household | anon_can_insert_household | INSERT | `true` (rate-limited at Edge) |
| household_member | anon_can_insert_member | INSERT | `true` (rate-limited at Edge) |
| address | anon_can_insert_address | INSERT | `true` (rate-limited at Edge) |
| contact_point | anon_can_insert_contact | INSERT | `true` (rate-limited at Edge) |
| subsidy_case | anon_can_insert_case | INSERT | `true` (rate-limited at Edge) |
| housing_registration | anon_can_insert_registration | INSERT | `true` (rate-limited at Edge) |
| public_status_access | anon_can_insert_status_access | INSERT | `true` (rate-limited at Edge) |
| public_status_access | anon_can_select_own | SELECT | `access_token_hash = hash(provided_token)` |

### Tables Used (Existing)

**For Bouwsubsidie Submission:**
- person (applicant)
- household
- household_member
- address
- contact_point
- subsidy_case
- public_status_access

**For Housing Registration Submission:**
- person (applicant)
- household
- household_member
- address
- contact_point
- housing_registration
- public_status_access

---

## E. Security & RLS Considerations

### Edge Function Security

| Function | Authorization | Rate Limit | Validation |
|----------|---------------|------------|------------|
| submit-bouwsubsidie-application | Anonymous (public) | 5/hour per IP | Full input validation |
| submit-housing-registration | Anonymous (public) | 5/hour per IP | Full input validation |
| lookup-public-status | Anonymous (public) | 20/hour per IP | Reference + token validation |

### Token Security
- Access tokens generated as cryptographically secure random strings
- Tokens hashed with SHA-256 before storage
- Original token shown only once to citizen
- Token required for all status lookups
- No PII exposed without valid token

### Input Validation
- All fields validated against expected types
- National ID format validation
- District code validation against allowed values
- Date format validation
- Email format validation
- Phone number format validation

### Abuse Prevention
- Rate limiting at Edge Function level
- IP-based throttling
- Request size limits
- No bulk submission capability

---

## F. Audit Trail Requirements

### Submissions Audit
All wizard submissions must log to audit_event:

```
entity_type: 'subsidy_case' | 'housing_registration'
action: 'public_submission'
entity_id: <generated case/registration ID>
actor_user_id: null (anonymous)
actor_role: 'public'
metadata_json: {
  reference_number: <generated>,
  district_code: <submitted>,
  submission_ip_hash: <hashed IP>,
  submission_timestamp: <ISO datetime>
}
```

### Status Lookup Audit
Status lookups must log to audit_event:

```
entity_type: 'public_status_access'
action: 'status_lookup'
entity_id: <status access record ID>
actor_user_id: null (anonymous)
actor_role: 'public'
metadata_json: {
  reference_number: <provided>,
  lookup_successful: true|false,
  lookup_ip_hash: <hashed IP>
}
```

---

## G. UI Impact

### Changes Allowed

| Component | Change Type | Description |
|-----------|-------------|-------------|
| BouwsubsidieWizard | Integration | Replace mock submission with Edge Function call |
| HousingRegistrationWizard | Integration | Replace mock submission with Edge Function call |
| StatusTrackingPage | Integration | Replace mock lookup with Edge Function call |
| WizardConfirmation | Integration | Display real reference number from response |

### Changes Forbidden

| Component | Forbidden |
|-----------|-----------|
| All wizard steps | Layout, styling, field changes |
| Public landing page | Any modifications |
| Navigation | Route changes |
| Darkone compliance | Must maintain 1:1 |

### Darkone 1:1 Compliance
- No visual changes to existing wizard UI
- Toast notifications use existing Darkone patterns
- Loading states use existing components
- Error displays use existing patterns

---

## H. Verification Criteria

### Edge Function Verification
- [ ] submit-bouwsubsidie-application creates all required records
- [ ] submit-housing-registration creates all required records
- [ ] lookup-public-status returns correct status data
- [ ] Rate limiting functional (5 submissions/hour)
- [ ] Rate limiting functional (20 lookups/hour)
- [ ] Invalid input returns proper error messages
- [ ] No internal errors exposed to public

### Database Verification
- [ ] Person records created correctly
- [ ] Household records created correctly
- [ ] Household member records created correctly
- [ ] Address records created correctly
- [ ] Contact point records created correctly
- [ ] Subsidy case records created with correct initial status
- [ ] Housing registration records created with correct initial status
- [ ] public_status_access records created with hashed tokens
- [ ] Reference numbers are unique

### RLS Verification
- [ ] Anonymous INSERT policies active
- [ ] Anonymous SELECT on public_status_access works with valid token
- [ ] Anonymous SELECT blocked without valid token
- [ ] Admin access unchanged

### UI Verification
- [ ] Bouwsubsidie wizard submits successfully
- [ ] Housing registration wizard submits successfully
- [ ] Confirmation page shows real reference number
- [ ] Status tracking returns real data
- [ ] Error handling displays user-friendly messages
- [ ] No visual regressions

### Audit Verification
- [ ] All submissions logged to audit_event
- [ ] All lookups logged to audit_event
- [ ] Metadata complete in audit entries
- [ ] IP addresses hashed (not stored plaintext)

---

## I. Restore Point Requirement

### Restore Point Name
`PHASE-9-COMPLETE`

### Restore Point Contents
- All Edge Functions created and deployed
- RLS policies updated for anonymous access
- UI integration complete
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 9 verification fails:
1. Revert to PHASE-8-COMPLETE
2. Remove new Edge Functions
3. Remove anonymous RLS policies
4. Restore mock submission handlers
5. Report failure details
6. Await remediation instructions

---

## J. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 9 COMPLETION**

Upon completing Phase 9:
1. Execute all verification criteria
2. Submit completion report in standard format
3. Create restore point PHASE-9-COMPLETE
4. **STOP** — Do not proceed to Phase 10
5. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 10**

---

## K. Dependencies

| Dependency | Source | Required For |
|------------|--------|--------------|
| Wizard UI | Phase 5 | Integration points |
| Database schema | Phases 1-4 | Data storage |
| RLS baseline | Phase 8 | Policy additions |
| Edge Function patterns | Phase 4 | Security patterns |

---

## L. Governance References

- Master PRD: Section 3.5 (Public Intake)
- Architecture & Security: Section 8 (Edge Functions)
- Database & RLS Specification: Anonymous access patterns
- UX Flows: Wizard submission flow
- Execution Plan: Phase 5 outputs

---

**End of Phase 9 Documentation**

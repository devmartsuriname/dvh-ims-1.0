# Phase 5 — Public Wizards

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Build citizen-facing public interfaces:
- Public landing page with service selection
- Bouwsubsidie intake wizard (8 steps)
- Housing Registration wizard (9 steps)
- Citizen status tracking with reference number and token
- Reference number and token generation

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| UI | Create public landing page |
| UI | Create Bouwsubsidie wizard (Steps 0-8) |
| UI | Create Housing Registration wizard (Steps 0-9) |
| UI | Create citizen status tracking page |
| Integration | Create `generate-reference-number` Edge Function |
| Integration | Create `hash-access-token` Edge Function |
| Integration | Use existing `public_status_access` table |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Database | New table creation |
| Database | Modifications to existing tables |
| Admin UI | Any modifications |
| Features | Citizen accounts or dashboards (out of v1.0 scope) |
| Features | Dark theme (explicitly excluded v1.0) |
| UI | Custom UI systems |
| UI | Non-Darkone styling |

---

## D. Database Impact (DOCUMENTATION ONLY)

### No New Tables

Phase 5 uses existing tables only:
- `public_status_access` (created in Phase 3)
- `subsidy_case` (via Edge Functions)
- `housing_registration` (via Edge Functions)
- `person` (via Edge Functions)
- `household` (via Edge Functions)

### Reference Number Format

| Module | Format | Example |
|--------|--------|---------|
| Bouwsubsidie | BS-YYYY-NNNN | BS-2026-0001 |
| Housing Registration | WR-YYYY-NNNN | WR-2026-0001 |

### Token Security

- Access token generated as random string
- Stored as SHA-256 hash in `public_status_access`
- Plaintext token shown to citizen once only
- Rate limiting on status lookups

---

## E. UI Impact (DOCUMENTATION ONLY)

### Public Pages (Darkone Assets, Light Theme ONLY)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Service selection |
| Bouwsubsidie Wizard | `/bouwsubsidie/apply` | 8-step wizard |
| Housing Wizard | `/housing/register` | 9-step wizard |
| Status Tracking | `/status` | Reference + token lookup |

### Bouwsubsidie Wizard Steps

| Step | Title | Content |
|------|-------|---------|
| 0 | Welcome | Introduction, eligibility info |
| 1 | Personal Information | Applicant details |
| 2 | Household Composition | Household members |
| 3 | Current Housing | Current living situation |
| 4 | Proposed Construction | Construction plans |
| 5 | Financial Information | Income, assets |
| 6 | Document Uploads | Required documents |
| 7 | Review | Summary for verification |
| 8 | Confirmation | Reference number, token |

### Housing Registration Wizard Steps

| Step | Title | Content |
|------|-------|---------|
| 0 | Welcome | Introduction, eligibility info |
| 1 | Personal Information | Applicant details |
| 2 | Household Composition | Household members |
| 3 | Current Housing | Current living situation |
| 4 | Housing Preferences | Type, location preferences |
| 5 | Urgency Factors | Self-declared urgency |
| 6 | Contact Information | Contact details |
| 7 | Document Uploads | Supporting documents |
| 8 | Review | Summary for verification |
| 9 | Confirmation | Reference number, token |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| LandingPage | `src/app/public/` | Service selection |
| BouwsubsidieWizard | `src/app/public/bouwsubsidie/` | Subsidy application |
| HousingWizard | `src/app/public/housing/` | Housing registration |
| StatusTracker | `src/app/public/status/` | Status lookup |
| WizardStep | `src/components/public/` | Reusable step wrapper |
| WizardProgress | `src/components/public/` | Progress indicator |

### Design Requirements

| Requirement | Implementation |
|-------------|----------------|
| Theme | Light theme ONLY |
| Styling | Darkone SCSS + Assets only |
| Icons | Iconify only |
| Responsiveness | Mobile-first |
| Accessibility | WCAG 2.1 AA compliance |

---

## F. Security & RLS Considerations

### Public Access (No Authentication)

- Wizards do not require login
- No access to internal data
- Only create records via Edge Functions

### Token Security

- Tokens generated server-side
- SHA-256 hashed before storage
- Plaintext shown once, never stored
- Brute-force protection via rate limiting

### Rate Limiting

| Action | Limit |
|--------|-------|
| Wizard submission | 5 per IP per hour |
| Status lookup | 10 per IP per minute |

### Data Minimization

- Only collect required information
- No tracking beyond functional requirements
- Clear privacy notice on wizards

---

## G. Verification Criteria

### UI Verification

- [ ] Landing page displays correctly
- [ ] Service selection works
- [ ] Bouwsubsidie wizard completes all steps
- [ ] Housing wizard completes all steps
- [ ] Status tracking works with valid reference/token
- [ ] Status tracking rejects invalid reference/token
- [ ] Light theme enforced throughout
- [ ] Darkone assets used correctly
- [ ] Mobile responsiveness verified

### Edge Function Verification

- [ ] Reference number generation works
- [ ] Token generation and hashing works
- [ ] Status lookup returns correct data
- [ ] Rate limiting functional

### Integration Verification

- [ ] Wizard creates correct database records
- [ ] Person/Household created correctly
- [ ] Case/Registration created correctly
- [ ] Status access record created correctly
- [ ] Audit events logged

### Security Verification

- [ ] No internal data exposed to public
- [ ] Token hashing verified
- [ ] Rate limiting tested
- [ ] Error messages do not leak info

---

## H. Restore Point (Documentation Snapshot — no execution)

**IMPORTANT:** This phase does not authorize execution. This document is for planning and governance purposes only. Execution requires explicit written authorization from Delroy.

### Restore Point Name
`phase-5-complete`

### Restore Point Contents
- All Phase 5 UI components created
- Edge Functions deployed
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 5 fails verification:
1. Revert to `phase-4-complete`
2. Remove public pages
3. Delete Edge Functions
4. Report failure details
5. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 5 COMPLETION**

Upon completing Phase 5:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 6
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 6**

---

**End of Phase 5 Documentation**

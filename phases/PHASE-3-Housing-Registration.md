# Phase 3 — Housing Registration

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Implement the Housing Registration (Woning Registratie) component of Module B:
- Public registration intake for housing seekers
- Central waiting list management per district
- Urgency assessment and scoring
- Status tracking for citizens
- Preparation for allocation (Phase 4)

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `housing_registration` table |
| Database | Create `housing_registration_status_history` table |
| Database | Create `housing_urgency` table |
| Database | Create `public_status_access` table |
| Database | Create RLS policies for all Housing Registration tables |
| UI | Create Registration List page (Admin) |
| UI | Create Registration Detail page with tabs |
| UI | Create Urgency Assessment UI |
| UI | Create Waiting List view |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Modules | Bouwsubsidie modifications |
| Modules | Allocation tables or logic (Phase 4) |
| Shared Core | Modifications to Person/Household tables |
| UI | Public-facing wizard (deferred to Phase 5) |
| UI | Public status tracking page (deferred to Phase 5) |
| UI | Layout modifications |
| UI | SCSS changes |
| Integration | Edge Functions (none required) |

---

## D. Database Impact (DOCUMENTATION ONLY)

### Tables to Create

#### `housing_registration`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| reference_number | text | NO | - | WR-YYYY-NNNN format |
| household_id | uuid | NO | - | FK to household |
| applicant_person_id | uuid | NO | - | FK to person |
| district_code | text | NO | - | District identifier |
| current_status | text | NO | 'received' | Current status |
| registration_date | timestamptz | NO | now() | Date received |
| housing_type_preference | text | YES | - | Preferred housing type |
| urgency_score | integer | YES | - | Calculated score |
| waiting_list_position | integer | YES | - | Position in queue |
| assigned_officer_id | uuid | YES | - | Assigned officer |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update |

#### `housing_registration_status_history`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| registration_id | uuid | NO | - | FK to registration |
| from_status | text | YES | - | Previous status |
| to_status | text | NO | - | New status |
| changed_by | uuid | NO | - | Actor user ID |
| reason | text | YES | - | Reason for change |
| changed_at | timestamptz | NO | now() | Timestamp |

#### `housing_urgency`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| registration_id | uuid | NO | - | FK to registration |
| urgency_category | text | NO | - | Category code |
| urgency_points | integer | NO | - | Points for category |
| assessed_by | uuid | NO | - | Assessor user ID |
| assessment_date | timestamptz | NO | now() | Assessment time |
| justification | text | YES | - | Justification text |
| supporting_document_path | text | YES | - | Document reference |

#### `public_status_access`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| entity_type | text | NO | - | 'subsidy_case' or 'housing_registration' |
| entity_id | uuid | NO | - | FK to case or registration |
| reference_number | text | NO | - | Public reference |
| access_token_hash | text | NO | - | Hashed token |
| created_at | timestamptz | NO | now() | Creation timestamp |
| last_accessed_at | timestamptz | YES | - | Last access time |

### Status Model

```
received → under_review → urgency_assessed → waiting_list → 
matched → allocated → finalized
                    → rejected
```

### RLS Policy Matrix

| Table | Policy | Operation | Expression |
|-------|--------|-----------|------------|
| housing_registration | District users can read | SELECT | District match or national |
| housing_registration | Frontdesk can create | INSERT | Role = frontdesk |
| housing_registration | Authorized can update | UPDATE | Role-based |
| housing_urgency | Authorized users can assess | INSERT | Role check |
| housing_urgency | Assessments immutable | UPDATE | DENY all |
| public_status_access | Public can read own | SELECT | Token match |

---

## E. UI Impact (DOCUMENTATION ONLY)

### Admin Pages (Darkone 1:1)

| Page | Route | Description |
|------|-------|-------------|
| Registration List | `/admin/housing/registrations` | Filterable list |
| Registration Detail | `/admin/housing/registrations/:id` | Tabbed detail view |
| Waiting List | `/admin/housing/waiting-list` | District waiting list |

### Registration Detail Tabs

| Tab | Content |
|-----|---------|
| Overview | Registration summary, applicant, status |
| Urgency | Urgency assessment and scoring |
| History | Status transition timeline |
| Allocation | Future allocation info (Phase 4) |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| RegistrationList | `src/app/admin/housing/registrations/` | Registration listing |
| RegistrationDetail | `src/app/admin/housing/registrations/[id]/` | Detail view |
| UrgencyAssessment | `src/components/housing/` | Urgency form |
| WaitingListView | `src/app/admin/housing/waiting-list/` | Queue display |
| StatusTimeline | `src/components/housing/` | History display |

### Public UI

**NO PUBLIC UI IN PHASE 3** (deferred to Phase 5)

---

## F. Security & RLS Considerations

### Role-Based Access

| Role | Registration Access | Urgency Access | Waiting List |
|------|---------------------|----------------|--------------|
| Minister | Read all | Read all | Read all |
| Project Leader | Full access | Full access | Manage |
| Frontdesk | District CRUD | Read only | Read district |
| Admin Staff | District CRUD | Assess | Read district |
| Social Worker | District read | Read only | Read district |
| Audit | Read all | Read all | Read all |

### Urgency Assessment Immutability

- Urgency assessments are append-only
- Cannot modify existing assessments
- New assessments add to history
- Audit trail maintained

### Public Access (Phase 5 Preparation)

- `public_status_access` table prepared for citizen status tracking
- Access token is hashed (never stored plaintext)
- Rate limiting to be implemented in Phase 5

---

## G. Verification Criteria

### Database Verification

- [ ] All 4 Housing Registration tables created
- [ ] RLS enabled on all tables
- [ ] FORCE RLS applied on all tables
- [ ] Status transition validation works
- [ ] Urgency assessment append-only enforced

### UI Verification

- [ ] Registration list displays and filters
- [ ] Registration detail tabs work
- [ ] Urgency assessment form works
- [ ] Waiting list displays correctly
- [ ] Status timeline displays correctly
- [ ] Darkone 1:1 compliance verified

### Workflow Verification

- [ ] Complete registration flow works
- [ ] Urgency scoring calculates correctly
- [ ] Waiting list position updates
- [ ] All status transitions logged
- [ ] Audit events created for all actions

### Cross-Module Verification

- [ ] Person/Household shared correctly with Bouwsubsidie
- [ ] No data leakage between modules
- [ ] Status tracking table supports both modules

---

## H. Restore Point Definition

### Restore Point Name
`phase-3-complete`

### Restore Point Contents
- All Phase 3 database migrations applied
- All Phase 3 UI components created
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 3 fails verification:
1. Revert to `phase-2-complete`
2. Drop Phase 3 tables
3. Report failure details
4. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 3 COMPLETION**

Upon completing Phase 3:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 4
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 4**

---

**End of Phase 3 Documentation**

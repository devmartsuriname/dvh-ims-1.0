# Phase 1 — Shared Core

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** Documentation Only  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Build the shared data foundation used by both Bouwsubsidie and Woning Registratie & Allocatie modules:
- Create Person entity with full lifecycle
- Create Household entity with membership management
- Create Contact Point and Address entities
- Implement role-based access control
- Build Admin UI for Person/Household management

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `person` table |
| Database | Create `household` table |
| Database | Create `household_member` table |
| Database | Create `contact_point` table |
| Database | Create `address` table |
| Database | Add `role` column to `app_user_profile` |
| Database | Create RLS policies for all new tables |
| Database | Create audit triggers for status changes |
| UI | Create Person list page (Admin) |
| UI | Create Person detail page (Admin) |
| UI | Create Household list page (Admin) |
| UI | Create Household detail page (Admin) |
| UI | Create Household member management UI |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Modules | Bouwsubsidie tables or logic |
| Modules | Housing Registration tables or logic |
| Modules | Allocation tables or logic |
| UI | Public-facing pages |
| UI | Wizard components |
| UI | Layout modifications |
| UI | SCSS changes |
| Integration | Edge Functions |
| Integration | Storage buckets |
| Integration | External API integrations |

---

## D. Database Impact (DOCUMENTATION ONLY)

### Tables to Create

#### `person`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| national_id | text | NO | - | Unique national identifier |
| first_name | text | NO | - | First name |
| last_name | text | NO | - | Last name |
| date_of_birth | date | YES | - | Date of birth |
| gender | text | YES | - | Gender |
| nationality | text | YES | - | Nationality |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update timestamp |
| created_by | uuid | YES | - | Creating user |

#### `household`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| primary_person_id | uuid | NO | - | FK to person |
| household_size | integer | NO | 1 | Number of members |
| district_code | text | NO | - | District identifier |
| created_at | timestamptz | NO | now() | Creation timestamp |
| updated_at | timestamptz | NO | now() | Last update timestamp |

#### `household_member`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| household_id | uuid | NO | - | FK to household |
| person_id | uuid | NO | - | FK to person |
| relationship | text | NO | - | Relationship to primary |
| created_at | timestamptz | NO | now() | Creation timestamp |

#### `contact_point`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| person_id | uuid | NO | - | FK to person |
| contact_type | text | NO | - | phone/email/other |
| contact_value | text | NO | - | The contact value |
| is_primary | boolean | NO | false | Primary contact flag |
| created_at | timestamptz | NO | now() | Creation timestamp |

#### `address`
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| household_id | uuid | NO | - | FK to household |
| address_line_1 | text | NO | - | Street address |
| address_line_2 | text | YES | - | Additional address |
| district_code | text | NO | - | District code |
| is_current | boolean | NO | true | Current address flag |
| created_at | timestamptz | NO | now() | Creation timestamp |

### Modification to Existing Table

#### `app_user_profile` — Add Role Column
| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| role | text | YES | - | User role identifier |

### RLS Policy Matrix

| Table | Policy | Operation | Expression |
|-------|--------|-----------|------------|
| person | District users can read | SELECT | District match or national role |
| person | Authorized users can insert | INSERT | Role-based check |
| person | Authorized users can update | UPDATE | Role-based check |
| household | District users can read | SELECT | District match or national role |
| household | Authorized users can insert | INSERT | Role-based check |
| household | Authorized users can update | UPDATE | Role-based check |
| household_member | District users can read | SELECT | Via household district |
| contact_point | District users can read | SELECT | Via person access |
| address | District users can read | SELECT | Via household access |

---

## E. UI Impact (DOCUMENTATION ONLY)

### Admin Pages (Darkone 1:1)

| Page | Route | Description |
|------|-------|-------------|
| Person List | `/admin/persons` | Searchable, filterable list |
| Person Detail | `/admin/persons/:id` | View/edit person details |
| Household List | `/admin/households` | Searchable, filterable list |
| Household Detail | `/admin/households/:id` | View/edit with member management |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| PersonList | `src/app/admin/persons/` | Person list with search |
| PersonDetail | `src/app/admin/persons/[id]/` | Person detail view |
| HouseholdList | `src/app/admin/households/` | Household list with search |
| HouseholdDetail | `src/app/admin/households/[id]/` | Household detail view |
| HouseholdMemberForm | `src/components/shared/` | Add/edit household member |

### Public UI

**NO PUBLIC UI IN PHASE 1**

### Darkone 1:1 Compliance Statement

All new pages MUST use existing Darkone Admin components (tables, forms, cards, tabs). No custom styling or layout modifications.

---

## F. Security & RLS Considerations

### Role-Based Access

| Role | Person Access | Household Access |
|------|---------------|------------------|
| Minister | National (read) | National (read) |
| Project Leader | National (full) | National (full) |
| Frontdesk Officer | District (read/write) | District (read/write) |
| Administrative Staff | District (read/write) | District (read/write) |
| Social Field Worker | District (read) | District (read) |
| Technical Inspector | District (read) | District (read) |
| Audit | National (read) | National (read) |

### District Isolation

- Operational roles (Frontdesk, Admin Staff, Field Workers) are restricted to their assigned district
- District code stored in `app_user_profile.district_code`
- RLS policies filter by district match

### Audit Trail

- All create/update operations logged to `audit_event`
- Actor identification via `auth.uid()`
- Metadata includes changed fields

---

## G. Verification Criteria

### Database Verification

- [ ] All 5 new tables created
- [ ] RLS enabled on all tables
- [ ] FORCE RLS applied on all tables
- [ ] Foreign key constraints valid
- [ ] Role column added to `app_user_profile`
- [ ] Audit triggers functional

### UI Verification

- [ ] Person list displays correctly
- [ ] Person search works
- [ ] Person detail loads
- [ ] Person create/edit works
- [ ] Household list displays correctly
- [ ] Household search works
- [ ] Household detail loads
- [ ] Household member management works
- [ ] Darkone 1:1 compliance verified

### RLS Verification

- [ ] District users cannot access other districts
- [ ] National roles can access all districts
- [ ] Unauthorized operations are denied

### Cross-Module Verification

- [ ] Person/Household tables reusable by both modules
- [ ] No module-specific logic in shared tables

---

## H. Restore Point (Documentation Snapshot — no execution)

**IMPORTANT:** This phase does not authorize execution. This document is for planning and governance purposes only. Execution requires explicit written authorization from Delroy.

### Restore Point Name
`phase-1-complete`

### Restore Point Contents
- All Phase 1 database migrations applied
- All Phase 1 UI components created
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 1 fails verification:
1. Revert to `phase-0-complete`
2. Drop Phase 1 tables
3. Report failure details
4. Await remediation instructions

---

## I. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 1 COMPLETION**

Upon completing Phase 1:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 2
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 2**

---

**End of Phase 1 Documentation**

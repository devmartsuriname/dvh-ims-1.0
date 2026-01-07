# Phase 1 — Shared Core

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** APPROVED FOR EXECUTION  
**Authority:** Delroy (Final)

---

## A. Phase Objective

Build the shared data STRUCTURE used by both Bouwsubsidie and Woning Registratie & Allocatie modules:
- Create Person entity (structural only)
- Create Household entity (structural only)
- Create Contact Point and Address entities (structural only)
- Build Admin UI for Person/Household management
- **NO role system**
- **NO authorization logic**
- **NO district-based filtering**

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `person` table |
| Database | Create `household` table |
| Database | Create `household_member` table |
| Database | Create `contact_point` table |
| Database | Create `address` table |
| Database | Create RLS policies (allowlist model) |
| Database | Create audit triggers for changes |
| UI | Create Person list page (Admin) |
| UI | Create Person detail page (Admin) |
| UI | Create Household list page (Admin) |
| UI | Create Household detail page (Admin) |
| UI | Create Household member management UI |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Database | `app_role` enum |
| Database | `user_roles` table |
| Database | Role helper functions |
| Database | Role column on `app_user_profile` |
| Database | District-based RLS logic |
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

## D. Database Impact

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

---

## E. Security Model — Allowlist (Phase 1 ONLY)

### Temporary Allowlist Security

Phase 1 implements a **TEMPORARY allowlist model**:
- Access restricted to ONLY: `info@devmart.sr`
- No role system
- No district filtering
- JWT email claim validation

### RLS Implementation Pattern

For ALL Phase 1 tables:
1. RLS ENABLED
2. FORCE RLS ENABLED
3. Deny-all by default
4. Allow SELECT/INSERT/UPDATE only when JWT email = `info@devmart.sr`

### RLS Policy Pattern (Applied to All Tables)

```sql
-- Allowlist check using JWT email claim
CREATE POLICY "Allowlist users can read [table]"
ON public.[table] FOR SELECT
TO authenticated
USING (
  current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr'
);

CREATE POLICY "Allowlist users can insert [table]"
ON public.[table] FOR INSERT
TO authenticated
WITH CHECK (
  current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr'
);

CREATE POLICY "Allowlist users can update [table]"
ON public.[table] FOR UPDATE
TO authenticated
USING (
  current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr'
);
```

### DELETE Operations

DELETE is NOT permitted (audit-first governance).

### Authorization Note

**Role-based access control will be introduced in a LATER phase (to be specified and authorized separately).**

Phase 1 provides ONLY structural tables with allowlist access for the designated admin account.

---

## F. UI Impact

### Admin Pages (Darkone 1:1)

| Page | Route | Description |
|------|-------|-------------|
| Person List | `/persons` | Searchable, filterable list |
| Person Detail | `/persons/:id` | View/edit person details |
| Household List | `/households` | Searchable, filterable list |
| Household Detail | `/households/:id` | View/edit with member management |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| PersonList | `src/app/(admin)/persons/` | Person list with search |
| PersonDetail | `src/app/(admin)/persons/[id]/` | Person detail view |
| HouseholdList | `src/app/(admin)/households/` | Household list with search |
| HouseholdDetail | `src/app/(admin)/households/[id]/` | Household detail view |
| HouseholdMemberForm | `src/components/shared/` | Add/edit household member |

### Public UI

**NO PUBLIC UI IN PHASE 1**

### Darkone 1:1 Compliance Statement

All new pages MUST use existing Darkone Admin components (tables, forms, cards, tabs). No custom styling or layout modifications.

---

## G. Audit Trail

- All create/update operations logged to `audit_event`
- Actor identification via `auth.uid()`
- Metadata includes changed fields

---

## H. Verification Criteria

### Database Verification

- [ ] `person` table created with RLS + FORCE RLS
- [ ] `household` table created with RLS + FORCE RLS
- [ ] `household_member` table created with RLS + FORCE RLS
- [ ] `contact_point` table created with RLS + FORCE RLS
- [ ] `address` table created with RLS + FORCE RLS
- [ ] Foreign key constraints valid
- [ ] `updated_at` triggers functional
- [ ] Audit logging works

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

### RLS Verification (Allowlist)

- [ ] `info@devmart.sr` can perform CRUD on all tables
- [ ] Other authenticated users are DENIED access
- [ ] Unauthenticated requests are DENIED
- [ ] No role checks exist
- [ ] No district filtering exists

### Cross-Module Verification

- [ ] Person/Household tables reusable by both modules
- [ ] No module-specific logic in shared tables

---

## I. Admin Account Requirement

**MANDATORY:** The Supabase user `info@devmart.sr` must:
1. Exist in auth.users
2. Be able to sign in
3. Pass the allowlist RLS check

Verification: Confirm CRUD operations work for `info@devmart.sr` and are denied for other users.

---

## J. Restore Point

### Restore Point Name
`PHASE-1-COMPLETE`

### Restore Point Contents
- All Phase 1 database migrations applied
- All Phase 1 UI components created
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 1 fails verification:
1. Revert to `PHASE-0-COMPLETE`
2. Drop Phase 1 tables
3. Report failure details
4. Await remediation instructions

---

## K. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 1 COMPLETION**

Upon completing Phase 1:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 2
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 2**

---

**End of Phase 1 Documentation**

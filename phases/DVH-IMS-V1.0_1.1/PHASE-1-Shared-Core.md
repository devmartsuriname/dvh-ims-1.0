# Phase 1 — Shared Core

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** APPROVED FOR EXECUTION  
**Authority:** Delroy (Final)  
**Restore Point:** PHASE-1-DOCS-SNAPSHOT (Documentation Sync)

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

## B. Framework & Routing (Confirmed)

| Item | Value |
|------|-------|
| Framework | Vite + React SPA |
| Routing | React Router DOM v6 |
| Route Registration | `src/routes/index.tsx` |
| Menu Config | `src/assets/data/menu-items.ts` |
| Page Pattern | `page.tsx` in folder (Darkone convention) |
| UI Baseline | Darkone Admin 1:1 |

**Note:** This is NOT Next.js App Router. The `src/app/(admin)/` folder structure and `page.tsx` naming follows Darkone Admin conventions, not Next.js conventions.

---

## C. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Database | Create `person` table |
| Database | Create `household` table |
| Database | Create `household_member` table |
| Database | Create `contact_point` table |
| Database | Create `address` table |
| Database | Create RLS policies (allowlist model) |
| Database | Create audit triggers for changes |
| Database | Fix `audit_event` INSERT policy (allowlist) |
| UI | Create Person list page (Admin) |
| UI | Create Person detail page (Admin) |
| UI | Create Household list page (Admin) |
| UI | Create Household detail page (Admin) |
| UI | Create Household member management UI |

---

## D. Explicit Out of Scope (FORBIDDEN)

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
| UI | Custom SCSS changes |
| UI | New icon libraries |
| UI | Custom Bootstrap extensions |
| Integration | Edge Functions |
| Integration | Storage buckets |
| Integration | External API integrations |

---

## E. Database Impact

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

## F. Security Model — Allowlist (Phase 1 ONLY)

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

### Audit Event Policy (Allowlist)

The existing overly-permissive `audit_event` INSERT policy will be replaced:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can insert audit events" ON public.audit_event;

-- Create allowlist INSERT policy
CREATE POLICY "Allowlist users can insert audit_event"
ON public.audit_event FOR INSERT
TO authenticated
WITH CHECK (
  actor_user_id = auth.uid()
  AND current_setting('request.jwt.claims', true)::json->>'email' = 'info@devmart.sr'
);
```

**Notes:**
- Maintains actor_user_id validation (must match auth.uid())
- Adds allowlist email check
- SELECT remains denied (append-only)

### DELETE Operations

DELETE is NOT permitted (audit-first governance).

### Authorization Note

**Role-based access control will be introduced in a LATER phase (to be specified and authorized separately).**

Phase 1 provides ONLY structural tables with allowlist access for the designated admin account.

---

## G. Audit Trail

### Phase 1 Audit Model (Allowlist)

- All create/update operations logged to `audit_event` via application layer
- Actor identification via `auth.uid()`
- Audit INSERT restricted to `info@devmart.sr` only (allowlist)
- Audit SELECT denied (append-only, no read access)
- Metadata includes: entity_type, entity_id, action, changed fields

### Application Layer Audit Utility

**File:** `src/hooks/useAuditLog.ts`

Provides `logAuditEvent()` function for application-layer audit writes after successful CRUD operations on Person/Household entities.

---

## H. UI Impact

### Admin Pages (Darkone 1:1)

| Page | Route | Description |
|------|-------|-------------|
| Person List | `/persons` | Searchable, filterable list |
| Person Detail | `/persons/:id` | View/edit person details |
| Household List | `/households` | Searchable, filterable list |
| Household Detail | `/households/:id` | View/edit with member management |

### File Structure

```
src/app/(admin)/
├── persons/
│   ├── page.tsx                    (Person list page)
│   └── components/
│       ├── PersonTable.tsx         (Grid.js table component)
│       └── PersonFormModal.tsx     (Create/Edit modal)
├── persons/[id]/
│   └── page.tsx                    (Person detail page)
├── households/
│   ├── page.tsx                    (Household list page)
│   └── components/
│       ├── HouseholdTable.tsx      (Grid.js table component)
│       └── HouseholdFormModal.tsx  (Create/Edit modal)
└── households/[id]/
    └── page.tsx                    (Household detail with members)
```

### Route Registration

**File:** `src/routes/index.tsx`

```typescript
// Shared Core Routes
const PersonList = lazy(() => import('@/app/(admin)/persons/page'))
const PersonDetail = lazy(() => import('@/app/(admin)/persons/[id]/page'))
const HouseholdList = lazy(() => import('@/app/(admin)/households/page'))
const HouseholdDetail = lazy(() => import('@/app/(admin)/households/[id]/page'))

const sharedCoreRoutes: RoutesProps[] = [
  { path: '/persons', name: 'Persons', element: <PersonList /> },
  { path: '/persons/:id', name: 'Person Detail', element: <PersonDetail /> },
  { path: '/households', name: 'Households', element: <HouseholdList /> },
  { path: '/households/:id', name: 'Household Detail', element: <HouseholdDetail /> },
]
```

### Menu Configuration

**File:** `src/assets/data/menu-items.ts`

```typescript
{
  key: 'shared-core',
  label: 'SHARED CORE',
  isTitle: true,
},
{
  key: 'persons',
  label: 'Persons',
  icon: 'mingcute:user-4-line',   // DARKONE_ASSET_MAP verified
  url: '/persons',
},
{
  key: 'households',
  label: 'Households',
  icon: 'mingcute:home-4-line',   // DARKONE_ASSET_MAP verified
  url: '/households',
},
```

### DARKONE_ASSET_MAP Icon Compliance

| Menu Item | Icon Key | Source |
|-----------|----------|--------|
| Persons | `mingcute:user-4-line` | DARKONE_ASSET_MAP Section 2.2 |
| Households | `mingcute:home-4-line` | DARKONE_ASSET_MAP Section 2.2 |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| PersonList | `src/app/(admin)/persons/page.tsx` | Person list with search |
| PersonDetail | `src/app/(admin)/persons/[id]/page.tsx` | Person detail view |
| HouseholdList | `src/app/(admin)/households/page.tsx` | Household list with search |
| HouseholdDetail | `src/app/(admin)/households/[id]/page.tsx` | Household detail view |
| PersonTable | `src/app/(admin)/persons/components/PersonTable.tsx` | Grid.js table |
| PersonFormModal | `src/app/(admin)/persons/components/PersonFormModal.tsx` | Create/Edit modal |
| HouseholdTable | `src/app/(admin)/households/components/HouseholdTable.tsx` | Grid.js table |
| HouseholdFormModal | `src/app/(admin)/households/components/HouseholdFormModal.tsx` | Create/Edit modal |

### Darkone Component Baseline (Allowed)

**From react-bootstrap (Darkone baseline):**
- `Card`, `CardBody`, `CardHeader`, `CardTitle`
- `Row`, `Col`
- `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`
- `Button`
- `FormControl`, `FormSelect`, `FormLabel`, `FormGroup`

**From existing Darkone wrappers:**
- `PageTitle` (src/components/PageTitle.tsx)
- `IconifyIcon` (src/components/wrapper/IconifyIcon.tsx)
- `TextFormInput`, `TextAreaFormInput` (src/components/from/)

**From existing Darkone hooks:**
- `useToggle` (src/hooks/useToggle.ts)
- `useModal` (src/hooks/useModal.ts)

**From external libraries (Darkone baseline):**
- `Grid` from `gridjs-react`

### Public UI

**NO PUBLIC UI IN PHASE 1**

### Darkone 1:1 Compliance Statement

All new pages MUST use existing Darkone Admin components. No custom styling, no layout modifications, no new icon libraries.

---

## I. Verification Criteria

### Database Verification

- [ ] `person` table created with RLS + FORCE RLS
- [ ] `household` table created with RLS + FORCE RLS
- [ ] `household_member` table created with RLS + FORCE RLS
- [ ] `contact_point` table created with RLS + FORCE RLS
- [ ] `address` table created with RLS + FORCE RLS
- [ ] Foreign key constraints valid
- [ ] `updated_at` triggers functional
- [ ] `audit_event` INSERT policy is allowlist (info@devmart.sr only)

### RLS Verification (Allowlist)

- [ ] `info@devmart.sr` can SELECT/INSERT/UPDATE all Phase 1 tables
- [ ] `info@devmart.sr` can INSERT to `audit_event`
- [ ] Other authenticated users are DENIED access
- [ ] Unauthenticated requests are DENIED
- [ ] No role checks exist
- [ ] No district filtering exists

### UI Verification

- [ ] `/persons` route loads PersonList page
- [ ] `/persons/:id` route loads PersonDetail page
- [ ] `/households` route loads HouseholdList page
- [ ] `/households/:id` route loads HouseholdDetail page
- [ ] Menu shows Shared Core section with correct icons
- [ ] Person list displays correctly with search
- [ ] Person create/edit works with audit logging
- [ ] Person detail loads
- [ ] Household list displays correctly with search
- [ ] Household create/edit works with audit logging
- [ ] Household detail loads with member management
- [ ] Grid.js tables render with search/sort/pagination
- [ ] Modals use react-bootstrap Modal pattern
- [ ] Forms use TextFormInput pattern

### Guardian Rule Compliance

- [ ] Darkone 1:1 compliance verified
- [ ] NO custom CSS added
- [ ] NO new icon libraries added
- [ ] NO layout modifications
- [ ] DARKONE_ASSET_MAP icons only (mingcute:*)

### Cross-Module Verification

- [ ] Person/Household tables reusable by both modules
- [ ] No module-specific logic in shared tables

---

## J. Admin Account Requirement

**MANDATORY:** The Supabase user `info@devmart.sr` must:
1. Exist in auth.users
2. Be able to sign in
3. Pass the allowlist RLS check

Verification: Confirm CRUD operations work for `info@devmart.sr` and are denied for other users.

---

## K. Restore Points

### Documentation Snapshot
**Identifier:** `PHASE-1-DOCS-SNAPSHOT`  
**Type:** Documentation Sync  
**Contents:** Phase 1 plan with corrected framework/routing/UI structure

### Execution Restore Point
**Identifier:** `PHASE-1-COMPLETE`  
**Type:** Full Implementation  
**Contents:**
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

## L. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 1 COMPLETION**

Upon completing Phase 1:
1. Execute all verification criteria
2. Submit completion report in standard format
3. **STOP** — Do not proceed to Phase 2
4. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 2**

---

## M. Governance References

This phase document aligns with:
- `/docs/Master_PRD.md` — Section 12 (Phase Plan Reference)
- `/docs/Architecture_Security.md` — Section 13 (Devmart Governance)
- `/docs/Database_RLS.md` — Section 8 (Phased Implementation)
- `/docs/Execution_Plan.md` — Phase 1 definition and Section 9 (Phase Documentation Reference)

Guardian Rules are defined in:
- `/docs/Architecture_Security.md` — Section 11, Section 13.2
- Project Instructions (Custom Knowledge)

---

**End of Phase 1 Documentation**

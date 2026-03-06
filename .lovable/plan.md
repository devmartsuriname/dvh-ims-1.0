# DVH-IMS v1.8 — Final Execution Plan

## Scope Summary

4 changes to the Bouwsubsidie wizard. Housing Registration: i18n label updates only (no logic/structure changes).

---

## Phase 1: Terminology Update ("handicap" → "beperking")

**Files:** `src/i18n/locales/nl.json` only

**Changes (4 string replacements):**


| Line | Current NL text                                                              | New NL text                                                |
| ---- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 172  | `"disability": "Handicap of speciale medische behoeften"`                    | `"disability": "Beperking of speciale medische behoeften"` |
| 173  | `"disabilityDescription": "...heeft een handicap of medische aandoening..."` | `"...heeft een beperking of medische aandoening..."`       |
| 209  | `"labelDisability": "Handicap"`                                              | `"labelDisability": "Beperking"`                           |


These are under `housing.step7` and `housing.step8` keys. UI text only. No DB fields, no scoring logic, no component code changes.

**Risk:** None. Translation string update only.

---

## Phase 2: Remove "Werkloosheidsuitkering" from Housing Income Sources

**Files:**

- `src/app/(public)/housing/register/constants.ts` — remove the `unemployment` entry from `INCOME_SOURCES` array (line 45)
- `src/i18n/locales/nl.json` — remove `"unemployment": "Werkloosheidsuitkering"` (line 256)
- `src/i18n/locales/en.json` — remove corresponding English key if present

**Impact:** Housing wizard income dropdown loses one option. No DB column references this value. No logic depends on it. Existing records with `income_source = 'unemployment'` remain in DB but are display-only in admin.

**Risk:** Low. Verify admin detail views handle unknown/legacy income source values gracefully (they already use fallback-to-raw-value pattern).

---

## Phase 3: Remove "(indien van toepassing)" from Housing Step 0

**File:** `src/i18n/locales/nl.json` line 103

**Current:** `"requirement4": "Inkomensgegevens (indien van toepassing)"`
**New:** `"requirement4": "Inkomensgegevens"`

**Risk:** None. Label text only.

---

## Phase 4: Household Children Table (Bouwsubsidie Step 3)

### 4A: Database Migration

Add 3 nullable columns to `household_member`:

```sql
ALTER TABLE public.household_member 
  ADD COLUMN gender text,
  ADD COLUMN age integer,
  ADD COLUMN has_disability boolean DEFAULT false;
```

No new table. No RLS changes needed (existing policies on `household_member` cover these columns). Children will use `relationship = 'child'`.

### 4B: Form Data Type Update

**File:** `src/app/(public)/bouwsubsidie/apply/types.ts`

Add to `BouwsubsidieFormData`:

```typescript
children: Array<{
  gender: string    // 'M' | 'V'
  age: number
  has_disability: boolean
}>
```

### 4C: Wizard UI (Step3Household.tsx)

Below existing household_size/dependents fields, add a dynamic children table:

- "Kind toevoegen" button adds a row
- Each row: gender select (M/V), age number input, disability checkbox
- Remove button per row
- Maximum rows = dependents value (or 20 cap)

### 4D: Constants Update

**File:** `src/app/(public)/bouwsubsidie/apply/constants.ts`

Add `children: []` to `INITIAL_FORM_DATA`.

### 4E: Review Step Update

**File:** `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx`

Add children table summary in Household section card showing gender, age, disability per child.

### 4F: Edge Function Update

**File:** `supabase/functions/submit-bouwsubsidie-application/index.ts`

After creating the head-of-household `household_member`, iterate over `children` array and insert each as:

```typescript
{
  household_id: householdId,
  person_id: personId,  // linked to applicant's person record
  relationship: 'child',
  gender: child.gender,
  age: child.age,
  has_disability: child.has_disability
}
```

Note: Children don't get their own `person` record — they are lightweight demographic entries on the household. The `person_id` references the applicant (head of household) as the responsible parent.

### 4G: Admin Detail View

The admin case detail already displays household members. New columns (`gender`, `age`, `has_disability`) will be added to the household members display section. No structural admin changes.

---

## Phase 5: Document Requirements Expansion (Bouwsubsidie)

### 5A: Update Config

**File:** `src/config/documentRequirements.ts`

Replace `BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS` with expanded categorized list. Add `category` field to `DocumentRequirementConfig`:

```typescript
export interface DocumentRequirementConfig {
  document_code: string
  document_name: string
  is_mandatory: boolean
  category: string  // NEW
}
```

**New document list (1 mandatory + rest optional per category):**


| Category  | Code                   | Name                              | Mandatory |
| --------- | ---------------------- | --------------------------------- | --------- |
| identity  | `ID_COPY`              | Kopie ID-kaart                    | Yes       |
| income    | `PAYSLIP`              | Loonstrook                        | No        |
| income    | `AOV_STATEMENT`        | AOV-verklaring                    | No        |
| income    | `PENSION_STATEMENT`    | Pensioenverklaring                | No        |
| income    | `EMPLOYER_DECLARATION` | Werkgeversverklaring              | No        |
| financial | `BANK_STATEMENT`       | Bankafschrift (laatste 3 maanden) | Yes       |
| property  | `PROPERTY_DEED`        | Grondbewijs / eigendomsbewijs     | Yes       |
| property  | `GLIS_EXTRACT`         | GLIS-uittreksel                   | No        |
| property  | `PARCEL_MAP`           | Perceelkaart                      | No        |
| legal     | `NOTARIAL_DEED`        | Notariële akte                    | No        |
| legal     | `PURCHASE_AGREEMENT`   | Koopovereenkomst                  | No        |
| special   | `ESTATE_PERMISSION`    | Boedelgrondverklaring             | No        |
| special   | `MORTGAGE_EXTRACT`     | Hypotheekuittreksel               | No        |
| special   | `VILLAGE_AUTHORITY`    | Verklaring dorpshoofd             | No        |


**Removed:** `HOUSEHOLD_COMP` (wizard collects this), `FAMILY_EXTRACT` (Gezinuittreksel), `CBB_EXTRACT`
**Kept mandatory:** `ID_COPY`, `BANK_STATEMENT`, `PROPERTY_DEED` (3 mandatory)
**Income proof:** Split into 4 specific sub-types (all optional — applicant uploads whichever applies)

### 5B: Update DocumentUploadAccordion

Modify `DocumentUploadAccordion.tsx` to group by `category` instead of just mandatory/optional tabs. Each category becomes an accordion section header. Within each category, documents are listed with mandatory/optional badges.

### 5C: DB Insert — subsidy_document_requirement

Insert new document requirement rows into `subsidy_document_requirement` table. Soft-deprecate removed rows via `is_active = false`.

### 5D: i18n Keys

Add NL/EN translation keys for all new document names under `bouwsubsidie.documents.*` namespace.

### 5E: Admin Verification

Admin case detail reads from `subsidy_document_requirement` joined with `subsidy_document_upload`. New document types auto-appear in the verification panel. No admin code changes needed — the panel iterates over requirements dynamically.

---

## Phase 6: Housing Document Config (HOUSING_DOCUMENT_REQUIREMENTS)

**No changes.** Housing document requirements remain untouched.

---

## Deployment Sequence

1. Create restore point
2. Phase 1: nl.json terminology update
3. Phase 2: Remove werkloosheidsuitkering
4. Phase 3: Remove "(indien van toepassing)"
5. Phase 4A: DB migration (household_member columns)
6. Phase 4B-E: Wizard type/UI/review changes
7. Phase 5A-D: Document config expansion + UI grouping
8. Phase 4F: Edge function update + deploy
9. Phase 5C: DB insert new document requirements
10. Phase 4G + 5E: Admin display adjustments
11. Hard stop — verification checklist

---

## System Integrity Confirmation


| Component                   | Impact                              |
| --------------------------- | ----------------------------------- |
| Housing Registration wizard | i18n label changes only (3 strings) |
| Housing waiting list        | None                                |
| Allocation engine           | None                                |
| Audit logging               | None                                |
| Status lifecycle            | None                                |
| RLS policies                | None                                |
| Existing dossier records    | None (new columns are nullable)     |


---

## NOTE — Required Corrections Before Implementation

1. Household children storage

Do NOT reuse the applicant’s `person_id` for child rows in `household_member`.

That would create incorrect duplicate member rows pointing to the same person.

Before implementation, first inspect the actual DB constraints on `household_member.person_id` and present the safest storage approach:

- either allow child demographic rows without creating a separate person record,

- or create a dedicated lightweight child structure,

- or explicitly confirm that `person_id` may be nullable and use `relationship = 'child'` with child demographic fields only.

Do not implement child rows by linking all children to the applicant’s `person_id`.

2. Temporary v1.8 document requirement rule

Because dynamic rules are deferred, do NOT make `PROPERTY_DEED` universally mandatory.

That would incorrectly block applicants in cases such as estate / village / other legal situations.

Also, income proof must not be fully optional.

For v1.8, implement this temporary validation rule:

- Mandatory:

  - `ID_COPY`

  - `BANK_STATEMENT` (last 3 months)

  - at least ONE income proof from:

    - `PAYSLIP`

    - `AOV_STATEMENT`

    - `PENSION_STATEMENT`

    - `EMPLOYER_DECLARATION`

- Visible but not universally mandatory:

  - `PROPERTY_DEED`

  - `GLIS_EXTRACT`

  - `PARCEL_MAP`

  - `NOTARIAL_DEED`

  - `PURCHASE_AGREEMENT`

  - `ESTATE_PERMISSION`

  - `MORTGAGE_EXTRACT`

  - `VILLAGE_AUTHORITY`

Present the adjusted validation approach in the implementation report before coding.

3. Approval condition

Proceed only after confirming:

- the corrected child storage model

- the corrected temporary v1.8 document validation rule  
Risk Summary


| Change                       | Risk   | Mitigation                              |
| ---------------------------- | ------ | --------------------------------------- |
| household_member ALTER TABLE | Medium | Nullable columns, no constraint changes |
| Edge function deploy         | Medium | New fields are optional in payload      |
| Document config expansion    | Low    | Static config, no dynamic rules         |
| i18n updates                 | None   | Text only                               |


Awaiting authorization to begin implementation.
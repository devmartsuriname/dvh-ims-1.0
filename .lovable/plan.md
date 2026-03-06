# DVH-IMS v1.8 — Corrected Final Execution Plan

## Scope Summary

**Bouwsubsidie wizard changes ONLY.** Two workstreams:

1. Household children table (new dedicated DB table + wizard UI)
2. Document requirements expansion (categorized, with group-mandatory validation)

**Housing Registration = NO CHANGES. Zero files touched.**

---

## 1. Database Migration

### 1A: Create `subsidy_household_child` table

```sql
CREATE TABLE public.subsidy_household_child (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_case_id uuid NOT NULL REFERENCES public.subsidy_case(id) ON DELETE CASCADE,
  gender text NOT NULL CHECK (gender IN ('M', 'V')),
  age integer NOT NULL CHECK (age >= 0 AND age <= 25),
  has_disability boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subsidy_household_child ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT — mirrors social_report pattern
CREATE POLICY "role_select_subsidy_household_child" ON public.subsidy_household_child
  FOR SELECT TO authenticated
  USING (
    is_national_role(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.subsidy_case sc
      WHERE sc.id = subsidy_household_child.subsidy_case_id
        AND (
          has_role(auth.uid(), 'frontdesk_bouwsubsidie')
          OR has_role(auth.uid(), 'admin_staff')
        )
        AND sc.district_code = get_user_district(auth.uid())
    )
  );

-- RLS: INSERT — same pattern
CREATE POLICY "role_insert_subsidy_household_child" ON public.subsidy_household_child
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'system_admin')
    OR has_role(auth.uid(), 'project_leader')
    OR EXISTS (
      SELECT 1 FROM public.subsidy_case sc
      WHERE sc.id = subsidy_household_child.subsidy_case_id
        AND (
          has_role(auth.uid(), 'frontdesk_bouwsubsidie')
          OR has_role(auth.uid(), 'admin_staff')
        )
        AND sc.district_code = get_user_district(auth.uid())
    )
  );

-- No UPDATE or DELETE — immutable once submitted
```

No changes to `household_member` table. No nullable columns. No constraint changes.

### 1B: Insert new document requirements into `subsidy_document_requirement`

Soft-deprecate removed rows (`HOUSEHOLD_COMP`, `FAMILY_EXTRACT`, `CBB_EXTRACT`, `INCOME_PROOF`, `LAND_TITLE`) and insert new expanded rows. Exact SQL via insert tool at implementation time.

---

## 2. Config / Document Requirements Update

**File:** `src/config/documentRequirements.ts`

- Add `category` field to `DocumentRequirementConfig`
- Add `validation_group` optional field for group-mandatory logic
- Replace `BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS` with expanded categorized list:


| Category  | Code                   | Name                              | Mandatory | Group          |
| --------- | ---------------------- | --------------------------------- | --------- | -------------- |
| identity  | `ID_COPY`              | Kopie ID-kaart                    | Yes       | —              |
| income    | `PAYSLIP`              | Loonstrook                        | No        | `income_proof` |
| income    | `AOV_STATEMENT`        | AOV-verklaring                    | No        | `income_proof` |
| income    | `PENSION_STATEMENT`    | Pensioenverklaring                | No        | `income_proof` |
| income    | `EMPLOYER_DECLARATION` | Werkgeversverklaring              | No        | `income_proof` |
| financial | `BANK_STATEMENT`       | Bankafschrift (laatste 3 maanden) | Yes       | —              |
| property  | `PROPERTY_DEED`        | Grondbewijs / eigendomsbewijs     | No        | —              |
| property  | `GLIS_EXTRACT`         | GLIS-uittreksel                   | No        | —              |
| property  | `PARCEL_MAP`           | Perceelkaart                      | No        | —              |
| legal     | `NOTARIAL_DEED`        | Notariële akte                    | No        | —              |
| legal     | `PURCHASE_AGREEMENT`   | Koopovereenkomst                  | No        | —              |
| special   | `ESTATE_PERMISSION`    | Boedelgrondverklaring             | No        | —              |
| special   | `MORTGAGE_EXTRACT`     | Hypotheekuittreksel               | No        | —              |
| special   | `VILLAGE_AUTHORITY`    | Verklaring dorpshoofd             | No        | —              |


**Removed:** `HOUSEHOLD_COMP`, `FAMILY_EXTRACT`, `CBB_EXTRACT`, `INCOME_PROOF`, `LAND_TITLE`

`**HOUSING_DOCUMENT_REQUIREMENTS` — NO CHANGES.**

---

## 3. Wizard UI Updates (Bouwsubsidie only)

### 3A: Types (`types.ts`)

Add `children` array to `BouwsubsidieFormData`:

```typescript
children: Array<{ gender: 'M' | 'V'; age: number; has_disability: boolean }>
```

Add `category` and `validation_group` to `DocumentUpload` interface.

### 3B: Constants (`constants.ts`)

- Add `children: []` to `INITIAL_FORM_DATA`
- `REQUIRED_DOCUMENTS` mapping updated to include `category` and `validation_group` from config

### 3C: Step3Household.tsx

- Add dynamic children table below existing fields
- Each row: gender select (M/V), age number input, disability checkbox, remove button
- "Kind toevoegen" button to add rows
- Maximum 20 rows

### 3D: Step6Documents.tsx

- Update validation: block "Next" unless:
  - All `is_mandatory` docs uploaded (ID_COPY, BANK_STATEMENT)
  - At least one doc from `validation_group === 'income_proof'` uploaded
- Show group-mandatory indicator for income category

### 3E: DocumentUploadAccordion.tsx

- Add `category` grouping mode: group documents by category with section headers
- Keep existing mandatory/optional tab structure but organize within tabs by category
- Add "at least one required" badge for income group

### 3F: Step7Review.tsx

- Add children summary table in Household section (gender, age, disability per child)
- Update documents section to reflect new category grouping

### 3G: i18n keys

- Add NL/EN translations for all new document names under `bouwsubsidie.documents.*`
- Add children-related labels: "Kind toevoegen", "Geslacht", "Leeftijd", "Beperking"
- Add category labels: "Identiteit", "Inkomen", "Financieel", "Eigendom", "Juridisch", "Bijzondere situaties"

---

## 4. Edge Function Update

**File:** `supabase/functions/submit-bouwsubsidie-application/index.ts`

- Add `children` to `BouwsubsidieInput` interface (optional array)
- After `subsidy_case` creation (line 402), insert children into `subsidy_household_child`:
  ```typescript
  if (input.children && input.children.length > 0) {
    for (let i = 0; i < input.children.length; i++) {
      await supabase.from('subsidy_household_child').insert({
        subsidy_case_id: caseId,
        gender: input.children[i].gender,
        age: input.children[i].age,
        has_disability: input.children[i].has_disability,
        sort_order: i,
      })
    }
  }
  ```
- Update audit metadata to include `children_count`
- No changes to existing household_member insertion logic

---

## 5. Admin UI Updates

**File:** `src/app/(admin)/subsidy-cases/[id]/page.tsx`

- Add query for `subsidy_household_child` by `subsidy_case_id`
- Display children table in case detail (Overview tab, below household info): Gender, Age, Disability
- New document requirement rows auto-appear in existing document verification panel (reads from `subsidy_document_requirement` table dynamically)

---

## 6. Deployment Sequence

1. Create restore point
2. DB migration: create `subsidy_household_child` table + RLS
3. DB data: insert new document requirement rows, soft-deprecate removed ones
4. Update `documentRequirements.ts` config (add category, new docs, remove old)
5. Update types + constants (children array, category fields)
6. Update Step3Household (children table UI)
7. Update DocumentUploadAccordion (category grouping)
8. Update Step6Documents (group-mandatory validation)
9. Update Step7Review (children + categorized docs summary)
10. Update i18n keys (NL + EN)
11. Update edge function (children insert)
12. Update admin case detail (children display)
13. Hard stop — verification checklist

---

## 7. Verification Checklist


| Item                                                  | Check                                                |
| ----------------------------------------------------- | ---------------------------------------------------- |
| Housing Registration wizard unchanged                 | Verify zero file changes in `housing/register/`      |
| Housing i18n keys unchanged                           | Verify `housing.*` keys in nl.json/en.json untouched |
| `household_member` table unchanged                    | No migration, no column changes                      |
| `subsidy_household_child` table created with RLS      | DB verification                                      |
| Children render in wizard Step3 (add/remove)          | Manual UI test                                       |
| Children saved to `subsidy_household_child` on submit | Edge function log verification                       |
| Children display in admin case detail                 | Manual UI test                                       |
| Document categories render in Step6                   | Manual UI test                                       |
| Group-mandatory income validation works               | Try submitting without income doc                    |
| Mandatory docs (ID_COPY, BANK_STATEMENT) block Next   | Manual UI test                                       |
| New docs appear in admin verification panel           | Manual UI test                                       |
| No code changes outside Bouwsubsidie scope            | File diff verification                               |


---

## NOTE — Final confirmation required before approval

Your corrected final execution plan is structurally acceptable:

- Bouwsubsidie only

- Housing Registration unchanged

- dedicated `subsidy_household_child` table

- grouped document requirements

- no `household_member` mutation

However, one document-code mapping issue must be corrected before approval.

Please verify the exact existing Bouwsubsidie requirement codes in the current DB/config before soft-deprecating rows.

In your plan you listed removed rows:

- `HOUSEHOLD_COMP`

- `FAMILY_EXTRACT`

- `CBB_EXTRACT`

- `INCOME_PROOF`

- `LAND_TITLE`

But the current Bouwsubsidie documentation uses:

- `HOUSEHOLD_COMPOSITION`

- `INCOME_DECLARATION`

- `LAND_TITLE`

- `CBB_EXTRACT`

- `FAMILY_EXTRACT`

So before implementation:

1. confirm the exact current Bouwsubsidie document codes from both:

   - `src/config/documentRequirements.ts`

   - `subsidy_document_requirement` table

2. update the migration plan so the deprecated codes match the real existing subsidy codes exactly

3. explicitly confirm that no Housing document codes are touched

If this code-mapping correction is confirmed, the plan can be approved.  
Explicit Boundary Statement

**Housing Registration = NO CHANGES.** No files in `src/app/(public)/housing/`, no Housing i18n keys, no Housing constants, no Housing edge function, no Housing document requirements are modified in this plan.
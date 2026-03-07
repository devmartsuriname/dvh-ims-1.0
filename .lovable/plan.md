# Phase 5 — Household Children Capture & Case Integration

## Restore Point

Create `restore-points/v1.0/RESTORE_POINT_PHASE_5_V1_8_START.md` before any changes.

## Critical Schema Mismatch

The `subsidy_household_child` table has columns: `age`, `gender`, `has_disability`, `sort_order`, `subsidy_case_id`. It does **NOT** have `first_name`, `last_name`, or `birth_date`.

The task spec requests capturing `first_name`, `last_name`, `birth_date` per child. This conflicts with the existing DB schema and the V1.8 architecture decision (memory: `v1-8-child-storage-architecture`) which states children are "lightweight demographic entries rather than full person records."

**Resolution:** Align implementation with the existing DB schema. The wizard will collect `age`, `gender`, `has_disability` per child — not names or birth dates. This preserves the approved architecture.

If the spec must be followed literally (names + birth_date), a migration adding those columns is required. **Awaiting confirmation on which approach to use.**

Proceeding with existing schema assumption (age/gender/disability only).

## Scope — 5 Files + Restore Point

### 1. `types.ts` — Add ChildInput type

```typescript
export interface ChildInput {
  age: number
  gender: 'M' | 'F'
  has_disability: boolean
}
```

Add `children: ChildInput[]` to `BouwsubsidieFormData` (Step 3 section).

### 2. `constants.ts` — Add children to INITIAL_FORM_DATA

Add `children: []` to `INITIAL_FORM_DATA`.

### 3. `Step3Household.tsx` — Dynamic children table

Add below existing household_size/dependents fields:

- "Household Children" section header
- Dynamic rows: age (number input), gender (select M/F), has_disability (checkbox)
- Add/Remove buttons
- Children array managed via local state, synced to formData on submit
- No minimum rows required (0 children is valid)

### 4. `Step7Review.tsx` — Children summary section

After the existing Household section, add:

- "Household Children" SectionCard
- If children exist: list each with "Child 1 — age X, M/F, (disability)" format
- If no children: "No children registered in this household."

### 5. Edge Function — Persist children

In `submit-bouwsubsidie-application/index.ts`, after case creation (after line ~518):

- Loop through `input.children` array
- Insert each into `subsidy_household_child` with `subsidy_case_id`, `age`, `gender`, `has_disability`, `sort_order`
- Add `children_count` to existing audit metadata (line ~535)

Add `children` to `BouwsubsidieInput` interface.

### 6. Admin Case Detail — Children display

In `src/app/(admin)/subsidy-cases/[id]/page.tsx`:

- Fetch `subsidy_household_child` where `subsidy_case_id = id` in `fetchCase`
- Add state for children array
- Add a "Household Children" section in the Overview tab (after household info)
- Display table: # | Age | Gender | Disability
- If no children: "No children registered."

### 7. i18n Keys

Add to both `nl.json` and `en.json`:

- `bouwsubsidie.step3.childrenTitle`
- `bouwsubsidie.step3.addChild` / `removeChild`
- `bouwsubsidie.step3.childAge` / `childGender` / `childDisability`
- `bouwsubsidie.step3.noChildren`
- `bouwsubsidie.step7.sectionChildren`
- `bouwsubsidie.step7.noChildren`
- `bouwsubsidie.step7.childDisabilityYes`

## Files Affected


| File                                                           | Change                            |
| -------------------------------------------------------------- | --------------------------------- |
| `src/app/(public)/bouwsubsidie/apply/types.ts`                 | Add ChildInput + children field   |
| `src/app/(public)/bouwsubsidie/apply/constants.ts`             | Add children to INITIAL_FORM_DATA |
| `src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx` | Dynamic children UI               |
| `src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx`    | Children summary                  |
| `supabase/functions/submit-bouwsubsidie-application/index.ts`  | Persist children + audit metadata |
| `src/app/(admin)/subsidy-cases/[id]/page.tsx`                  | Children display in admin         |
| `src/i18n/locales/nl.json`                                     | i18n keys                         |
| `src/i18n/locales/en.json`                                     | i18n keys                         |
| `restore-points/v1.0/RESTORE_POINT_PHASE_5_V1_8_START.md`      | Restore point                     |


## NOTE — Scope confirmation before implementation

Proceed with Option A only.

Confirmed child data scope for Phase 5:

- age

- gender

- has_disability

Do NOT add:

- first_name

- last_name

- birth_date

Reason:

This phase must align with the existing approved `subsidy_household_child` schema and the lightweight child-storage architecture already established in v1.8.

So implementation may proceed only with:

- Step 3 dynamic children rows using age / gender / disability

- Step 7 summary using age / gender / disability

- edge function inserts into `subsidy_household_child`

- admin case detail display from `subsidy_household_child`

No new migration is authorized in this phase.  
What This Does NOT Touch

- Housing Registration — zero files
- `household_member` table — zero changes
- Document requirements config — zero changes
- Submission persistence logic (case/docs) — unchanged, children added after
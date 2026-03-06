# Phase 2 — Corrected Scope: Config + Step 6 Validation + Types

## Correction Applied

Phase 2 is **functional**, not scaffolding. The config replacement directly drives Step 6 UI and validation. Therefore this phase includes the `validation_group` enforcement in Step 6 to prevent submission without income proof.

## Scope

1. `**src/config/documentRequirements.ts**` — extend interface, replace Bouwsubsidie array, add helpers
2. `**src/app/(public)/bouwsubsidie/apply/types.ts**` — add `category` and `validation_group` to `DocumentUpload`
3. `**src/app/(public)/bouwsubsidie/apply/constants.ts**` — pass `category` and `validation_group` through mapping
4. `**src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx**` — add group-mandatory validation
5. `**src/components/public/DocumentUploadAccordion.tsx**` — add group-mandatory badge for income docs

**NO admin changes. NO Housing changes.**

---

## 1. `documentRequirements.ts`

- Add `category?: string` and `validation_group?: string` to `DocumentRequirementConfig`
- Replace `BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS` with 14 active docs (as approved)
- Add `BOUWSUBSIDIE_DOCUMENT_CATEGORIES` and `BOUWSUBSIDIE_INCOME_GROUP` exports
- `HOUSING_DOCUMENT_REQUIREMENTS` unchanged

## 2. `types.ts`

Add to `DocumentUpload`:

```typescript
category?: string
validation_group?: string
```

## 3. `constants.ts`

Update mapping to pass through new fields:

```typescript
export const REQUIRED_DOCUMENTS: Omit<DocumentUpload, 'uploaded_file'>[] =
  BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS.map(req => ({
    id: req.document_code,
    document_code: req.document_code,
    label: `bouwsubsidie.documents.${req.document_code}`,
    is_mandatory: req.is_mandatory,
    category: req.category,
    validation_group: req.validation_group,
  }))
```

## 4. `Step6Documents.tsx` — Validation Logic Change

Current validation (line ~29):

```typescript
const allMandatoryUploaded = uploadedMandatoryCount === mandatoryDocs.length
```

This only checks `is_mandatory`. After config update, only `ID_COPY` and `BANK_STATEMENT` are mandatory — income docs would be skippable.

**Fix:** Add group-mandatory check:

```typescript
// Existing mandatory check
const allMandatoryUploaded = uploadedMandatoryCount === mandatoryDocs.length

// NEW: Group-mandatory check — at least 1 income_proof doc uploaded
const incomeGroupDocs = formData.documents.filter(d => d.validation_group === 'income_proof')
const hasIncomeProof = incomeGroupDocs.some(d => d.uploaded_file)

// Combined gate
const canProceed = allMandatoryUploaded && hasIncomeProof
```

Replace `nextDisabled={!allMandatoryUploaded}` with `nextDisabled={!canProceed}`.

Add warning message when income proof is missing (similar to existing mandatory warning).

## 5. `DocumentUploadAccordion.tsx` — Group Badge

Add a `validation_group` field to `DocumentItem` interface. For docs with `validation_group`, show a distinct badge: "1 vereist" / "1 required" instead of "optional", using `info` color. This makes it clear to citizens that the income category needs at least one upload.

The tab split changes:

- **Mandatory tab**: `is_mandatory === true` docs (ID_COPY, BANK_STATEMENT)
- **Optional tab**: all other docs, but income group docs show the "1 required" badge

## 6. i18n Keys Required

Under `bouwsubsidie.documents.*`:

- `PAYSLIP`, `AOV_STATEMENT`, `PENSION_STATEMENT`, `EMPLOYER_DECLARATION`
- `PROPERTY_DEED`, `GLIS_EXTRACT`, `PARCEL_MAP`
- `NOTARIAL_DEED`, `PURCHASE_AGREEMENT`
- `ESTATE_PERMISSION`, `MORTGAGE_EXTRACT`, `VILLAGE_AUTHORITY`

Under `bouwsubsidie.step6.*`:

- `incomeProofMissing` — "Upload minimaal één inkomensbewijs"
- `groupRequired` — "Minimaal 1 vereist" / "At least 1 required"

---

## Validation Behavior After Phase 2


| Condition                                         | Can Proceed? |
| ------------------------------------------------- | ------------ |
| ID_COPY + BANK_STATEMENT uploaded, no income doc  | NO           |
| ID_COPY + BANK_STATEMENT + PAYSLIP uploaded       | YES          |
| ID_COPY + BANK_STATEMENT + AOV_STATEMENT uploaded | YES          |
| Only ID_COPY uploaded                             | NO           |


## NOTE — Approved for Phase 2

Proceed with Phase 2 as documented.

During implementation, verify explicitly in the completion report that:

1. Step 6 blocks progression when no `income_proof` document is uploaded

2. Step 6 allows progression when at least one of

   - PAYSLIP

   - AOV_STATEMENT

   - PENSION_STATEMENT

   - EMPLOYER_DECLARATION

   is uploaded

3. Housing Registration files and i18n remain untouched

4. No admin files were changed in this phase  
What This Does NOT Touch

- Housing Registration wizard — zero files changed
- Housing i18n keys — zero changes
- Admin case detail views — zero changes (Phase 5 per plan)
- `household_member` table — zero changes
- Edge function — zero changes (Phase 4 per plan)
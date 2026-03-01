# DVH-IMS v1.7.x — Phase 8: Wizard Constants Refactor

## Objective

Eliminate duplicated `REQUIRED_DOCUMENTS` arrays in both wizard `constants.ts` files. Derive them from the shared config in `src/config/documentRequirements.ts`.

## Analysis: Before State

### Shared Config (`src/config/documentRequirements.ts`)

- Shape: `{ document_code, document_name, is_mandatory }`
- Bouwsubsidie: 7 items (5 mandatory, 2 optional)
- Housing: 6 items (3 mandatory, 3 optional)

### Wizard Constants (local `REQUIRED_DOCUMENTS`)

- Shape: `{ id, document_code, label, is_mandatory }` (typed as `Omit<DocumentUpload, 'uploaded_file'>`)
- `id` = same as `document_code`
- `label` = i18n key (e.g., `bouwsubsidie.documents.ID_COPY`)
- `document_code` and `is_mandatory` = identical to shared config

### Gap

Shared config has `document_name` (display string). Wizards need `label` (i18n key). A mapping function is required.

## Code Parity Verification


| document_code  | Shared Config is_mandatory | Bouwsubsidie Wizard is_mandatory | Match |
| -------------- | -------------------------- | -------------------------------- | ----- |
| ID_COPY        | true                       | true                             | YES   |
| INCOME_PROOF   | true                       | true                             | YES   |
| LAND_TITLE     | true                       | true                             | YES   |
| BANK_STATEMENT | true                       | true                             | YES   |
| HOUSEHOLD_COMP | true                       | true                             | YES   |
| CBB_EXTRACT    | false                      | false                            | YES   |
| FAMILY_EXTRACT | false                      | false                            | YES   |



| document_code      | Shared Config is_mandatory | Housing Wizard is_mandatory | Match |
| ------------------ | -------------------------- | --------------------------- | ----- |
| ID_COPY            | true                       | true                        | YES   |
| INCOME_PROOF       | true                       | true                        | YES   |
| RESIDENCE_PROOF    | true                       | true                        | YES   |
| FAMILY_COMPOSITION | false                      | false                       | YES   |
| MEDICAL_CERT       | false                      | false                       | YES   |
| EMERGENCY_PROOF    | false                      | false                       | YES   |


Full parity confirmed. Safe to refactor.

## Implementation

### Step 1: Add helper function to shared config

Add to `src/config/documentRequirements.ts`:

```text
/**
 * Convert shared config to wizard DocumentUpload format
 * Maps document_code to i18n label key using a prefix convention
 */
export function toWizardDocuments(
  requirements: DocumentRequirementConfig[],
  i18nPrefix: string
): Array<{ id: string; document_code: string; label: string; is_mandatory: boolean }> {
  return requirements.map(req => ({
    id: req.document_code,
    document_code: req.document_code,
    label: `${i18nPrefix}.${req.document_code}`,
    is_mandatory: req.is_mandatory,
  }))
}
```

### Step 2: Refactor Bouwsubsidie constants

In `src/app/(public)/bouwsubsidie/apply/constants.ts`:

- Remove the local `REQUIRED_DOCUMENTS` array (lines 27-43)
- Import and derive:

```text
import { BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS, toWizardDocuments } from '@/config/documentRequirements'

export const REQUIRED_DOCUMENTS: Omit<DocumentUpload, 'uploaded_file'>[] =
  toWizardDocuments(BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS, 'bouwsubsidie.documents')
```

### Step 3: Refactor Housing constants

In `src/app/(public)/housing/register/constants.ts`:

- Remove the local `REQUIRED_DOCUMENTS` array (lines 55-66)
- Import and derive:

```text
import { HOUSING_DOCUMENT_REQUIREMENTS, toWizardDocuments } from '@/config/documentRequirements'

export const REQUIRED_DOCUMENTS: Omit<DocumentUpload, 'uploaded_file'>[] =
  toWizardDocuments(HOUSING_DOCUMENT_REQUIREMENTS, 'housing.step8documents.doc')
```

**Note on Housing i18n prefix**: The housing wizard uses keys like `housing.step8documents.docIdCopy` where `docIdCopy` maps to `ID_COPY`. The prefix `housing.step8documents.doc` + document_code produces `housing.step8documents.docID_COPY` which does NOT match. This requires a code-to-label-suffix map for housing.

**Revised approach for Housing**: Use an explicit label map instead of a simple prefix:

```text
const HOUSING_LABEL_MAP: Record<string, string> = {
  ID_COPY: 'housing.step8documents.docIdCopy',
  INCOME_PROOF: 'housing.step8documents.docIncomeProof',
  RESIDENCE_PROOF: 'housing.step8documents.docResidenceProof',
  FAMILY_COMPOSITION: 'housing.step8documents.docFamilyComposition',
  MEDICAL_CERT: 'housing.step8documents.docMedicalCert',
  EMERGENCY_PROOF: 'housing.step8documents.docEmergencyProof',
}

export const REQUIRED_DOCUMENTS: Omit<DocumentUpload, 'uploaded_file'>[] =
  HOUSING_DOCUMENT_REQUIREMENTS.map(req => ({
    id: req.document_code,
    document_code: req.document_code,
    label: HOUSING_LABEL_MAP[req.document_code],
    is_mandatory: req.is_mandatory,
  }))
```

Similarly for Bouwsubsidie (uses `bouwsubsidie.documents.ID_COPY` which matches `bouwsubsidie.documents.` + `document_code`), the simple prefix works. But for consistency, both can use a label map or the prefix approach where it works.

### Final approach (cleanest)

1. **Bouwsubsidie**: Simple prefix (`bouwsubsidie.documents.` + document_code) -- works perfectly
2. **Housing**: Explicit label map (i18n keys use camelCase suffixes, not document_code)

No helper function needed on shared config. Each wizard derives locally from the imported shared config array.

### Step 4: Documentation updates

- `docs/backend.md` -- Add Phase 8 entry
- `docs/DVH-IMS-V1.0_1.1/architecture.md` -- Add Change History entry

## Files Modified


| File                                               | Change                                                    |
| -------------------------------------------------- | --------------------------------------------------------- |
| `src/app/(public)/bouwsubsidie/apply/constants.ts` | Remove local array, import from shared config             |
| `src/app/(public)/housing/register/constants.ts`   | Remove local array, import from shared config + label map |
| `docs/backend.md`                                  | Phase 8 entry                                             |
| `docs/DVH-IMS-V1.0_1.1/architecture.md`            | Change History entry                                      |


## Files NOT Modified

- `src/config/documentRequirements.ts` -- No changes needed (source of truth stays as-is)
- No DB changes, no RLS changes, no schema changes
- No type files changed (DocumentUpload interface unchanged)

  
NOTE — Approval Gate for Phase 8 (Wizard Constants Refactor)

You may proceed to APPROVE Phase 8 ONLY if the following two conditions are explicitly accepted as HARD GATES:

1) Housing i18n Verification (Mandatory)

Before finalizing the refactor, all keys defined in HOUSING_LABEL_MAP must be verified against the actual i18n resource files.

- Every key must exist.

- No undefined labels allowed.

- No fallback rendering.

If any key mismatch is detected → STOP and correct before proceeding.

2) No Behavioral Change Confirmation

After refactor:

- Bouwsubsidie required documents count must remain 7.

- Woningregistratie required documents count must remain 6.

- Mandatory vs optional flags must remain identical to current behavior.

- No console errors.

- No UI regressions in the Documents step of both wizards.

If either condition is not satisfied, DO NOT proceed.

HARD RULE:

No DB changes.

No schema changes.

No config structure changes.

Refactor only.

Await explicit verification in the end-of-task report.  
  
  
Constraints

- No DB changes
- No RLS changes
- No schema changes
- No production promotion
- HARD STOP after report
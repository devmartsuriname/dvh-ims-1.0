# Fix Document Upload UI/Validation Mismatch + Update "Wat u nodig heeft"

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Problem

The `DocumentUploadAccordion` splits documents into two tabs: "Verplicht (2)" and "Optioneel (12)". Income proof docs (PAYSLIP, AOV, PENSION, EMPLOYER) are classified as `is_mandatory: false` but have `validation_group: income_proof`, making them functionally required. The UI misleads the user.

Additionally, the "Wat u nodig heeft" sections on both intro pages list generic requirements without mentioning the actual document requirements.

---

## Part 1 — Fix DocumentUploadAccordion Tab Structure

**File:** `src/components/public/DocumentUploadAccordion.tsx`

Change from 2-tab to 3-tab layout:

- **Tab 1:** "Verplicht (2)" — `is_mandatory === true` docs (ID_COPY, BANK_STATEMENT)
- **Tab 2:** "Inkomensbewijs (4)" — docs with `validation_group` defined, with subtitle "min. 1 verplicht"
- **Tab 3:** "Optioneel (8)" — remaining docs (no mandatory, no validation_group)

The tab label for income will include a badge/indicator showing it's group-mandatory.

Auto-expand first un-uploaded doc in income tab when mandatory tab is complete.

**File:** `src/i18n/locales/nl.json` + `en.json` — Add keys:

- `bouwsubsidie.step6.incomeProofTab`: "Inkomensbewijs" / "Income Proof"
- `bouwsubsidie.step6.incomeProofTabNote`: "min. 1 verplicht" / "min. 1 required"

## Part 2 — Fix Summary Panel in Step6Documents

**File:** `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx`

Update summary card to show 3 status lines:

1. Verplicht: X/2 (green badge when complete)
2. Inkomensbewijs: X/4 (green badge when ≥1, warning when 0)
3. Total uploaded: X van 14

Keep existing `incomeProofMissing` warning message when income proof is missing.

## Part 3 — Update Bouwsubsidie Step0 "Wat u nodig heeft"

**File:** `src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx`

Replace the current single-column requirements list with a 2-column `Row`:

- **Left column (Col md={6}):** Keep existing 4 requirements (ID, contact, address, documents)
- **Right column (Col md={6}):** New "Benodigde documenten" block listing:
  - Kopie ID-kaart (verplicht)
  - Bankafschrift laatste 3 maanden (verplicht)
  - Minimaal 1 inkomensbewijs: loonstrook, AOV-verklaring, pensioenverklaring of werkgeversverklaring
  - Small note: "Overige documenten (eigendom, juridisch) kunnen optioneel worden toegevoegd"

Add i18n keys in both NL and EN.

## Part 4 — Update Housing Step0 "Wat u nodig heeft"

**File:** `src/app/(public)/housing/register/steps/Step0Introduction.tsx`

Same 2-column pattern:

- **Left column:** Keep existing requirements
- **Right column:** "Benodigde documenten" block:
  - Kopie ID-kaart (verplicht)
  - Inkomensbewijs (verplicht)
  - Bewijs van woonadres (verplicht)
  - Optioneel: gezinssamenstelling, medische verklaring, noodbewijs

Add i18n keys in both NL and EN.

## Files Changed Summary


| File                                                              | Change                                           |
| ----------------------------------------------------------------- | ------------------------------------------------ |
| `src/components/public/DocumentUploadAccordion.tsx`               | 3-tab structure (mandatory / income / optional)  |
| `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx`    | Updated summary panel with 3 status indicators   |
| `src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx` | 2-column layout with document requirements       |
| `src/app/(public)/housing/register/steps/Step0Introduction.tsx`   | 2-column layout with document requirements       |
| `src/i18n/locales/nl.json`                                        | New i18n keys for tabs + intro document sections |
| `src/i18n/locales/en.json`                                        | Same keys in English                             |


## NOTE — Validation Gate Verification

After implementing the UI changes, verify that the wizard progression logic behaves correctly.

Step 7 should allow progression when:

- ID_COPY uploaded

- BANK_STATEMENT uploaded

- At least ONE income proof uploaded

  (PAYSLIP, AOV_STATEMENT, PENSION_STATEMENT, or EMPLOYER_DECLARATION)

Step 7 must remain blocked when:

- the income proof group is empty

Provide a verification screenshot confirming the wizard can proceed when these conditions are met.  
What does NOT change

- Database schema
- Edge Functions
- RLS policies
- Admin UI
- Workflow logic
- Validation logic (canProceed gate unchanged)
- `documentRequirements.ts` config
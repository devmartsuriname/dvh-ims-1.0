# Improve Wizard Document Step UX + Align Icon Style

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Part 1 — Add Ready-to-Proceed Checklist (Step6Documents)

**File:** `src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx`

Replace the current summary Card (lines 157-196) with a checklist that shows individual document requirements with green check / warning icons:

- Line item: "Kopie ID-kaart geüpload" — checks if ID_COPY has `uploaded_file`
- Line item: "Bankafschrift geüpload" — checks if BANK_STATEMENT has `uploaded_file`
- Line item: "Minimaal één inkomensbewijs geüpload" — checks `hasIncomeProof`

Each line: green check icon when satisfied, warning icon when not.

Below the checklist:

- When `canProceed`: green message "Alle vereiste documenten zijn geüpload. U kunt doorgaan."
- When not: warning message "Upload minimaal één inkomensbewijs om door te gaan." (or mandatory missing message)

Keep the total uploaded counter as a subtle footer line.

`canProceed` logic remains unchanged.

To identify specific mandatory docs (ID_COPY, BANK_STATEMENT), check by document `id` or `document_code` from `formData.documents`.

**i18n keys to add** (nl.json + en.json):

- `bouwsubsidie.step6.checkIdCopy` / `bouwsubsidie.step6.checkBankStatement` / `bouwsubsidie.step6.checkIncomeProof`
- `bouwsubsidie.step6.allRequiredUploaded` / `bouwsubsidie.step6.uploadIncomeToProced`

---

## Part 2 — Align Icon Style in "Benodigde documenten"

**Files:**

- `src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx` (lines 106-117)
- `src/app/(public)/housing/register/steps/Step0Introduction.tsx` (lines 106-117)

Change in both files:

- Replace `icon="mingcute:document-line" className="text-primary"` with `icon="mingcute:check-circle-line" className="text-success me-2"`
- Change `align-items-start` to `align-items-center` on list items
- Remove `mt-1 flex-shrink-0` (not needed with center alignment)

This makes the right column visually match the left column's green check style.

---

## Files Changed Summary


| File                                 | Change                                               |
| ------------------------------------ | ---------------------------------------------------- |
| `Step6Documents.tsx`                 | Replace summary card with ready-to-proceed checklist |
| Bouwsubsidie `Step0Introduction.tsx` | Change doc icons from purple document to green check |
| Housing `Step0Introduction.tsx`      | Same icon change                                     |
| `nl.json`                            | New checklist i18n keys                              |
| `en.json`                            | Same keys in English                                 |


## NOTE — Checklist Implementation Constraint

Do not completely remove the existing summary information.

The document progress indicator (total uploaded count) must remain visible to the user.

Preferred approach:

- Place the new checklist above the summary card

OR

- Extend the summary card with the checklist instead of replacing it.

Additionally ensure each checklist item checks actual upload status

(e.g. uploaded_file presence), not just document entry existence.  
What does NOT change

- `canProceed` validation logic
- Database schema / Edge Functions / RLS / Admin UI
- `DocumentUploadAccordion.tsx`
- `documentRequirements.ts`
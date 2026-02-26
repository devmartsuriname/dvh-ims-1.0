# DVH-IMS V1.5 Restore Point — Bouwsubsidie Document Requirements Change

**Created:** 2026-02-26
**Context:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

## Pre-Change State

### Frontend (`src/app/(public)/bouwsubsidie/apply/constants.ts`)

| document_code     | is_mandatory | label (i18n key)                              |
|-------------------|-------------|-----------------------------------------------|
| ID_COPY           | true        | bouwsubsidie.documents.ID_COPY                |
| INCOME_PROOF      | true        | bouwsubsidie.documents.INCOME_PROOF           |
| LAND_TITLE        | true        | bouwsubsidie.documents.LAND_TITLE             |
| CONSTRUCTION_PLAN | true        | bouwsubsidie.documents.CONSTRUCTION_PLAN      |
| COST_ESTIMATE     | true        | bouwsubsidie.documents.COST_ESTIMATE          |
| BUILDING_PERMIT   | true        | bouwsubsidie.documents.BUILDING_PERMIT        |
| BANK_STATEMENT    | false       | bouwsubsidie.documents.BANK_STATEMENT         |
| HOUSEHOLD_COMP    | false       | bouwsubsidie.documents.HOUSEHOLD_COMP         |

### Database (`subsidy_document_requirement`)

Same 8 rows as above, seeded in initial migration.

### i18n Labels

**NL:**
- ID_COPY: "Kopie ID-kaart (voor- en achterkant)"
- INCOME_PROOF: "Inkomensverklaring (recente loonstroken)"
- LAND_TITLE: "Grondbewijs of erfpachtovereenkomst"
- CONSTRUCTION_PLAN: "Bouwplan of tekening"
- COST_ESTIMATE: "Gedetailleerde kostenbegroting"
- BUILDING_PERMIT: "Bouwvergunning (indien van toepassing)"
- BANK_STATEMENT: "Bankafschrift (laatste 3 maanden)"
- HOUSEHOLD_COMP: "Huishoudsamenstelling"

**EN:**
- ID_COPY: "Copy of ID (front and back)"
- INCOME_PROOF: "Income proof (recent pay slips)"
- LAND_TITLE: "Land title or lease agreement"
- CONSTRUCTION_PLAN: "Construction plan or drawing"
- COST_ESTIMATE: "Detailed cost estimate"
- BUILDING_PERMIT: "Building permit (if applicable)"
- BANK_STATEMENT: "Bank statement (last 3 months)"
- HOUSEHOLD_COMP: "Household composition"

### Backend

Edge function (`submit-bouwsubsidie-application`) reads from DB dynamically. No hardcoded doc validation.

### Admin

DirectorReviewPanel reads `is_mandatory` from `subsidy_document_requirement` table. No hardcoded checks.

## Files Affected

1. `src/app/(public)/bouwsubsidie/apply/constants.ts`
2. `src/i18n/locales/en.json`
3. `src/i18n/locales/nl.json`
4. `subsidy_document_requirement` table (data update via migration)

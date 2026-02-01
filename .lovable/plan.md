
# DVH-IMS V1.3 — PRIORITY 1: PUBLIC WIZARD DOCUMENT UPLOAD

## Phase 5C Implementation Plan

**Date:** 2026-02-01  
**Priority:** P0 (Blocking)  
**Scope:** Document Upload for Bouwsubsidie + Woningregistratie Public Wizards

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Bouwsubsidie Wizard — COMPLETE ✅
| Feature | Status | Evidence |
|---------|--------|----------|
| File upload UI | ✅ Implemented | `Step6Documents.tsx` with react-dropzone |
| Multi-file per doc type | ⚠️ Single file | Current implementation allows 1 file per document type |
| Mandatory enforcement | ✅ Implemented | `nextDisabled={!allMandatoryUploaded}` |
| File type validation | ✅ Implemented | PDF, JPG, PNG only |
| Size validation | ✅ Implemented | 10MB max |
| Storage upload | ✅ Implemented | `citizen-uploads` bucket |
| Edge Function linking | ✅ Implemented | Creates `subsidy_document_upload` records |
| Admin visibility | ✅ Implemented | Admin page fetches from `subsidy_document_upload` |

### 1.2 Woningregistratie Wizard — NOT IMPLEMENTED ❌
| Feature | Status | Evidence |
|---------|--------|----------|
| File upload UI | ❌ Missing | No document step exists (Steps 0-9 are data only) |
| Document requirements | ❌ Missing | No `housing_document_requirement` table |
| Document uploads table | ❌ Missing | No `housing_document_upload` table |
| Edge Function linking | ❌ Missing | `submit-housing-registration` does not handle documents |

---

## 2. GAP ASSESSMENT

### 2.1 Required for Housing Wizard Document Upload:

**Database Schema:**
- Create `housing_document_requirement` table (like `subsidy_document_requirement`)
- Create `housing_document_upload` table (like `subsidy_document_upload`)
- Add RLS policies for anon insert and staff read

**Frontend:**
- Add new step `Step8Documents.tsx` (before current Step8Review → Step9Review)
- Update `types.ts` to include document upload structure
- Update `constants.ts` with document requirements
- Update `page.tsx` to handle new step flow
- Renumber current Step8Review → Step9Review, Step9Receipt → Step10Receipt

**Edge Function:**
- Update `submit-housing-registration` to accept and link documents

### 2.2 Bouwsubsidie Enhancement (Optional):
- Multi-file support per document type (currently single file)

---

## 3. DOCUMENT REQUIREMENTS FOR HOUSING REGISTRATION

Based on government housing registration requirements:

| Document Code | Document Name | Mandatory |
|---------------|---------------|-----------|
| ID_COPY | Copy of ID | Yes |
| INCOME_PROOF | Proof of Income | Yes |
| RESIDENCE_PROOF | Proof of Current Residence | Yes |
| FAMILY_COMPOSITION | Family Composition | No |
| MEDICAL_CERT | Medical Certificate (if applicable) | No |
| EMERGENCY_PROOF | Emergency Situation Proof (if applicable) | No |

---

## 4. IMPLEMENTATION STEPS

### Step 5C-1: Create Restore Point
Create `RESTORE_POINT_V1.3_PHASE5C_START.md`

### Step 5C-2: Database Schema Changes

**Create `housing_document_requirement` table:**
```text
- id (uuid, PK)
- document_code (text, unique)
- document_name (text)
- description (text)
- is_mandatory (boolean)
- created_at (timestamp)
```

**Create `housing_document_upload` table:**
```text
- id (uuid, PK)
- registration_id (uuid, FK → housing_registration)
- requirement_id (uuid, FK → housing_document_requirement)
- file_path (text)
- file_name (text)
- uploaded_by (uuid, nullable)
- uploaded_at (timestamp)
- is_verified (boolean)
- verified_by (uuid, nullable)
- verified_at (timestamp, nullable)
```

**RLS Policies:**
- Anonymous INSERT for public submissions
- Staff SELECT based on district

### Step 5C-3: Seed Document Requirements
Insert initial document requirements for housing registration.

### Step 5C-4: Update Housing Wizard Types
Add `DocumentUpload` interface to `housing/register/types.ts`
Add `documents` array to `HousingFormData`

### Step 5C-5: Update Housing Wizard Constants
Add `REQUIRED_DOCUMENTS` array with document definitions
Update `INITIAL_FORM_DATA` to include documents array
Update `WIZARD_STEPS` to include new documents step

### Step 5C-6: Create Step8Documents.tsx
Create document upload step for Housing wizard
Reuse pattern from Bouwsubsidie `Step6Documents.tsx`
Apply i18n (NL/EN translations)

### Step 5C-7: Renumber Housing Wizard Steps
- Current Step8Review.tsx → Step9Review.tsx
- Current Step9Receipt.tsx → Step10Receipt.tsx
- Update imports in page.tsx

### Step 5C-8: Update Housing Wizard Page
Update step count and step rendering logic
Add Step8Documents to wizard flow

### Step 5C-9: Add Translation Keys
Add housing document upload translations to `nl.json` and `en.json`

### Step 5C-10: Update Edge Function
Modify `submit-housing-registration` to:
- Accept `documents` array in input
- Query `housing_document_requirement` for requirement IDs
- Insert records into `housing_document_upload`
- Log document count in audit event

### Step 5C-11: Deploy Edge Function
Deploy updated `submit-housing-registration`

### Step 5C-12: Create Documentation
Create `PHASE-5C-DOCUMENT-UPLOAD-REPORT.md`

### Step 5C-13: Create Completion Restore Point
Create `RESTORE_POINT_V1.3_PHASE5C_COMPLETE.md`

---

## 5. FILES TO CREATE/MODIFY

### New Files:
| File | Purpose |
|------|---------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_START.md` | Pre-phase restore point |
| `src/app/(public)/housing/register/steps/Step8Documents.tsx` | Document upload step |
| `phases/DVH-IMS-V1.3/PHASE-5C/PHASE-5C-DOCUMENT-UPLOAD-REPORT.md` | Implementation report |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_COMPLETE.md` | Post-phase restore point |

### Modified Files:
| File | Change |
|------|--------|
| `src/app/(public)/housing/register/types.ts` | Add DocumentUpload interface |
| `src/app/(public)/housing/register/constants.ts` | Add REQUIRED_DOCUMENTS |
| `src/app/(public)/housing/register/page.tsx` | Add Step8Documents, update step flow |
| `src/app/(public)/housing/register/steps/Step8Review.tsx` | Rename to Step9Review.tsx |
| `src/app/(public)/housing/register/steps/Step9Receipt.tsx` | Rename to Step10Receipt.tsx |
| `src/i18n/locales/nl.json` | Add housing.step8 document translations |
| `src/i18n/locales/en.json` | Add housing.step8 document translations |
| `supabase/functions/submit-housing-registration/index.ts` | Add document handling |

---

## 6. DATABASE MIGRATION REQUIRED

```sql
-- Create housing_document_requirement table
CREATE TABLE IF NOT EXISTS public.housing_document_requirement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_code TEXT NOT NULL UNIQUE,
  document_name TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create housing_document_upload table
CREATE TABLE IF NOT EXISTS public.housing_document_upload (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES housing_registration(id),
  requirement_id UUID NOT NULL REFERENCES housing_document_requirement(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE housing_document_requirement ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_document_upload ENABLE ROW LEVEL SECURITY;

-- RLS Policies for housing_document_requirement
CREATE POLICY "Anyone can read housing document requirements"
  ON housing_document_requirement FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for housing_document_upload
CREATE POLICY "anon_can_insert_housing_document_upload"
  ON housing_document_upload FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "role_select_housing_document_upload"
  ON housing_document_upload FOR SELECT
  TO authenticated
  USING (
    is_national_role(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM housing_registration hr
      WHERE hr.id = housing_document_upload.registration_id
      AND (has_role(auth.uid(), 'frontdesk_housing') OR has_role(auth.uid(), 'admin_staff'))
      AND hr.district_code = get_user_district(auth.uid())
    )
  );

-- Seed initial document requirements
INSERT INTO housing_document_requirement (document_code, document_name, description, is_mandatory)
VALUES
  ('ID_COPY', 'Copy of ID', 'Valid government-issued ID card or passport', true),
  ('INCOME_PROOF', 'Proof of Income', 'Recent salary slips or income statement', true),
  ('RESIDENCE_PROOF', 'Proof of Current Residence', 'Utility bill or rental agreement', true),
  ('FAMILY_COMPOSITION', 'Family Composition', 'Declaration of household members', false),
  ('MEDICAL_CERT', 'Medical Certificate', 'Medical certificate for disability (if applicable)', false),
  ('EMERGENCY_PROOF', 'Emergency Documentation', 'Proof of emergency situation (if applicable)', false);
```

---

## 7. EXPLICIT CONSTRAINTS

### Allowed:
| Action | Status |
|--------|--------|
| Create housing document tables | ALLOWED |
| Add document upload step to Housing wizard | ALLOWED |
| Extend Edge Function for document handling | ALLOWED |
| Add i18n translations for new step | ALLOWED |

### Forbidden:
| Action | Status |
|--------|--------|
| Create public accounts | FORBIDDEN |
| Change roles or permissions | FORBIDDEN |
| Modify workflow state machine | FORBIDDEN |
| Change Admin UI language | FORBIDDEN |
| Modify Bouwsubsidie (beyond optional multi-file) | FORBIDDEN |

---

## 8. VERIFICATION CHECKLIST

| Test | Expected |
|------|----------|
| Housing wizard shows document step after Step 7 | Documents step visible |
| Mandatory documents block progression | Cannot proceed without uploads |
| Files upload to citizen-uploads bucket | Storage success |
| Edge Function creates document records | Database entries created |
| Admin can view uploaded documents | Documents visible in admin |
| Bouwsubsidie wizard unchanged | No regression |
| NL translations work on new step | Dutch text displays |

---

## 9. END-OF-TASK DELIVERABLES

| Deliverable | Status |
|-------------|--------|
| RESTORE_POINT_V1.3_PHASE5C_START.md | To create |
| Database tables + RLS + seed data | To create |
| Step8Documents.tsx (Housing) | To create |
| Updated Housing wizard flow | To modify |
| Updated Edge Function | To modify |
| i18n translations | To add |
| PHASE-5C-DOCUMENT-UPLOAD-REPORT.md | To create |
| RESTORE_POINT_V1.3_PHASE5C_COMPLETE.md | To create |

---

## GOVERNANCE STATEMENT

**Phase 5C implements document upload for the Woningregistratie (Housing Registration) public wizard.**

- Follows the existing Bouwsubsidie pattern exactly
- Uses same storage bucket (`citizen-uploads`)
- Enforces mandatory document upload before submission
- Validates file types (PDF, JPG, PNG) and size (10MB)
- Links documents to registration in database
- Adds NL/EN translations for new step
- No workflow state machine changes
- No role or authentication changes
- Admin remains EN-only

**STOP after Phase 5C and await authorization for next phase.**

---

**PHASE 5C — PUBLIC WIZARD DOCUMENT UPLOAD — AWAITING APPROVAL TO BEGIN IMPLEMENTATION**

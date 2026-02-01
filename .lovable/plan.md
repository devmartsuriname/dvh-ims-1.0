

# DVH-IMS V1.3 — Phase 5A Execution Plan

## Document Type: Phase Scope & Execution Plan
## Version: 1.0
## Date: 2026-02-01
## Phase: Phase 5A — Public Wizard: Mandatory Document Upload + NL Localization (P0)
## Authorization: Blocking for Real Use

---

## 1. Authorization Context

| Item | Status |
|------|--------|
| V1.3 Phase 4C | CLOSED & LOCKED |
| V1.3 Phase 5A | OPEN — Public Wizard Hardening |

**Scope Constraint:** PUBLIC WIZARD ONLY — Admin remains EN-only

---

## 2. Current State Analysis

### 2.1 Document Upload

| Component | Current State |
|-----------|---------------|
| Step6Documents.tsx | Declaration-only (toggle checkbox) |
| File upload UI | NOT IMPLEMENTED |
| Storage bucket for uploads | NOT EXISTS (only `generated-documents`) |
| subsidy_document_upload table | EXISTS (case_id, requirement_id, file_path, uploaded_at) |
| subsidy_document_requirement table | EXISTS (8 requirement types defined) |
| RLS on subsidy_document_upload | Authenticated only — NO anon policy |
| react-dropzone | INSTALLED but not used in wizard |

### 2.2 Localization

| Component | Current State |
|-----------|---------------|
| i18n framework | NOT INSTALLED |
| src/locales directory | EMPTY |
| Hardcoded English text | ALL wizard steps + constants |
| Language switcher | NOT EXISTS |

### 2.3 Files Requiring Translation

| File | Text Type |
|------|-----------|
| src/app/(public)/bouwsubsidie/apply/constants.ts | Labels, options |
| src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx | Instructions |
| src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx | Labels, validation |
| src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx | Labels, validation |
| src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx | Labels, validation |
| src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx | Labels, validation |
| src/app/(public)/bouwsubsidie/apply/steps/Step5Context.tsx | Labels, validation |
| src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx | Labels (REPLACED) |
| src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx | Labels, sections |
| src/app/(public)/bouwsubsidie/apply/steps/Step8Receipt.tsx | Messages, instructions |
| src/components/public/WizardStep.tsx | Button labels |
| src/components/public/PublicHeader.tsx | Navigation |
| src/components/public/PublicFooter.tsx | Footer text |
| src/constants/districts.ts | District names (keep as-is, official) |

---

## 3. Phase 5A Objective

### Part A: Mandatory Document Upload

Replace the toggle-based declaration with actual file uploads:
1. Create public storage bucket for citizen uploads
2. Update Step6Documents to use react-dropzone for file upload
3. Modify Edge Function to handle file references
4. Block submission if mandatory documents are not uploaded
5. Enable Admin visibility of uploaded documents

### Part B: Dutch (NL) Localization

1. Install react-i18next framework
2. Create translation files (nl.json, en.json)
3. Set NL as default language
4. Add language switcher to public header
5. Translate all wizard components

---

## 4. PART A: Document Upload Implementation

### 4.1 Storage Architecture

```text
Bucket: citizen-uploads (PUBLIC for read, controlled write)
├── bouwsubsidie/
│   └── {case_id}/
│       └── {document_type}_{timestamp}.{ext}
└── housing/
    └── {registration_id}/
        └── {document_type}_{timestamp}.{ext}
```

### 4.2 Database Changes

#### 4.2.1 Storage Bucket Creation

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('citizen-uploads', 'citizen-uploads', true);
```

#### 4.2.2 Storage RLS Policies

```sql
-- Allow public upload (anonymous)
CREATE POLICY "anon_can_upload_citizen_documents"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'citizen-uploads');

-- Allow public read (for preview)
CREATE POLICY "anon_can_read_citizen_documents"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'citizen-uploads');

-- Allow authenticated staff to read all
CREATE POLICY "staff_can_read_citizen_documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'citizen-uploads');
```

#### 4.2.3 Document Upload Table - Add Anon Policy

```sql
-- Allow anonymous insert for public submissions
CREATE POLICY "anon_can_insert_document_upload"
ON public.subsidy_document_upload FOR INSERT TO anon
WITH CHECK (true);
```

### 4.3 Updated Step6Documents Component

**Major Changes:**
1. Replace toggle with file dropzone per document type
2. Validate mandatory documents before allowing next
3. Upload files to storage bucket immediately on drop
4. Store file references in formData for submission
5. Show upload progress and preview

**New formData structure:**

```typescript
interface DocumentUpload {
  id: string                    // requirement ID
  document_code: string         // e.g., 'ID_COPY'
  label: string                 // display label
  is_mandatory: boolean
  uploaded_file?: {
    file_path: string           // storage path
    file_name: string           // original name
    uploaded_at: string         // ISO timestamp
  }
}

// documents: DocumentUpload[]
```

### 4.4 Edge Function Update

Modify `submit-bouwsubsidie-application`:
1. Accept documents array with file paths
2. Validate mandatory documents are uploaded
3. Create `subsidy_document_upload` records
4. Return error if mandatory docs missing

### 4.5 Validation Rules

| Document Code | Label (EN) | Mandatory |
|---------------|------------|-----------|
| ID_COPY | Copy of ID | YES |
| INCOME_PROOF | Income Proof | YES |
| LAND_TITLE | Land Title / Deed | YES |
| CONSTRUCTION_PLAN | Construction Plan | YES |
| COST_ESTIMATE | Cost Estimate | YES |
| BUILDING_PERMIT | Building Permit | YES |
| BANK_STATEMENT | Bank Statement | NO |
| HOUSEHOLD_COMP | Household Composition | NO |

**Submission blocked if any mandatory document is missing.**

---

## 5. PART B: Localization Implementation

### 5.1 Package Installation

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

### 5.2 i18n Configuration

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import nl from './locales/nl.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { nl: { translation: nl }, en: { translation: en } },
    fallbackLng: 'nl',  // Dutch as default
    lng: 'nl',          // Force Dutch initially
    interpolation: { escapeValue: false },
  });

export default i18n;
```

### 5.3 Translation File Structure

```text
src/i18n/
├── config.ts
└── locales/
    ├── nl.json
    └── en.json
```

### 5.4 Translation Keys Structure

```json
{
  "common": {
    "next": "Volgende",
    "back": "Vorige",
    "submit": "Indienen",
    "continue": "Doorgaan",
    "staffPortal": "Personeelsportaal",
    "print": "Afdrukken",
    "checkStatus": "Status controleren",
    "returnHome": "Terug naar home"
  },
  "header": {
    "ministry": "Ministerie van Sociale Zaken en Volkshuisvesting"
  },
  "wizard": {
    "steps": {
      "introduction": "Introductie",
      "personalInfo": "Persoonsgegevens",
      "contact": "Contactgegevens",
      "household": "Huishouden",
      "address": "Adres",
      "application": "Aanvraag",
      "documents": "Documenten",
      "review": "Controleren",
      "receipt": "Ontvangstbewijs"
    }
  },
  "bouwsubsidie": {
    "title": "Bouwsubsidie Aanvraag",
    "step0": {
      "title": "Welkom bij de Bouwsubsidie Aanvraag",
      "importantNotice": "Belangrijke mededeling",
      "noticeText": "Aanvragen via dit portaal zijn alleen voor registratiedoeleinden..."
    },
    "step1": {
      "title": "Persoonsgegevens",
      "nationalId": "ID-nummer",
      "firstName": "Voornaam",
      "lastName": "Achternaam",
      "dateOfBirth": "Geboortedatum",
      "gender": "Geslacht"
    },
    "step6": {
      "title": "Documenten Uploaden",
      "description": "Upload de vereiste documenten om door te gaan.",
      "mandatory": "Verplicht",
      "optional": "Optioneel",
      "dropzone": "Sleep bestand hierheen of klik om te uploaden",
      "maxSize": "Maximale bestandsgrootte: 10MB",
      "uploaded": "Geüpload"
    },
    "step8": {
      "successTitle": "Aanvraag Succesvol Ingediend",
      "referenceNumber": "Uw Referentienummer",
      "securityToken": "Beveiligingstoken"
    },
    "reasons": {
      "new_construction": "Nieuwbouw",
      "renovation": "Woningrenovatie",
      "extension": "Woninguitbreiding",
      "repair": "Structurele reparaties",
      "disaster_recovery": "Rampenherstel"
    },
    "documents": {
      "ID_COPY": "Kopie ID-kaart (voor- en achterkant)",
      "INCOME_PROOF": "Inkomensverklaring (recente loonstroken)",
      "LAND_TITLE": "Grondbewijs of erfpachtovereenkomst",
      "CONSTRUCTION_PLAN": "Bouwplan of kostenbegroting",
      "COST_ESTIMATE": "Gedetailleerde kostenbegroting",
      "BUILDING_PERMIT": "Bouwvergunning",
      "BANK_STATEMENT": "Bankafschrift (laatste 3 maanden)",
      "HOUSEHOLD_COMP": "Huishoudsamenstelling"
    }
  },
  "validation": {
    "required": "Dit veld is verplicht",
    "invalidEmail": "Ongeldig e-mailadres",
    "invalidDate": "Ongeldige datum",
    "minLength": "Minimaal {{min}} tekens vereist",
    "documentRequired": "Dit document is verplicht"
  }
}
```

### 5.5 Language Switcher Component

```typescript
// src/components/public/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'nl', label: 'Nederlands', flag: '🇸🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];
  
  return (
    <Dropdown>
      <Dropdown.Toggle variant="outline-secondary" size="sm">
        {languages.find(l => l.code === i18n.language)?.flag} 
        {languages.find(l => l.code === i18n.language)?.label}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languages.map(lang => (
          <Dropdown.Item 
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            active={i18n.language === lang.code}
          >
            {lang.flag} {lang.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
```

### 5.6 Component Updates

Each wizard step will be updated to use `useTranslation()`:

```typescript
import { useTranslation } from 'react-i18next';

const Step1PersonalInfo = () => {
  const { t } = useTranslation();
  
  return (
    <WizardStep
      title={t('bouwsubsidie.step1.title')}
      description={t('bouwsubsidie.step1.description')}
    >
      <TextFormInput
        label={t('bouwsubsidie.step1.firstName')}
        // ...
      />
    </WizardStep>
  );
};
```

---

## 6. Implementation Steps

### Step 5A-1: Create Restore Point
Create `RESTORE_POINT_V1.3_PHASE5A_START.md`

### Step 5A-2: Install Dependencies
- Add react-i18next, i18next, i18next-browser-languagedetector to package.json

### Step 5A-3: Create i18n Infrastructure
- Create src/i18n/config.ts
- Create src/i18n/locales/nl.json
- Create src/i18n/locales/en.json
- Import i18n config in main.tsx

### Step 5A-4: Database Migration - Storage Bucket
- Create citizen-uploads storage bucket
- Create storage RLS policies
- Create anon insert policy on subsidy_document_upload

### Step 5A-5: Update Types
- Update BouwsubsidieFormData.documents type
- Add DocumentUpload interface

### Step 5A-6: Create Document Upload Component
- Rebuild Step6Documents.tsx with file upload
- Use react-dropzone for file selection
- Implement immediate upload to storage
- Add validation for mandatory documents

### Step 5A-7: Update Edge Function
- Modify submit-bouwsubsidie-application
- Accept document file paths
- Create subsidy_document_upload records
- Validate mandatory documents present

### Step 5A-8: Localize All Wizard Steps
- Update Step0Introduction.tsx with translations
- Update Step1PersonalInfo.tsx with translations
- Update Step2ContactInfo.tsx with translations
- Update Step3Household.tsx with translations
- Update Step4Address.tsx with translations
- Update Step5Context.tsx with translations
- Update Step6Documents.tsx with translations
- Update Step7Review.tsx with translations
- Update Step8Receipt.tsx with translations

### Step 5A-9: Update Public Header/Footer
- Add LanguageSwitcher to PublicHeader
- Translate all text in PublicHeader
- Translate PublicFooter if exists

### Step 5A-10: Update WizardStep Component
- Add translation for button labels

### Step 5A-11: Verification Testing
- Test document upload flow
- Test submission blocking without docs
- Verify NL is default language
- Verify language switch works
- Verify Admin can see uploaded documents

### Step 5A-12: Documentation
- Create Phase 5A artifacts

### Step 5A-13: Create Completion Restore Point
Create `RESTORE_POINT_V1.3_PHASE5A_COMPLETE.md`

---

## 7. Files to Create

| File | Purpose |
|------|---------|
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5A_START.md | Pre-phase restore point |
| src/i18n/config.ts | i18n configuration |
| src/i18n/locales/nl.json | Dutch translations |
| src/i18n/locales/en.json | English translations |
| src/components/public/LanguageSwitcher.tsx | Language toggle |
| phases/DVH-IMS-V1.3/PHASE-5A/PHASE-5A-WIZARD-UPLOAD-REPORT.md | Upload implementation report |
| phases/DVH-IMS-V1.3/PHASE-5A/PHASE-5A-LOCALIZATION-REPORT.md | Localization report |
| phases/DVH-IMS-V1.3/PHASE-5A/PHASE-5A-VERIFICATION-CHECKLIST.md | Test results |
| restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5A_COMPLETE.md | Post-phase restore point |

## 8. Files to Modify

| File | Change |
|------|--------|
| package.json | Add i18n dependencies |
| src/main.tsx | Import i18n config |
| src/app/(public)/bouwsubsidie/apply/types.ts | Update DocumentUpload interface |
| src/app/(public)/bouwsubsidie/apply/constants.ts | Update REQUIRED_DOCUMENTS |
| src/app/(public)/bouwsubsidie/apply/page.tsx | Add i18n context |
| src/app/(public)/bouwsubsidie/apply/steps/Step*.tsx | All 9 steps with translations |
| src/components/public/WizardStep.tsx | Add translations |
| src/components/public/PublicHeader.tsx | Add LanguageSwitcher + translations |
| supabase/functions/submit-bouwsubsidie-application/index.ts | Handle document uploads |

---

## 9. Verification Matrix

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| P5A-T01 | Upload mandatory document | File uploaded, preview shown |
| P5A-T02 | Submit without mandatory docs | Submission BLOCKED, error shown |
| P5A-T03 | Submit with all mandatory docs | Submission succeeds |
| P5A-T04 | Admin views uploaded documents | Documents visible in case detail |
| P5A-T05 | First load language | NL is default |
| P5A-T06 | Switch to EN | All labels change to English |
| P5A-T07 | Switch back to NL | All labels change to Dutch |
| P5A-T08 | Validation messages in NL | Dutch error messages |
| P5A-T09 | Receipt page in NL | All text in Dutch |
| P5A-T10 | Woningregistratie unchanged | No changes to housing wizard |

---

## 10. Explicit Constraints

### 10.1 Allowed Actions

| Action | Authorized |
|--------|------------|
| Install i18n packages | ALLOWED |
| Create storage bucket | ALLOWED |
| Create translation files | ALLOWED |
| Modify Bouwsubsidie wizard | ALLOWED |
| Modify public header | ALLOWED |
| Add language switcher | ALLOWED |
| Update Edge Function | ALLOWED |

### 10.2 Forbidden Actions

| Action | Status |
|--------|--------|
| Create public user accounts | FORBIDDEN |
| Modify authentication flows | FORBIDDEN |
| Localize Admin interface | FORBIDDEN |
| Modify Woningregistratie wizard | FORBIDDEN |
| Change role permissions | FORBIDDEN |
| Modify workflow triggers | FORBIDDEN |

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Large file uploads fail | Limit file size to 10MB, show progress |
| Storage bucket permissions | Test anon upload before full implementation |
| Translation misses | Use t() function with fallback keys |
| Upload performance | Immediate upload per file, not on submit |

---

## 12. Rollback Plan

### 12.1 Database Rollback

```sql
-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'citizen-uploads';

-- Remove anon policy
DROP POLICY IF EXISTS "anon_can_insert_document_upload" ON public.subsidy_document_upload;
```

### 12.2 Application Rollback

1. Remove i18n packages from package.json
2. Revert all component changes (git)
3. Restore original Step6Documents.tsx

---

## 13. Deliverables

| # | Artifact | Purpose |
|---|----------|---------|
| 1 | RESTORE_POINT_V1.3_PHASE5A_START.md | Pre-phase restore point |
| 2 | Storage bucket + policies | Document storage |
| 3 | i18n framework + translations | Localization |
| 4 | Updated Step6Documents.tsx | File upload UI |
| 5 | Updated Edge Function | Document handling |
| 6 | LanguageSwitcher.tsx | Language toggle |
| 7 | All localized wizard steps | NL + EN translations |
| 8 | PHASE-5A-WIZARD-UPLOAD-REPORT.md | Documentation |
| 9 | PHASE-5A-LOCALIZATION-REPORT.md | Documentation |
| 10 | PHASE-5A-VERIFICATION-CHECKLIST.md | Test results |
| 11 | RESTORE_POINT_V1.3_PHASE5A_COMPLETE.md | Post-phase restore point |

---

## 14. Governance Statement

**V1.3 Phase 5A implements mandatory document upload and Dutch localization for PUBLIC WIZARD ONLY.**

**Admin interface remains English-only.**

**No public user accounts are introduced.**

**Authentication flows remain unchanged.**

**Woningregistratie wizard remains unchanged.**

**STOP after Phase 5A completion and await authorization for next phase.**

---

**PHASE 5A — PUBLIC WIZARD HARDENING — AWAITING APPROVAL TO BEGIN IMPLEMENTATION**


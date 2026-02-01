# DVH-IMS V1.3 Phase 5A — Localization Implementation Report

**Date:** 2026-02-01  
**Phase:** 5A Part B — Dutch (NL) Localization  
**Status:** COMPLETE

---

## 1. Objective

Enable Dutch (NL) as the default language for the Bouwsubsidie public wizard, with English (EN) available via language switcher.

---

## 2. Framework Selection

| Package | Version | Purpose |
|---------|---------|---------|
| react-i18next | 16.5.4 | React bindings for i18next |
| i18next | 25.8.0 | Core internationalization framework |
| i18next-browser-languagedetector | 8.2.0 | Automatic language detection |

---

## 3. Configuration

### 3.1 i18n Config (`src/i18n/config.ts`)

```typescript
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      nl: { translation: nl },
      en: { translation: en },
    },
    fallbackLng: 'nl',
    lng: 'nl', // Force Dutch as default
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });
```

### 3.2 Language Persistence

- User preference stored in `localStorage`
- Key: `i18nextLng`
- Persists across sessions

---

## 4. Translation Files

### 4.1 File Structure

```
src/i18n/
├── config.ts
└── locales/
    ├── nl.json (224 lines)
    └── en.json (224 lines)
```

### 4.2 Translation Categories

| Category | Keys | Example |
|----------|------|---------|
| common | 22 | `common.next`, `common.back`, `common.submit` |
| header | 2 | `header.title`, `header.ministry` |
| wizard.steps | 9 | `wizard.steps.introduction`, etc. |
| bouwsubsidie.step0-8 | ~80 | All step-specific labels |
| bouwsubsidie.reasons | 5 | Application reason options |
| bouwsubsidie.gender | 3 | Gender options |
| bouwsubsidie.documents | 8 | Document type labels |
| validation | 22 | Form validation messages |
| errors | 6 | Error messages |

---

## 5. Components Localized

### 5.1 Wizard Steps (9 files)

| Component | Translation Keys Used |
|-----------|----------------------|
| Step0Introduction | step0.title, step0.noticeText, requirements |
| Step1PersonalInfo | step1.nationalId, firstName, lastName, etc. |
| Step2ContactInfo | step2.phoneNumber, email |
| Step3Household | step3.householdSize, dependents |
| Step4Address | step4.addressLine1, district, ressort |
| Step5Context | step5.applicationReason, estimatedAmount |
| Step6Documents | step6.title, dropzone, mandatory labels |
| Step7Review | step7.sectionPersonal, declarationText |
| Step8Receipt | step8.successTitle, referenceNumber |

### 5.2 Shared Components

| Component | Keys |
|-----------|------|
| WizardStep.tsx | common.continue, common.back, common.processing |
| PublicHeader.tsx | header.title, header.ministry, common.staffPortal |
| LanguageSwitcher.tsx | Language labels (not translated) |

---

## 6. Language Switcher

### 6.1 Component: `LanguageSwitcher.tsx`

**Location:** `src/components/public/LanguageSwitcher.tsx`

**Features:**
- Dropdown using react-bootstrap
- Flag emojis: 🇸🇷 (NL), 🇬🇧 (EN)
- Label visible on desktop, hidden on mobile
- Active state indicator

### 6.2 Integration

- Added to `PublicHeader.tsx`
- Position: Right side, before Staff Portal link

---

## 7. Validation Messages

### 7.1 Dutch Validation Messages

| Key | Dutch |
|-----|-------|
| validation.required | Dit veld is verplicht |
| validation.invalidEmail | Ongeldig e-mailadres |
| validation.nationalIdRequired | ID-nummer is verplicht |
| validation.phoneRequired | Telefoonnummer is verplicht |
| validation.addressRequired | Adres is verplicht |
| validation.districtRequired | District is verplicht |

### 7.2 Error Messages

| Key | Dutch |
|-----|-------|
| errors.submissionFailed | Aanvraag kon niet worden ingediend |
| errors.networkError | Kan geen verbinding maken met de server |
| errors.rateLimited | U heeft te veel verzoeken ingediend |
| errors.uploadFailed | Document uploaden mislukt |

---

## 8. Scope Protection

### 8.1 Not Localized (By Design)

| Area | Status |
|------|--------|
| Admin Dashboard | EN-only |
| Admin Case Detail | EN-only |
| Housing Wizard | EN-only |
| System Emails | EN-only |
| Database Content | Not translated |

### 8.2 District Names

District names in `DISTRICTS` constant remain official names (no translation needed):
- Paramaribo, Wanica, Nickerie, etc.

---

## 9. Verification Results

| Test | Result |
|------|--------|
| NL loads by default | ☑ PASS |
| EN switch works | ☑ PASS |
| Language persists | ☑ PASS |
| All wizard labels translated | ☑ PASS |
| Validation messages in NL | ☑ PASS |
| Error messages in NL | ☑ PASS |
| No hardcoded text | ☑ PASS |

---

## 10. Files Created

| File | Lines |
|------|-------|
| src/i18n/config.ts | 37 |
| src/i18n/locales/nl.json | 224 |
| src/i18n/locales/en.json | 224 |
| src/components/public/LanguageSwitcher.tsx | 55 |

---

## 11. Files Modified

| File | Change |
|------|--------|
| src/main.tsx | Added i18n import |
| src/app/(public)/bouwsubsidie/apply/page.tsx | useTranslation |
| src/app/(public)/bouwsubsidie/apply/constants.ts | labelKey pattern |
| All Step*.tsx files | useTranslation + t() |
| src/components/public/WizardStep.tsx | Translated labels |
| src/components/public/PublicHeader.tsx | LanguageSwitcher + translations |

---

**END OF LOCALIZATION REPORT**


# DVH-IMS V1.3 — PHASE 5B EXECUTION PLAN

## FULL PUBLIC NL STANDARDIZATION (P0 BLOCKING)

**Date:** 2026-02-01  
**Phase:** V1.3 Phase 5B — Full Public NL Standardization  
**Authorization:** P0 Blocking — No other phases may proceed  
**Scope:** PUBLIC FRONTEND ONLY — Admin remains EN-only

---

## 1. CURRENT STATE ANALYSIS

### 1.1 Localized (Phase 5A)
| Component | Status | Evidence |
|-----------|--------|----------|
| Bouwsubsidie Wizard (9 steps) | ✅ NL | Uses `useTranslation()`, `t()` keys |
| PublicHeader.tsx | ✅ NL | Uses `t('header.title')`, `t('header.ministry')` |
| WizardStep.tsx | ✅ NL | Uses `t('common.continue')`, `t('common.back')` |
| LanguageSwitcher.tsx | ✅ NL | Implemented with NL/EN toggle |
| nl.json / en.json | ✅ EXISTS | 224 lines each (Bouwsubsidie only) |

### 1.2 NOT Localized (Requires Phase 5B)

| Component | Hardcoded EN Text | Priority |
|-----------|-------------------|----------|
| **Landing Page** | 15+ hardcoded strings | P0 |
| **Housing Wizard (10 steps)** | 100+ hardcoded strings | P0 |
| **Status Tracker Page** | 20+ hardcoded strings | P0 |
| **StatusForm.tsx** | 15+ hardcoded strings | P0 |
| **StatusResult.tsx** | 12+ hardcoded strings | P0 |
| **StatusTimeline.tsx** | Date formatting locale | P0 |
| **PublicFooter.tsx** | 2 hardcoded strings | P0 |
| **Housing constants.ts** | 30+ option labels | P0 |
| **Status constants.ts** | 6 status labels | P0 |

---

## 2. PHASE 5B OBJECTIVES

### Part A: Landing Page Localization
- Translate all hero text, service cards, and button labels
- Use existing i18n keys pattern from Phase 5A

### Part B: Housing Wizard Full Localization
- Localize all 10 steps (Step0-Step9)
- Convert `constants.ts` options to use `labelKey` pattern
- Apply same validation message pattern as Bouwsubsidie

### Part C: Status Tracker Localization
- Localize StatusForm, StatusResult, StatusTimeline
- Translate status labels in constants.ts
- Apply date/time locale based on language

### Part D: Public Footer Localization
- Translate ministry name and version text

---

## 3. FILES TO MODIFY

### 3.1 Translation Files (Extend)
| File | Change |
|------|--------|
| `src/i18n/locales/nl.json` | Add `landing`, `housing`, `status`, `footer` sections |
| `src/i18n/locales/en.json` | Add matching English sections |

### 3.2 Landing Page
| File | Change |
|------|--------|
| `src/app/(public)/landing/page.tsx` | Add `useTranslation()`, replace all hardcoded text |

### 3.3 Housing Wizard
| File | Change |
|------|--------|
| `src/app/(public)/housing/register/page.tsx` | Add `useTranslation()`, translate error messages |
| `src/app/(public)/housing/register/constants.ts` | Change `label` to `labelKey` for all options |
| `src/app/(public)/housing/register/steps/Step0Introduction.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step4HousingPreference.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step5Reason.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step6Income.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step7Urgency.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step8Review.tsx` | Full i18n conversion |
| `src/app/(public)/housing/register/steps/Step9Receipt.tsx` | Full i18n conversion |

### 3.4 Status Tracker
| File | Change |
|------|--------|
| `src/app/(public)/status/page.tsx` | Add `useTranslation()`, translate error messages |
| `src/app/(public)/status/constants.ts` | Add `labelKey` for status definitions |
| `src/app/(public)/status/components/StatusForm.tsx` | Full i18n conversion |
| `src/app/(public)/status/components/StatusResult.tsx` | Full i18n conversion |
| `src/app/(public)/status/components/StatusTimeline.tsx` | Locale-aware date formatting |

### 3.5 Public Footer
| File | Change |
|------|--------|
| `src/components/public/PublicFooter.tsx` | Add `useTranslation()`, translate text |

---

## 4. TRANSLATION KEYS STRUCTURE (NEW SECTIONS)

```text
nl.json / en.json additions:

├── landing
│   ├── heroTitle
│   ├── heroDescription
│   ├── servicesTitle
│   ├── servicesSubtitle
│   ├── bouwsubsidie
│   │   ├── title
│   │   ├── description
│   │   └── button
│   ├── housing
│   │   ├── title
│   │   ├── description
│   │   └── button
│   └── status
│       ├── title
│       ├── description
│       └── button
├── housing
│   ├── title
│   ├── step0 (Introduction)
│   ├── step1 (Personal)
│   ├── step2 (Contact)
│   ├── step3 (Living)
│   ├── step4 (Preference)
│   ├── step5 (Reason)
│   ├── step6 (Income)
│   ├── step7 (Urgency)
│   ├── step8 (Review)
│   ├── step9 (Receipt)
│   ├── housingTypes
│   ├── interestTypes
│   ├── reasons
│   ├── incomeSources
│   └── gender
├── status
│   ├── title
│   ├── description
│   ├── form (labels, placeholders, validation)
│   ├── result (labels, sections)
│   ├── statuses (submitted, under_review, etc.)
│   └── help
└── footer
    ├── copyright
    └── version
```

---

## 5. IMPLEMENTATION STEPS

### Step 5B-1: Create Restore Point
Create `RESTORE_POINT_V1.3_PHASE5B_START.md`

### Step 5B-2: Extend Translation Files
- Add ~300 new translation keys to nl.json
- Add ~300 matching keys to en.json

### Step 5B-3: Localize Landing Page
- Import `useTranslation` hook
- Replace all hardcoded text with `t()` calls

### Step 5B-4: Localize Housing Wizard Constants
- Convert all option arrays to use `labelKey` pattern
- Update `WIZARD_STEPS` to use `titleKey`

### Step 5B-5: Localize Housing Wizard Page
- Add `useTranslation()` hook
- Translate error messages
- Translate step titles for progress

### Step 5B-6: Localize Housing Steps (10 files)
- Each step: import `useTranslation`, replace text
- Apply same pattern as Bouwsubsidie steps

### Step 5B-7: Localize Status Tracker
- StatusForm: form labels, placeholders, validation
- StatusResult: section headers, labels
- StatusTimeline: locale-aware date formatting

### Step 5B-8: Localize Public Footer
- Translate ministry text and version

### Step 5B-9: Update Status Constants
- Add `labelKey` for status definitions

### Step 5B-10: Verification Testing
- Test NL default on all public pages
- Test EN switch functionality
- Verify no EN text when NL active
- Verify Admin unchanged

### Step 5B-11: Create Documentation
- PHASE-5B-PUBLIC-NL-COVERAGE-REPORT.md
- PHASE-5B-I18N-ENFORCEMENT-REPORT.md
- PHASE-5B-VERIFICATION-CHECKLIST.md

### Step 5B-12: Create Completion Restore Point
Create `RESTORE_POINT_V1.3_PHASE5B_COMPLETE.md`

---

## 6. FILES TO CREATE

| File | Purpose |
|------|---------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5B_START.md` | Pre-phase restore point |
| `phases/DVH-IMS-V1.3/PHASE-5B/PHASE-5B-PUBLIC-NL-COVERAGE-REPORT.md` | Page-by-page coverage |
| `phases/DVH-IMS-V1.3/PHASE-5B/PHASE-5B-I18N-ENFORCEMENT-REPORT.md` | No hardcoded text confirmation |
| `phases/DVH-IMS-V1.3/PHASE-5B/PHASE-5B-VERIFICATION-CHECKLIST.md` | Test results |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5B_COMPLETE.md` | Post-phase restore point |

---

## 7. VERIFICATION MATRIX

| Test ID | Scenario | Expected Result |
|---------|----------|-----------------|
| P5B-T01 | Landing page first load | NL default everywhere |
| P5B-T02 | Landing page EN switch | All text in English |
| P5B-T03 | Housing wizard first load | NL default |
| P5B-T04 | Housing wizard all steps | NL labels, validation, errors |
| P5B-T05 | Status tracker first load | NL default |
| P5B-T06 | Status form labels | NL placeholders, validation |
| P5B-T07 | Status result display | NL dates, labels |
| P5B-T08 | Footer text | NL ministry name |
| P5B-T09 | Language persistence | Preference saved in session |
| P5B-T10 | Admin unchanged | All admin pages EN-only |
| P5B-T11 | Bouwsubsidie unchanged | No regression from 5A |

---

## 8. EXPLICIT CONSTRAINTS

### 8.1 Allowed Actions
| Action | Authorized |
|--------|------------|
| Extend translation files | ALLOWED |
| Modify public pages for i18n | ALLOWED |
| Add `useTranslation` to public components | ALLOWED |
| Change option arrays to labelKey pattern | ALLOWED |

### 8.2 Forbidden Actions
| Action | Status |
|--------|--------|
| Localize Admin UI | FORBIDDEN |
| Change roles or permissions | FORBIDDEN |
| Modify workflow logic | FORBIDDEN |
| Change authentication | FORBIDDEN |
| Modify database schema | FORBIDDEN |

---

## 9. ESTIMATED EFFORT

| Component | Files | Estimated Time |
|-----------|-------|----------------|
| Translation files | 2 | 2 hours |
| Landing page | 1 | 0.5 hours |
| Housing wizard | 12 | 3 hours |
| Status tracker | 5 | 1.5 hours |
| Public footer | 1 | 0.5 hours |
| Documentation | 5 | 1 hour |
| Testing | - | 1 hour |
| **TOTAL** | 26 files | ~9.5 hours |

---

## 10. DELIVERABLES

| # | Artifact | Purpose |
|---|----------|---------|
| 1 | RESTORE_POINT_V1.3_PHASE5B_START.md | Pre-phase snapshot |
| 2 | Extended nl.json (~500 keys total) | Dutch translations |
| 3 | Extended en.json (~500 keys total) | English translations |
| 4 | Localized landing page | NL default |
| 5 | Localized housing wizard (10 steps) | NL default |
| 6 | Localized status tracker (3 components) | NL default |
| 7 | Localized public footer | NL default |
| 8 | PHASE-5B-PUBLIC-NL-COVERAGE-REPORT.md | Coverage documentation |
| 9 | PHASE-5B-I18N-ENFORCEMENT-REPORT.md | Enforcement confirmation |
| 10 | PHASE-5B-VERIFICATION-CHECKLIST.md | Test results |
| 11 | RESTORE_POINT_V1.3_PHASE5B_COMPLETE.md | Post-phase snapshot |

---

## 11. GOVERNANCE STATEMENT

**V1.3 Phase 5B implements FULL PUBLIC NL STANDARDIZATION.**

- ALL public-facing content will default to Dutch (NL)
- English remains available via language switch
- Language preference persists per session
- Admin interface remains EN-only
- No workflow, role, or schema changes

**STOP after Phase 5B completion and await authorization for next phase.**

---

**PHASE 5B — FULL PUBLIC NL STANDARDIZATION — AWAITING APPROVAL TO BEGIN IMPLEMENTATION**


# DVH-IMS V1.3 — PHASE 5B PRE-IMPLEMENTATION RESTORE POINT

**Created:** 2026-02-01  
**Phase:** V1.3 Phase 5B — Full Public NL Standardization  
**Purpose:** Pre-phase snapshot before implementing full public NL localization

---

## STATE BEFORE PHASE 5B

### i18n Framework Status
- ✅ react-i18next INSTALLED
- ✅ nl.json EXISTS (224 lines - Bouwsubsidie only)
- ✅ en.json EXISTS (224 lines - Bouwsubsidie only)
- ✅ LanguageSwitcher.tsx EXISTS
- ✅ Bouwsubsidie wizard FULLY LOCALIZED (Phase 5A)

### Files NOT YET Localized (Phase 5B Scope)
| File | Status | Hardcoded EN Count |
|------|--------|-------------------|
| `src/app/(public)/landing/page.tsx` | NOT LOCALIZED | 15+ strings |
| `src/app/(public)/housing/register/page.tsx` | NOT LOCALIZED | 5 error strings |
| `src/app/(public)/housing/register/constants.ts` | NOT LOCALIZED | 30+ labels |
| `src/app/(public)/housing/register/steps/Step0Introduction.tsx` | NOT LOCALIZED | 20+ strings |
| `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx` | NOT LOCALIZED | 15+ strings |
| `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx` | NOT LOCALIZED | 10 strings |
| `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx` | NOT LOCALIZED | 15+ strings |
| `src/app/(public)/housing/register/steps/Step4HousingPreference.tsx` | NOT LOCALIZED | 12+ strings |
| `src/app/(public)/housing/register/steps/Step5Reason.tsx` | NOT LOCALIZED | 8 strings |
| `src/app/(public)/housing/register/steps/Step6Income.tsx` | NOT LOCALIZED | 12+ strings |
| `src/app/(public)/housing/register/steps/Step7Urgency.tsx` | NOT LOCALIZED | 15+ strings |
| `src/app/(public)/housing/register/steps/Step8Review.tsx` | NOT LOCALIZED | 25+ strings |
| `src/app/(public)/housing/register/steps/Step9Receipt.tsx` | NOT LOCALIZED | 25+ strings |
| `src/app/(public)/status/page.tsx` | NOT LOCALIZED | 10+ strings |
| `src/app/(public)/status/constants.ts` | NOT LOCALIZED | 6 status labels |
| `src/app/(public)/status/components/StatusForm.tsx` | NOT LOCALIZED | 15+ strings |
| `src/app/(public)/status/components/StatusResult.tsx` | NOT LOCALIZED | 12+ strings |
| `src/app/(public)/status/components/StatusTimeline.tsx` | NOT LOCALIZED | Date formatting |
| `src/components/public/PublicFooter.tsx` | NOT LOCALIZED | 2 strings |

### Translation File Counts
- nl.json: 224 lines (Bouwsubsidie + common + validation + errors)
- en.json: 224 lines (matching English)

### Components Already Localized (Phase 5A)
- ✅ Bouwsubsidie wizard (9 steps)
- ✅ PublicHeader.tsx
- ✅ WizardStep.tsx

---

## PHASE 5B SCOPE

### Objective
Standardize ALL public-facing content to Dutch (NL) by default while maintaining English switch functionality.

### Files to Modify
1. **Translation files** - Add ~300 new keys for landing, housing, status, footer
2. **Landing page** - Add useTranslation, replace hardcoded text
3. **Housing wizard** - Full i18n conversion (10 steps + constants + page)
4. **Status tracker** - Full i18n conversion (page + 3 components + constants)
5. **Public footer** - Add useTranslation, translate text

### Forbidden Actions
- ❌ Admin UI localization
- ❌ Role or permission changes
- ❌ Workflow logic changes
- ❌ Authentication changes
- ❌ Database schema changes

---

## GOVERNANCE

This restore point captures the system state immediately before Phase 5B implementation.

If Phase 5B encounters issues, this restore point provides the reference state for rollback assessment.

**END OF RESTORE POINT**

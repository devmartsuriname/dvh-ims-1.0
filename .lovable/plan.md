

# Phase 9C — Small Utility / Naming Cleanup

## Part 1: Rename `src/helpers/Manu.ts` → `src/helpers/Menu.ts`

- Create `src/helpers/Menu.ts` with identical contents of `Manu.ts`
- Delete `src/helpers/Manu.ts`
- Update 2 imports:
  1. `src/components/layout/VerticalNavigationBar/page.tsx` — line 1
  2. `src/components/layout/VerticalNavigationBar/components/AppMenu.tsx` — line 2

## Part 2: Rename `src/components/from/` → `src/components/form/`

- Create `src/components/form/TextFormInput.tsx` with identical contents
- Delete `src/components/from/TextFormInput.tsx`
- Update 13 imports (`@/components/from/TextFormInput` → `@/components/form/TextFormInput`):
  1. `src/app/(admin)/households/components/HouseholdFormModal.tsx`
  2. `src/app/(admin)/persons/components/PersonFormModal.tsx`
  3. `src/app/(other)/auth/sign-in/components/SignIn.tsx`
  4. `src/app/(other)/auth/sign-up/components/SignUp.tsx`
  5. `src/app/(other)/auth/reset-password/components/ResetPassword.tsx`
  6. `src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx`
  7. `src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx`
  8. `src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx`
  9. `src/app/(public)/bouwsubsidie/apply/steps/Step5Context.tsx`
  10. `src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx`
  11. `src/app/(public)/housing/register/steps/Step2ContactInfo.tsx`
  12. `src/app/(public)/housing/register/steps/Step3LivingSituation.tsx`
  13. `src/app/(public)/housing/register/steps/Step6Income.tsx`

## Summary

| Metric | Count |
|---|---|
| New files | 2 |
| Deleted files | 2 |
| Modified files | 15 |
| **Total file operations** | **19** |

All changes are import path updates only. Zero logic changes. Post-implementation: global search to confirm zero remaining references to `Manu` and `components/from/`.


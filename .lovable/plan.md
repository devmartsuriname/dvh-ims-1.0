# Phase 9 — Revised Execution Plan

---

## Phase 9A — Safe Dead Code Removal

**Scope:** Remove duplicate file, consolidate single reference.


| #   | Action                                                                                          | Files Touched | Audit Finding                                 | Risk |
| --- | ----------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------- | ---- |
| 1   | Delete `src/components/FallbackLoading.tsx`                                                     | 1 deleted     | #1 — exact duplicate of `LoadingFallback.tsx` | Low  |
| 2   | Update `src/layouts/AuthLayout.tsx` — change import from `FallbackLoading` to `LoadingFallback` | 1 modified    | Same                                          | Low  |


**Total: 1 deleted, 1 modified = 2 file operations**

---

## Phase 9B — UI / Template Artifact Cleanup

**Scope:** Remove decorative template artifacts with no business purpose. Items classified NEEDS REVIEW in the audit — presented here for explicit approval.


| #   | Action                                                                   | Files Touched | Audit Finding                                    | Risk | Note                                                                                       |
| --- | ------------------------------------------------------------------------ | ------------- | ------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------ |
| 1   | Delete `src/components/AnimationStar.tsx`                                | 1 deleted     | #9 — decorative star animation, Darkone artifact | Low  | &nbsp;                                                                                     |
| 2   | Remove `AnimationStar` import + usage from `src/layouts/AdminLayout.tsx` | 1 modified    | Same                                             | Low  | Single `<AnimationStar />` line removed                                                    |
| 3   | `VectorMap` / `CountryMap`                                               | 0             | #10                                              | —    | **NO ACTION** — search shows zero imports; already removed in earlier phases               |
| 4   | `ThemeCustomizer`                                                        | 0             | #11                                              | —    | **DEFERRED** — deeply integrated into `useLayoutContext` and type system; not safe cleanup |


**Total: 1 deleted, 1 modified = 2 file operations**

---

## Phase 9C — Small Utility / Naming Cleanup

**Scope:** Fix naming typos. No logic changes, no runtime behavior change.


| #   | Action                                                                             | Files Touched    | Audit Finding       | Risk |
| --- | ---------------------------------------------------------------------------------- | ---------------- | ------------------- | ---- |
| 1   | Rename `src/helpers/Manu.ts` to `src/helpers/Menu.ts`                              | 1 new, 1 deleted | #3 — typo filename  | Low  |
| 2   | Update 2 imports of `Manu` in `VerticalNavigationBar/page.tsx` and `AppMenu.tsx`   | 2 modified       | Same                | Low  |
| 3   | Rename `src/components/from/` to `src/components/form/` (move `TextFormInput.tsx`) | 1 new, 1 deleted | #2 — typo directory | Low  |
| 4   | Update ~14 imports of `@/components/from/TextFormInput` across 14 files            | 14 modified      | Same                | Low  |


**Total: 2 new, 2 deleted, 16 modified = 20 file operations**

---

## Phase 9D — Edge Function Shared Module Extraction

**DEFERRED to after 9A–9C are complete and verified.**

Will extract `corsHeaders`, `createRateLimiter`, `VALID_DISTRICTS`, `isValidUUID` into `supabase/functions/_shared/` modules. Revisited only after cleanup phases pass build verification.

---

## Execution Order

1. **Phase 9A** — 2 file ops — await approval + verify build
2. **Phase 9B** — 2 file ops — await approval + verify build
3. **Phase 9C** — 20 file ops — await approval + verify build
4. **Phase 9D** — deferred

Each sub-phase produces a restore point and stops for authorization.  
  
**Before executing Phase 9C renames, perform a full project search**

to confirm zero remaining references to:

- src/helpers/Manu.ts

- src/components/from/

including dynamic imports and path aliases.

Proceed only if search confirms all references are updated.
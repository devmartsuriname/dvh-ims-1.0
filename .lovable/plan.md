# Frontend Audit & Planning Pass — VolksHuisvesting IMS

---

## A. Executive Summary

The codebase carries significant legacy weight from the Darkone template it was forked from. Key findings:

- **~15 unused dependencies** in package.json (FullCalendar, google-maps-react, embla-carousel, recharts, axios-mock-adapter, cookies-next, next-themes, gumshoejs, react-quill, etc.)
- **~25 dead/demo files** including brand images, small gallery images, unused avatar images, demo data types, deprecated helpers, and unused components
- **732-line externals.d.ts** with type stubs for packages that are either unused or already installed
- **Email/Chat context system** fully wired but never used
- **VectorMap components** for 5 countries — only WorldMap used (dashboard)
- **SCSS plugins** for features never used in this project (editors, google-map)
- **ThemeCustomizer** and **AnimationStar** are template artifacts still rendered in AdminLayout

Overall health: Functional but bloated. Estimated ~30% of files are dead weight from the template.

---

## B. Section 1 — Dead Code Removal / Demo Item Cleanup / Type Cleanup

### 1. Suspected Dead Code Areas


| Category                      | Files                                                                                             | Risk                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Deprecated helpers**        | `src/helpers/fake-backend.ts`                                                                     | Safe — marked deprecated, zero imports                                                               |
| **Unused components**         | `ComponentContainerCard.tsx`, `Preloader.tsx`, `CustomFlatpickr.tsx`                              | Safe — zero imports outside own file                                                                 |
| **Unused form components**    | `ChoicesFormInput.tsx`, `DropzoneFormInput.tsx`, `PasswordFormInput.tsx`, `TextAreaFormInput.tsx` | Safe — zero external imports                                                                         |
| **Unused hooks**              | `useModal.ts`, `useFileUploader.ts`                                                               | Safe — useModal has zero external imports; useFileUploader only imported by unused DropzoneFormInput |
| **Unused VectorMap variants** | `CanadaMap.tsx`, `SpainMap.tsx`, `IraqVectorMap.tsx`, `RussiaMap.tsx`, `VectorMap/index.tsx`      | Safe — only WorldMap is imported                                                                     |
| **Email context system**      | `useEmailContext.tsx` + Email types in `context.ts` and `data.ts`                                 | Medium — types referenced by context.ts                                                              |
| **ThemeCustomizer**           | `ThemeCustomizer.tsx` + layout context wiring                                                     | Medium — imported in AdminLayout via layout context                                                  |


### 2. Suspected Demo-Only Code


| Item                   | Location                                                                                                                                      | Evidence                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Brand logos            | `src/assets/images/brands/` (5 SVGs)                                                                                                          | Zero imports                               |
| Gallery images         | `src/assets/images/small/` (10 JPGs)                                                                                                          | Zero imports                               |
| Unused avatars         | `src/assets/images/users/avatar-2..10.jpg`                                                                                                    | Only avatar-1 imported                     |
| Demo background images | `bg-pattern-1.png`, `bg-pattern.svg`                                                                                                          | Zero imports                               |
| `maintenance.svg`      | `src/assets/images/`                                                                                                                          | Zero imports                               |
| Demo notification data | `src/assets/data/topbar.ts`                                                                                                                   | Already emptied but file remains           |
| Demo data types        | `src/types/data.ts` — EmailType, PropertyType, CustomerType, PricingType, ProjectType, TodoType, SellerType, SocialEventType, GroupType, etc. | Template artifacts, not used by IMS domain |


### 3. Suspected Type Cleanup Areas


| File                                   | Issue                                                                                                            |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `src/types/externals.d.ts` (732 lines) | Massive stub file. Many stubs are for installed packages (redundant) or unused packages. Needs audit per-module. |
| `src/types/data.ts` (236 lines)        | ~80% demo types. Only `NotificationType`, `FileType`, and `IdType` may be active.                                |
| `src/types/context.ts`                 | Contains `EmailContextType`, `EmailOffcanvasStatesType`, `ChatOffcanvasStatesType` — all unused.                 |
| `src/types/component-props.ts`         | Imports FullCalendar types — never used in IMS.                                                                  |
| `src/types/gumshoejs.d.ts`             | Stub for unused dependency.                                                                                      |
| `src/types/react-bootstrap-types.d.ts` | Needs verification of actual usage.                                                                              |


### 4. Recommended Execution Order

**Batch 1 — Safe Deletions (Risk: LOW, ~12 files)**

- `fake-backend.ts`
- `ComponentContainerCard.tsx`
- `Preloader.tsx`
- `CustomFlatpickr.tsx`
- `ChoicesFormInput.tsx`, `DropzoneFormInput.tsx`, `PasswordFormInput.tsx`, `TextAreaFormInput.tsx`
- `useModal.ts`
- `gumshoejs.d.ts`
- `VectorMap/CanadaMap.tsx`, `SpainMap.tsx`, `IraqVectorMap.tsx`, `RussiaMap.tsx`

**Batch 2 — Image Cleanup (Risk: LOW, ~20 files)**

- `src/assets/images/brands/*` (5 files)
- `src/assets/images/small/*` (10 files)
- `src/assets/images/users/avatar-2..10.jpg` (9 files)
- `bg-pattern-1.png`, `bg-pattern.svg`, `maintenance.svg`

**Batch 3 — Type/Context Cleanup (Risk: MEDIUM, ~5 files)**

- Trim `data.ts` to active types only
- Trim `context.ts` to remove Email/Chat types
- Remove `useEmailContext.tsx`
- Trim `externals.d.ts` (remove stubs for installed/unused packages)
- Clean `component-props.ts` FullCalendar imports

**Batch 4 — Layout Artifact Removal (Risk: MEDIUM, ~3 files)**

- Remove `AnimationStar.tsx` + its import from AdminLayout
- Remove `ThemeCustomizer.tsx` + its wiring from layout context
- Requires manual review: confirm no admin functionality depends on ThemeCustomizer

### 5. Risky Files — DO NOT TOUCH Casually

- `src/types/v12-roles.ts` — Governance documentation, must remain
- `src/context/useLayoutContext.tsx` — Core layout system, changes cascade
- `src/routes/index.tsx` — All routes, needs careful handling
- `src/assets/scss/style.scss` — Master import, removal of SCSS partials must be coordinated

---

## C. Section 2 — Performance Plan

### 1. Likely Performance Bottlenecks


| Area                    | Impact      | Detail                                                                                                                                                                                                                                                 |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unused npm packages** | Bundle size | ~15 packages installed but never imported (FullCalendar suite, google-maps-react, embla-carousel, recharts, axios-mock-adapter, cookies-next, next-themes, gumshoejs, react-quill, cmdk, vaul, input-otp, sonner). Tree-shaking may not eliminate all. |
| **jsvectormap**         | Bundle size | Loads 5 country map data files; only world map used                                                                                                                                                                                                    |
| **externals.d.ts**      | Build time  | 732-line type file parsed every build                                                                                                                                                                                                                  |
| **gridjs**              | Render cost | Used in 4+ admin tables; acceptable but monitor                                                                                                                                                                                                        |


### 2. Low-Risk Quick Wins

1. Remove unused npm dependencies from `package.json` (~15 packages)
2. Remove unused VectorMap country imports (keep only WorldMap)
3. Lazy-load heavy admin components already done via `lazy()` — verified OK

### 3. Medium-Risk Optimizations

1. Audit `externals.d.ts` — remove stubs for installed packages (type resolution already handled by node_modules)
2. Consider whether dashboard ApexCharts data is efficiently loaded
3. Review image sizes for `hero-community.png` and `side-img.jpg`

### 4. Estimated Impact


| Action                    | Estimated Bundle Reduction            |
| ------------------------- | ------------------------------------- |
| Remove unused deps        | 5-15% (depends on tree-shaking)       |
| Remove VectorMap variants | Minor (~50KB)                         |
| Image optimization        | Load time improvement on public pages |


### 5. Recommended Execution Order

1. Dependency audit + removal (after dead code cleanup)
2. Image size audit
3. Build size measurement (before/after)

---

## D. Section 3 — Unused SCSS Files Audit

### 1. Likely Unused SCSS Files


| File                                 | Reason                      |
| ------------------------------------ | --------------------------- |
| `plugins/_editors.scss`              | react-quill not used in IMS |
| `plugins/_google-map.scss`           | google-maps-react not used  |
| `plugins/_dropzone.scss`             | DropzoneFormInput unused    |
| `plugins/_flatpicker.scss`           | CustomFlatpickr unused      |
| `pages/_icon-demo.scss`              | No icon demo page in routes |
| `icons/icons.scss` + `icons/` folder | Needs verification          |


### 2. Uncertain — Requires Validation


| File                              | Status                                   |
| --------------------------------- | ---------------------------------------- |
| `plugins/_vector-map.scss`        | Used by dashboard WorldMap — KEEP        |
| `plugins/_apexcharts.scss`        | Used by dashboard — KEEP                 |
| `plugins/_gridjs.scss`            | Used by admin tables — KEEP              |
| `plugins/_simplebar.scss`         | Used by layout — KEEP                    |
| `components/_search-results.scss` | Verify if GlobalSearch uses these styles |
| `components/_widgets.scss`        | Verify dashboard widget usage            |


### 3. Definitely Active — DO NOT TOUCH

All `structure/` files, `config/` files, `components/_card.scss`, `_buttons.scss`, `_forms.scss`, `_tables.scss`, `_nav.scss`, `_public-landing.scss`, `_avatar.scss`, `_badge.scss`, `_breadcrumb.scss`, `_dropdown.scss`, `_modal.scss`, `_type.scss`, `_reboot.scss`, `_helper.scss`, `_backgrounds.scss`.

### 4. Safe Verification Strategy

1. Comment out `@import` line in `style.scss`
2. Build project
3. Visually verify affected pages
4. If no regression → safe to remove file and import

### 5. Phased Removal Plan

- Phase A: Remove clearly unused plugin SCSS (editors, google-map, dropzone, flatpicker) — 4 files
- Phase B: Remove icon-demo page SCSS — 1 file
- Phase C: Validate uncertain files one at a time

---

## E. Section 4 — Mobile UX / Accessibility / Performance Check

### 1. Audit Checklist

**Mobile UX:**

- Touch targets ≥ 44px on all interactive elements
- Card grid stacking (1-col on mobile verified)
- Wizard step navigation usable on 320px width
- Form inputs not overflowing on small screens
- Sidebar collapse behavior on mobile
- Landing page image panel hidden on mobile (verified — d-none d-lg-flex)
- Status tracker form usable on mobile

**Accessibility:**

- Heading hierarchy (h1 → h2 → h3 correct order)
- Color contrast ratios meet WCAG AA
- All form inputs have labels
- Focus states visible on all interactive elements
- Keyboard navigation through wizard steps
- ARIA labels on icon-only buttons
- Skip-to-content link presence
- Alert/error messages announced to screen readers

**Performance:**

- Landing page loads without unnecessary JS
- Admin dashboard initial load time
- Wizard step transitions smooth
- No layout shifts on page load

### 2. High-Priority Screens to Review First

1. Landing page (public entry point)
2. Housing wizard (citizen-facing, multi-step)
3. Bouwsubsidie wizard (citizen-facing, multi-step)
4. Status tracker (public)
5. Dashboard (admin entry point)

### 3. Expected Likely Issues

- Icon-only buttons in admin TopBar missing ARIA labels
- Wizard forms may have tight touch targets on mobile
- Admin sidebar may not be fully keyboard-navigable
- Color contrast on muted text elements
- No skip-to-content link

### 4. Recommended Execution Order

1. Automated Lighthouse audit on landing + wizard pages
2. Manual mobile viewport testing (320px, 375px, 768px)
3. Keyboard navigation walkthrough on wizard
4. Contrast checker on public pages
5. Admin accessibility pass (lower priority)

### 5. Automated vs Manual


| Check               | Method                           |
| ------------------- | -------------------------------- |
| Contrast ratios     | Lighthouse / automated           |
| Heading hierarchy   | Automated HTML audit             |
| Touch target size   | Manual inspection                |
| Keyboard navigation | Manual                           |
| Screen reader       | Manual                           |
| Layout overflow     | Browser DevTools responsive mode |
| Performance scores  | Lighthouse                       |


---

## F. Master Execution Plan

### Phase 1 — Safe Dead Code Cleanup

- **Scope**: Batch 1 (unused components, helpers, hooks) + Batch 2 (demo images)
- **Estimated files**: ~32
- **Risk**: LOW
- **Blockers**: None
- **Success criteria**: Build passes, no broken imports, no visual regression

### Phase 2 — Performance Quick Wins

- **Scope**: Remove unused npm dependencies, trim VectorMap variants
- **Estimated files**: package.json + ~5 component files
- **Risk**: LOW-MEDIUM
- **Blockers**: Verify tree-shaking behavior
- **Success criteria**: Smaller bundle, build passes

### Phase 3 — SCSS Validation & Removal

- **Scope**: Remove 4-5 unused SCSS plugin files, validate uncertain ones
- **Estimated files**: ~6 SCSS files + style.scss import updates
- **Risk**: LOW
- **Blockers**: Each removal requires visual verification
- **Success criteria**: No styling regressions on any page

### Phase 4 — Type Cleanup + Context Cleanup

- **Scope**: Trim data.ts, context.ts, externals.d.ts, remove EmailContext
- **Estimated files**: ~5
- **Risk**: MEDIUM
- **Blockers**: Must verify no cascading type errors
- **Success criteria**: Build passes, TypeScript clean

### Phase 5 — Mobile/Accessibility Remediation + Final Verification

- **Scope**: Fix issues found in Section E audit
- **Estimated files**: TBD based on audit findings
- **Risk**: LOW-MEDIUM
- **Blockers**: Audit must complete first
- **Success criteria**: Lighthouse scores improved, no accessibility violations on public pages, mobile UX validated

---

**Background color `#f8fafc` remains unchanged throughout all phases.**

**Plan looks good.**

One adjustment required before execution:

Phase 1 exceeds the under-25 file change limit.

Split Phase 1 into two batches so that each execution stays below the 25-file change constraint.

Example:

Phase 1A — Safe code cleanup

Phase 1B — Demo image cleanup

All other sections are approved.

Proceed only after adjusting the batch sizing.  
Awaiting authorization to proceed.
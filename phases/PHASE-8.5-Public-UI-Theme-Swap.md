# Phase 8.5 — Public UI Theme Swap (Neonwizard Skin)

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** PENDING  
**Authority:** Delroy (Final)  
**Baseline Restore Point:** PHASE-8-COMPLETE  
**Target Restore Point:** PHASE-8.5-COMPLETE

---

## A. Phase Objective

Apply the Neonwizard visual design language to ALL public-facing pages while maintaining complete functional parity:

- **Landing page** (`/`)
- **Bouwsubsidie Wizard** (`/bouwsubsidie/apply`)
- **Housing Registration Wizard** (`/housing/register`)
- **Status Tracking Page** (`/status`)

This is a **visual reskin only**. All routes, step sequences, validations, form logic, and data flows remain unchanged.

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| SCSS | Create namespaced `src/assets/scss/neonwizard/` with strict `.neonwizard-scope` isolation |
| SCSS | Extract Neonwizard visual patterns (colors, gradients, shadows, borders, spacing) |
| SCSS | Apply to PublicLayout wrapper via scoped class |
| Components | Restyle existing wizard components (WizardContainer, WizardProgress, WizardStepCard) |
| Components | Restyle PublicHeader and PublicFooter |
| Components | Update public landing page visual design |
| Icons | Map Font Awesome icons from template to equivalent Iconify (mingcute:*) icons |
| Typography | Use existing Darkone fonts (no new font imports) |
| Images | Add Neonwizard decorative assets to `src/assets/images/neonwizard/` |
| Images | Add Neonwizard decorative assets to `public/images/neonwizard/` if needed for CSS |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Routes | NO route changes — all paths remain identical |
| Logic | NO wizard step logic changes |
| Logic | NO validation changes |
| Logic | NO form field additions/removals |
| Logic | NO data submission changes |
| Database | NO schema changes |
| Database | NO RLS changes |
| Fonts | NO new font imports (use existing Darkone fonts) |
| Icons | NO Font Awesome library import |
| JavaScript | NO jQuery or jQuery plugins |
| Admin | NO changes to Darkone Admin UI |
| Admin | NO changes to admin SCSS |
| Admin | NO changes to admin routes or layouts |

---

## D. Database Impact

### Schema Changes
- **None** — This phase is UI-only

### RLS Changes
- **None** — No policy modifications

### Migration Required
- **No** — No database changes

---

## E. Security & RLS Considerations

### Security Impact
- **None** — This phase does not affect authentication, authorization, or data access

### Public Page Security
- All existing security controls remain in place
- Status page token validation unchanged
- No new API endpoints
- No new data exposure

### RLS Posture
- Unchanged from Phase 8 baseline (allowlist model)

---

## F. Audit Trail Requirements

### Audit Impact
- **None** — No auditable actions are modified

### Existing Audit Preservation
- All existing audit hooks in wizard submission flows remain intact
- No audit logging code changes permitted

---

## G. UI Impact

### Affected Components

| Component | File Path | Change Type |
|-----------|-----------|-------------|
| PublicLayout | `src/layouts/PublicLayout.tsx` | Add `.neonwizard-scope` class |
| PublicHeader | `src/components/public/PublicHeader.tsx` | Visual restyle |
| PublicFooter | `src/components/public/PublicFooter.tsx` | Visual restyle |
| WizardContainer | `src/components/public/WizardContainer.tsx` | Visual restyle |
| WizardProgress | `src/components/public/WizardProgress.tsx` | Visual restyle |
| WizardStepCard | `src/components/public/WizardStepCard.tsx` | Visual restyle |
| Landing Page | `src/app/(public)/landing/page.tsx` | Visual restyle |
| Status Page | `src/app/(public)/status/page.tsx` | Visual restyle |

### Unaffected Components
- ALL Admin components
- ALL Admin layouts
- ALL Admin pages
- ALL AdminLayout, AdminSidebar, AdminHeader

### CSS Isolation Strategy

```scss
// All Neonwizard styles MUST be wrapped
.neonwizard-scope {
  // Variables
  @import "neonwizard/variables";
  
  // Component styles
  @import "neonwizard/wizard";
  @import "neonwizard/header";
  @import "neonwizard/footer";
  @import "neonwizard/progress";
  
  // Responsive
  @import "neonwizard/responsive";
}
```

### Darkone Admin Protection
- Neonwizard SCSS is NEVER imported in main `style.scss`
- `.neonwizard-scope` class ONLY applied in PublicLayout
- AdminLayout remains completely untouched
- No global CSS resets or body styles

---

## H. Component Inventory (Track A: Darkone-Compliant)

### Visual Patterns to Extract

| Pattern | Neonwizard Source | Implementation |
|---------|-------------------|----------------|
| Gradient backgrounds | Template CSS | Darkone color variables |
| Progress bar styling | `_wizard.scss` | CSS only, no JS |
| Step number circles | Template components | Existing React state |
| Form card shadows | Template CSS | CSS box-shadow |
| Button hover effects | Template CSS | CSS transitions |
| Input field styling | Template CSS | Form control overrides |
| Success/error states | Template CSS | Existing validation hooks |

### Icon Mapping

| Neonwizard (Font Awesome) | Darkone (Iconify) |
|---------------------------|-------------------|
| `fa-user` | `mingcute:user-2-line` |
| `fa-home` | `mingcute:home-2-line` |
| `fa-file` | `mingcute:file-line` |
| `fa-check` | `mingcute:check-line` |
| `fa-arrow-right` | `mingcute:arrow-right-line` |
| `fa-arrow-left` | `mingcute:arrow-left-line` |
| `fa-search` | `mingcute:search-line` |
| `fa-phone` | `mingcute:phone-line` |
| `fa-envelope` | `mingcute:mail-line` |

---

## I. Content Carry-Over

### Preserved Content

| Element | Current Location | Target Location |
|---------|------------------|-----------------|
| SoZaVo Logo | PublicHeader | Restyled header |
| Ministry Title | Header | Title area |
| Service Cards | Landing | Restyled cards |
| Wizard Links | Cards | Same paths |
| Copyright | PublicFooter | Restyled footer |
| Staff Portal Link | Header | Navigation |
| Legal Disclaimer | Footer | Footer |

### Content Changes
- **None** — All text, links, and legal content preserved exactly

---

## J. Verification Criteria

### Build Verification
- [ ] No build errors
- [ ] No TypeScript errors
- [ ] No console errors on public pages

### Visual Verification
- [ ] Landing page displays Neonwizard design
- [ ] Bouwsubsidie wizard displays Neonwizard design
- [ ] Housing wizard displays Neonwizard design
- [ ] Status page displays Neonwizard design
- [ ] All pages responsive (mobile, tablet, desktop)

### Functional Verification
- [ ] Landing page links work
- [ ] Bouwsubsidie wizard step navigation works
- [ ] Bouwsubsidie wizard validation works
- [ ] Housing wizard step navigation works
- [ ] Housing wizard validation works
- [ ] Status page lookup works

### Admin Isolation Verification
- [ ] Admin dashboard unchanged (dark theme)
- [ ] Admin sidebar unchanged
- [ ] Admin forms unchanged
- [ ] Admin tables unchanged
- [ ] No Neonwizard styles leak to admin

### No-Regression Checklist
- [ ] All wizard steps load correctly
- [ ] Form validations fire correctly
- [ ] Step transitions work
- [ ] Back navigation works
- [ ] Form data persists between steps
- [ ] Final review step shows all data
- [ ] Submit actions functional (when connected)

---

## K. Restore Point Requirement

### Pre-Phase Restore Point
`PHASE-8-COMPLETE` (current baseline)

### Post-Phase Restore Point
`PHASE-8.5-COMPLETE`

### Restore Point Contents
- All Neonwizard SCSS files created
- All public components restyled
- No admin changes
- Clean build state
- Verification checklist complete

---

## L. Rollback Strategy

If Phase 8.5 causes issues:

1. **Immediate Rollback:**
   - Remove `.neonwizard-scope` class from PublicLayout
   - Delete `src/assets/scss/neonwizard/` directory
   - Delete `src/assets/images/neonwizard/` directory
   - Revert component styling changes

2. **Verification:**
   - Confirm admin unaffected
   - Confirm public pages functional (original styling)
   - Confirm build green

3. **Report:**
   - Document rollback reason
   - Document specific failures
   - Await remediation instructions

---

## M. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 8.5 COMPLETION**

Upon completing Phase 8.5:
1. Execute all verification criteria
2. Submit completion report in standard format
3. Create restore point PHASE-8.5-COMPLETE
4. **STOP** — Do not proceed to Phase 9
5. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 9**

---

## N. Implementation Steps (Reference)

When authorized, execute in order:

1. Create restore point checkpoint
2. Create `src/assets/scss/neonwizard/` directory structure
3. Create namespaced SCSS files with `.neonwizard-scope` wrapper
4. Extract visual patterns from Neonwizard template
5. Add `.neonwizard-scope` class to PublicLayout
6. Restyle PublicHeader component
7. Restyle PublicFooter component
8. Restyle WizardContainer component
9. Restyle WizardProgress component
10. Restyle WizardStepCard component
11. Restyle landing page
12. Restyle status page
13. Add decorative images if needed
14. Run full verification checklist
15. Create PHASE-8.5-COMPLETE restore point
16. Submit completion report

---

## O. Governance References

- Master PRD: Section 7.3 (UX & UI Requirements)
- Architecture & Security: Section 11 (Guardian Rules)
- UX Public Wizard Design Uniformity: Full document
- Execution Plan: Global Execution Rules

### Guardian Rules Compliance (Track A)
- ✅ Uses existing Darkone fonts
- ✅ Uses Iconify (mingcute:*) icons
- ✅ No jQuery dependencies
- ✅ Strict CSS scoping
- ✅ Admin UI untouched
- ✅ Light theme for public only

---

## P. Exception Status

**No exceptions required for Track A implementation.**

Track A uses:
- Existing Darkone fonts
- Existing Iconify icon library
- Namespaced SCSS (no global conflicts)
- No new JavaScript dependencies

---

**End of Phase 8.5 Documentation**

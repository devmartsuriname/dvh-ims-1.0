# Landing Page Correction Pass — Align with App.tsx Reference

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

## Changes to `src/app/(public)/landing/page.tsx`

### 1. Background color

- Change `bg-light` on right column (line 53) to inline `style={{ backgroundColor: '#e0e7ff' }}`

### 2. Card proportions — reduce vertical stretch

From App.tsx reference, cards use compact padding (`p-6 sm:p-8` equivalent) with a full-width bottom CTA bar and `flex-grow` on description to equalize height without excessive stretching.

Changes per card:

- Reduce `CardBody` padding from `p-4` to `p-3 pt-4`
- Reduce icon container from 56×56 to 48×48
- Reduce bottom margin on icon wrapper from `mb-3` to `mb-2`
- Reduce description `mb-3` to `mb-2`
- Change CTA from `Button variant="outline-*"` to a full-width styled div/button matching App.tsx pattern: background `bg-light` bar with hover color transition, using `mt-auto` and `w-100`
- Add `d-flex flex-column` to CardBody for flex layout with CTA anchored at bottom
- Add card hover: `translateY(-2px)` on hover via inline style or a small CSS class

### 3. Card grid responsive behavior

From App.tsx: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`

Bootstrap equivalent:

- Change `<Col md={4}>` to `<Col xs={12} md={6} xl={4}>` for each card
- This gives: 1 col mobile, 2 cols tablet, 3 cols desktop — matching reference

### 4. Spacing rhythm

- Title: keep `display-5 fw-bold`, reduce `mb-3` to `mb-2`
- Subtitle: reduce `mb-4` to `mb-3`
- HR: change `my-4` to `mt-3 mb-4` with `opacity-25` for subtlety
- Services title: `h5` instead of `h4`, `mb-1`
- Services subtitle: `mb-3` instead of `mb-4`
- Card grid gap: keep `g-3` (matches `gap-6` in reference at Bootstrap scale)

### 5. Card styling details

- Add `rounded-4` to cards (matching existing project pattern from memory)
- Lighter border: `border-opacity-50`
- Card shadow: `shadow-sm` stays
- CTA bar: full-width rounded pill inside card bottom, neutral bg, colored on hover

### 6. Left image panel

- Add subtle gradient overlay back (matching App.tsx `bg-gradient-to-b from-slate-900/10 via-slate-900/20 to-slate-900/40`) using a lightweight overlay div

## Files changed


| File                                | Change                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/app/(public)/landing/page.tsx` | Background color, card proportions, grid breakpoints, spacing, CTA style, hover treatment |


## NOTE — Styling discipline correction

Do NOT use Tailwind-style utility classes or Tailwind-inspired class names

(e.g. bg-gradient-to-b, from-slate-*, via-slate-*, to-slate-*).

This correction pass must follow the existing project styling discipline only:

- existing Bootstrap utilities where appropriate

- existing project SCSS / Darkone-compatible styling

- no hybrid styling system

- no Tailwind syntax

Also avoid inline background styling where possible.

Use a project-consistent class / SCSS-based approach for the right panel background (#e0e7ff)

and for the left overlay treatment.

Goal:

the landing must align with the App.tsx composition reference,

but implementation must stay fully consistent with our own SCSS / Darkone styling approach.  
Untouched

- PublicHeader / PublicFooter
- Service meaning/order/count
- No backend/schema/admin changes
- No new files or dependencies
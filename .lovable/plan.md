# Landing Page Inner Refactor — Execution Path Assessment + Plan

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

---

## Step 1 — Execution Path Recommendation

**Screenshot-based implementation is sufficient.**

Reasons:

1. The current `page.tsx` is a single-file, 170-line React-Bootstrap component. Full source is available.
2. The refactor is a layout restructure using standard Bootstrap grid (`Col lg={4}` / `Col lg={8}`) — no complex CSS or unknown spacing tokens.
3. Screenshot 2 clearly shows the target composition: left image panel, right content with title + services.
4. The existing hero image asset (`hero-community.png`) is already imported and reused.
5. No external code, third-party components, or unknown patterns are involved.

**What can be matched confidently:**

- 30/70 split composition
- Left panel with B&W image + grayscale filter + dark overlay
- Right panel: title, subtitle, horizontal rule, "Onze Diensten" heading, 3 service cards in a row
- Card restyling (lighter borders, cleaner padding, text-based CTAs instead of full-width colored buttons)
- Responsive stacking on mobile

**What cannot be guaranteed without pixel-level spec:**

- Exact font sizes (will use existing Bootstrap display/heading classes)
- Exact px spacing (will use 8px rhythm from existing design system)

**Recommendation: Proceed now with screenshot-based refactor.**

---

## Step 2 — Implementation Plan

**File:** `src/app/(public)/landing/page.tsx`

### Changes

Replace everything between `<PublicHeader />` and `<PublicFooter />` with:

**Outer structure:**

```
Row (no gutters, min-vh-100 minus header/footer)
  Col lg={4} — Image panel (sticky/full-height, B&W hero image, grayscale, dark overlay)
  Col lg={8} — Content panel (white bg, padded)
```

**Left column (image panel):**

- Full-height `position-relative` div
- Same B&W background image with `grayscale(100%)` filter
- Same `rgba(0, 0, 0, 0.82)` dark overlay
- `min-height: 100%` on desktop, fixed height (~300px) on mobile
- On mobile: displayed as a banner above content

**Right column (content panel):**

- `px-4 px-lg-5 py-5` padding
- `max-width: 900px` inner container
- "Welkom bij VolksHuisvesting" — `display-4 fw-bold`
- Subtitle paragraph — `text-muted`
- Horizontal rule separator
- "Onze Diensten" heading + subtitle
- 3 service cards in a `Row g-3`:
  - Cards with `border rounded-3 shadow-sm` (lighter than current heavy shadow)
  - Icon circles remain (purple/green/cyan identity preserved)
  - CTA: text-style links or outline buttons instead of full-width colored buttons (matching screenshot 2)
  - `Col md={4}` for 3-across on desktop within the content panel

**Responsive:**

- Desktop (lg+): side-by-side 4/8 split
- Tablet (md): 3/9 or stacked
- Mobile (<md): image panel stacks on top (limited height), content below

### Files changed


| File                                | Change                                  |
| ----------------------------------- | --------------------------------------- |
| `src/app/(public)/landing/page.tsx` | Replace inner content with split layout |


### NOTE

Bootstrap lg={4}/lg={8} split is acceptable as approximation of the requested 30/70 layout.

Ensure the image column remains visually smaller than the content column.

Do NOT remove spacing between sections.

Use gx-0 instead of completely removing grid spacing if needed.

CTA buttons should remain clearly visible and actionable.

They may become smaller or outline style, but must not become weak text links.  
  
**What does NOT change**

- `PublicHeader` — untouched
- `PublicFooter` — untouched
- No new sections added (no trust strip, no "Hoe Werkt Het")
- No new assets or dependencies
- No routing changes
- No i18n key changes (reuses existing `landing.*` keys)
- No schema/RLS/admin changes
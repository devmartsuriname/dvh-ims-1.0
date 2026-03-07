# Vertical Centering of Right Content Panel

**File:** `src/app/(public)/landing/page.tsx`

## Change

Add flex vertical centering to the right content column (Col lg={8}) so the hero + services block sits centered in the available viewport height instead of top-aligned with empty space below.

### Line 55 — Right Column

Change:

```jsx
<Col lg={8} className="landing-content-panel">
  <div className="px-4 px-lg-5 py-4" style={{ maxWidth: '900px' }}>
```

To:

```jsx
<Col lg={8} className="landing-content-panel d-flex align-items-center">
  <div className="px-4 px-lg-5 py-4" style={{ maxWidth: '900px' }}>
```

This makes the Col a flex container with `align-items-center`, vertically centering the inner content wrapper within the full-height column. No SCSS changes needed — uses existing Bootstrap utility.

### NOTE — Content wrapper sizing and centering

Keep the right column as a flex container for vertical centering, but ensure the inner content wrapper also spans the usable content width.

Update the inner wrapper to include full width while respecting max-width, for example:

<div className="px-4 px-lg-5 py-4 w-100" style={{ maxWidth: '900px' }}>

Also ensure the vertical centering is applied only where the column has full available height, so the hero + services block sits visually balanced between header and footer.  
What stays untouched

- Left image panel (lines 29–39) — no changes
- Mobile image banner (lines 42–52) — no changes
- Header / Footer — no changes
- All spacing rhythm inside content — no changes
- SCSS file — no changes
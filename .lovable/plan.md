# Service Card Refinement — Premium Polish Pass

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B

**File:** `src/app/(public)/landing/page.tsx` (only file changed)

---

## Changes

### 1. Card Width and Grid

- Change card row from `g-3` to `g-4` for more breathing room
- Keep `Col md={4}` for 3-across on desktop
- Add `Col sm={6}` for 2-column tablet layout (third card full-width below)
- Mobile: full-width stack (default `Col` behavior)

### 2. Card Structure — Equal Height + CTA Anchoring

- Replace `CardBody` with a flex column layout (`d-flex flex-column h-100`)
- Move CTA to bottom with `mt-auto` so buttons align across all 3 cards regardless of description length
- Increase padding from `p-4` to `p-4 pt-4 pb-4` (keep consistent)

### 3. Premium Card Polish

- Border: change from `border` to a softer custom border (`border` with `border-color` style set to `rgba(0,0,0,0.08)`)
- Radius: increase from `rounded-3` to `rounded-4` for a more modern feel
- Shadow: upgrade from `shadow-sm` to a custom subtle shadow via inline style (`0 2px 12px rgba(0,0,0,0.06)`)
- Icon container: increase from 56px to 64px, with slightly larger icon (`fs-2` instead of `fs-3`)
- Title: upgrade from `h6` to `h5` with `fw-semibold` for stronger presence
- Description: keep `text-muted small` but add `px-2` for better line length control

### 4. Hover / Animation

Add inline CSS transition on Card via style prop:

- `transition: 'transform 0.25s ease, box-shadow 0.25s ease'`
- On hover (via CSS class or onMouseEnter/Leave state): `transform: translateY(-4px)` + stronger shadow `0 8px 24px rgba(0,0,0,0.10)`
- Icon container: `transition: 'transform 0.25s ease'`, on card hover scale to 1.08

Implementation: Use a small `ServiceCard` sub-component with `useState` for hover state to keep it clean without adding external CSS files.

### 5. CTA Button Refinement

- Remove `size="sm"` — use default size for stronger presence
- Add `rounded-pill` for premium pill-shaped buttons
- Add `px-4` for wider padding
- Keep `outline-primary` / `outline-success` / `outline-info` variants
- On hover: the outline buttons naturally fill — Bootstrap handles this
- Keep arrow icon

### 6. Content Spacing Above Cards

- Hero title: keep `display-5 fw-bold mb-3`
- Subtitle: change `mb-4` to `mb-5` for more breathing room before divider
- Divider: change `my-4` to `my-5`
- Services title: keep `fw-bold mb-2`
- Services subtitle: change `mb-4` to `mb-5` before card row

### 7. Responsive

- Desktop (lg+): 3 columns with `g-4` gutters inside the 70% panel
- Tablet (sm-md): `Col sm={6}` gives 2-column layout; third card wraps below
- Mobile (<sm): single column stack, cards get full width, pill buttons remain touch-friendly

---

## NOTE

Do not implement hover animations using React state (useState).

Use pure CSS transitions for hover effects instead.

Prefer Bootstrap utility classes or scoped CSS instead of inline style shadows when possible.

Goal:

keep the component lightweight and maintainable.  
  
**What does NOT change**

- Header / Footer
- Left image panel structure
- Service order, meaning, or count
- Purple / green / blue identity
- i18n keys
- No new sections added
- No backend/schema changes
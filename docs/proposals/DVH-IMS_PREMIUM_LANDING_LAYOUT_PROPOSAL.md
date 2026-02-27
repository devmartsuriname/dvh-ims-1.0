# DVH-IMS v1.7.x — Premium Landing Layout Upgrade Proposal

**Status:** Draft — Pending Internal Review  
**Date:** 2026-02-27  
**Author:** DevMart Engineering  
**Authority:** Delroy (Final Approval Required)

---

## 1. Executive Summary

This proposal outlines a structural upgrade of the VolksHuisvesting IMS public landing page from a basic centered government template to a premium, modern digital service experience.

**Why this upgrade is proposed:**
- The current layout uses a generic center-stacked hero and equally-weighted service cards — a pattern indistinguishable from default Bootstrap templates.
- Government digital services in 2026 are expected to convey authority, clarity, and accessibility through intentional visual hierarchy.
- The current layout does not communicate service priority or guide the citizen toward a clear action path.

**Strategic benefits:**
- **Modernization** — Aligns the public portal with contemporary government digital standards.
- **Hierarchy** — Establishes Bouwsubsidie as the primary service through layout weight.
- **UX Clarity** — Adds a step-by-step process section and trust indicators to reduce citizen uncertainty.
- **Professional Tone** — Elevates the ministry's digital presence without compromising governance compliance.

---

## 2. Before vs After Layout Explanation

### 2.1 Current Layout (Before)

| Section | Structure |
|---------|-----------|
| Hero | Full-width background image (B&W + dark overlay). Center-stacked title, subtitle. No CTA button. |
| Services | 3 equal-width cards in a row (Bouwsubsidie, Woning Registratie, Status Tracking). No hierarchy. |
| Footer | 2-column: copyright left, version right. Minimal. |

**Issues:**
- Hero has no visual anchor or directional flow.
- All three services appear equally important — no guidance for citizens.
- No trust indicators or process explanation.
- Footer provides no useful information.

### 2.2 Proposed Layout (After)

| Section | Structure |
|---------|-----------|
| Hero | 60/40 asymmetrical split. Left: title + subtitle + primary CTA (left-aligned). Right: hero image block (rounded, B&W, overlay). Mobile: stacked. |
| Trust Strip | Slim horizontal bar below hero. 3 items: official portal, secure connection, 24/7 availability. |
| Services | 3-column grid with hierarchy: Bouwsubsidie spans 2 columns, other two span 1 each. Cards with hover elevation. |
| "Hoe Werkt Het?" | 3-step process section: Kies een dienst → Dien aanvraag in → Volg uw status. Icons + short descriptions. |
| Footer | 3-column grid: About the portal, Contact information, Quick links. Copyright row below. |

---

## 3. Layout Wireframe Description (Textual)

### 3.1 Desktop (≥992px)

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER (PublicHeader — unchanged)                            │
├──────────────────────────────────────────────────────────────┤
│                        HERO (min-height: 80vh)               │
│  ┌─────────────────────────┐  ┌──────────────────────────┐   │
│  │  Title (left-aligned)   │  │  Hero Image              │   │
│  │  Subtitle               │  │  (B&W, rounded,          │   │
│  │  [Primary CTA Button]   │  │   overlay maintained)    │   │
│  │  (max-width: 65ch)      │  │                          │   │
│  └─────────────────────────┘  └──────────────────────────┘   │
│         60%                          40%                     │
├──────────────────────────────────────────────────────────────┤
│ TRUST STRIP                                                  │
│  Officieel portaal  ·  Beveiligde verbinding  ·  24/7        │
├──────────────────────────────────────────────────────────────┤
│                     SERVICES (120px top spacing)             │
│  ┌──────────────────────────────┐  ┌─────────────────────┐   │
│  │  BOUWSUBSIDIE (2 cols)       │  │  WONING REG (1 col) │   │
│  │  Featured card               │  │  Standard card      │   │
│  └──────────────────────────────┘  └─────────────────────┘   │
│                                    ┌─────────────────────┐   │
│                                    │  STATUS (1 col)     │   │
│                                    │  Standard card      │   │
│                                    └─────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│                  "HOE WERKT HET?" (120px spacing)            │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Step 1   │  │  Step 2      │  │  Step 3              │    │
│  │  Kies     │  │  Dien in     │  │  Volg status         │    │
│  └──────────┘  └──────────────┘  └──────────────────────┘    │
├──────────────────────────────────────────────────────────────┤
│ FOOTER (3 columns)                                           │
│  Over het portaal  │  Contact  │  Snelle links               │
│──────────────────────────────────────────────────────────────│
│  © 2026 Copyright                                            │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Mobile (<992px)

```
┌──────────────────────┐
│ HEADER               │
├──────────────────────┤
│ Title (centered)     │
│ Subtitle             │
│ [CTA Button]         │
│ Hero Image (full-w)  │
├──────────────────────┤
│ Trust Strip (stacked)│
├──────────────────────┤
│ Bouwsubsidie Card    │
│ Woning Reg Card      │
│ Status Card          │
├──────────────────────┤
│ Step 1               │
│ Step 2               │
│ Step 3               │
├──────────────────────┤
│ Over het portaal     │
│ Contact              │
│ Snelle links         │
│ © Copyright          │
└──────────────────────┘
```

---

## 4. Impact Assessment

### 4.1 Files That Would Change (If Approved)

| File | Change Type | Scope |
|------|-------------|-------|
| `src/app/(public)/landing/page.tsx` | Major rewrite | Hero, services, new sections |
| `src/components/public/PublicFooter.tsx` | Moderate rewrite | 3-column layout |

### 4.2 Risk Level

| Area | Risk | Notes |
|------|------|-------|
| Layout breakage | **Low** | React-bootstrap grid is well-tested |
| Responsive regression | **Low** | Mobile stacking uses standard breakpoints |
| Performance | **None** | No new libraries, no new assets |
| Governance compliance | **None** | No routing, Supabase, i18n, or admin changes |
| Accessibility | **Low** | Semantic HTML maintained, heading hierarchy preserved |

### 4.3 Performance Impact

- No additional network requests.
- No new dependencies.
- No new images (reuses existing `hero-community.png`).
- Estimated bundle size change: **<1KB** (additional JSX markup only).

### 4.4 Governance Impact

- **No database changes.**
- **No RLS changes.**
- **No routing changes.**
- **No i18n key changes** — new static text is hardcoded Dutch (phases 4/5/7).
- **No admin-side modifications.**

---

## 5. Open Questions for Team

| # | Question | Context |
|---|----------|---------|
| 1 | Is the asymmetrical split hero acceptable for the ministry portal? | Deviates from traditional centered government layout. |
| 2 | Is featuring Bouwsubsidie as the primary service (2-column span) politically correct? | Implies priority over Woning Registratie. |
| 3 | Is Dutch-only static text acceptable for new sections (trust strip, "Hoe werkt het", footer)? | Current i18n keys are not extended — new text is hardcoded NL. |
| 4 | Does ministry branding (logo, colors, naming) require separate approval before implementation? | Trust strip references "Min-SoZaVo" explicitly. |
| 5 | Should the "Hoe Werkt Het?" section include links or remain informational only? | Current proposal is text-only, no navigation. |

---

## 6. Visual Principles

### 6.1 Hierarchy
- **Primary:** Hero title and CTA — largest type, highest contrast.
- **Secondary:** Bouwsubsidie card — visually dominant through column span.
- **Tertiary:** Supporting services and process steps — equal weight, smaller scale.

### 6.2 White Space Strategy
- 120px vertical spacing between major sections.
- Internal card padding: 32px.
- Container max-width: 1152px — prevents content from stretching on wide screens.

### 6.3 Container Strategy
- Hero: full-width background, constrained content.
- All other sections: `max-width: 1152px`, centered, with `24px` horizontal padding.
- Consistent 8px base spacing unit.

### 6.4 Editorial Alignment Shift
- **Desktop:** Left-aligned hero text (editorial style) — creates reading direction and visual anchor.
- **Mobile:** Center-aligned — appropriate for narrow viewports.
- **Cards:** Center-aligned content with full-width CTAs.

---

## 7. Next Steps

1. **Team review** of this proposal document.
2. **Resolve open questions** (section 5).
3. **Approval from Delroy** to proceed to implementation.
4. **Implementation** follows the 7-phase execution plan (already documented).
5. **Restore point** created after implementation.
6. **Visual verification** via desktop + mobile screenshots.

---

*This document is a design proposal only. No source code was modified. No restore point was created. Awaiting authorization to proceed.*

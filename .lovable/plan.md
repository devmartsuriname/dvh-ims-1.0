

# Fix: Inconsistent Icon Sizes in Document Requirements List

## Problem

The icon for "Minimaal 1 inkomensbewijs" (doc3) and the info icon for "docsNote" shrink when their text wraps to multiple lines. The `d-flex` container allows the SVG icon to compress below its intended size.

## Root Cause

No explicit minimum width/height is set on the `IconifyIcon` components in the document list. When text wraps, flexbox shrinks the icon.

## Fix

In `src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx`:

1. **All document list icons (doc1, doc2, doc3)**: Add `style={{ minWidth: 16, minHeight: 16 }}` and change `align-items-center` to `align-items-start` so icons align to the first line of text (matching the reference screenshot).

2. **docsNote paragraph**: Convert from inline `<p>` to `d-flex` layout matching the list items, using `align-items-start` for consistent alignment.

This also applies to the left-column requirement items (requirement1–4) for full consistency.

**Files modified:** 1 (`Step0Introduction.tsx`)
**No functional changes. No new dependencies.**


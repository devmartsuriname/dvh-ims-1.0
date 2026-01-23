# Restore Point: ADMIN_V1_1_ALLOC_BTN_FIX_START

**Created:** 2026-01-09
**Phase:** Admin v1.1 Minor Fixes
**Scope:** Allocation Engine Button Interaction Standardization

## Purpose

Restore point created BEFORE fixing the button interaction patterns in:
- Allocation Runs (View button)
- Allocation Decisions (Make Decision button)

## Files To Be Modified

| File | Change |
|------|--------|
| `src/app/(admin)/allocation-runs/components/RunTable.tsx` | Replace `window.dispatchEvent` with data-attribute + event delegation |
| `src/app/(admin)/allocation-decisions/components/DecisionTable.tsx` | Replace `window.dispatchEvent` with data-attribute + event delegation |

## Current Pattern (Deprecated)

```tsx
// Button uses inline onclick with window.dispatchEvent
formatter: (cell) => html(`
  <button onclick="window.dispatchEvent(new CustomEvent('run-view', {detail: '${cell}'}))">
    View
  </button>
`)

// Listener on window
useEffect(() => {
  const handleViewClick = (e: CustomEvent) => {
    navigate(`/allocation-runs/${e.detail}`)
  }
  window.addEventListener('run-view', handleViewClick as EventListener)
  return () => window.removeEventListener('run-view', handleViewClick as EventListener)
}, [navigate])
```

## Target Pattern (Standardized)

```tsx
// Button uses data-attribute
formatter: (cell) => html(`
  <button data-run-view="${cell}">View</button>
`)

// Event delegation on document
useEffect(() => {
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const btn = target.closest('[data-run-view]') as HTMLElement | null
    if (btn) {
      const runId = btn.getAttribute('data-run-view')
      if (runId) navigate(`/allocation-runs/${runId}`)
    }
  }
  document.addEventListener('click', handleClick)
  return () => document.removeEventListener('click', handleClick)
}, [navigate])
```

## Rollback Instructions

If issues occur after implementation, revert to the `window.dispatchEvent` pattern shown above.

---

**Status:** Pre-implementation snapshot

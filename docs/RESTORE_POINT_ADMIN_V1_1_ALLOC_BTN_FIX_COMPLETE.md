# Restore Point: ADMIN_V1_1_ALLOC_BTN_FIX_COMPLETE

**Created:** 2026-01-09
**Phase:** Admin v1.1 Minor Fixes
**Scope:** Allocation Engine Button Interaction Standardization

## Summary

Successfully replaced deprecated `window.dispatchEvent` pattern with standardized data-attribute + event delegation pattern in both Allocation Engine table components.

## Files Modified

| File | Change |
|------|--------|
| `src/app/(admin)/allocation-runs/components/RunTable.tsx` | View button now uses `data-run-view` attribute |
| `src/app/(admin)/allocation-decisions/components/DecisionTable.tsx` | Make Decision button now uses `data-decision-make` attribute |

## Pattern Applied

### Before (Deprecated)
```tsx
// Inline onclick with window.dispatchEvent
formatter: (cell) => html(`
  <button onclick="window.dispatchEvent(new CustomEvent('run-view', {detail: '${cell}'}))">
    View
  </button>
`)
```

### After (Standardized)
```tsx
// Data attribute on button
formatter: (cell) => html(`
  <button data-run-view="${cell}">View</button>
`)

// Event delegation via document listener
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

## Verification Checklist

- [x] Allocation Runs View button triggers navigation
- [x] Allocation Decisions Make Decision button opens modal
- [x] Buttons work reliably after table re-renders
- [x] No console errors introduced
- [x] No regression in existing Allocation Engine flows

## Related Restore Points

- Previous: `ADMIN_V1_1_ALLOC_BTN_FIX_START`
- Context: `ADMIN_V1_1_A_FIXES_COMPLETE` (Households/Quotas fixes)

---

**Status:** Implementation complete

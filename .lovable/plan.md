

# Phase 3 — SCSS Validation & Removal

## Validation Results

| SCSS File | Status | Evidence |
|-----------|--------|----------|
| `plugins/_editors.scss` | **REMOVE** | Zero component usage of `.ql-*` classes. react-quill was removed in Phase 2. |
| `plugins/_google-map.scss` | **REMOVE** | Zero component usage of `.gmaps` classes. google-maps-react removed in Phase 2. |
| `plugins/_dropzone.scss` | **REMOVE** | Styles target `.dropzone` / `.dz-message` / `.dz-started` (Dropzone.js library classes). No component uses these CSS classes. `DocumentUploadAccordion.tsx` uses `react-dropzone` hook (no CSS dependency). |
| `plugins/_flatpicker.scss` | **KEEP** | `AuditLogFilters.tsx` actively imports and renders `react-flatpickr`. Flatpickr calendar styling is required. |
| `pages/_icon-demo.scss` | **REMOVE** | `.icon-box` class has zero usage anywhere in the codebase. No icon demo page in routes. |

## Execution Plan

**Step 1 — Delete 4 SCSS files:**
- `src/assets/scss/plugins/_editors.scss`
- `src/assets/scss/plugins/_google-map.scss`
- `src/assets/scss/plugins/_dropzone.scss`
- `src/assets/scss/pages/_icon-demo.scss`

**Step 2 — Update `style.scss`:**
Remove these 4 import lines:
```
@import "plugins/dropzone";
@import "plugins/editors";
@import "plugins/google-map";
@import "pages/icon-demo";
```

**Step 3 — Verify build passes.**

### Files kept (validated as active)
- `_flatpicker.scss` — used by AuditLogFilters
- `_vector-map.scss` — used by dashboard WorldMap
- `_apexcharts.scss` — used by dashboard charts
- `_gridjs.scss` — used by admin tables
- `_simplebar.scss` — used by layout scrollbar

### Scope: 5 files modified/deleted. Zero risk to active UI.


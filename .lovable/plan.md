# V1.9 Phase 5 — Archive Export (GAP-5)

**Context ID:** 8F42B1C3-5D9E-4A7B-B2E1-9C3F4D5A6E7B
**Scope:** Additive UI only. No schema changes.

---

## Implementation

### 1. New Component: `ArchiveExportButtons.tsx`

**Location:** `src/app/(admin)/archive/components/ArchiveExportButtons.tsx`

**Props:**

```typescript
{
  data: Array<Record<string, any>>
  headers: { key: string; label: string }[]
  filenamePrefix: string  // e.g. 'subsidy_archive' or 'housing_archive'
}
```

**CSV Export:** Reuses the same client-side pattern from `AuditExportButton` — builds CSV string, creates Blob, triggers download. Filename includes date: `subsidy_archive_2026-03-07.csv`.

**PDF Export:** Uses `window.print()` with a hidden print-friendly view. No new dependency. The button triggers a print dialog scoped to the current table content. This is the lightest approach and avoids adding jsPDF as a dependency.

### 2. Integration into Archive Page

**File:** `src/app/(admin)/archive/page.tsx`

- Import `ArchiveExportButtons`
- Add export buttons in each tab's `CardHeader`, next to the title
- Subsidy tab: passes `subsidyCases` with headers `[Case Number, Applicant, District, Status, Created, Last Updated]`
- Housing tab: passes `housingRegistrations` with headers `[Reference Number, Applicant, District, Status, Registration Date, Last Updated]`
- Buttons disabled when data is empty or loading

### Approved.

Ensure CSV export includes the currently filtered dataset

and verify that pagination does not limit the exported results.

If pagination is active, export should still include the full filtered dataset where possible.  
What does NOT change

- No schema changes, no migrations, no RLS changes
- No filtering logic changes
- No new dependencies
- Archive access guards (`ALLOWED_ROLES`) remain intact
- Both tabs and detail navigation remain as-is


# Phase 4 — Type & Context Cleanup

## Findings

### data.ts
- **KEEP**: `NotificationType` (imported by `topbar.ts`)
- **REMOVE**: All other types — `EmailType`, `EmailLabelType`, `EmailCountType`, `ReviewType`, `Employee`, `PaginationType`, `SearchType`, `SortingType`, `LoadingType`, `HiddenType`, `PropertyType`, `CustomerType`, `CustomerReviewsType`, `FileType`, `ActivityType`, `SocialEventType`, `GroupType`, `TimelineType`, `PricingType`, `ProjectType`, `TodoType`, `SellerType`, `IdType` — zero external imports
- Remove imports of `BootstrapVariantType` and `UserType` (no longer needed)

### context.ts
- **KEEP**: `ThemeType`, `OffcanvasControlType`, `MenuType`, `LayoutState`, `LayoutOffcanvasStatesType`, `LayoutType` (all used by `useLayoutContext.tsx`)
- **REMOVE**: `ChatOffcanvasStatesType`, `EmailOffcanvasStatesType`, `EmailContextType` (only used by `useEmailContext.tsx` which is being deleted)
- Remove import of `EmailLabelType`, `EmailType` from `data.ts`

### useEmailContext.tsx
- **DELETE**: Zero external consumers. Only file importing Email types from context.ts and data.ts.

### component-props.ts
- **KEEP**: `ChildrenType`, `BootstrapVariantType`, `FormInputProps`
- **REMOVE**: `UploadFileType`, `DropzoneFormInputProps`, `CalendarFormType`, `CalendarProps` — zero external imports
- Remove FullCalendar imports (lines 4, 6) and `OffcanvasControlType` import (line 5, only used by CalendarFormType)

### externals.d.ts — cautious trim only
Remove stubs for **removed packages** (confirmed uninstalled in Phase 2):
- `@fullcalendar/core/index.js` (lines 18-39)
- `@fullcalendar/interaction/index.js` (lines 41-55)
- `cookies-next` (lines 387-403)
- `axios-mock-adapter` (lines 486-525)
- `react-quill` (lines 680-696)
- `google-maps-react` (lines 698-710)
- `jsvectormap/dist/maps/canada|spain|iraq|russia` (lines 588-591)

**KEEP all other stubs** — packages are installed but these stubs may provide extended type info used by components.

### topbar.ts
- File content is already emptied (just exports empty array). Keep file but update to use inline type instead of importing from data.ts.

## Execution Order

1. Delete `useEmailContext.tsx`
2. Trim `data.ts` → keep only `NotificationType`
3. Trim `context.ts` → remove Email/Chat types and dead import
4. Trim `component-props.ts` → remove FullCalendar/Dropzone/Calendar types and dead imports
5. Update `topbar.ts` → inline the type or remove the import
6. Trim `externals.d.ts` → remove stubs for uninstalled packages only
7. Verify build passes

## Scope
- **~5 files modified**, 1 file deleted
- Zero risk to runtime behavior
- Zero layout/route/backend changes


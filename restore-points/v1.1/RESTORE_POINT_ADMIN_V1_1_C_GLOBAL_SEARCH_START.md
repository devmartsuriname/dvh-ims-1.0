# Restore Point: ADMIN_V1_1_C_GLOBAL_SEARCH_START

**Created:** 2026-01-13  
**Phase:** Admin v1.1-C Global Search  
**Status:** Implementation Starting

## Pre-Implementation State

### Files to be Created
- `src/hooks/useGlobalSearch.ts`
- `src/components/layout/TopNavigationBar/components/SearchResults.tsx`

### Files to be Modified
- `src/components/layout/TopNavigationBar/page.tsx`
- `docs/Backend.md`
- `docs/architecture.md`

### Scope
- 4 entities: Person, Household, Housing Registration, Subsidy Case
- Read-only search with RLS enforcement
- Darkone-compliant dropdown (NO React-Bootstrap)
- Topbar integration

### Guardian Rules Verified
- [x] NO React-Bootstrap for search dropdown
- [x] NO new UI frameworks
- [x] NO new icon libraries
- [x] Darkone SCSS canonical
- [x] RLS-first queries
- [x] Read-only navigation only

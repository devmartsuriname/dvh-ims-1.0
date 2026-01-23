# Restore Point: v1.1-D4-A START

## Metadata
- **Created**: 2026-01-23
- **Phase**: Admin v1.1-D4-A (Error Handling & Safe Failure States - Admin)
- **Status**: IN PROGRESS

## Scope
Standardize error handling across Admin modules:
- Dashboard hooks: Surface silent data fetch errors via notify.error()
- CRUD tables: Add user-facing error notifications on fetch failure
- Logging: Ensure console.error() retained for debugging

## Files To Be Modified
1. `src/app/(admin)/dashboards/hooks/useDashboardData.ts` — Add notify.error() to 6 catch blocks
2. `src/app/(admin)/subsidy-cases/components/CaseTable.tsx` — Add notify.error() in fetch catch
3. `src/app/(admin)/households/components/HouseholdTable.tsx` — Add notify.error() in fetch catch
4. `src/app/(admin)/persons/components/PersonTable.tsx` — Add notify.error() in fetch catch
5. `src/app/(admin)/housing-registrations/components/RegistrationTable.tsx` — Add notify.error() in fetch catch

## Constraints (Confirmed)
- No new utility files created
- No DB/RLS/Edge changes
- No timeout wrappers
- No KPI logic changes
- No hook refactoring

## Baseline State
- Dashboard hooks have console.error but no user notification
- CRUD tables have console.error but no user notification
- notify helper exists at src/utils/notify.ts

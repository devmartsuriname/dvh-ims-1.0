/**
 * Unit tests for src/hooks/useUserRole.ts
 *
 * Phase 6 — Testability Extraction & Critical RBAC Coverage.
 * Guards the useUserRole hook that fetches user roles from Supabase and
 * provides hasRole/hasAnyRole utilities used throughout admin pages.
 *
 * Mock strategy:
 *   - @/integrations/supabase/client → module factory mock (avoids import.meta.env)
 *   - supabase.auth.getUser → per-test controlled
 *   - supabase.from('user_roles').select → per-test controlled
 *   - supabase.from('app_user_profile').select → per-test controlled
 *
 * Coverage:
 *   - Successful role resolution (user with roles)
 *   - Loading transitions (starts true, settles to false)
 *   - Empty role fallback (authenticated user, no role rows)
 *   - Unauthenticated user (getUser returns null)
 *   - Failed role fetch (DB error on user_roles query)
 *   - hasRole/hasAnyRole utility correctness
 *   - isNationalRole / isDistrictScoped derived values
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUserRole } from './useUserRole'

// ---------------------------------------------------------------------------
// Mock setup
// ---------------------------------------------------------------------------

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  },
}))

/**
 * Build a chainable Supabase query mock that resolves with { data, error }.
 * Supports: .select().eq().single() and .select().eq() (no single).
 */
function makeQueryMock(result: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    // For non-single queries, the chain itself resolves
    then: vi.fn((resolve: (val: unknown) => void) => resolve(result)),
  }
  // Make the chain a thenable so `await supabase.from(...).select().eq()` works
  const thenableChain = Object.assign(chain, {
    then: (resolve: (val: unknown) => void) => Promise.resolve(result).then(resolve),
  })
  chain.select.mockReturnValue(thenableChain)
  chain.eq.mockReturnValue(thenableChain)
  return chain
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useUserRole', () => {
  it('starts in loading state', () => {
    // User auth hangs — hook is in loading state
    mockGetUser.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useUserRole())
    expect(result.current.loading).toBe(true)
    expect(result.current.roles).toEqual([])
  })

  it('resolves to not loading after unauthenticated user (null)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const { result } = renderHook(() => useUserRole())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.roles).toEqual([])
    expect(result.current.district).toBeNull()
  })

  it('resolves roles for authenticated user with roles', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({
          data: [{ role: 'project_leader' }, { role: 'admin_staff' }],
          error: null,
        })
      }
      if (table === 'app_user_profile') {
        return makeQueryMock({ data: { district_code: 'PAR' }, error: null })
      }
      return makeQueryMock({ data: null, error: null })
    })

    const { result } = renderHook(() => useUserRole())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.roles).toContain('project_leader')
    expect(result.current.roles).toContain('admin_staff')
    expect(result.current.district).toBe('PAR')
  })

  it('resolves to empty roles for authenticated user with no role rows', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-456' } },
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [], error: null })
      }
      if (table === 'app_user_profile') {
        return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
      }
      return makeQueryMock({ data: null, error: null })
    })

    const { result } = renderHook(() => useUserRole())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.roles).toEqual([])
    expect(result.current.district).toBeNull()
  })

  it('resolves loading to false even when role fetch errors', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-789' } },
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: null, error: { message: 'DB unavailable' } })
      }
      if (table === 'app_user_profile') {
        return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
      }
      return makeQueryMock({ data: null, error: null })
    })

    const { result } = renderHook(() => useUserRole())

    await waitFor(() => expect(result.current.loading).toBe(false))
    // Roles default to empty on error — hook does not throw
    expect(result.current.roles).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// hasRole / hasAnyRole utility tests
// These tests indirectly validate hasRole/hasAnyRole via the hook return value.
// ---------------------------------------------------------------------------

describe('useUserRole — hasRole / hasAnyRole', () => {
  it('hasRole returns true for a role the user holds', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-abc' } },
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [{ role: 'director' }], error: null })
      }
      return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
    })

    const { result } = renderHook(() => useUserRole())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.hasRole('director')).toBe(true)
    expect(result.current.hasRole('minister')).toBe(false)
  })

  it('hasAnyRole returns true when at least one role matches', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-def' } },
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [{ role: 'admin_staff' }], error: null })
      }
      return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
    })

    const { result } = renderHook(() => useUserRole())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.hasAnyRole(['admin_staff', 'project_leader'])).toBe(true)
    expect(result.current.hasAnyRole(['director', 'minister'])).toBe(false)
  })

  it('hasRole returns false for all roles when user has no roles', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-ghi' } },
      error: null,
    })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [], error: null })
      }
      return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
    })

    const { result } = renderHook(() => useUserRole())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.hasRole('project_leader')).toBe(false)
    expect(result.current.hasRole('system_admin')).toBe(false)
    expect(result.current.hasAnyRole(['director', 'minister', 'admin_staff'])).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isNationalRole / isDistrictScoped derived value tests
// ---------------------------------------------------------------------------

describe('useUserRole — isNationalRole / isDistrictScoped', () => {
  it('project_leader is a national role', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [{ role: 'project_leader' }], error: null })
      }
      return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
    })

    const { result } = renderHook(() => useUserRole())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isNationalRole).toBe(true)
    expect(result.current.isDistrictScoped).toBe(false)
  })

  it('frontdesk_bouwsubsidie (no national role) is district scoped', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2' } }, error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [{ role: 'frontdesk_bouwsubsidie' }], error: null })
      }
      return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
    })

    const { result } = renderHook(() => useUserRole())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isNationalRole).toBe(false)
    expect(result.current.isDistrictScoped).toBe(true)
  })

  it('user with no roles: isNationalRole=false, isDistrictScoped=false', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u3' } }, error: null })
    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return makeQueryMock({ data: [], error: null })
      }
      return makeQueryMock({ data: null, error: { code: 'PGRST116' } })
    })

    const { result } = renderHook(() => useUserRole())
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isNationalRole).toBe(false)
    expect(result.current.isDistrictScoped).toBe(false)
  })
})

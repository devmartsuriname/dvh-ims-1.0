import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

// Search result types per entity
export interface PersonResult {
  id: string
  national_id: string
  first_name: string
  last_name: string
}

export interface HouseholdResult {
  id: string
  district_code: string
  household_size: number
}

export interface HousingRegistrationResult {
  id: string
  reference_number: string
  current_status: string
  district_code: string
}

export interface SubsidyCaseResult {
  id: string
  case_number: string
  status: string
  district_code: string
}

export interface GlobalSearchResults {
  persons: PersonResult[]
  households: HouseholdResult[]
  housingRegistrations: HousingRegistrationResult[]
  subsidyCases: SubsidyCaseResult[]
}

interface UseGlobalSearchReturn {
  results: GlobalSearchResults
  isLoading: boolean
  error: string | null
  hasResults: boolean
}

const SEARCH_LIMIT = 10
const MIN_QUERY_LENGTH = 2

export function useGlobalSearch(query: string): UseGlobalSearchReturn {
  const [results, setResults] = useState<GlobalSearchResults>({
    persons: [],
    households: [],
    housingRegistrations: [],
    subsidyCases: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchEntities = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setResults({
        persons: [],
        households: [],
        housingRegistrations: [],
        subsidyCases: [],
      })
      return
    }

    setIsLoading(true)
    setError(null)

    const searchTerm = `%${searchQuery}%`

    try {
      // Parallel RLS-safe queries with LIMIT 10 per entity
      const [personsRes, householdsRes, housingRes, subsidyRes] = await Promise.all([
        // Person: search by national_id, first_name, last_name
        supabase
          .from('person')
          .select('id, national_id, first_name, last_name')
          .or(`national_id.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT),

        // Household: search by district_code
        supabase
          .from('household')
          .select('id, district_code, household_size')
          .ilike('district_code', searchTerm)
          .limit(SEARCH_LIMIT),

        // Housing Registration: search by reference_number, district_code
        supabase
          .from('housing_registration')
          .select('id, reference_number, current_status, district_code')
          .or(`reference_number.ilike.${searchTerm},district_code.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT),

        // Subsidy Case: search by case_number, district_code
        supabase
          .from('subsidy_case')
          .select('id, case_number, status, district_code')
          .or(`case_number.ilike.${searchTerm},district_code.ilike.${searchTerm}`)
          .limit(SEARCH_LIMIT),
      ])

      // Check for errors
      const errors = [personsRes.error, householdsRes.error, housingRes.error, subsidyRes.error].filter(Boolean)
      if (errors.length > 0) {
        throw new Error(errors[0]?.message || 'Search query failed')
      }

      setResults({
        persons: personsRes.data || [],
        households: householdsRes.data || [],
        housingRegistrations: housingRes.data || [],
        subsidyCases: subsidyRes.data || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults({
        persons: [],
        households: [],
        housingRegistrations: [],
        subsidyCases: [],
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    searchEntities(query)
  }, [query, searchEntities])

  const hasResults =
    results.persons.length > 0 ||
    results.households.length > 0 ||
    results.housingRegistrations.length > 0 ||
    results.subsidyCases.length > 0

  return { results, isLoading, error, hasResults }
}

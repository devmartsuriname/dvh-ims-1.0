import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import SimplebarReactClient from '@/components/wrapper/SimplebarReactClient'
import type { GlobalSearchResults } from '@/hooks/useGlobalSearch'

interface SearchResultsProps {
  results: GlobalSearchResults
  isLoading: boolean
  error: string | null
  hasResults: boolean
  onResultClick: () => void
}

/**
 * SearchResults - Darkone-aligned dropdown for Global Search
 * NO React-Bootstrap components used per Guardian Rules
 * Uses existing Darkone SCSS patterns and Iconify icons only
 */
const SearchResults = ({
  results,
  isLoading,
  error,
  hasResults,
  onResultClick,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="search-results-dropdown">
        <div className="search-results-loading">
          <IconifyIcon icon="solar:refresh-bold" className="spin me-2" />
          Searching...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="search-results-dropdown">
        <div className="search-results-empty text-danger">
          <IconifyIcon icon="solar:danger-triangle-outline" className="me-2" />
          {error}
        </div>
      </div>
    )
  }

  if (!hasResults) {
    return (
      <div className="search-results-dropdown">
        <div className="search-results-empty">
          <IconifyIcon icon="solar:magnifer-outline" className="me-2" />
          No results found
        </div>
      </div>
    )
  }

  return (
    <div className="search-results-dropdown">
      <SimplebarReactClient style={{ maxHeight: 400 }}>
        {/* Persons Section */}
        {results.persons.length > 0 && (
          <div className="search-results-section">
            <div className="search-results-header">
              <IconifyIcon icon="solar:user-outline" className="me-2" />
              Persons ({results.persons.length})
            </div>
            {results.persons.map((person) => (
              <Link
                key={person.id}
                to={`/persons/${person.id}`}
                className="search-result-item"
                onClick={onResultClick}
              >
                <div className="search-result-primary">
                  {person.first_name} {person.last_name}
                </div>
                <div className="search-result-secondary">
                  ID: {person.national_id}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Households Section */}
        {results.households.length > 0 && (
          <div className="search-results-section">
            <div className="search-results-header">
              <IconifyIcon icon="solar:home-2-outline" className="me-2" />
              Households ({results.households.length})
            </div>
            {results.households.map((household) => (
              <Link
                key={household.id}
                to={`/households/${household.id}`}
                className="search-result-item"
                onClick={onResultClick}
              >
                <div className="search-result-primary">
                  District: {household.district_code}
                </div>
                <div className="search-result-secondary">
                  Size: {household.household_size} members
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Housing Registrations Section */}
        {results.housingRegistrations.length > 0 && (
          <div className="search-results-section">
            <div className="search-results-header">
              <IconifyIcon icon="solar:document-text-outline" className="me-2" />
              Housing Registrations ({results.housingRegistrations.length})
            </div>
            {results.housingRegistrations.map((reg) => (
              <Link
                key={reg.id}
                to={`/housing-registrations/${reg.id}`}
                className="search-result-item"
                onClick={onResultClick}
              >
                <div className="search-result-primary">
                  {reg.reference_number}
                </div>
                <div className="search-result-secondary">
                  {reg.district_code} • {reg.current_status}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Subsidy Cases Section */}
        {results.subsidyCases.length > 0 && (
          <div className="search-results-section">
            <div className="search-results-header">
              <IconifyIcon icon="solar:case-outline" className="me-2" />
              Subsidy Cases ({results.subsidyCases.length})
            </div>
            {results.subsidyCases.map((subsidyCase) => (
              <Link
                key={subsidyCase.id}
                to={`/subsidy-cases/${subsidyCase.id}`}
                className="search-result-item"
                onClick={onResultClick}
              >
                <div className="search-result-primary">
                  {subsidyCase.case_number}
                </div>
                <div className="search-result-secondary">
                  {subsidyCase.district_code} • {subsidyCase.status}
                </div>
              </Link>
            ))}
          </div>
        )}
      </SimplebarReactClient>
    </div>
  )
}

export default SearchResults

import { useState, useEffect, useRef } from 'react'
import LeftSideBarToggle from './components/LeftSideBarToggle'
import ProfileDropdown from './components/ProfileDropdown'
import ThemeModeToggle from './components/ThemeModeToggle'
import { Container } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import Notifications from './components/Notifications'
import SearchResults from './components/SearchResults'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

const page = () => {
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { results, isLoading, error, hasResults } = useGlobalSearch(debouncedQuery)

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [inputValue])

  // Open dropdown when we have a valid query
  useEffect(() => {
    if (debouncedQuery.length >= MIN_QUERY_LENGTH) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedQuery])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setInputValue('')
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleResultClick = () => {
    setIsOpen(false)
    setInputValue('')
  }

  const handleClear = () => {
    setInputValue('')
    setIsOpen(false)
  }

  return (
    <header className="app-topbar">
      <div>
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2">
              <LeftSideBarToggle />
              <form 
                className="app-search d-none d-md-block me-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="position-relative" ref={containerRef}>
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search persons, cases, registrations..."
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <IconifyIcon icon="solar:magnifer-outline" className="search-widget-icon" />
                  {inputValue && (
                    <IconifyIcon
                      icon="solar:close-circle-outline"
                      className="search-widget-icon search-widget-icon-close"
                      onClick={handleClear}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  {isOpen && (
                    <SearchResults
                      results={results}
                      isLoading={isLoading}
                      error={error}
                      hasResults={hasResults}
                      onResultClick={handleResultClick}
                    />
                  )}
                </div>
              </form>
            </div>
            <div className="d-flex align-items-center gap-2">
              <ThemeModeToggle />
              <Notifications />
              <ProfileDropdown />
            </div>
          </div>
        </Container>
      </div>
    </header>
  )
}

export default page

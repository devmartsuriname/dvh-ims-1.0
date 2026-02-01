/**
 * LanguageSwitcher Component
 * V1.3 Phase 5A — Public Wizard Localization
 * 
 * Allows users to switch between Dutch (NL) and English (EN)
 * Persists language preference to localStorage
 */

import { useTranslation } from 'react-i18next'
import { Dropdown } from 'react-bootstrap'

interface Language {
  code: string
  label: string
  flag: string
}

const languages: Language[] = [
  { code: 'nl', label: 'Nederlands', flag: '🇸🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  
  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0]
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode)
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="outline-secondary" 
        size="sm"
        id="language-switcher"
        className="d-flex align-items-center gap-1"
      >
        <span>{currentLanguage.flag}</span>
        <span className="d-none d-sm-inline">{currentLanguage.label}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languages.map(lang => (
          <Dropdown.Item 
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            active={i18n.language === lang.code}
            className="d-flex align-items-center gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default LanguageSwitcher

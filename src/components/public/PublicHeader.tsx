import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logoSozavo from '@/assets/images/logo-sozavo.png'
import LanguageSwitcher from './LanguageSwitcher'

/**
 * PublicHeader - Reusable header for public pages
 * V1.3 Phase 5A — Localized with i18n + Language Switcher
 * 
 * Darkone 1:1 with react-bootstrap
 * Official SoZaVo logo
 */
const PublicHeader = () => {
  const { t } = useTranslation()

  return (
    <header className="py-3 border-bottom bg-white">
      <Container>
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
            <img 
              src={logoSozavo} 
              alt="VolksHuisvesting Suriname" 
              style={{ height: '40px', width: 'auto' }}
            />
            <div>
              <h5 className="mb-0 fw-bold text-dark">{t('header.title')}</h5>
              <small className="text-muted">{t('header.ministry')}</small>
            </div>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <LanguageSwitcher />
            <Link to="/auth/sign-in" className="btn btn-outline-primary btn-sm d-none d-md-inline-block">
              {t('common.staffPortal')}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  )
}

export default PublicHeader

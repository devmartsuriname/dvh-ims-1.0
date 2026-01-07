import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import logoSozavo from '@/assets/images/logo-sozavo.png'

/**
 * PublicHeader - Reusable header for public pages
 * 
 * Darkone 1:1 with react-bootstrap
 * Official SoZaVo logo
 * English baseline
 */
const PublicHeader = () => {
  return (
    <header className="py-3 border-bottom bg-white">
      <Container>
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center gap-3 text-decoration-none">
            <img 
              src={logoSozavo} 
              alt="VolksHuisvesting Suriname" 
              height="48" 
            />
            <div>
              <h5 className="mb-0 fw-bold text-dark">VolksHuisvesting</h5>
              <small className="text-muted">Ministry of Social Affairs and Housing</small>
            </div>
          </Link>
          <Link to="/auth/sign-in" className="btn btn-outline-primary btn-sm">
            Staff Portal
          </Link>
        </div>
      </Container>
    </header>
  )
}

export default PublicHeader

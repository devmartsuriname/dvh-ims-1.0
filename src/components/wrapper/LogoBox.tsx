import logoSozavo from '@/assets/images/logo-sozavo.png'
import { Link } from 'react-router-dom'

/**
 * LogoBox - Admin sidebar logo component
 * 
 * Uses official SoZaVo logo for VolksHuisvesting branding.
 * Darkone 1:1 structure.
 */
const LogoBox = () => {
  return (
    <div className="logo-box">
      <Link to="/dashboards" className="logo-dark">
        <img style={{ height: '28px', width: 'auto' }} src={logoSozavo} className="logo-sm" alt="VolksHuisvesting" />
        <img style={{ height: '32px', width: 'auto' }} src={logoSozavo} className="logo-lg" alt="VolksHuisvesting" />
      </Link>
      <Link to="/dashboards" className="logo-light">
        <img style={{ height: '28px', width: 'auto' }} src={logoSozavo} className="logo-sm" alt="VolksHuisvesting" />
        <img style={{ height: '32px', width: 'auto' }} src={logoSozavo} className="logo-lg" alt="VolksHuisvesting" />
      </Link>
    </div>
  )
}

export default LogoBox

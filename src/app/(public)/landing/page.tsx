import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PublicHeader, PublicFooter } from '@/components/public'

/**
 * Public Landing Page - VolksHuisvesting Suriname
 * 
 * Phase 8.5: Neonwizard Layout #1 styling applied
 * Light theme scoped via PublicLayout wrapper
 */
const LandingPage = () => {
  return (
    <div className="nw-landing">
      <PublicHeader />

      {/* Hero Section - Neonwizard styled */}
      <section className="nw-hero">
        <Container>
          <div className="nw-hero-content">
            <h1>Welcome to VolksHuisvesting</h1>
            <p>
              Your portal for housing services in Suriname. Apply for construction subsidies, 
              register for social housing, or check the status of your application.
            </p>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className="nw-services">
        <Container>
          <div className="nw-services-title">
            <h2>Our Services</h2>
            <p>Select a service to get started</p>
          </div>

          <Row className="g-4 justify-content-center">
            {/* Construction Subsidy Card */}
            <Col md={6} lg={4}>
              <div className="nw-service-card">
                <div className="nw-service-icon primary">
                  <IconifyIcon icon="mingcute:file-check-line" />
                </div>
                <h5 className="nw-service-title">Construction Subsidy</h5>
                <p className="nw-service-description">
                  Apply for financial support for home construction or renovation projects.
                </p>
                <Link to="/bouwsubsidie/apply">
                  <button className="nw-btn-next nw-service-btn">
                    Start Application
                    <span className="nw-btn-icon">→</span>
                  </button>
                </Link>
              </div>
            </Col>

            {/* Housing Registration Card */}
            <Col md={6} lg={4}>
              <div className="nw-service-card">
                <div className="nw-service-icon success">
                  <IconifyIcon icon="mingcute:home-4-line" />
                </div>
                <h5 className="nw-service-title">Housing Registration</h5>
                <p className="nw-service-description">
                  Register as a housing applicant to join the waiting list for social housing.
                </p>
                <Link to="/housing/register">
                  <button className="nw-btn-submit nw-service-btn">
                    Register Now
                    <span className="nw-btn-icon">→</span>
                  </button>
                </Link>
              </div>
            </Col>

            {/* Status Tracking Card */}
            <Col md={6} lg={4}>
              <div className="nw-service-card">
                <div className="nw-service-icon info">
                  <IconifyIcon icon="mingcute:search-line" />
                </div>
                <h5 className="nw-service-title">Check Status</h5>
                <p className="nw-service-description">
                  Track the progress of your subsidy or housing registration application.
                </p>
                <Link to="/status">
                  <button className="nw-btn-secondary nw-service-btn">
                    View Status
                    <span className="nw-btn-icon">→</span>
                  </button>
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <PublicFooter />
    </div>
  )
}

export default LandingPage

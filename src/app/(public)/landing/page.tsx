import { Card, CardBody, Row, Col, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PublicHeader, PublicFooter } from '@/components/public'

/**
 * Public Landing Page - VolksHuisvesting Suriname
 * 
 * Darkone 1:1 implementation with react-bootstrap
 * Light theme scoped via PublicLayout wrapper
 * English baseline (no Dutch)
 */
const LandingPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="align-items-center justify-content-center text-center">
            <Col lg={8}>
              <h1 className="display-5 fw-bold mb-3">
                Welcome to VolksHuisvesting
              </h1>
              <p className="lead text-muted mb-4">
                Your portal for housing services in Suriname. Apply for construction subsidies, 
                register for social housing, or check the status of your application.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <main className="flex-grow-1 py-5">
        <Container>
          <Row className="mb-4">
            <Col className="text-center">
              <h2 className="fw-bold mb-2">Our Services</h2>
              <p className="text-muted">Select a service to get started</p>
            </Col>
          </Row>

          <Row className="g-4 justify-content-center">
            {/* Construction Subsidy Card */}
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="text-center p-4">
                  <div className="mb-3">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" style={{ width: 64, height: 64 }}>
                      <IconifyIcon 
                        icon="mingcute:file-check-line" 
                        className="text-primary fs-2"
                      />
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">Construction Subsidy</h5>
                  <p className="text-muted small mb-3">
                    Apply for financial support for home construction or renovation projects.
                  </p>
                  <Link to="/bouwsubsidie/apply">
                    <Button variant="primary" className="w-100">
                      Start Application
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>

            {/* Housing Registration Card */}
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="text-center p-4">
                  <div className="mb-3">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10" style={{ width: 64, height: 64 }}>
                      <IconifyIcon 
                        icon="mingcute:home-4-line" 
                        className="text-success fs-2"
                      />
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">Housing Registration</h5>
                  <p className="text-muted small mb-3">
                    Register as a housing applicant to join the waiting list for social housing.
                  </p>
                  <Link to="/housing/register">
                    <Button variant="success" className="w-100">
                      Register Now
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>

            {/* Status Tracking Card */}
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <CardBody className="text-center p-4">
                  <div className="mb-3">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10" style={{ width: 64, height: 64 }}>
                      <IconifyIcon 
                        icon="mingcute:search-line" 
                        className="text-info fs-2"
                      />
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">Check Status</h5>
                  <p className="text-muted small mb-3">
                    Track the progress of your subsidy or housing registration application.
                  </p>
                  <Link to="/status">
                    <Button variant="info" className="w-100">
                      View Status
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      <PublicFooter />
    </div>
  )
}

export default LandingPage

import { Card, CardBody, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

/**
 * Bouwsubsidie Wizard Placeholder
 * 
 * Static placeholder for Phase 5 Checkpoint 2
 * Wizard implementation comes in Checkpoint 4
 */
const BouwsubsidieWizardPlaceholder = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <header className="py-3 border-bottom bg-white">
        <Container>
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="text-decoration-none">
              <img 
                src="/assets/images/logo-dark.png" 
                alt="VolksHuisvesting Logo" 
                height="36" 
              />
            </Link>
            <div>
              <h6 className="mb-0 fw-bold">Construction Subsidy Application</h6>
              <small className="text-muted">VolksHuisvesting Suriname</small>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 py-5 bg-light">
        <Container>
          <Card className="border-0 shadow-sm mx-auto" style={{ maxWidth: 600 }}>
            <CardBody className="text-center py-5 px-4">
              <div className="mb-4">
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" style={{ width: 80, height: 80 }}>
                  <IconifyIcon 
                    icon="mingcute:file-check-line" 
                    className="text-primary"
                    style={{ fontSize: '2.5rem' }}
                  />
                </span>
              </div>
              <h3 className="fw-bold mb-3">Construction Subsidy Wizard</h3>
              <p className="text-muted mb-4">
                The application wizard is currently being prepared. 
                This feature will be available in the next update.
              </p>
              <div className="d-flex flex-column gap-2 align-items-center">
                <span className="badge bg-warning text-dark">Coming Soon</span>
                <Link to="/">
                  <Button variant="outline-secondary" size="sm" className="mt-3">
                    <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-3 border-top bg-white">
        <Container>
          <div className="text-center">
            <small className="text-muted">
              © {new Date().getFullYear()} Ministry of Social Affairs and Housing
            </small>
          </div>
        </Container>
      </footer>
    </div>
  )
}

export default BouwsubsidieWizardPlaceholder

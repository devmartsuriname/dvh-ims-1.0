import { Card, CardBody, Row, Col, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PublicHeader, PublicFooter } from '@/components/public'
import heroImage from '@/assets/images/hero-community.png'

/**
 * Public Landing Page - VolksHuisvesting Suriname
 * 
 * Darkone 1:1 implementation with react-bootstrap
 * Light theme scoped via PublicLayout wrapper
 * i18n enabled - NL default
 * Premium government-grade visual tone
 */
const LandingPage = () => {
  const { t } = useTranslation()

  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />

      {/* Hero Section with Background Image + Dark Overlay */}
      <section 
        className="py-5 position-relative"
      >
        {/* B&W background image layer */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
          }}
        />
        {/* Dark overlay for readability */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
        />
        
        <Container className="position-relative">
          <Row className="align-items-center justify-content-center text-center py-4">
            <Col lg={8}>
              <h1 className="display-5 fw-bold mb-3 text-white">
                {t('landing.heroTitle')}
              </h1>
              <p className="lead text-white-50 mb-0">
                {t('landing.heroDescription')}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Section */}
      <main className="flex-grow-1 py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col className="text-center">
              <h2 className="fw-bold mb-2">{t('landing.servicesTitle')}</h2>
              <p className="text-muted">{t('landing.servicesSubtitle')}</p>
            </Col>
          </Row>

          <Row className="g-4 justify-content-center">
            {/* Construction Subsidy Card */}
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow">
                <CardBody className="text-center p-4">
                  <div className="mb-3">
                    <span 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" 
                      style={{ width: 64, height: 64 }}
                    >
                      <IconifyIcon 
                        icon="mingcute:file-check-line" 
                        className="text-primary fs-2"
                      />
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">{t('landing.bouwsubsidie.title')}</h5>
                  <p className="text-muted small mb-3">
                    {t('landing.bouwsubsidie.description')}
                  </p>
                  <Link to="/bouwsubsidie/apply">
                    <Button 
                      variant="primary" 
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <span>{t('landing.bouwsubsidie.button')}</span>
                      <IconifyIcon icon="mingcute:arrow-right-line" />
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>

            {/* Housing Registration Card */}
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow">
                <CardBody className="text-center p-4">
                  <div className="mb-3">
                    <span 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10" 
                      style={{ width: 64, height: 64 }}
                    >
                      <IconifyIcon 
                        icon="mingcute:home-4-line" 
                        className="text-success fs-2"
                      />
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">{t('landing.housing.title')}</h5>
                  <p className="text-muted small mb-3">
                    {t('landing.housing.description')}
                  </p>
                  <Link to="/housing/register">
                    <Button 
                      variant="success" 
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <span>{t('landing.housing.button')}</span>
                      <IconifyIcon icon="mingcute:arrow-right-line" />
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>

            {/* Status Tracking Card */}
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow">
                <CardBody className="text-center p-4">
                  <div className="mb-3">
                    <span 
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10" 
                      style={{ width: 64, height: 64 }}
                    >
                      <IconifyIcon 
                        icon="mingcute:search-line" 
                        className="text-info fs-2"
                      />
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">{t('landing.status.title')}</h5>
                  <p className="text-muted small mb-3">
                    {t('landing.status.description')}
                  </p>
                  <Link to="/status">
                    <Button 
                      variant="info" 
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <span>{t('landing.status.button')}</span>
                      <IconifyIcon icon="mingcute:arrow-right-line" />
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

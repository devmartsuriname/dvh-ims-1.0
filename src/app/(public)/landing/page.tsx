import { Card, CardBody, Row, Col, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { PublicHeader, PublicFooter } from '@/components/public'
import sideImage from '@/assets/images/side-img.jpg'

/**
 * Public Landing Page - VolksHuisvesting Suriname
 * 
 * V1.7 — Split layout refactor (30/70)
 * Left: B&W hero image panel
 * Right: Welcome + Services content
 * Darkone 1:1 with react-bootstrap, light theme
 * i18n enabled - NL default
 */
const LandingPage = () => {
  const { t } = useTranslation()

  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />

      {/* Split Layout — Image Panel (left) + Content Panel (right) */}
      <main className="flex-grow-1">
        <Row className="g-0 flex-grow-1" style={{ minHeight: 'calc(100vh - 130px)' }}>
          
          {/* Left Column — Image Panel (30%) */}
          <Col lg={4} className="position-relative d-none d-lg-block">
            {/* B&W background image */}
            <div 
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(100%)',
              }}
            />
            {/* Dark overlay */}
            <div 
              className="position-absolute top-0 start-0 w-100 h-100" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.82)' }}
            />
          </Col>

          {/* Mobile Image Banner (visible < lg only) */}
          <Col xs={12} className="d-lg-none position-relative" style={{ height: '240px' }}>
            <div 
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(100%)',
              }}
            />
            <div 
              className="position-absolute top-0 start-0 w-100 h-100" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.82)' }}
            />
          </Col>

          {/* Right Column — Content Panel (70%) */}
          <Col lg={8} className="bg-light">
            <div className="px-4 px-lg-5 py-5" style={{ maxWidth: '900px' }}>
              
              {/* Welcome Section */}
              <h1 className="display-5 fw-bold mb-3">
                {t('landing.heroTitle')}
              </h1>
              <p className="lead text-muted mb-4">
                {t('landing.heroDescription')}
              </p>

              <hr className="my-4" />

              {/* Services Section */}
              <h4 className="fw-bold mb-2">{t('landing.servicesTitle')}</h4>
              <p className="text-muted mb-4">{t('landing.servicesSubtitle')}</p>

              <Row className="g-3">
                {/* Construction Subsidy Card */}
                <Col md={4}>
                  <Card className="h-100 border rounded-3 shadow-sm">
                    <CardBody className="text-center p-4">
                      <div className="mb-3">
                        <span 
                          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" 
                          style={{ width: 56, height: 56 }}
                        >
                          <IconifyIcon 
                            icon="mingcute:file-check-line" 
                            className="text-primary fs-3"
                          />
                        </span>
                      </div>
                      <h6 className="fw-bold mb-2">{t('landing.bouwsubsidie.title')}</h6>
                      <p className="text-muted small mb-3">
                        {t('landing.bouwsubsidie.description')}
                      </p>
                      <Link to="/bouwsubsidie/apply">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                        >
                          <span>{t('landing.bouwsubsidie.button')}</span>
                          <IconifyIcon icon="mingcute:arrow-right-line" />
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>

                {/* Housing Registration Card */}
                <Col md={4}>
                  <Card className="h-100 border rounded-3 shadow-sm">
                    <CardBody className="text-center p-4">
                      <div className="mb-3">
                        <span 
                          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10" 
                          style={{ width: 56, height: 56 }}
                        >
                          <IconifyIcon 
                            icon="mingcute:home-4-line" 
                            className="text-success fs-3"
                          />
                        </span>
                      </div>
                      <h6 className="fw-bold mb-2">{t('landing.housing.title')}</h6>
                      <p className="text-muted small mb-3">
                        {t('landing.housing.description')}
                      </p>
                      <Link to="/housing/register">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                        >
                          <span>{t('landing.housing.button')}</span>
                          <IconifyIcon icon="mingcute:arrow-right-line" />
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>

                {/* Status Tracking Card */}
                <Col md={4}>
                  <Card className="h-100 border rounded-3 shadow-sm">
                    <CardBody className="text-center p-4">
                      <div className="mb-3">
                        <span 
                          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10" 
                          style={{ width: 56, height: 56 }}
                        >
                          <IconifyIcon 
                            icon="mingcute:search-line" 
                            className="text-info fs-3"
                          />
                        </span>
                      </div>
                      <h6 className="fw-bold mb-2">{t('landing.status.title')}</h6>
                      <p className="text-muted small mb-3">
                        {t('landing.status.description')}
                      </p>
                      <Link to="/status">
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          className="d-inline-flex align-items-center gap-1"
                        >
                          <span>{t('landing.status.button')}</span>
                          <IconifyIcon icon="mingcute:arrow-right-line" />
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </main>

      <PublicFooter />
    </div>
  )
}

export default LandingPage

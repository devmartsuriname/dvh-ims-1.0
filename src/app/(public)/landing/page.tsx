import { Card, CardBody, Row, Col } from 'react-bootstrap'
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
            <div 
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage: `url(${sideImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="landing-image-overlay" />
          </Col>

          {/* Mobile Image Banner (visible < lg only) */}
          <Col xs={12} className="d-lg-none position-relative" style={{ height: '200px' }}>
            <div 
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage: `url(${sideImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="landing-image-overlay" />
          </Col>

          {/* Right Column — Content Panel (70%) */}
          <Col lg={8} className="landing-content-panel d-flex align-items-center">
            <div className="px-4 px-lg-5 py-4 w-100" style={{ maxWidth: '900px' }}>
              
              {/* Welcome Section */}
              <h1 className="display-5 fw-bold mb-2">
                {t('landing.heroTitle')}
              </h1>
              <p className="lead text-muted mb-3">
                {t('landing.heroDescription')}
              </p>

              <hr className="mt-3 mb-4 opacity-75" />

              {/* Services Section */}
              <h2 className="h5 fw-bold mb-1">{t('landing.servicesTitle')}</h2>
              <p className="text-muted mb-3">{t('landing.servicesSubtitle')}</p>

              <Row className="g-3">
                {/* Construction Subsidy Card */}
                <Col xs={12} md={6} xl={4}>
                  <Card className="h-100 landing-service-card shadow-sm">
                    <CardBody className="text-center">
                      <div className="mb-2">
                        <span 
                          className="service-icon-wrap d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
                        >
                          <IconifyIcon 
                            icon="mingcute:file-check-line" 
                            className="text-primary fs-4"
                          />
                        </span>
                      </div>
                      <h3 className="h6 fw-bold mb-1">{t('landing.bouwsubsidie.title')}</h3>
                      <p className="text-muted small mb-2 service-description">
                        {t('landing.bouwsubsidie.description')}
                      </p>
                      <Link to="/bouwsubsidie/apply" className="service-cta service-cta--primary mt-auto">
                        {t('landing.bouwsubsidie.button')} →
                      </Link>
                    </CardBody>
                  </Card>
                </Col>

                {/* Housing Registration Card */}
                <Col xs={12} md={6} xl={4}>
                  <Card className="h-100 landing-service-card shadow-sm">
                    <CardBody className="text-center">
                      <div className="mb-2">
                        <span 
                          className="service-icon-wrap d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10"
                        >
                          <IconifyIcon 
                            icon="mingcute:home-4-line" 
                            className="text-success fs-4"
                          />
                        </span>
                      </div>
                      <h3 className="h6 fw-bold mb-1">{t('landing.housing.title')}</h3>
                      <p className="text-muted small mb-2 service-description">
                        {t('landing.housing.description')}
                      </p>
                      <Link to="/housing/register" className="service-cta service-cta--success mt-auto">
                        {t('landing.housing.button')} →
                      </Link>
                    </CardBody>
                  </Card>
                </Col>

                {/* Status Tracking Card */}
                <Col xs={12} md={6} xl={4}>
                  <Card className="h-100 landing-service-card shadow-sm">
                    <CardBody className="text-center">
                      <div className="mb-2">
                        <span 
                          className="service-icon-wrap d-inline-flex align-items-center justify-content-center rounded-circle bg-info bg-opacity-10"
                        >
                          <IconifyIcon 
                            icon="mingcute:search-line" 
                            className="text-info fs-4"
                          />
                        </span>
                      </div>
                      <h3 className="h6 fw-bold mb-1">{t('landing.status.title')}</h3>
                      <p className="text-muted small mb-2 service-description">
                        {t('landing.status.description')}
                      </p>
                      <Link to="/status" className="service-cta service-cta--info mt-auto">
                        {t('landing.status.button')} →
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

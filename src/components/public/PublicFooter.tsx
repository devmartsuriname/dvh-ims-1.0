import { Container, Row, Col } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

/**
 * PublicFooter - Reusable footer for public pages
 * 
 * Darkone 1:1 with react-bootstrap
 * i18n enabled - NL default
 */
const PublicFooter = () => {
  const { t } = useTranslation()

  return (
    <footer className="py-4 border-top bg-white">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <small className="text-muted">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </small>
          </Col>
          <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
            <small className="text-muted">
              {t('footer.version')}
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default PublicFooter

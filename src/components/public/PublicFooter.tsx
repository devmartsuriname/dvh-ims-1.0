import { Container, Row, Col } from 'react-bootstrap'

/**
 * PublicFooter - Reusable footer for public pages
 * 
 * Darkone 1:1 with react-bootstrap
 * English baseline
 */
const PublicFooter = () => {
  return (
    <footer className="py-4 border-top bg-white">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <small className="text-muted">
              © {new Date().getFullYear()} Ministry of Social Affairs and Housing, Suriname
            </small>
          </Col>
          <Col md={6} className="text-center text-md-end mt-2 mt-md-0">
            <small className="text-muted">
              VolksHuisvesting IMS v1.0
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default PublicFooter

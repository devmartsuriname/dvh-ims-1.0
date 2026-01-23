import { currentYear } from '@/context/constants'
import { Col, Row } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <Row>
          <Col xs={12} className=" text-center">
            {currentYear}&nbsp;© Ministerie van Sociale Zaken en Volkshuisvesting
          </Col>
        </Row>
      </div>
    </footer>
  )
}

export default Footer

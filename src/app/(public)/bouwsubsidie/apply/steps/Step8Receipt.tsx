import { Card, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { SubmissionResult } from '../types'

interface Step8ReceiptProps {
  result: SubmissionResult
}

/**
 * Step 8: Receipt
 * 
 * Displays case reference number, access token, and next steps.
 */
const Step8Receipt = ({ result }: Step8ReceiptProps) => {
  const handlePrint = () => {
    window.print()
  }

  const handleCopyReference = () => {
    navigator.clipboard.writeText(result.reference_number)
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(result.access_token)
  }

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div 
        className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
        style={{ width: 80, height: 80 }}
      >
        <IconifyIcon icon="mingcute:check-circle-fill" className="text-success" style={{ fontSize: 48 }} />
      </div>

      <h3 className="fw-bold mb-2">Application Submitted Successfully</h3>
      <p className="text-muted mb-4">
        Your construction subsidy application has been registered. Please save the information below.
      </p>

      {/* Reference Number Card */}
      <Card className="mb-3">
        <Card.Body className="py-4">
          <h6 className="text-muted mb-2">Your Reference Number</h6>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <h2 className="mb-0 font-monospace text-primary">{result.reference_number}</h2>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleCopyReference}
              title="Copy to clipboard"
            >
              <IconifyIcon icon="mingcute:copy-line" />
            </Button>
          </div>
          <p className="text-muted small mb-0">
            Use this number to track your application status
          </p>
        </Card.Body>
      </Card>

      {/* Access Token Card */}
      <Card className="mb-4 border-warning">
        <Card.Header className="bg-warning bg-opacity-10 border-warning">
          <div className="d-flex align-items-center justify-content-center">
            <IconifyIcon icon="mingcute:key-2-line" className="text-warning me-2" />
            <span className="fw-semibold">Security Token</span>
          </div>
        </Card.Header>
        <Card.Body className="py-4">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <code className="fs-5 bg-light px-3 py-2 rounded">{result.access_token}</code>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleCopyToken}
              title="Copy to clipboard"
            >
              <IconifyIcon icon="mingcute:copy-line" />
            </Button>
          </div>
          <div className="bg-warning bg-opacity-10 rounded p-3 mt-3">
            <p className="text-warning mb-0 small">
              <IconifyIcon icon="mingcute:warning-line" className="me-1" />
              <strong>Important:</strong> Save this token securely. You will need both the reference 
              number and this token to check your application status online. This token will only 
              be displayed once.
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Submission Details */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="text-start">
            <Col xs={6}>
              <p className="text-muted small mb-1">Submitted On</p>
              <p className="fw-medium mb-0">
                {new Date(result.submitted_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </Col>
            <Col xs={6}>
              <p className="text-muted small mb-1">Time</p>
              <p className="fw-medium mb-0">
                {new Date(result.submitted_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Next Steps */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0 fw-semibold">What Happens Next?</h6>
        </Card.Header>
        <Card.Body className="text-start">
          <div className="d-flex mb-3">
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <span className="text-primary fw-bold small">1</span>
            </div>
            <div>
              <p className="fw-medium mb-1">Application Review</p>
              <p className="text-muted small mb-0">
                Your application will be reviewed by the Volkshuisvesting department.
              </p>
            </div>
          </div>
          <div className="d-flex mb-3">
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <span className="text-primary fw-bold small">2</span>
            </div>
            <div>
              <p className="fw-medium mb-1">Document Verification</p>
              <p className="text-muted small mb-0">
                You may be contacted to provide the documents you declared.
              </p>
            </div>
          </div>
          <div className="d-flex">
            <div 
              className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <span className="text-primary fw-bold small">3</span>
            </div>
            <div>
              <p className="fw-medium mb-1">Decision Notification</p>
              <p className="text-muted small mb-0">
                You will be contacted via phone regarding the outcome of your application.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
        <Button variant="outline-primary" onClick={handlePrint}>
          <IconifyIcon icon="mingcute:printer-line" className="me-2" />
          Print Receipt
        </Button>
        <Link to="/status" className="btn btn-outline-secondary">
          <IconifyIcon icon="mingcute:search-line" className="me-2" />
          Check Status
        </Link>
        <Link to="/" className="btn btn-primary">
          <IconifyIcon icon="mingcute:home-4-line" className="me-2" />
          Return Home
        </Link>
      </div>
    </div>
  )
}

export default Step8Receipt

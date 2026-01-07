import { Card, Form } from 'react-bootstrap'
import WizardStep from '@/components/public/WizardStep'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { WizardStepProps } from '../types'

/**
 * Step 6: Document Declaration
 * 
 * Checklist of required documents with yes/no possession indicators.
 */
const Step6Documents = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const handleDocumentChange = (documentId: string, hasDocument: boolean) => {
    const updatedDocuments = formData.documents.map((doc) =>
      doc.id === documentId ? { ...doc, hasDocument } : doc
    )
    updateFormData({ documents: updatedDocuments })
  }

  return (
    <WizardStep
      title="Document Declaration"
      description="Please indicate which required documents you have available."
      onBack={onBack}
      onNext={onNext}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          {/* Info Notice */}
          <div className="bg-light rounded p-3 mb-4">
            <div className="d-flex align-items-start">
              <IconifyIcon 
                icon="mingcute:information-line" 
                className="text-primary fs-4 me-2 mt-1" 
              />
              <div>
                <h6 className="fw-semibold mb-1">Document Submission</h6>
                <p className="text-muted mb-0 small">
                  You do not need to upload documents now. This is a declaration of which 
                  documents you have available. You will be required to bring these documents 
                  when you visit the office.
                </p>
              </div>
            </div>
          </div>

          {/* Document Checklist */}
          <h6 className="fw-semibold mb-3">Required Documents</h6>
          <div className="d-flex flex-column gap-3">
            {formData.documents.map((doc) => (
              <div key={doc.id} className="border rounded p-3">
                <div className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start flex-grow-1">
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                        doc.hasDocument 
                          ? 'bg-success bg-opacity-10' 
                          : 'bg-secondary bg-opacity-10'
                      }`}
                      style={{ width: 40, height: 40, minWidth: 40 }}
                    >
                      <IconifyIcon 
                        icon={doc.hasDocument ? 'mingcute:check-line' : 'mingcute:document-line'}
                        className={doc.hasDocument ? 'text-success' : 'text-secondary'}
                      />
                    </div>
                    <div>
                      <p className="mb-1 fw-medium">{doc.label}</p>
                      <span className={`badge ${doc.hasDocument ? 'bg-success' : 'bg-secondary'}`}>
                        {doc.hasDocument ? 'Available' : 'Not available'}
                      </span>
                    </div>
                  </div>
                  <Form.Check
                    type="switch"
                    id={`doc-${doc.id}`}
                    checked={doc.hasDocument}
                    onChange={(e) => handleDocumentChange(doc.id, e.target.checked)}
                    className="ms-3"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-light rounded">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted">Documents available:</span>
              <span className="fw-semibold">
                {formData.documents.filter((d) => d.hasDocument).length} of {formData.documents.length}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step6Documents

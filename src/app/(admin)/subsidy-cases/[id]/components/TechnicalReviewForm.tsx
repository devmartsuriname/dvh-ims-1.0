import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Form, Button, Badge, Spinner, Modal } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { useAuditLog } from '@/hooks/useAuditLog'
import { useUserRole } from '@/hooks/useUserRole'
import { notify } from '@/utils/notify'

interface TechnicalReportData {
  property_type: string
  structural_condition: string
  estimated_construction_cost: number | ''
  land_ownership_verified: string
  building_permit_status: string
  technical_observations: string
  technical_recommendation: string
}

const EMPTY_REPORT: TechnicalReportData = {
  property_type: '',
  structural_condition: '',
  estimated_construction_cost: '',
  land_ownership_verified: '',
  building_permit_status: '',
  technical_observations: '',
  technical_recommendation: '',
}

const PROPERTY_TYPES = [
  { value: '', label: '-- Select --' },
  { value: 'existing_structure', label: 'Existing Structure' },
  { value: 'new_construction', label: 'New Construction' },
  { value: 'renovation', label: 'Renovation' },
]

const STRUCTURAL_CONDITIONS = [
  { value: '', label: '-- Select --' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'unsafe', label: 'Unsafe' },
]

const LAND_OWNERSHIP = [
  { value: '', label: '-- Select --' },
  { value: 'yes', label: 'Yes — Verified' },
  { value: 'no', label: 'No — Not Verified' },
  { value: 'pending', label: 'Pending Verification' },
]

const BUILDING_PERMIT_STATUSES = [
  { value: '', label: '-- Select --' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'not_applicable', label: 'Not Applicable' },
]

const TECHNICAL_RECOMMENDATIONS = [
  { value: '', label: '-- Select --' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'needs_revision', label: 'Needs Revision' },
]

interface TechnicalReviewFormProps {
  caseId: string
  caseStatus: string
  report: {
    id: string
    report_json: any
    is_finalized: boolean
    finalized_at: string | null
    updated_at: string
  } | null
  onReportUpdated: () => void
}

const TechnicalReviewForm = ({ caseId, caseStatus, report, onReportUpdated }: TechnicalReviewFormProps) => {
  const { hasRole } = useUserRole()
  const { logEvent } = useAuditLog()
  const [formData, setFormData] = useState<TechnicalReportData>(EMPTY_REPORT)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [finalizeReason, setFinalizeReason] = useState('')
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const isInspector = hasRole('technical_inspector')
  const isEditableStatus = ['in_technical_review', 'returned_to_technical'].includes(caseStatus)
  const canEdit = isInspector && isEditableStatus && !report?.is_finalized

  // Load existing report data
  useEffect(() => {
    if (report?.report_json && typeof report.report_json === 'object') {
      const json = report.report_json as Record<string, any>
      setFormData({
        property_type: json.property_type || '',
        structural_condition: json.structural_condition || '',
        estimated_construction_cost: json.estimated_construction_cost ?? '',
        land_ownership_verified: json.land_ownership_verified || '',
        building_permit_status: json.building_permit_status || '',
        technical_observations: json.technical_observations || '',
        technical_recommendation: json.technical_recommendation || '',
      })
    }
    if (report?.updated_at) {
      setLastSaved(report.updated_at)
    }
  }, [report])

  const handleFieldChange = (field: keyof TechnicalReportData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveDraft = useCallback(async () => {
    if (!report || !canEdit) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('technical_report')
        .update({ report_json: formData as any })
        .eq('id', report.id)

      if (error) throw error
      setLastSaved(new Date().toISOString())
    } catch (error: any) {
      notify.error('Failed to save draft: ' + (error.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }, [report, canEdit, formData])

  // Auto-save on field changes with debounce
  useEffect(() => {
    if (!canEdit || !report) return
    const timer = setTimeout(() => {
      saveDraft()
    }, 1500)
    return () => clearTimeout(timer)
  }, [formData, canEdit, report])

  const isFormComplete = (): boolean => {
    return (
      formData.property_type !== '' &&
      formData.structural_condition !== '' &&
      formData.estimated_construction_cost !== '' &&
      formData.land_ownership_verified !== '' &&
      formData.building_permit_status !== '' &&
      formData.technical_observations.trim() !== '' &&
      formData.technical_recommendation !== ''
    )
  }

  const handleFinalize = async () => {
    if (!report || !finalizeReason.trim()) return

    setFinalizing(true)
    try {
      const { error } = await supabase
        .from('technical_report')
        .update({
          report_json: formData as any,
          is_finalized: true,
          finalized_at: new Date().toISOString(),
          finalized_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', report.id)

      if (error) throw error

      await logEvent({
        action: 'TECHNICAL_INSPECTION_COMPLETED',
        entity_type: 'technical_report',
        entity_id: report.id,
        reason: finalizeReason,
        metadata: { case_id: caseId, recommendation: formData.technical_recommendation } as any,
      })

      notify.success('Technical report finalized successfully')
      setShowFinalizeModal(false)
      setFinalizeReason('')
      onReportUpdated()
    } catch (error: any) {
      notify.error('Failed to finalize report: ' + (error.message || 'Unknown error'))
    } finally {
      setFinalizing(false)
    }
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h5">Technical Report</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-muted text-center py-4">No technical report found for this case.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <CardTitle as="h5" className="mb-1">Technical Report</CardTitle>
            <small className="text-muted">
              Finalization of a Social or Technical report does not advance the dossier state
              and does not constitute a decision. All status transitions remain manual and role-controlled.
            </small>
          </div>
          <div className="d-flex align-items-center gap-2">
            {report.is_finalized ? (
              <Badge bg="success">Finalized</Badge>
            ) : (
              <Badge bg="warning">Draft</Badge>
            )}
            {saving && <Spinner animation="border" size="sm" />}
          </div>
        </CardHeader>
        <CardBody>
          {lastSaved && (
            <p className="text-muted small mb-3">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </p>
          )}

          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Property Type <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.property_type}
                  onChange={e => handleFieldChange('property_type', e.target.value)}
                  disabled={!canEdit}
                >
                  {PROPERTY_TYPES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Structural Condition <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.structural_condition}
                  onChange={e => handleFieldChange('structural_condition', e.target.value)}
                  disabled={!canEdit}
                >
                  {STRUCTURAL_CONDITIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Estimated Construction Cost (SRD) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formData.estimated_construction_cost}
                  onChange={e => handleFieldChange('estimated_construction_cost', e.target.value === '' ? '' : parseFloat(e.target.value))}
                  disabled={!canEdit}
                  placeholder="Enter amount..."
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Land Ownership Verified <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.land_ownership_verified}
                  onChange={e => handleFieldChange('land_ownership_verified', e.target.value)}
                  disabled={!canEdit}
                >
                  {LAND_OWNERSHIP.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Building Permit Status <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.building_permit_status}
                  onChange={e => handleFieldChange('building_permit_status', e.target.value)}
                  disabled={!canEdit}
                >
                  {BUILDING_PERMIT_STATUSES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Technical Observations <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.technical_observations}
                  onChange={e => handleFieldChange('technical_observations', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Describe structural findings, material assessment, and technical observations..."
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Technical Recommendation <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.technical_recommendation}
                  onChange={e => handleFieldChange('technical_recommendation', e.target.value)}
                  disabled={!canEdit}
                >
                  {TECHNICAL_RECOMMENDATIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {canEdit && (
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="primary"
                onClick={() => setShowFinalizeModal(true)}
                disabled={!isFormComplete()}
              >
                Finalize Report
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Finalization Confirmation Modal */}
      <Modal show={showFinalizeModal} onHide={() => setShowFinalizeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Finalize Technical Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Once finalized, this report cannot be edited. Are you sure?
          </p>
          <Form.Group>
            <Form.Label>Reason for finalization <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={finalizeReason}
              onChange={e => setFinalizeReason(e.target.value)}
              placeholder="Provide reason for finalizing this report..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFinalizeModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleFinalize}
            disabled={!finalizeReason.trim() || finalizing}
          >
            {finalizing ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Finalizing...
              </>
            ) : (
              'Confirm Finalization'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default TechnicalReviewForm

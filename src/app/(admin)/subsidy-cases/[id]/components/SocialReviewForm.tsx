import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Form, Button, Badge, Spinner, Modal } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { useAuditLog } from '@/hooks/useAuditLog'
import { useUserRole } from '@/hooks/useUserRole'
import { notify } from '@/utils/notify'

interface SocialReportData {
  housing_condition: string
  income_category: string
  number_of_dependents: number | ''
  employment_status: string
  social_observations: string
  recommendation: string
}

const EMPTY_REPORT: SocialReportData = {
  housing_condition: '',
  income_category: '',
  number_of_dependents: '',
  employment_status: '',
  social_observations: '',
  recommendation: '',
}

const HOUSING_CONDITIONS = [
  { value: '', label: '-- Select --' },
  { value: 'adequate', label: 'Adequate' },
  { value: 'needs_repair', label: 'Needs Repair' },
  { value: 'substandard', label: 'Substandard' },
  { value: 'uninhabitable', label: 'Uninhabitable' },
]

const INCOME_CATEGORIES = [
  { value: '', label: '-- Select --' },
  { value: 'no_income', label: 'No Income' },
  { value: 'below_minimum', label: 'Below Minimum Wage' },
  { value: 'minimum_wage', label: 'Minimum Wage' },
  { value: 'above_minimum', label: 'Above Minimum Wage' },
]

const EMPLOYMENT_STATUSES = [
  { value: '', label: '-- Select --' },
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'retired', label: 'Retired' },
  { value: 'disabled', label: 'Disabled' },
]

const RECOMMENDATIONS = [
  { value: '', label: '-- Select --' },
  { value: 'favorable', label: 'Favorable' },
  { value: 'unfavorable', label: 'Unfavorable' },
  { value: 'needs_further_review', label: 'Needs Further Review' },
]

interface SocialReviewFormProps {
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

const SocialReviewForm = ({ caseId, caseStatus, report, onReportUpdated }: SocialReviewFormProps) => {
  const { hasRole } = useUserRole()
  const { logEvent } = useAuditLog()
  const [formData, setFormData] = useState<SocialReportData>(EMPTY_REPORT)
  const [saving, setSaving] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [finalizeReason, setFinalizeReason] = useState('')
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const isSocialWorker = hasRole('social_field_worker')
  const isEditableStatus = ['in_social_review', 'returned_to_intake'].includes(caseStatus)
  const canEdit = isSocialWorker && isEditableStatus && !report?.is_finalized

  // Load existing report data
  useEffect(() => {
    if (report?.report_json && typeof report.report_json === 'object') {
      const json = report.report_json as Record<string, any>
      setFormData({
        housing_condition: json.housing_condition || '',
        income_category: json.income_category || '',
        number_of_dependents: json.number_of_dependents ?? '',
        employment_status: json.employment_status || '',
        social_observations: json.social_observations || '',
        recommendation: json.recommendation || '',
      })
    }
    if (report?.updated_at) {
      setLastSaved(report.updated_at)
    }
  }, [report])

  const handleFieldChange = (field: keyof SocialReportData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Auto-save draft (debounced via explicit save)
  const saveDraft = useCallback(async () => {
    if (!report || !canEdit) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('social_report')
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
      formData.housing_condition !== '' &&
      formData.income_category !== '' &&
      formData.number_of_dependents !== '' &&
      formData.employment_status !== '' &&
      formData.social_observations.trim() !== '' &&
      formData.recommendation !== ''
    )
  }

  const handleFinalize = async () => {
    if (!report || !finalizeReason.trim()) return

    setFinalizing(true)
    try {
      // Save final form data + finalization fields
      const { error } = await supabase
        .from('social_report')
        .update({
          report_json: formData as any,
          is_finalized: true,
          finalized_at: new Date().toISOString(),
          finalized_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', report.id)

      if (error) throw error

      // Mandatory audit event
      await logEvent({
        action: 'SOCIAL_ASSESSMENT_COMPLETED',
        entity_type: 'social_report',
        entity_id: report.id,
        reason: finalizeReason,
        metadata: { case_id: caseId, recommendation: formData.recommendation } as any,
      })

      notify.success('Social report finalized successfully')
      setShowFinalizeModal(false)
      setFinalizeReason('')
      onReportUpdated()
    } catch (error: any) {
      notify.error('Failed to finalize report: ' + (error.message || 'Unknown error'))
    } finally {
      setFinalizing(false)
    }
  }

  // No report exists
  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h5">Social Report</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-muted text-center py-4">No social report found for this case.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div>
            <CardTitle as="h5" className="mb-1">Social Report</CardTitle>
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
                <Form.Label>Housing Condition <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.housing_condition}
                  onChange={e => handleFieldChange('housing_condition', e.target.value)}
                  disabled={!canEdit}
                >
                  {HOUSING_CONDITIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Income Category <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.income_category}
                  onChange={e => handleFieldChange('income_category', e.target.value)}
                  disabled={!canEdit}
                >
                  {INCOME_CATEGORIES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Number of Dependents <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={formData.number_of_dependents}
                  onChange={e => handleFieldChange('number_of_dependents', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={!canEdit}
                  placeholder="Enter number..."
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Employment Status <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.employment_status}
                  onChange={e => handleFieldChange('employment_status', e.target.value)}
                  disabled={!canEdit}
                >
                  {EMPLOYMENT_STATUSES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Social Observations <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.social_observations}
                  onChange={e => handleFieldChange('social_observations', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Describe household social conditions, living situation, and relevant observations..."
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Recommendation <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.recommendation}
                  onChange={e => handleFieldChange('recommendation', e.target.value)}
                  disabled={!canEdit}
                >
                  {RECOMMENDATIONS.map(o => (
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
          <Modal.Title>Finalize Social Report</Modal.Title>
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

export default SocialReviewForm

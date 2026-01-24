import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

interface QuotaFormModalProps {
  show: boolean
  onHide: () => void
  onSave: (data: {
    district_code: string
    period_start: string
    period_end: string
    total_quota: number
  }) => Promise<void>
  editingQuota: {
    id: string
    district_code: string
    period_start: string
    period_end: string
    total_quota: number
  } | null
}

interface ValidationErrors {
  district?: string
  periodStart?: string
  periodEnd?: string
  totalQuota?: string
}

const DISTRICTS = [
  { code: 'PAR', name: 'Paramaribo' },
  { code: 'WAG', name: 'Wanica' },
  { code: 'NIC', name: 'Nickerie' },
  { code: 'COR', name: 'Coronie' },
  { code: 'SAR', name: 'Saramacca' },
  { code: 'COM', name: 'Commewijne' },
  { code: 'MAR', name: 'Marowijne' },
  { code: 'PAA', name: 'Para' },
  { code: 'BRO', name: 'Brokopondo' },
  { code: 'SIP', name: 'Sipaliwini' },
]

const QuotaFormModal = ({ show, onHide, onSave, editingQuota }: QuotaFormModalProps) => {
  const [districtCode, setDistrictCode] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [totalQuota, setTotalQuota] = useState(0)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    if (editingQuota) {
      setDistrictCode(editingQuota.district_code)
      setPeriodStart(editingQuota.period_start)
      setPeriodEnd(editingQuota.period_end)
      setTotalQuota(editingQuota.total_quota)
    } else {
      setDistrictCode('')
      setPeriodStart('')
      setPeriodEnd('')
      setTotalQuota(0)
    }
    setValidationErrors({})
    setValidated(false)
  }, [editingQuota, show])

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!districtCode) {
      errors.district = 'District is required'
    }
    if (!periodStart) {
      errors.periodStart = 'Period start is required'
    }
    if (!periodEnd) {
      errors.periodEnd = 'Period end is required'
    } else if (periodStart && periodEnd < periodStart) {
      errors.periodEnd = 'Period end must be on or after period start'
    }
    if (totalQuota < 0) {
      errors.totalQuota = 'Total quota must be 0 or greater'
    }

    setValidationErrors(errors)
    setValidated(true)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      await onSave({
        district_code: districtCode,
        period_start: periodStart,
        period_end: periodEnd,
        total_quota: totalQuota
      })
    } finally {
      setSaving(false)
    }
  }

  const clearFieldError = (field: keyof ValidationErrors) => {
    if (validated) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingQuota ? 'Edit Quota' : 'New District Quota'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>District <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={districtCode}
              onChange={(e) => { setDistrictCode(e.target.value); clearFieldError('district') }}
              isInvalid={!!validationErrors.district}
            >
              <option value="">Select district...</option>
              {DISTRICTS.map(d => (
                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </Form.Select>
            {validationErrors.district && (
              <div className="invalid-feedback d-block">
                {validationErrors.district}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period Start <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={periodStart}
              onChange={(e) => { setPeriodStart(e.target.value); clearFieldError('periodStart') }}
              isInvalid={!!validationErrors.periodStart}
            />
            {validationErrors.periodStart && (
              <div className="invalid-feedback d-block">
                {validationErrors.periodStart}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period End <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={periodEnd}
              onChange={(e) => { setPeriodEnd(e.target.value); clearFieldError('periodEnd') }}
              isInvalid={!!validationErrors.periodEnd}
            />
            {validationErrors.periodEnd && (
              <div className="invalid-feedback d-block">
                {validationErrors.periodEnd}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total Quota <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={totalQuota}
              onChange={(e) => { setTotalQuota(parseInt(e.target.value) || 0); clearFieldError('totalQuota') }}
              isInvalid={!!validationErrors.totalQuota}
            />
            {validationErrors.totalQuota && (
              <div className="invalid-feedback d-block">
                {validationErrors.totalQuota}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : editingQuota ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default QuotaFormModal

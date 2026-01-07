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
  }, [editingQuota, show])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingQuota ? 'Edit Quota' : 'New District Quota'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>District</Form.Label>
            <Form.Select
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              required
            >
              <option value="">Select district...</option>
              {DISTRICTS.map(d => (
                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period Start</Form.Label>
            <Form.Control
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Period End</Form.Label>
            <Form.Control
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total Quota</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={totalQuota}
              onChange={(e) => setTotalQuota(parseInt(e.target.value) || 0)}
              required
            />
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

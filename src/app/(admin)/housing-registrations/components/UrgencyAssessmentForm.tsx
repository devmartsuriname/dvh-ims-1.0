import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Form, Button, Spinner, Table, Badge } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import { useAuditLog } from '@/hooks/useAuditLog'

interface UrgencyAssessment {
  id: string
  urgency_category: string
  urgency_points: number
  assessed_by: string | null
  assessment_date: string
  justification: string | null
}

interface UrgencyAssessmentFormProps {
  registrationId: string
  assessments: UrgencyAssessment[]
  onAssessmentAdded: () => void
}

const URGENCY_CATEGORIES = [
  { value: 'medical', label: 'Medical Condition', defaultPoints: 50 },
  { value: 'safety', label: 'Safety Concern', defaultPoints: 40 },
  { value: 'displacement', label: 'Displacement', defaultPoints: 35 },
  { value: 'overcrowding', label: 'Overcrowding', defaultPoints: 25 },
  { value: 'family_separation', label: 'Family Separation', defaultPoints: 20 },
  { value: 'structural_issues', label: 'Current Housing Structural Issues', defaultPoints: 30 },
  { value: 'financial_hardship', label: 'Financial Hardship', defaultPoints: 15 },
  { value: 'other', label: 'Other', defaultPoints: 10 },
]

const UrgencyAssessmentForm = ({ registrationId, assessments, onAssessmentAdded }: UrgencyAssessmentFormProps) => {
  const [category, setCategory] = useState('')
  const [points, setPoints] = useState<number | ''>('')
  const [justification, setJustification] = useState('')
  const [loading, setLoading] = useState(false)
  const { logEvent } = useAuditLog()

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    const categoryConfig = URGENCY_CATEGORIES.find(c => c.value === value)
    if (categoryConfig) {
      setPoints(categoryConfig.defaultPoints)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || points === '' || points < 0) {
      toast.error('Please select a category and enter valid points')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('housing_urgency')
        .insert({
          registration_id: registrationId,
          urgency_category: category,
          urgency_points: points,
          assessed_by: user?.id,
          justification: justification || null,
        })
        .select()
        .single()

      if (error) throw error

      // Calculate new total urgency score
      const totalScore = assessments.reduce((sum, a) => sum + a.urgency_points, 0) + points

      // Update registration with new urgency score
      await supabase
        .from('housing_registration')
        .update({ urgency_score: totalScore })
        .eq('id', registrationId)

      await logEvent({
        action: 'CREATE',
        entity_type: 'housing_urgency',
        entity_id: data.id,
        reason: `Urgency assessment added: ${category} (${points} points)`,
      })

      toast.success('Urgency assessment added successfully')
      setCategory('')
      setPoints('')
      setJustification('')
      onAssessmentAdded()
    } catch (error: any) {
      toast.error(error.message || 'Failed to add assessment')
    } finally {
      setLoading(false)
    }
  }

  const totalScore = assessments.reduce((sum, a) => sum + a.urgency_points, 0)

  return (
    <>
      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">Urgency Score</CardTitle>
          <Badge bg={totalScore > 50 ? 'danger' : totalScore > 25 ? 'warning' : 'secondary'} className="fs-5">
            {totalScore} points
          </Badge>
        </CardHeader>
      </Card>

      <Card className="mb-3">
        <CardHeader>
          <CardTitle as="h5">Add Urgency Assessment</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            <strong>Note:</strong> Urgency assessments are append-only. Once submitted, they cannot be modified or deleted.
          </p>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="">Select urgency category...</option>
                {URGENCY_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} (default: {c.defaultPoints} pts)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Points <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={points}
                onChange={(e) => setPoints(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Enter points"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Justification</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Enter justification for this assessment..."
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Add Assessment'}
            </Button>
          </Form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h5">Assessment History</CardTitle>
        </CardHeader>
        <CardBody>
          {assessments.length === 0 ? (
            <p className="text-muted text-center py-3">No assessments recorded yet</p>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Points</th>
                  <th>Justification</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const categoryLabel = URGENCY_CATEGORIES.find(c => c.value === a.urgency_category)?.label || a.urgency_category
                  return (
                    <tr key={a.id}>
                      <td>{categoryLabel}</td>
                      <td><Badge bg="primary">{a.urgency_points}</Badge></td>
                      <td>{a.justification || '-'}</td>
                      <td>{new Date(a.assessment_date).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default UrgencyAssessmentForm

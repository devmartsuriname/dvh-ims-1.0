import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  household_size: yup
    .number()
    .required('Household size is required')
    .min(1, 'Household size must be at least 1')
    .max(20, 'Household size cannot exceed 20'),
  dependents: yup
    .number()
    .min(0, 'Dependents cannot be negative')
    .max(20, 'Dependents cannot exceed 20'),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 3: Household Information
 * 
 * Collects household size and number of dependents.
 */
const Step3Household = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      household_size: formData.household_size,
      dependents: formData.dependents,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Household Information"
      description="Tell us about your household composition."
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Household Size</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={20}
                    placeholder="Total number of people in household"
                    {...register('household_size')}
                    isInvalid={!!errors.household_size}
                  />
                  {errors.household_size?.message && (
                    <div className="text-danger small mt-1">{String(errors.household_size.message)}</div>
                  )}
                  <Form.Text className="text-muted">
                    Including yourself
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Number of Dependents</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={20}
                    placeholder="Number of dependents"
                    {...register('dependents')}
                    isInvalid={!!errors.dependents}
                  />
                  {errors.dependents?.message && (
                    <div className="text-danger small mt-1">{String(errors.dependents.message)}</div>
                  )}
                  <Form.Text className="text-muted">
                    Children or others who depend on you financially (optional)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step3Household

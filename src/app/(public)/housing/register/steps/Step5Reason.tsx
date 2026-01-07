import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import { APPLICATION_REASONS } from '../constants'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  application_reason: yup
    .string()
    .required('Please select a reason for your application'),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 5: Reason for Application
 * 
 * Collects the main reason for housing registration.
 */
const Step5Reason = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      application_reason: formData.application_reason,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Reason for Application"
      description="Why are you applying for housing registration?"
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Primary Reason</Form.Label>
                  {APPLICATION_REASONS.map((reason) => (
                    <Form.Check
                      key={reason.value}
                      type="radio"
                      id={`reason-${reason.value}`}
                      label={reason.label}
                      value={reason.value}
                      {...register('application_reason')}
                      className="mb-2"
                    />
                  ))}
                  {errors.application_reason?.message && (
                    <div className="text-danger small mt-1">{String(errors.application_reason.message)}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step5Reason

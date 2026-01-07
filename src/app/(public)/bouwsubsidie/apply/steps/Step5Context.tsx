import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { APPLICATION_REASONS } from '../constants'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  application_reason: yup
    .string()
    .required('Please select a reason for your application'),
  estimated_amount: yup.string(),
  is_calamity: yup.boolean(),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 5: Application Context
 * 
 * Collects reason for application, estimated amount, and calamity indicator.
 */
const Step5Context = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      application_reason: formData.application_reason,
      estimated_amount: formData.estimated_amount,
      is_calamity: formData.is_calamity,
    },
  })

  const isCalamity = watch('is_calamity')

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Application Details"
      description="Tell us more about your construction subsidy request."
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Reason for Application</Form.Label>
                  <Form.Select
                    {...register('application_reason')}
                    isInvalid={!!errors.application_reason}
                  >
                    <option value="">Select the reason for your application</option>
                    {APPLICATION_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.application_reason?.message && (
                    <div className="text-danger small mt-1">{String(errors.application_reason.message)}</div>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <TextFormInput
                  name="estimated_amount"
                  label="Estimated Amount (SRD)"
                  placeholder="e.g., 50000"
                  control={control}
                  containerClassName="mb-0"
                />
                <div className="text-muted small mt-1">Optional - approximate cost of construction</div>
              </Col>
              
              <Col xs={12}>
                <div className="border rounded p-3">
                  <Form.Check
                    type="checkbox"
                    id="is_calamity"
                    {...register('is_calamity')}
                    label={
                      <span>
                        <strong>Calamity/Emergency Application</strong>
                        <br />
                        <span className="text-muted small">
                          Check this box if your application is due to a natural disaster, 
                          fire, or other emergency situation
                        </span>
                      </span>
                    }
                  />
                </div>
              </Col>
              
              {isCalamity && (
                <Col xs={12}>
                  <div className="bg-warning bg-opacity-10 border border-warning rounded p-3">
                    <div className="d-flex align-items-start">
                      <IconifyIcon 
                        icon="mingcute:warning-line" 
                        className="text-warning fs-4 me-2 mt-1" 
                      />
                      <div>
                        <h6 className="fw-semibold mb-1 text-warning">Emergency Application</h6>
                        <p className="text-muted mb-0 small">
                          Emergency applications may be eligible for expedited processing. 
                          Please ensure you have documentation of the emergency situation 
                          available for verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </Col>
              )}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step5Context

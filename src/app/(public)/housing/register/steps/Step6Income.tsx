import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { INCOME_SOURCES } from '../constants'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  income_source: yup
    .string()
    .required('Please select your income source'),
  monthly_income_applicant: yup.string(),
  monthly_income_partner: yup.string(),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 6: Income Information
 * 
 * Collects income source and monthly income details.
 */
const Step6Income = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      income_source: formData.income_source,
      monthly_income_applicant: formData.monthly_income_applicant,
      monthly_income_partner: formData.monthly_income_partner,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Income Information"
      description="Please provide information about your income."
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Primary Income Source</Form.Label>
                  <Form.Select
                    {...register('income_source')}
                    isInvalid={!!errors.income_source}
                  >
                    <option value="">Select income source</option>
                    {INCOME_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.income_source?.message && (
                    <div className="text-danger small mt-1">{String(errors.income_source.message)}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <TextFormInput
                  name="monthly_income_applicant"
                  label="Your Monthly Income (SRD)"
                  placeholder="Enter amount"
                  control={control}
                  containerClassName="mb-0"
                />
                <div className="text-muted small mt-1">Optional</div>
              </Col>

              <Col md={6}>
                <TextFormInput
                  name="monthly_income_partner"
                  label="Partner's Monthly Income (SRD)"
                  placeholder="Enter amount"
                  control={control}
                  containerClassName="mb-0"
                />
                <div className="text-muted small mt-1">Optional - if applicable</div>
              </Col>
            </Row>

            <div className="bg-light rounded p-3 mt-4">
              <p className="text-muted small mb-0">
                <strong>Note:</strong> Income information is used to determine eligibility for 
                different housing programs. You may be asked to provide proof of income later 
                in the process.
              </p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step6Income

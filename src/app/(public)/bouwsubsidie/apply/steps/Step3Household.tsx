import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import type { WizardStepProps } from '../types'

/**
 * Step 3: Household Information
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Collects household size and number of dependents.
 */
const Step3Household = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    household_size: yup
      .number()
      .required(t('validation.householdSizeRequired'))
      .min(1, t('validation.householdSizeMin'))
      .max(20, t('validation.householdSizeMax')),
    dependents: yup
      .number()
      .min(0, t('validation.minValue', { min: 0 }))
      .max(20, t('validation.maxValue', { max: 20 })),
  })

  type FormData = yup.InferType<typeof schema>

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
      title={t('bouwsubsidie.step3.title')}
      description={t('bouwsubsidie.step3.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('bouwsubsidie.step3.householdSize')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={20}
                    placeholder={t('bouwsubsidie.step3.householdSizePlaceholder')}
                    {...register('household_size')}
                    isInvalid={!!errors.household_size}
                  />
                  {errors.household_size?.message && (
                    <div className="text-danger small mt-1">{String(errors.household_size.message)}</div>
                  )}
                  <Form.Text className="text-muted">
                    {t('bouwsubsidie.step3.householdSizeHelp')}
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('bouwsubsidie.step3.dependents')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={20}
                    placeholder={t('bouwsubsidie.step3.dependentsPlaceholder')}
                    {...register('dependents')}
                    isInvalid={!!errors.dependents}
                  />
                  {errors.dependents?.message && (
                    <div className="text-danger small mt-1">{String(errors.dependents.message)}</div>
                  )}
                  <Form.Text className="text-muted">
                    {t('bouwsubsidie.step3.dependentsHelp')}
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

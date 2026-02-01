import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { APPLICATION_REASONS } from '../constants'
import type { WizardStepProps } from '../types'

/**
 * Step 5: Application Context
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Collects reason for application, estimated amount, and calamity indicator.
 */
const Step5Context = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    application_reason: yup
      .string()
      .required(t('validation.applicationReasonRequired')),
    estimated_amount: yup.string(),
    is_calamity: yup.boolean(),
  })

  type FormData = yup.InferType<typeof schema>

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
      title={t('bouwsubsidie.step5.title')}
      description={t('bouwsubsidie.step5.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('bouwsubsidie.step5.applicationReason')}</Form.Label>
                  <Form.Select
                    {...register('application_reason')}
                    isInvalid={!!errors.application_reason}
                  >
                    <option value="">{t('bouwsubsidie.step5.applicationReasonPlaceholder')}</option>
                    {APPLICATION_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {t(reason.labelKey)}
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
                  label={t('bouwsubsidie.step5.estimatedAmount')}
                  placeholder={t('bouwsubsidie.step5.estimatedAmountPlaceholder')}
                  control={control}
                  containerClassName="mb-0"
                />
                <div className="text-muted small mt-1">{t('bouwsubsidie.step5.estimatedAmountHelp')}</div>
              </Col>
              
              <Col xs={12}>
                <div className="border rounded p-3">
                  <Form.Check
                    type="checkbox"
                    id="is_calamity"
                    {...register('is_calamity')}
                    label={
                      <span>
                        <strong>{t('bouwsubsidie.step5.isCalamity')}</strong>
                        <br />
                        <span className="text-muted small">
                          {t('bouwsubsidie.step5.isCalamityDescription')}
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
                        <h6 className="fw-semibold mb-1 text-warning">{t('bouwsubsidie.step5.emergencyTitle')}</h6>
                        <p className="text-muted mb-0 small">
                          {t('bouwsubsidie.step5.emergencyText')}
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

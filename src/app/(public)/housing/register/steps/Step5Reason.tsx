import { Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import { APPLICATION_REASONS } from '../constants'
import type { WizardStepProps } from '../types'

/**
 * Step 5: Reason for Application
 * 
 * Collects the main reason for housing registration.
 * i18n enabled - NL default
 */
const Step5Reason = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    application_reason: yup
      .string()
      .required(t('validation.applicationReasonRequired')),
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      application_reason: formData.application_reason,
    },
  })

  const onSubmit = (data: any) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title={t('housing.step5.title')}
      description={t('housing.step5.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('housing.step5.primaryReason')}</Form.Label>
                  {APPLICATION_REASONS.map((reason) => (
                    <Form.Check
                      key={reason.value}
                      type="radio"
                      id={`reason-${reason.value}`}
                      label={t(reason.labelKey)}
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
    </WizardStep>
  )
}
export default Step5Reason

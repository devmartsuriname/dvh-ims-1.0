import { Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { INCOME_SOURCES } from '../constants'
import type { WizardStepProps } from '../types'

/**
 * Step 6: Income Information
 * 
 * Collects income source and monthly income details.
 * i18n enabled - NL default
 */
const Step6Income = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    income_source: yup
      .string()
      .required(t('validation.incomeSourceRequired')),
    monthly_income_applicant: yup.string(),
    monthly_income_partner: yup.string(),
  })

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      income_source: formData.income_source,
      monthly_income_applicant: formData.monthly_income_applicant,
      monthly_income_partner: formData.monthly_income_partner,
    },
  })

  const onSubmit = (data: any) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title={t('housing.step6.title')}
      description={t('housing.step6.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>{t('housing.step6.incomeSource')}</Form.Label>
                  <Form.Select
                    {...register('income_source')}
                    isInvalid={!!errors.income_source}
                  >
                    <option value="">{t('housing.step6.incomeSourcePlaceholder')}</option>
                    {INCOME_SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {t(source.labelKey)}
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
                  label={t('housing.step6.monthlyIncomeApplicant')}
                  placeholder={t('housing.step6.monthlyIncomeApplicantPlaceholder')}
                  control={control}
                  containerClassName="mb-0"
                />
                <Form.Text className="text-muted">{t('common.optional')}</Form.Text>
              </Col>

              <Col md={6}>
                <TextFormInput
                  name="monthly_income_partner"
                  label={t('housing.step6.monthlyIncomePartner')}
                  placeholder={t('housing.step6.monthlyIncomePartnerPlaceholder')}
                  control={control}
                  containerClassName="mb-0"
                />
                <Form.Text className="text-muted">{t('housing.step6.monthlyIncomePartnerHelp')}</Form.Text>
              </Col>
            </Row>

            <div className="bg-light rounded p-3 mt-3">
              <p className="text-muted small mb-0">
                <strong>{t('common.optional')}:</strong> {t('housing.step6.note')}
              </p>
            </div>
      </Form>
    </WizardStep>
  )
}

export default Step6Income

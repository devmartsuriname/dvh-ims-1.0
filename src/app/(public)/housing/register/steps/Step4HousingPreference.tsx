import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import { DISTRICTS } from '@/constants/districts'
import { INTEREST_TYPES } from '../constants'
import type { WizardStepProps } from '../types'

/**
 * Step 4: Housing Preference
 * 
 * Collects interest type (rent/rent-to-own/purchase) and preferred district.
 * i18n enabled - NL default
 */
const Step4HousingPreference = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    interest_type: yup
      .string()
      .required(t('validation.interestTypeRequired')),
    preferred_district: yup
      .string()
      .required(t('validation.preferredDistrictRequired')),
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      interest_type: formData.interest_type,
      preferred_district: formData.preferred_district,
    },
  })

  const onSubmit = (data: any) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title={t('housing.step4.title')}
      description={t('housing.step4.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('housing.step4.interestType')}</Form.Label>
                  <Form.Select
                    {...register('interest_type')}
                    isInvalid={!!errors.interest_type}
                  >
                    <option value="">{t('housing.step4.interestTypePlaceholder')}</option>
                    {INTEREST_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {t(type.labelKey)}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.interest_type?.message && (
                    <div className="text-danger small mt-1">{String(errors.interest_type.message)}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('housing.step4.preferredDistrict')}</Form.Label>
                  <Form.Select
                    {...register('preferred_district')}
                    isInvalid={!!errors.preferred_district}
                  >
                    <option value="">{t('housing.step4.preferredDistrictPlaceholder')}</option>
                    {DISTRICTS.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.preferred_district?.message && (
                    <div className="text-danger small mt-1">{String(errors.preferred_district.message)}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="bg-light rounded p-3 mt-4">
              <p className="text-muted small mb-0">
                <strong>{t('common.optional')}:</strong> {t('housing.step4.note')}
              </p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step4HousingPreference

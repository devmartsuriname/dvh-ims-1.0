import { Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { DISTRICTS } from '@/constants/districts'
import { HOUSING_TYPES } from '../constants'
import type { WizardStepProps } from '../types'

/**
 * Step 3: Current Living Situation
 * 
 * Collects current address, district, housing type, and number of residents.
 * i18n enabled - NL default
 */
const Step3LivingSituation = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    address_line_1: yup.string().required(t('validation.addressRequired')).min(5, t('validation.addressMinLength')),
    district: yup.string().required(t('validation.districtRequired')),
    current_housing_type: yup.string().required(t('validation.housingTypeRequired')),
    monthly_rent: yup.string(),
    number_of_residents: yup.number().min(1, t('validation.residentsMin')).required(t('validation.residentsRequired')),
  })

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      address_line_1: formData.address_line_1,
      district: formData.district,
      current_housing_type: formData.current_housing_type,
      monthly_rent: formData.monthly_rent,
      number_of_residents: formData.number_of_residents,
    },
  })

  const onSubmit = (data: any) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep 
      title={t('housing.step3.title')} 
      description={t('housing.step3.description')} 
      onBack={onBack} 
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
            <Row className="g-3">
              <Col xs={12}>
                <TextFormInput 
                  name="address_line_1" 
                  label={t('housing.step3.address')} 
                  placeholder={t('housing.step3.addressPlaceholder')} 
                  control={control} 
                  containerClassName="mb-0" 
                />
                {errors.address_line_1?.message && (
                  <div className="text-danger small mt-1">{String(errors.address_line_1.message)}</div>
                )}
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('housing.step3.district')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select {...register('district')} isInvalid={!!errors.district}>
                    <option value="">{t('housing.step3.districtPlaceholder')}</option>
                    {DISTRICTS.map((district) => (
                      <option key={district.code} value={district.code}>{district.name}</option>
                    ))}
                  </Form.Select>
                  {errors.district?.message && (
                    <div className="text-danger small mt-1">{String(errors.district.message)}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('housing.step3.housingType')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select {...register('current_housing_type')} isInvalid={!!errors.current_housing_type}>
                    <option value="">{t('housing.step3.housingTypePlaceholder')}</option>
                    {HOUSING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
                    ))}
                  </Form.Select>
                  {errors.current_housing_type?.message && (
                    <div className="text-danger small mt-1">{String(errors.current_housing_type.message)}</div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <TextFormInput 
                  name="monthly_rent" 
                  label={t('housing.step3.monthlyRent')} 
                  placeholder={t('housing.step3.monthlyRentPlaceholder')} 
                  control={control} 
                  containerClassName="mb-0" 
                />
                <Form.Text className="text-muted">{t('housing.step3.monthlyRentHelp')}</Form.Text>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('housing.step3.residents')}</Form.Label>
                  <Form.Control 
                    type="number" 
                    min={1} 
                    {...register('number_of_residents', { valueAsNumber: true })} 
                    isInvalid={!!errors.number_of_residents} 
                  />
                  {errors.number_of_residents?.message && (
                    <div className="text-danger small mt-1">{String(errors.number_of_residents.message)}</div>
                  )}
                  <Form.Text className="text-muted">{t('housing.step3.residentsHelp')}</Form.Text>
                </Form.Group>
              </Col>
            </Row>
      </Form>
    </WizardStep>
  )
}

export default Step3LivingSituation

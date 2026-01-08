import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { NeonwizardLayout, NeonwizardStep } from '@/components/public'

/**
 * Public Landing Page - VolksHuisvesting Suriname
 * 
 * Phase 8.5: Neonwizard Layout #1 - Step 1 Service Selection
 * Renders directly as wizard Step 1 (no hero, no landing sections)
 */

const services = [
  { 
    id: 'subsidy', 
    title: 'Construction Subsidy', 
    icon: 'mingcute:file-check-line', 
    route: '/bouwsubsidie/apply' 
  },
  { 
    id: 'housing', 
    title: 'Housing Registration', 
    icon: 'mingcute:home-4-line', 
    route: '/housing/register' 
  },
  { 
    id: 'status', 
    title: 'Check Status', 
    icon: 'mingcute:search-line', 
    route: '/status' 
  }
]

const steps: NeonwizardStep[] = [
  { title: 'Service Selection' },
  { title: 'Personal Information' },
  { title: 'Application Details' },
  { title: 'Documents' },
  { title: 'Review & Submit' }
]

const LandingPage = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleNext = () => {
    if (selectedService) {
      const service = services.find(s => s.id === selectedService)
      if (service) {
        navigate(service.route)
      }
    }
  }

  return (
    <NeonwizardLayout
      steps={steps}
      currentStep={0}
      onNext={selectedService ? handleNext : undefined}
      nextLabel="NEXT"
      showActions={true}
    >
      {/* Step 1 Header */}
      <div className="nw-step-header">
        <span className="nw-step-label">Step 1</span>
        <h2 className="nw-step-title">What service do you need?</h2>
        <p className="nw-step-description">
          Select the service you would like to access.
        </p>
      </div>

      {/* Service Selection Cards */}
      <div className="nw-service-options">
        {services.map(service => (
          <label 
            key={service.id}
            className={`nw-service-option ${selectedService === service.id ? 'is-selected' : ''}`}
          >
            <input 
              type="radio" 
              name="service" 
              value={service.id}
              checked={selectedService === service.id}
              onChange={() => setSelectedService(service.id)}
            />
            <span className="nw-service-option-check" />
            <div className="nw-service-option-icon">
              <IconifyIcon icon={service.icon} />
            </div>
            <span className="nw-service-option-text">{service.title}</span>
          </label>
        ))}
      </div>
    </NeonwizardLayout>
  )
}

export default LandingPage

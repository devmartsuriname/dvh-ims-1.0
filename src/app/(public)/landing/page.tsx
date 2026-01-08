import '@/assets/scss/neonwizard/style.scss'
import { NeonwizardLayout, NeonwizardStep1, NeonwizardStep2, NeonwizardStep3, NeonwizardStep4, NeonwizardStep5 } from '@/components/neonwizard'
import { NeonwizardProvider } from '@/context/NeonwizardContext'
import { useNeonwizard } from '@/hooks/useNeonwizard'

/**
 * Public Landing Page - Neonwizard Layout #1
 * Phase 9B-1: Interactive wizard with state management
 * 
 * Restore Point: PHASE-9B-1-BEFORE-WIRING
 */

const WizardContent = () => {
  const { currentStep } = useNeonwizard()
  
  return (
    <NeonwizardLayout currentStep={currentStep}>
      {currentStep === 1 && <NeonwizardStep1 />}
      <NeonwizardStep2 />
      <NeonwizardStep3 />
      <NeonwizardStep4 />
      <NeonwizardStep5 />
    </NeonwizardLayout>
  )
}

const LandingPage = () => {
  return (
    <div className="neonwizard-scope">
      <NeonwizardProvider>
        <WizardContent />
      </NeonwizardProvider>
    </div>
  )
}

export default LandingPage

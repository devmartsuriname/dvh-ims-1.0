import '@/assets/scss/neonwizard/style.scss'
import { NeonwizardLayout, NeonwizardStep1 } from '@/components/neonwizard'

/**
 * Public Landing Page - Neonwizard Layout #1 (1:1 Visual Parity)
 * 
 * RESTORE POINT: PHASE-8.5-BEFORE-TRANSFER
 */
const LandingPage = () => {
  return (
    <div className="neonwizard-scope">
      <NeonwizardLayout currentStep={1}>
        <NeonwizardStep1 />
      </NeonwizardLayout>
    </div>
  )
}

export default LandingPage

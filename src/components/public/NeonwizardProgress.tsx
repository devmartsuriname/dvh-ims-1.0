import IconifyIcon from '@/components/wrapper/IconifyIcon'

export interface NeonwizardStep {
  title: string
  subtitle?: string
}

interface NeonwizardProgressProps {
  steps: NeonwizardStep[]
  currentStep: number
}

/**
 * NeonwizardProgress - Vertical Step Progress Indicator
 * Phase 8.5 - Layout #1 style vertical progress
 * 
 * Matches Neonwizard template exactly:
 * - Vertical numbered circles with connecting lines
 * - Active step has pulse animation
 * - Completed steps show checkmark
 */
const NeonwizardProgress = ({ steps, currentStep }: NeonwizardProgressProps) => {
  return (
    <div className="nw-progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isCompleted = stepNumber < currentStep
        const isActive = stepNumber === currentStep
        
        return (
          <div key={index} className="nw-progress-step">
            {/* Step Circle - Numbers only, no labels (per Layout #1 reference) */}
            <div 
              className={`nw-step-circle ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}
            >
              {isCompleted ? (
                <IconifyIcon icon="mingcute:check-line" />
              ) : (
                stepNumber
              )}
            </div>
            
            {/* Connecting Line */}
            <div 
              className={`nw-step-line ${isCompleted ? 'is-completed' : ''}`}
            />
          </div>
        )
      })}
    </div>
  )
}

export default NeonwizardProgress

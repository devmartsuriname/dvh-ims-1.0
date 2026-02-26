import { ProgressBar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

export interface WizardStep {
  title: string
}

export interface PhaseGroup {
  labelKey: string
  steps: number[]
}

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number
  phaseGroups?: PhaseGroup[]
  onBack?: () => void
}

/**
 * WizardProgress - Mobile-first step indicator
 * V1.7 — Wizard Experience Enhancement
 * 
 * Mobile (<768px): Sticky top bar with phase label, step counter, progress bar
 * Desktop (>=768px): Horizontal stepper with 36px circles, phase underlines
 */
const WizardProgress = ({ steps, currentStep, phaseGroups, onBack }: WizardProgressProps) => {
  const { t } = useTranslation()
  const progressPercent = Math.round((currentStep / (steps.length - 1)) * 100)

  // Find current phase
  const getCurrentPhase = () => {
    if (!phaseGroups) return null
    return phaseGroups.find(pg => pg.steps.includes(currentStep)) || null
  }

  const currentPhase = getCurrentPhase()

  // Get phase for a given step index (desktop underline)
  const getPhaseForStep = (stepIndex: number) => {
    if (!phaseGroups) return null
    return phaseGroups.find(pg => pg.steps.includes(stepIndex)) || null
  }

  // Check if step is first in its phase group (for underline rendering)
  const isFirstInPhase = (stepIndex: number) => {
    const phase = getPhaseForStep(stepIndex)
    return phase ? phase.steps[0] === stepIndex : false
  }

  // Check if step is last in its phase group
  const isLastInPhase = (stepIndex: number) => {
    const phase = getPhaseForStep(stepIndex)
    return phase ? phase.steps[phase.steps.length - 1] === stepIndex : false
  }

  return (
    <div className="wizard-progress mb-4">
      {/* ==================== MOBILE (<768px): Sticky top bar ==================== */}
      <div
        className="d-block d-md-none bg-white shadow-sm rounded mb-3"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1020,
          padding: '12px 16px',
        }}
      >
        <div className="d-flex align-items-center mb-2">
          {/* Back arrow */}
          {currentStep > 0 && onBack && (
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-0 me-3"
              onClick={onBack}
              aria-label={t('common.back')}
              style={{ lineHeight: 1 }}
            >
              <IconifyIcon icon="mingcute:arrow-left-line" className="fs-5" />
            </button>
          )}
          <div className="flex-grow-1">
            {/* Phase label */}
            {currentPhase && (
              <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                {t(currentPhase.labelKey)}
              </small>
            )}
            {/* Step counter + title */}
            <div className="d-flex justify-content-between align-items-baseline">
              <span className="fw-semibold small">
                {t('common.stepOf', {
                  current: currentStep + 1,
                  total: steps.length,
                  defaultValue: `Stap ${currentStep + 1} van ${steps.length}`,
                })}
              </span>
              <span className="text-muted small text-truncate ms-2" style={{ maxWidth: '50%' }}>
                {steps[currentStep]?.title}
              </span>
            </div>
          </div>
        </div>
        <ProgressBar
          now={progressPercent}
          style={{ height: 4 }}
          variant="primary"
        />
      </div>

      {/* ==================== DESKTOP (>=768px): Horizontal stepper ==================== */}
      <div className="d-none d-md-block">
        <div className="d-flex align-items-start justify-content-between position-relative">
          {/* Progress line background */}
          <div
            className="position-absolute bg-light"
            style={{
              height: 2,
              left: '5%',
              right: '5%',
              top: 18,
              zIndex: 0,
            }}
          />
          {/* Progress line filled */}
          <div
            className="position-absolute bg-primary"
            style={{
              height: 2,
              left: '5%',
              width: `${Math.max(0, (currentStep / (steps.length - 1)) * 90)}%`,
              top: 18,
              zIndex: 1,
              transition: 'width 0.3s ease',
            }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isPending = index > currentStep
            const phase = getPhaseForStep(index)
            const showPhaseLabel = isFirstInPhase(index) && phase

            return (
              <div
                key={index}
                className="d-flex flex-column align-items-center position-relative"
                style={{ zIndex: 2, flex: '1 1 0', minWidth: 0 }}
              >
                {/* Step circle */}
                <div
                  className={`
                    d-flex align-items-center justify-content-center rounded-circle
                    ${isCompleted ? 'bg-primary text-white' : ''}
                    ${isCurrent ? 'bg-primary text-white shadow-sm' : ''}
                    ${isPending ? 'bg-light text-muted border' : ''}
                  `}
                  style={{
                    width: 36,
                    height: 36,
                    transition: 'all 0.3s ease',
                    fontSize: '0.8rem',
                  }}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <IconifyIcon icon="mingcute:check-line" className="fs-6" />
                  ) : (
                    <span className="fw-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step label (2-line wrapping) */}
                <small
                  className={`mt-1 text-center ${isCurrent ? 'fw-semibold text-primary' : 'text-muted'}`}
                  style={{
                    maxWidth: 80,
                    fontSize: '0.68rem',
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {step.title}
                </small>

                {/* Phase group underline segment */}
                {phase && (
                  <div
                    className={`mt-1 ${
                      phase.steps.includes(currentStep) ? 'bg-primary' : 'bg-light'
                    }`}
                    style={{
                      height: 3,
                      width: '100%',
                      borderRadius: showPhaseLabel ? '3px 0 0 3px' : isLastInPhase(index) ? '0 3px 3px 0' : 0,
                      transition: 'background-color 0.3s ease',
                    }}
                  />
                )}

                {/* Phase label (show on first step of phase) */}
                {showPhaseLabel && (
                  <small
                    className="text-muted text-center position-absolute"
                    style={{
                      fontSize: '0.6rem',
                      top: 80,
                      whiteSpace: 'nowrap',
                      left: '50%',
                      transform: 'translateX(-25%)',
                    }}
                  >
                    {t(phase.labelKey)}
                  </small>
                )}
              </div>
            )
          })}
        </div>

        {/* Extra spacing when phase labels are shown */}
        {phaseGroups && <div style={{ height: 16 }} />}
      </div>
    </div>
  )
}

export default WizardProgress

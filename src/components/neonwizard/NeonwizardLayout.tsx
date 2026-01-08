import { ReactNode } from 'react'

/**
 * NeonwizardLayout - 1:1 port from neonwizard-react_v2/react-package/pages/index.js
 * 
 * Two-column layout:
 * - Left: Image holder with step indicators
 * - Right: Form content area
 * 
 * NO jQuery | NO Font Awesome | NO new fonts
 * Step navigation logic deferred to later phase
 */

interface NeonwizardLayoutProps {
  children: ReactNode
  currentStep?: number
}

const NeonwizardLayout = ({ children, currentStep = 1 }: NeonwizardLayoutProps) => {
  // Generate step indicator classes based on current step
  const getStepClass = (stepNumber: number) => {
    const classes = ['multisteps-form__progress-btn']
    
    if (stepNumber < currentStep) {
      classes.push('js-active')
    }
    if (stepNumber === currentStep) {
      classes.push('js-active', 'current')
    }
    if (stepNumber === 5) {
      classes.push('last')
    }
    
    return classes.join(' ')
  }

  return (
    <div className="wrapper">
      {/* Left panel: Image + Step indicators */}
      <div className="steps-area steps-area-fixed">
        <div className="image-holder">
          <img src="/assets/neonwizard/img/side-img.jpg" alt="" />
        </div>
        <div className="steps clearfix">
          <ul className="tablist multisteps-form__progress">
            <li className={getStepClass(1)}>
              <span>1</span>
            </li>
            <li className={getStepClass(2)}>
              <span>2</span>
            </li>
            <li className={getStepClass(3)}>
              <span>3</span>
            </li>
            <li className={getStepClass(4)}>
              <span>4</span>
            </li>
            <li className={getStepClass(5)}>
              <span>5</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right panel: Form area */}
      <form className="multisteps-form__form" action="#" id="wizard" method="POST">
        <div className="form-area position-relative">
          {children}
        </div>
      </form>
    </div>
  )
}

export default NeonwizardLayout

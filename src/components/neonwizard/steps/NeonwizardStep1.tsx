import IconifyIcon from '@/components/wrapper/IconifyIcon'

/**
 * NeonwizardStep1 - 1:1 port from neonwizard-react_v2/react-package/components/v1/step/step-1.js
 * 
 * Step 1: Service selection (3 options)
 * 
 * Changes from original:
 * - Font Awesome icons replaced with Iconify
 * - Class component converted to functional component (TypeScript)
 * - All class names, structure, and content preserved 1:1
 * 
 * NO jQuery | NO Font Awesome | NO navigation logic (deferred)
 */

const NeonwizardStep1 = () => {
  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      {/* div 1 */}
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no">Step 1</span>
              <h2>What kind of Services You need?</h2>
              <p>
                Tation argumentum et usu, dicit viderer evertitur te has. Eu dictas
                concludaturque usu, facete detracto patrioque an per, lucilius
                pertinacia eu vel.
              </p>
              <div className="step-box">
                <div className="row">
                  <div className="col-md-4">
                    <label className="step-box-content bg-white text-center relative-position active">
                      <span className="step-box-icon">
                        <img src="/assets/neonwizard/img/d1.png" alt="" />
                      </span>
                      <span className="step-box-text">Corporate Services</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_name"
                            defaultValue="Corporate Services"
                            defaultChecked
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="step-box-content bg-white text-center relative-position">
                      <span className="step-box-icon">
                        <img src="/assets/neonwizard/img/d2.png" alt="" />
                      </span>
                      <span className="step-box-text">Freelancing Services</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_name"
                            defaultValue="Freelancing Services"
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label className="step-box-content bg-white text-center relative-position">
                      <span className="step-box-icon">
                        <img src="/assets/neonwizard/img/d3.png" alt="" />
                      </span>
                      <span className="step-box-text">Development</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_name"
                            defaultValue="Development Services"
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /.inner */}
        <div className="actions">
          <ul>
            <li className="disable" aria-disabled="true">
              <span className="js-btn-next" title="NEXT">
                Backward <IconifyIcon icon="mingcute:arrow-right-line" />
              </span>
            </li>
            <li>
              <span className="js-btn-next" title="NEXT">
                NEXT <IconifyIcon icon="mingcute:arrow-right-line" />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NeonwizardStep1

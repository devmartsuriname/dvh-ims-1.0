import IconifyIcon from '@/components/wrapper/IconifyIcon'

/**
 * NeonwizardStep4 - 1:1 port from neonwizard-react_v2/react-package/components/v1/step/step-4.js
 * 
 * Step 4: Budget + support + optimization options
 * 
 * Changes from original:
 * - Font Awesome icons replaced with Iconify
 * - Class component converted to functional component (TypeScript)
 * - All class names, structure, and content preserved 1:1
 * 
 * NO jQuery | NO Font Awesome | NO navigation logic (deferred)
 */

const NeonwizardStep4 = () => {
  return (
    <div className="multisteps-form__panel" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 4</span>
              <div className="step-progress float-right">
                <span>4 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
              <h2>What kind of services You Need</h2>
              <p>
                Tation argumentum et usu, dicit viderer evertitur te has. Eu dictas
                concludaturque usu, facete detracto patrioque an per, lucilius
                pertinacia eu vel.
              </p>
              <div className="step-content-area">
                <div className="budget-area">
                  <p>
                    <IconifyIcon icon="mingcute:currency-dollar-line" /> Budget
                  </p>
                  <select name="budget">
                    <option>$390 - $600</option>
                    <option>$390 - $600</option>
                    <option>$390 - $600</option>
                    <option>$390 - $600</option>
                    <option>$390 - $600</option>
                  </select>
                </div>
                <div className="budget-area">
                  <p>
                    <IconifyIcon icon="mingcute:comment-line" /> Required Support
                  </p>
                  <select name="support_period">
                    <option>2 to 6 month</option>
                    <option>2 to 6 month</option>
                    <option>2 to 6 month</option>
                    <option>2 to 6 month</option>
                    <option>2 to 6 month</option>
                  </select>
                </div>
                <div className="budget-area">
                  <p>Optimization and Accessibility</p>
                  <div className="opti-list">
                    <ul className="d-md-flex">
                      <li className="bg-white active">
                        <input
                          type="checkbox"
                          name="code_opti1"
                          value="Semantic coding"
                          defaultChecked
                        />
                        Semantic coding
                      </li>
                      <li className="bg-white">
                        <input type="checkbox" name="code_opti2" value="Mobile APP" />
                        Mobile APP
                      </li>
                      <li className="bg-white">
                        <input
                          type="checkbox"
                          name="code_opti3"
                          value="Mobile Design"
                        />
                        Mobile Design
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="comment-box">
                  <p>
                    <IconifyIcon icon="mingcute:comment-line" /> Write Somthing note
                  </p>
                  <textarea
                    name="comments-note"
                    placeholder="Your Content Here"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <ul>
            <li>
              <span className="js-btn-prev" title="BACK">
                <IconifyIcon icon="mingcute:arrow-left-line" /> BACK{' '}
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

export default NeonwizardStep4

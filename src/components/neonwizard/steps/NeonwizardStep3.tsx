import IconifyIcon from '@/components/wrapper/IconifyIcon'

/**
 * NeonwizardStep3 - 1:1 port from neonwizard-react_v2/react-package/components/v1/step/step-3.js
 * 
 * Step 3: Service selection + language + comments
 * 
 * Changes from original:
 * - Font Awesome icons replaced with Iconify
 * - Class component converted to functional component (TypeScript)
 * - All class names, structure, and content preserved 1:1
 * 
 * NO jQuery | NO Font Awesome | NO navigation logic (deferred)
 */

const NeonwizardStep3 = () => {
  return (
    <div className="multisteps-form__panel" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 3</span>
              <div className="step-progress float-right">
                <span>3 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
              <h2>What kind of services You Need</h2>
              <p>
                Tation argumentum et usu, dicit viderer evertitur te has. Eu dictas
                concludaturque usu, facete detracto patrioque an per, lucilius
                pertinacia eu vel.
              </p>
              <div className="services-select-option">
                <ul>
                  <li className="bg-white active">
                    <label>
                      Web Design{' '}
                      <input
                        type="radio"
                        name="web_service"
                        value="Web Design"
                        defaultChecked
                      />
                    </label>
                  </li>
                  <li className="bg-white">
                    <label>
                      Web Development{' '}
                      <input type="radio" name="web_service" value="Web Development" />
                    </label>
                  </li>
                  <li className="bg-white">
                    <label>
                      Graphics Design{' '}
                      <input type="radio" name="web_service" value="Graphics Design" />
                    </label>
                  </li>
                  <li className="bg-white">
                    <label>
                      SEO <input type="radio" name="web_service" value="SEO" />
                    </label>
                  </li>
                </ul>
              </div>
              <div className="language-select">
                <p>I want to browse projects in the following languages: </p>
                <select name="languages">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div className="comment-box">
                <p>
                  <IconifyIcon icon="mingcute:comment-line" /> Write Somthing note
                </p>
                <textarea name="full_comments" placeholder="Write here"></textarea>
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

export default NeonwizardStep3

import IconifyIcon from '@/components/wrapper/IconifyIcon'

/**
 * NeonwizardStep2 - 1:1 port from neonwizard-react_v2/react-package/components/v1/step/step-2.js
 * 
 * Step 2: Personal information + document upload
 * 
 * Changes from original:
 * - Font Awesome icons replaced with Iconify
 * - Class component converted to functional component (TypeScript)
 * - All class names, structure, and content preserved 1:1
 * 
 * NO jQuery | NO Font Awesome | NO navigation logic (deferred)
 */

const NeonwizardStep2 = () => {
  return (
    <div className="multisteps-form__panel" data-animation="slideHorz">
      {/* div 2 */}
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 2</span>
              <div className="step-progress float-right">
                <span>2 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar"></div>
                  </div>
                </div>
              </div>

              <h2>What kind of services you are quiz?</h2>
              <p>
                Tation argumentum et usu, dicit viderer evertitur te has. Eu dictas
                concludaturque usu, facete detracto patrioque an per, lucilius
                pertinacia eu vel.
              </p>

              <div className="form-inner-area">
                <input
                  type="text"
                  name="full_name"
                  className="form-control required"
                  minLength={2}
                  placeholder="First and last name *"
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="form-control required"
                  placeholder="Email Address *"
                  required
                />
                <input type="text" name="phone" placeholder="Phone" />
              </div>
              <div className="gender-selection">
                <h3>Gender:</h3>
                <label>
                  <input type="radio" name="gender" value="Male" />
                  <span className="checkmark"></span>Male
                </label>
                <label>
                  <input type="radio" name="gender" value="Female" />
                  <span className="checkmark"></span>Female
                </label>
              </div>
              <div className="upload-documents">
                <h3>Upload Documents:</h3>
                <div className="upload-araa bg-white">
                  <input type="hidden" value="" name="fileContent" id="fileContent" />
                  <input type="hidden" value="" name="filename" id="filename" />
                  <div className="upload-icon float-left">
                    <IconifyIcon icon="mingcute:cloud-upload-line" />
                  </div>
                  <div className="upload-text">
                    <span>
                      ( File accepted: pdf. doc/ docx - Max file size : 150kb for demo
                      limit )
                    </span>
                  </div>
                  <div className="upload-option text-center">
                    <label htmlFor="attach">Upload The Documents</label>
                    <input id="attach" style={{ display: 'none' }} type="file" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /.inner */}
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

export default NeonwizardStep2

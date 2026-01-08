/**
 * Status Result Component
 * Phase 9B-3: Neonwizard visual language restyle
 * NO logic changes - visual only
 */

import IconifyIcon from '@/components/wrapper/IconifyIcon'
import StatusTimeline from './StatusTimeline'
import { STATUS_CONFIG } from '../constants'
import type { StatusLookupResponse } from '../types'

interface StatusResultProps {
  result: StatusLookupResponse
  onReset: () => void
}

const StatusResult = ({ result, onReset }: StatusResultProps) => {
  const statusConfig = STATUS_CONFIG[result.current_status] || STATUS_CONFIG.submitted
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getApplicationTypeLabel = (): string => {
    return result.application_type === 'bouwsubsidie' 
      ? 'Building Subsidy (Bouwsubsidie)'
      : 'Housing Registration'
  }

  return (
    <div className="status-result">
      {/* Success Header */}
      <div className="result-success-card">
        <div className="success-icon-wrapper">
          <IconifyIcon 
            icon="mingcute:check-circle-line" 
            className="success-icon"
          />
        </div>
        <div className="success-content">
          <h3>Application Found</h3>
          <p>Here is the current status of your application</p>
        </div>
      </div>

      {/* Application Details Card */}
      <div className="result-details-card">
        <h4 className="card-title">
          <IconifyIcon icon="mingcute:document-line" className="title-icon" />
          Application Details
        </h4>
        
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Application Type</span>
            <span className="detail-value">{getApplicationTypeLabel()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reference Number</span>
            <span className="detail-value monospace">{result.reference_number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Applicant Name</span>
            <span className="detail-value">{result.applicant_name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Submitted On</span>
            <span className="detail-value">{formatDate(result.submitted_at)}</span>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="current-status-box">
          <div className="status-info">
            <span className="status-label-text">Current Status</span>
            <span className={`status-badge status-${statusConfig.variant}`}>
              <IconifyIcon icon={statusConfig.icon} />
              {result.current_status_label}
            </span>
          </div>
          <IconifyIcon 
            icon={statusConfig.icon} 
            className={`status-icon-large status-${statusConfig.variant}`}
          />
        </div>
      </div>

      {/* Status History Timeline */}
      <div className="result-timeline-card">
        <h4 className="card-title">
          <IconifyIcon icon="mingcute:time-line" className="title-icon" />
          Status History
        </h4>
        
        <StatusTimeline history={result.status_history} />
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button 
          onClick={onReset}
          className="reset-btn"
        >
          <IconifyIcon icon="mingcute:refresh-2-line" />
          <span>Check Another Application</span>
        </button>
      </div>
    </div>
  )
}

export default StatusResult
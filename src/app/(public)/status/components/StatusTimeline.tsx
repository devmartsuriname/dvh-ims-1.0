/**
 * Status Timeline Component
 * Phase 9B-3: Neonwizard visual language restyle
 * NO logic changes - visual only
 */

import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { STATUS_CONFIG } from '../constants'
import type { StatusHistoryEntry } from '../types'

interface StatusTimelineProps {
  history: StatusHistoryEntry[]
}

const StatusTimeline = ({ history }: StatusTimelineProps) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Reverse to show most recent first
  const sortedHistory = [...history].reverse()

  return (
    <div className="timeline">
      {sortedHistory.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.submitted
        const isLast = index === sortedHistory.length - 1
        
        return (
          <div key={index} className="timeline-item">
            {/* Timeline connector */}
            <div className="timeline-marker">
              <span className={`marker-icon marker-${config.variant}`}>
                <IconifyIcon icon={config.icon} />
              </span>
              {!isLast && <div className="timeline-line" />}
            </div>
            
            {/* Content */}
            <div className="timeline-content">
              <div className="timeline-header">
                <span className={`timeline-badge badge-${config.variant}`}>
                  {entry.status_label}
                </span>
                <span className="timeline-date">
                  {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                </span>
              </div>
              <p className="timeline-description">
                {entry.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatusTimeline
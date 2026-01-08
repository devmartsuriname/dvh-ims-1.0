/**
 * Status Timeline Component
 * Phase 5 - Checkpoint 6
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
    <div className="position-relative">
      {sortedHistory.map((entry, index) => {
        const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.submitted
        const isLast = index === sortedHistory.length - 1
        
        return (
          <div key={index} className="d-flex gap-3 pb-3">
            {/* Timeline connector */}
            <div className="d-flex flex-column align-items-center" style={{ width: 40 }}>
              <span 
                className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${config.variant} bg-opacity-10 flex-shrink-0`}
                style={{ width: 40, height: 40 }}
              >
                <IconifyIcon 
                  icon={config.icon} 
                  className={`text-${config.variant}`}
                  style={{ fontSize: '1.25rem' }}
                />
              </span>
              {!isLast && (
                <div 
                  className="bg-secondary bg-opacity-25 flex-grow-1" 
                  style={{ width: 2, minHeight: 24 }}
                />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-grow-1 pb-2">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <span className={`badge bg-${config.variant}`}>
                  {entry.status_label}
                </span>
                <small className="text-muted">
                  {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                </small>
              </div>
              <p className="mb-0 text-muted small">
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

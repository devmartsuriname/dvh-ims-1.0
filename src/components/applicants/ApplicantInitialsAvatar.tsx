/**
 * ApplicantInitialsAvatar — List-row-only initials avatar for applicant names.
 * Scope: Housing Registrations list, Subsidy Cases list, Recent Cases/Registrations widget.
 * NOT for global user/admin/header avatars.
 */

const AVATAR_COLORS = [
  'bg-primary',
  'bg-success',
  'bg-info',
  'bg-warning',
  'bg-danger',
  'bg-secondary',
  'bg-dark',
  'bg-purple',
] as const

function stableHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.trim()
  const l = lastName?.trim()
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase()
  const single = f || l || ''
  if (single.length >= 2) return single.substring(0, 2).toUpperCase()
  if (single.length === 1) return single[0].toUpperCase()
  return '?'
}

function getColorClass(firstName?: string, lastName?: string): string {
  const key = `${firstName || ''}${lastName || ''}`.toLowerCase() || 'unknown'
  return AVATAR_COLORS[stableHash(key) % AVATAR_COLORS.length]
}

interface ApplicantInitialsAvatarProps {
  firstName?: string
  lastName?: string
  size?: 'xs' | 'sm'
}

const ApplicantInitialsAvatar = ({ firstName, lastName, size = 'xs' }: ApplicantInitialsAvatarProps) => {
  const initials = getInitials(firstName, lastName)
  const colorClass = getColorClass(firstName, lastName)
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown'
  const sizeClass = size === 'xs' ? 'avatar-xs' : 'avatar-sm'

  return (
    <span
      className={`${sizeClass} rounded-circle avatar-title ${colorClass} d-inline-flex`}
      style={{
        fontSize: size === 'xs' ? '0.65rem' : '0.75rem',
        fontWeight: 600,
        width: size === 'xs' ? '1.5rem' : '2.25rem',
        height: size === 'xs' ? '1.5rem' : '2.25rem',
        minWidth: size === 'xs' ? '1.5rem' : '2.25rem',
        minHeight: size === 'xs' ? '1.5rem' : '2.25rem',
        lineHeight: 1,
      }}
      aria-label={`Applicant: ${fullName} (${initials})`}
      title={fullName}
    >
      {initials}
    </span>
  )
}

// Utility for Grid.js html() formatter — same logic, returns HTML string
export function renderApplicantAvatarHtml(firstName?: string, lastName?: string): string {
  const initials = getInitials(firstName, lastName)
  const colorClass = getColorClass(firstName, lastName)
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Unknown'

  return `<div style="display:flex;align-items:center"><span class="avatar-xs rounded-circle avatar-title ${colorClass} d-inline-flex" style="font-size:0.65rem;font-weight:600;width:1.5rem;height:1.5rem;min-width:1.5rem;min-height:1.5rem;line-height:1" aria-label="Applicant: ${fullName} (${initials})" title="${fullName}">${initials}</span><span class="ms-1">${fullName !== 'Unknown' ? fullName : '-'}</span></div>`
}

export default ApplicantInitialsAvatar

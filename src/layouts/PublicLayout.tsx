import { ChildrenType } from '@/types/component-props'

/**
 * PublicLayout - Light theme wrapper for citizen-facing pages
 * 
 * CRITICAL: Light theme is applied ONLY to this wrapper div via data-bs-theme="light"
 * NEVER set theme on html/body/root elements to prevent admin theme pollution
 */
const PublicLayout = ({ children }: ChildrenType) => {
  return (
    <div data-bs-theme="light" className="public-wrapper min-vh-100 bg-white">
      {children}
    </div>
  )
}

export default PublicLayout

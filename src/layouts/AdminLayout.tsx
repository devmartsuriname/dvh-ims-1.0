import AnimationStar from '@/components/AnimationStar'
import ErrorBoundary from '@/components/ErrorBoundary'
import Footer from '@/components/layout/Footer'
import { ChildrenType } from '@/types/component-props'
import { lazy, Suspense } from 'react'
import { Container } from 'react-bootstrap'

// Lazy-load nav components (they will be handled by router-level Suspense)
const TopNavigationBar = lazy(() => import('@/components/layout/TopNavigationBar/page'))
const VerticalNavigationBar = lazy(() => import('@/components/layout/VerticalNavigationBar/page'))

/**
 * AdminLayout - Single Suspense boundary for all lazy-loaded children.
 * Route-level Suspense in router.tsx handles initial load spinner.
 * Layout does NOT add additional Suspense spinners to prevent double-spinner issue.
 */
const AdminLayout = ({ children }: ChildrenType) => {
  return (
    <div className="wrapper">
      {/* Nav components render without individual Suspense - router handles fallback */}
      <TopNavigationBar />
      <VerticalNavigationBar />
      <AnimationStar />
      <div className="page-content">
        <Container fluid>
          <ErrorBoundary>
            {/* Children render directly - no nested Suspense spinner */}
            {children}
          </ErrorBoundary>
        </Container>
        <Footer />
      </div>
    </div>
  )
}

export default AdminLayout

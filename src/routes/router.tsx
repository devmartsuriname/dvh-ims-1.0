import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import { Suspense } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import AuthLayout from '@/layouts/AuthLayout'
import PublicLayout from '@/layouts/PublicLayout'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingFallback from '@/components/LoadingFallback'
import { appRoutes, authRoutes, publicRoutes } from '@/routes/index'
import { useAuthContext } from '@/context/useAuthContext'
import Error404Page from '@/app/(other)/error-pages/pages-404/page'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated } = useAuthContext()
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes - Citizen-facing, Light Theme, No Auth */}
          {(publicRoutes || []).map((route, idx) => (
            <Route
              key={idx + route.name}
              path={route.path}
              element={<PublicLayout>{route.element}</PublicLayout>}
            />
          ))}

          {/* Auth Routes - Sign in/up, No Layout wrapper */}
          {(authRoutes || []).map((route, idx) => (
            <Route key={idx + route.name} path={route.path} element={<AuthLayout {...props}>{route.element}</AuthLayout>} />
          ))}

          {/* Admin Routes - Staff-facing, Dark Theme, Auth Required */}
          {(appRoutes || []).map((route, idx) => (
            <Route
              key={idx + route.name}
              path={route.path}
              element={
                isAuthenticated ? (
                  <AdminLayout {...props}>{route.element}</AdminLayout>
                ) : (
                  <Navigate
                    to={{
                      pathname: '/auth/sign-in',
                      search: 'redirectTo=' + route.path,
                    }}
                  />
                )
              }
            />
          ))}

          {/* Catch-all: Force 404 for any unregistered path */}
          <Route 
            path="*" 
            element={
              <AuthLayout>
                <Error404Page />
              </AuthLayout>
            } 
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default AppRouter

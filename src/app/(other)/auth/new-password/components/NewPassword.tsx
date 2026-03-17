import logoSozavo from '@/assets/images/logo-sozavo.png'
import * as yup from 'yup'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

const NewPassword = () => {
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [hashError, setHashError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.body.classList.add('authentication-bg')
    return () => {
      document.body.classList.remove('authentication-bg')
    }
  }, [])

  // Parse hash for errors and listen for PASSWORD_RECOVERY event
  useEffect(() => {
    // Check for error in URL hash (e.g. expired OTP link)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      setHashError(errorDescription || 'The reset link is invalid or has expired.')
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      }
    })

    // Timeout fallback after 8 seconds
    const timeout = setTimeout(() => {
      setHashError('The reset link appears to be invalid or has expired. Please request a new one.')
    }, 8000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const schema = yup.object({
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .required('Please enter a new password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  })

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!sessionReady) {
      toast.error('Session not ready. Please use the link from your email.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated successfully!')
        // Sign out and redirect to sign-in
        await supabase.auth.signOut()
        navigate('/auth/sign-in')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="">
      <div className="account-pages py-5">
        <div className="container">
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="border-0 shadow-lg">
                <CardBody className="p-5">
                  <div className="text-center">
                    <div className="mx-auto mb-4 text-center auth-logo">
                      <Link to="/dashboards" className="d-inline-block">
                        <img src={logoSozavo} style={{ height: '56px', width: 'auto' }} alt="VolksHuisvesting" />
                      </Link>
                    </div>
                    <h4 className="fw-bold text-dark mb-2">Set New Password</h4>
                    <p className="text-muted">
                      {hashError
                        ? 'There was a problem with your reset link.'
                        : sessionReady
                          ? 'Enter your new password below.'
                          : 'Verifying your reset link...'}
                    </p>
                  </div>
                  {sessionReady && (
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                      <div className="mb-3">
                        <TextFormInput
                          control={control}
                          name="password"
                          placeholder="Enter new password"
                          className="bg-light bg-opacity-50 border-light py-2"
                          label="New Password"
                          type="password"
                        />
                      </div>
                      <div className="mb-3">
                        <TextFormInput
                          control={control}
                          name="confirmPassword"
                          placeholder="Confirm new password"
                          className="bg-light bg-opacity-50 border-light py-2"
                          label="Confirm Password"
                          type="password"
                        />
                      </div>
                      <div className="d-grid">
                        <button className="btn btn-dark btn-lg fw-medium" type="submit" disabled={loading}>
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  )}
                  {hashError && (
                    <div className="text-center mt-4">
                      <div className="alert alert-danger" role="alert">
                        {hashError}
                      </div>
                      <Link to="/auth/reset-password" className="btn btn-dark btn-lg fw-medium w-100 mt-3">
                        Request New Reset Link
                      </Link>
                    </div>
                  )}
                  {!sessionReady && !hashError && (
                    <div className="text-center mt-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
              <p className="text-center mt-4 text-white text-opacity-50">
                Back to&nbsp;
                <Link to="/auth/sign-in" className="text-decoration-none text-white fw-bold">
                  Sign In
                </Link>
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default NewPassword

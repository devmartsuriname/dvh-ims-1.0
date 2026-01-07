import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoSozavo from '@/assets/images/logo-sozavo.png'
import TextFormInput from '@/components/from/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useNotificationContext } from '@/context/useNotificationContext'

const SignUp = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotificationContext()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.body.classList.add('authentication-bg')
    return () => {
      document.body.classList.remove('authentication-bg')
    }
  }, [])

  const messageSchema = yup.object({
    name: yup.string().required('Please enter Name'),
    email: yup.string().email().required('Please enter Email'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Please enter password'),
  })

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: values.name,
          },
        },
      })

      if (error) {
        showNotification({ message: error.message, variant: 'danger' })
        return
      }

      showNotification({ 
        message: 'Account created successfully! Please check your email to confirm your account.', 
        variant: 'success' 
      })
      navigate('/auth/sign-in')
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred'
      showNotification({ message: errorMessage, variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return (
    <>
      <div className="">
        <div className="account-pages py-5">
          <div className="container">
            <Row className=" justify-content-center">
              <Col md={6} lg={5}>
                <Card className=" border-0 shadow-lg">
                  <CardBody className=" p-5">
                    <div className="text-center">
                      <div className="mx-auto mb-4 text-center auth-logo">
                        <Link to="/dashboards">
                          <img src={logoSozavo} height={48} alt="VolksHuisvesting" />
                        </Link>
                      </div>
                      <h4 className="fw-bold text-dark mb-2">Sign Up</h4>
                      <p className="text-muted">New to our platform? Sign up now! It only takes a minute.</p>
                    </div>
                    <form onSubmit={onSubmit} className="mt-4">
                      <div className="mb-3">
                        <TextFormInput control={control} name="name" placeholder="Enter your Name" className="form-control" label="Name" />
                      </div>
                      <div className="mb-3">
                        <TextFormInput control={control} name="email" placeholder="Enter your email" className="form-control" label="Email" />
                      </div>
                      <div className="mb-3">
                        <TextFormInput
                          control={control}
                          name="password"
                          placeholder="Enter your password"
                          className="form-control"
                          label="Password"
                          type="password"
                        />
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="checkbox-signin" />
                          <label className="form-check-label" htmlFor="checkbox-signin">
                            I accept Terms and Condition
                          </label>
                        </div>
                      </div>
                      <div className="mb-1 text-center d-grid">
                        <button className="btn btn-dark btn-lg fw-medium" type="submit" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                      </div>
                    </form>
                  </CardBody>
                </Card>
                <p className="text-center mt-4 text-white text-opacity-50">
                  I already have an account&nbsp;
                  <Link to="/auth/sign-in" className="text-decoration-none text-white fw-bold">
                    Sign In
                  </Link>
                </p>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUp

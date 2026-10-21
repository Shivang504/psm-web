import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/organisms/AuthLayout'
import {
  LoginForm,
  type LoginFormValues,
} from '../components/organisms/LoginForm'
import { sagaActions } from '../store/actions'
import { useAppDispatch } from '../store/hooks'
import { setPendingMobile } from '../utils/auth'
import type { SendOtpRequest } from '../utils/types'

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = (
    values: LoginFormValues,
    { setLoading }: { setLoading: (loading: boolean) => void },
  ) => {
    const mobile = values.mobile
    const variables: SendOtpRequest = {
      mobile_no: mobile,
    }

    dispatch({
      type: sagaActions.SEND_OTP,
      payload: {
        query: '/auth/sendOtp',
        method: 'PUT',
        variables,
        isPublic: true,
        showToast: true,
        successMessage: 'OTP sent successfully',
        setLoading,
        onSuccess: () => {
          setPendingMobile(mobile)
          navigate('/verify-otp', { state: { mobile } })
        },
      },
    })
  }

  return (
    <AuthLayout variant="login">
      <div className="mx-auto w-full min-w-0 max-w-[420px]">
        <p className="text-sm font-semibold text-primary">Sign in</p>
        <h1 className="mt-2 text-[34px] leading-tight font-semibold tracking-tight text-text-strong">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Enter your mobile number. We will send a one-time code to continue.
        </p>
        <div className="mt-8">
          <LoginForm onSubmit={handleSubmit} />
        </div>
      </div>
    </AuthLayout>
  )
}

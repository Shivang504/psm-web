import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/organisms/AuthLayout'
import {
  LoginForm,
  type LoginFormValues,
} from '@/components/organisms/LoginForm'
import { sagaActions } from '@/store/actions'
import { useAppDispatch } from '@/store/hooks'
import { setPendingMobile } from '@/utils/auth'
import type { SendOtpRequest } from '@/utils/types'

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
        <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-[rgba(79,70,229,0.12)] px-2.5 py-1 text-xs font-semibold text-[#4F46E5]">
          Sign in
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#1E1B4B]">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-[#4C4A7A]">
          Enter your registered mobile number to receive a one-time login code.
        </p>
        <div className="mt-6">
          <LoginForm onSubmit={handleSubmit} />
        </div>
      </div>
    </AuthLayout>
  )
}

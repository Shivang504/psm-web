import toast from 'react-hot-toast'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/organisms/AuthLayout'
import {
  VerifyOtpForm,
  type VerifyOtpFormValues,
} from '../../components/organisms/VerifyOtpForm'
import { sagaActions } from '../../store/actions'
import { useAppDispatch } from '../../store/hooks'
import { loginSuccess } from '../../store/slices/authSlice'
import {
  clearPendingMobile,
  getPendingMobile,
  setAuthSession,
} from '../../utils/auth'
import type {
  LoginRequest,
  LoginResponse,
  SendOtpRequest,
} from '../../utils/types'

function readRouteMobile(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('mobile' in state)) {
    return ''
  }

  return typeof state.mobile === 'string' ? state.mobile : ''
}

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const mobile = readRouteMobile(location.state) || getPendingMobile() || ''

  if (!mobile) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = (
    values: VerifyOtpFormValues,
    { setLoading }: { setLoading: (loading: boolean) => void },
  ) => {
    const variables: LoginRequest = {
      username: mobile,
      otp: values.otp,
      config: {
        source: 'web',
      },
    }

    dispatch({
      type: sagaActions.LOGIN,
      payload: {
        query: '/auth/login',
        method: 'POST',
        variables,
        isPublic: true,
        showToast: true,
        successMessage: 'Logged in successfully',
        setLoading,
        onSuccess: (response: LoginResponse) => {
          const accessToken = response.data?.accessToken
          const refreshToken = response.data?.refreshToken

          if (!accessToken || !refreshToken) {
            toast.error('Login did not return a session. Please try again.')
            return false
          }

          setAuthSession({ accessToken, refreshToken, mobile })
          clearPendingMobile()
          dispatch(
            loginSuccess({
              accessToken,
              refreshToken,
              mobile,
            }),
          )
          dispatch({ type: sagaActions.GET_PROFILE })
          navigate('/home', { replace: true })
        },
      },
    })
  }

  const handleResend = ({
    setLoading,
    onSuccess,
  }: {
    setLoading: (loading: boolean) => void
    onSuccess: () => void
  }) => {
    const variables: SendOtpRequest = {
      mobile_no: mobile,
    }

    dispatch({
      type: sagaActions.RESEND_OTP,
      payload: {
        query: '/auth/sendOtp',
        method: 'POST',
        variables,
        isPublic: true,
        showToast: true,
        successMessage: 'OTP sent successfully',
        setLoading,
        onSuccess,
      },
    })
  }

  return (
    <AuthLayout variant="otp">
      <div className="mx-auto w-full min-w-0 max-w-[420px]">
        <VerifyOtpForm
          mobile={mobile}
          onSubmit={handleSubmit}
          onResend={handleResend}
        />
      </div>
    </AuthLayout>
  )
}

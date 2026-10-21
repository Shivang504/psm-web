import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FormProvider } from 'react-hook-form'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import useFormHandler from '../../../hooks/useFormHandler'
import { validationSchema } from '../../../utils/validationSchema'
import { Button } from '../../atoms/Button'
import { OtpField } from '../../atoms/OtpField'

const RESEND_SECONDS = 45

const verifyOtpSchema = yup.object({
  otp: validationSchema.otp.matches(/^\d{6}$/, 'Enter the 6-digit code'),
})

export type VerifyOtpFormValues = yup.InferType<typeof verifyOtpSchema>

type LoadingHelpers = {
  setLoading: (loading: boolean) => void
}

type ResendHelpers = LoadingHelpers & {
  onSuccess: () => void
}

type VerifyOtpFormProps = {
  mobile?: string
  onSubmit: (values: VerifyOtpFormValues, helpers: LoadingHelpers) => void
  onResend: (helpers: ResendHelpers) => void
}

export function VerifyOtpForm({
  mobile,
  onSubmit,
  onResend,
}: VerifyOtpFormProps) {
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const inFlightRef = useRef(false)
  const methods = useFormHandler<VerifyOtpFormValues>({
    schema: verifyOtpSchema,
    defaultValues: {
      otp: '',
    },
  })

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [secondsLeft])

  const resetOtpEntry = () => {
    methods.setValue('otp', '')
    methods.clearErrors('otp')
    setSecondsLeft(RESEND_SECONDS)
    document.getElementById('otp-0')?.focus()
  }

  const handleValidSubmit = (values: VerifyOtpFormValues) => {
    setLoading(true)
    onSubmit(values, {
      setLoading: (value) => {
        inFlightRef.current = value
        setLoading(value)
      },
    })
  }

  const releaseIfInvalid = () => {
    inFlightRef.current = false
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (inFlightRef.current) return

    inFlightRef.current = true
    void methods.handleSubmit(handleValidSubmit, releaseIfInvalid)(event)
  }

  const handleComplete = (otp: string) => {
    if (inFlightRef.current) return

    inFlightRef.current = true
    methods.setValue('otp', otp, { shouldValidate: true, shouldDirty: true })
    void methods.handleSubmit(handleValidSubmit, releaseIfInvalid)()
  }

  const handleResend = () => {
    if (secondsLeft > 0 || inFlightRef.current) return

    inFlightRef.current = true
    setResending(true)
    onResend({
      setLoading: (value) => {
        inFlightRef.current = value
        setResending(value)
      },
      onSuccess: resetOtpEntry,
    })
  }

  const countdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit} noValidate>
        <p className="text-sm font-semibold text-primary">Verification</p>
        <h1 className="mt-2 text-[34px] leading-tight font-semibold tracking-tight text-text-strong">
          Check your phone
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-text-emphasis">
            {mobile || 'your mobile number'}
          </span>
          .
        </p>

        <div className="mt-8">
          <OtpField
            name="otp"
            disabled={loading || resending}
            onComplete={handleComplete}
          />
        </div>

        <p className="mt-4 text-sm text-text-muted">
          Didn’t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || loading || resending}
            className="font-semibold text-primary transition hover:text-primary-hover disabled:cursor-default disabled:text-text-faint"
          >
            {resending ? 'Sending code' : 'Resend code'}
          </button>
          {secondsLeft > 0 ? <span> in {countdown}</span> : null}
        </p>

        <Button
          type="submit"
          loading={loading}
          disabled={resending}
          className="mt-6"
        >
          {loading ? 'Verifying' : 'Verify and continue'}
          {loading ? null : <ArrowRight className="size-4" />}
        </Button>

        <Link
          to="/login"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </form>
    </FormProvider>
  )
}

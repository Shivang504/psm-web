import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FormProvider } from 'react-hook-form'
import { Link } from 'react-router-dom'
import * as yup from 'yup'
import useFormHandler from '@/hooks/useFormHandler'
import { validationSchema } from '@/utils/validationSchema'
import { Button } from '@/components/atoms/Button'
import { OtpField } from '@/components/atoms/OtpField'

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
        <h1 className="text-center text-[28px] font-bold tracking-tight text-[#1E1B4B]">
          Check your phone
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#4C4A7A]">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-[#1E1B4B]">
            {mobile ? `+91 ${mobile}` : 'your mobile number'}
          </span>
          .
        </p>

        <div className="mt-7">
          <OtpField
            name="otp"
            disabled={loading || resending}
            onComplete={handleComplete}
          />
        </div>

        <p className="mt-4 text-center text-xs text-[#4C4A7A] sm:text-sm">
          Didn’t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || loading || resending}
            className="font-semibold text-[#4F46E5] transition hover:text-[#4338CA] disabled:cursor-default disabled:text-[#4C4A7A]/50"
          >
            {resending ? 'Sending code...' : 'Resend code'}
          </button>
          {secondsLeft > 0 ? (
            <span className="text-[#4C4A7A]"> in {countdown}</span>
          ) : null}
        </p>

        <Button
          type="submit"
          loading={loading}
          disabled={resending}
          className="mt-6"
        >
          {loading ? 'Verifying...' : 'Verify and continue'}
          {loading ? null : <ArrowRight className="size-4" />}
        </Button>

        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#312E81] transition hover:text-[#4F46E5]"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Link>
        </div>
      </form>
    </FormProvider>
  )
}

import { ArrowRight } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { FormProvider } from 'react-hook-form'
import * as yup from 'yup'
import useFormHandler from '@/hooks/useFormHandler'
import { validationSchema } from '@/utils/validationSchema'
import { Button } from '@/components/atoms/Button'
import { InputField } from '@/components/atoms/InputField'

const loginSchema = yup.object({
  mobile: validationSchema.mobile,
})

export type LoginFormValues = yup.InferType<typeof loginSchema>

type LoginFormProps = {
  onSubmit: (
    values: LoginFormValues,
    helpers: { setLoading: (loading: boolean) => void },
  ) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const submittingRef = useRef(false)
  const methods = useFormHandler<LoginFormValues>({
    schema: loginSchema,
    defaultValues: {
      mobile: '',
    },
  })

  const handleValidSubmit = (values: LoginFormValues) => {
    setLoading(true)
    onSubmit(values, {
      setLoading: (value) => {
        submittingRef.current = value
        setLoading(value)
      },
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) return

    submittingRef.current = true
    void methods.handleSubmit(handleValidSubmit, () => {
      submittingRef.current = false
    })(event)
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <InputField
          name="mobile"
          type="tel"
          label="Mobile number"
          placeholder="Enter 10-digit mobile"
          autoComplete="tel"
          maxLength={10}
          isRequired
          isMobileNumber
        />

        <Button
          type="submit"
          loading={loading}
          size="default"
          className="mt-2 w-full h-[46px] rounded-[16px] bg-[#4F46E5] text-white font-semibold shadow-md shadow-[#4F46E5]/25 hover:bg-[#4338CA]"
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
          {loading ? null : <ArrowRight className="size-4" />}
        </Button>
      </form>
    </FormProvider>
  )
}

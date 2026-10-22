import { useEffect, type ClipboardEvent, type KeyboardEvent } from 'react'
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from 'react-hook-form'

type OtpFieldProps<T extends FieldValues> = {
  name: Path<T>
  disabled?: boolean
  label?: string
  isRequired?: boolean
  /** Called once the field contains a full 6-digit code. */
  onComplete?: (otp: string) => void
}

const OTP_LENGTH = 6

export function OtpField<T extends FieldValues>({
  name,
  disabled,
  label,
  isRequired,
  onComplete,
}: OtpFieldProps<T>) {
  const { control } = useFormContext<T>()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.getElementById('otp-0')?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const digits = Array.from({ length: OTP_LENGTH }, (_, index) => {
          return String(field.value || '')[index] || ''
        })

        const focusInput = (index: number) => {
          document.getElementById(`otp-${index}`)?.focus()
        }

        const commit = (nextDigits: string[], focusIndex?: number) => {
          const code = nextDigits.join('').slice(0, OTP_LENGTH)
          field.onChange(code)

          if (focusIndex !== undefined) {
            focusInput(Math.max(0, Math.min(focusIndex, OTP_LENGTH - 1)))
          }

          if (/^\d{6}$/.test(code)) {
            onComplete?.(code)
          }
        }

        const handleChange = (value: string, index: number) => {
          const cleaned = value.replace(/\D/g, '')
          if (!cleaned) {
            const nextDigits = [...digits]
            nextDigits[index] = ''
            commit(nextDigits)
            return
          }

          const nextDigits = [...digits]
          cleaned
            .slice(0, OTP_LENGTH - index)
            .split('')
            .forEach((digit, offset) => {
              nextDigits[index + offset] = digit
            })

          commit(nextDigits, index + cleaned.length)
        }

        const handleKeyDown = (
          event: KeyboardEvent<HTMLInputElement>,
          index: number,
        ) => {
          if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault()
            focusInput(index - 1)
            return
          }

          if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            event.preventDefault()
            focusInput(index + 1)
            return
          }

          if (event.key === 'Backspace' && !digits[index] && index > 0) {
            event.preventDefault()
            const nextDigits = [...digits]
            nextDigits[index - 1] = ''
            commit(nextDigits, index - 1)
          }
        }

        const handlePaste = (
          event: ClipboardEvent<HTMLInputElement>,
          index: number,
        ) => {
          event.preventDefault()
          handleChange(event.clipboardData.getData('text'), index)
        }

        return (
          <div className="w-full">
            {label && (
              <label className="mb-3 block text-sm font-medium tracking-wide text-secondary">
                {label}
                {isRequired && <span className="text-error"> *</span>}
              </label>
            )}

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  disabled={disabled}
                  value={digit}
                  aria-label={`Digit ${index + 1}`}
                  aria-invalid={Boolean(fieldState.error)}
                  onChange={(event) => handleChange(event.target.value, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={(event) => handlePaste(event, index)}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`h-[48px] sm:h-[54px] w-full min-w-0 rounded-[14px] border text-center text-lg sm:text-xl font-bold transition duration-150 outline-none backdrop-blur-sm ${
                    digit
                      ? 'border-[#4F46E5]/60 bg-white text-[#1E1B4B] shadow-xs'
                      : 'border-white/85 bg-white/70 text-[#1E1B4B] hover:bg-white/85'
                  } ${
                    fieldState.error
                      ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'focus:border-[#4F46E5] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                />
              ))}
            </div>

            {fieldState.error && (
              <p className="mt-2 text-xs text-error">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

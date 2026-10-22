import { Eye, EyeOff } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from 'react-hook-form'

type InputFieldProps<T extends FieldValues> = {
  name: Path<T>
  placeholder?: string
  type?: string
  label?: string
  disabled?: boolean
  maxLength?: number
  showPasswordToggle?: boolean
  isbgColor?: boolean
  isRequired?: boolean
  variant?: 'dark' | 'light'
  className?: string
  isMobileNumber?: boolean
  suffix?: string
  autoComplete?: string
  hint?: string
  startIcon?: ReactNode
}

export function InputField<T extends FieldValues>({
  name,
  placeholder,
  type = 'text',
  label,
  disabled,
  maxLength,
  showPasswordToggle = true,
  isRequired,
  isbgColor = false,
  variant = 'light',
  isMobileNumber = false,
  className,
  suffix,
  autoComplete = 'off',
  hint,
  startIcon,
}: InputFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false)

  const inputType =
    type === 'password' ? (showPassword ? 'text' : 'password') : type
  const { control } = useFormContext<T>()
  const fieldId = String(name)

  const themeStyles = {
    dark: {
      label: 'text-primary-foreground/70 text-sm',
      input:
        'border-primary-foreground/40 text-primary-foreground placeholder:text-primary-foreground/20 border-[0.5px] bg-transparent placeholder:text-[16px]',
    },
    light: {
      label: 'text-[13px] font-semibold text-[#1E1B4B]',
      input:
        'border border-white/85 bg-white/70 text-[#1E1B4B] placeholder:text-[#4C4A7A]/60 backdrop-blur-sm hover:bg-white/85 focus:border-[#4F46E5] focus:bg-white',
    },
  }

  const currentTheme = themeStyles[variant]

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="w-full">
          {label && (
            <label
              htmlFor={fieldId}
              className={`mb-1.5 block tracking-wide ${currentTheme.label}`}
            >
              {label} {isRequired && <span className="text-error">*</span>}
            </label>
          )}

          <div className="relative flex items-center">
            {isMobileNumber && (
              <div
                className={`mr-2 flex h-[44px] items-center rounded-[14px] border px-3.5 whitespace-nowrap text-xs font-semibold ${currentTheme.input}`}
              >
                <span>IN +91</span>
              </div>
            )}

            {startIcon ? (
              <span className="pointer-events-none absolute left-3.5 text-text-faint">
                {startIcon}
              </span>
            ) : null}

            <input
              {...field}
              id={fieldId}
              autoComplete={autoComplete}
              autoCorrect="off"
              autoCapitalize="off"
              type={inputType}
              maxLength={maxLength}
              inputMode={type === 'tel' ? 'numeric' : undefined}
              pattern={type === 'tel' ? '[0-9]*' : undefined}
              disabled={disabled || field.disabled}
              aria-invalid={Boolean(fieldState.error)}
              onChange={(e) => {
                if (type === 'tel') {
                  const value = e.target.value.replace(/\D/g, '')
                  field.onChange(value)
                } else if (type === 'capital') {
                  const value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')

                  field.onChange(value)
                } else {
                  field.onChange(e)
                }
              }}
              placeholder={placeholder}
              className={`h-[44px] w-full min-w-0 rounded-[14px] border px-4 text-[13px] outline-none transition duration-150 ${startIcon ? 'pl-10' : ''} ${className ?? ''} ${
                isbgColor ? 'bg-transparent' : ''
              } ${
                disabled
                  ? 'cursor-not-allowed border-border bg-background-muted text-text-faint'
                  : ''
              } ${type === 'password' || suffix ? 'pr-12' : ''} ${currentTheme.input} ${
                fieldState.error
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15'
              }`}
            />

            {suffix ? (
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-text-faint">
                {suffix}
              </span>
            ) : null}

            {type === 'password' && showPasswordToggle ? (
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-text-faint transition hover:bg-border-subtle hover:text-secondary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : null}
          </div>

          {fieldState.error ? (
            <p className="mt-2 text-xs text-error">
              {fieldState.error.message}
            </p>
          ) : hint ? (
            <p className="mt-2 text-xs text-text-muted">{hint}</p>
          ) : null}
        </div>
      )}
    />
  )
}

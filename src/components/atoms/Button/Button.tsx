import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

export function Button({
  loading = false,
  variant = 'primary',
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-[#4f46e5] text-white shadow-[0_12px_24px_-14px_rgba(79,70,229,0.9)] hover:bg-[#4338ca]',
    ghost:
      'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

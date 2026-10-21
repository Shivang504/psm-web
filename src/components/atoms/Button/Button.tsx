import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  variant?: 'primary' | 'ghost'
  size?: 'default' | 'compact'
}

export function Button({
  loading = false,
  variant = 'primary',
  size = 'default',
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

  const sizes = {
    default: 'h-12 w-full rounded-xl px-4',
    compact: 'h-9 w-auto rounded-xl px-3.5',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 text-sm font-semibold transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

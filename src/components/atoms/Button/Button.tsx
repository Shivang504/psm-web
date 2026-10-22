import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
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
      'bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/20 hover:bg-[#4338CA]',
    ghost:
      'bg-white/70 text-[#312E81] border border-[rgba(79,70,229,0.25)] hover:bg-white hover:text-[#1E1B4B]',
  }

  const sizes = {
    default: 'h-[46px] w-full rounded-[16px] px-5 text-[14px]',
    compact: 'h-[42px] w-auto rounded-[14px] px-4 text-[13px]',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 cursor-pointer font-semibold transition duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

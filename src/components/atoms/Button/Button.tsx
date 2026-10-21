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
      'bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover',
    ghost:
      'bg-background-surface text-secondary ring-1 ring-border hover:bg-secondary-soft hover:ring-border-strong',
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

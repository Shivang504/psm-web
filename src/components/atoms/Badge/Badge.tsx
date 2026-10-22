import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'role' | 'area' | 'area-more' | 'neutral'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  role: 'bg-[rgba(79,70,229,0.14)] text-[#3730A3] font-semibold text-xs rounded-[10px] px-2.5 py-1',
  area: 'bg-[rgba(255,255,255,0.8)] border border-[rgba(79,70,229,0.18)] text-[#1E1B4B] text-xs rounded-[10px] px-2.5 py-1 whitespace-nowrap',
  'area-more':
    'bg-[#EEF2FF] text-[#3730A3] font-semibold text-xs rounded-[10px] px-2.5 py-1 whitespace-nowrap border border-[rgba(79,70,229,0.18)]',
  neutral:
    'bg-white/80 border border-border text-text-muted text-xs font-medium rounded-[10px] px-2.5 py-1',
}

export function Badge({
  variant = 'role',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center leading-none ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

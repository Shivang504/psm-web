import type { HTMLAttributes } from 'react'

export type AvatarVariant = 'a' | 'b' | 'c' | 'auto'

export interface AvatarProps extends HTMLAttributes<HTMLElement> {
  name?: string | null
  initials?: string
  variant?: AvatarVariant
  size?: number
}

function getInitials(name?: string | null, fallback = '—'): string {
  if (!name) return fallback
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function pickVariant(seed: string): 'a' | 'b' | 'c' {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  }
  const index = Math.abs(hash) % 3
  if (index === 1) return 'b'
  if (index === 2) return 'c'
  return 'a'
}

const variantStyles: Record<'a' | 'b' | 'c', string> = {
  a: 'bg-[#E0E7FF] text-[#3730A3]',
  b: 'bg-[#FBCFE8] text-[#831843]',
  c: 'bg-[#BAE6FD] text-[#0C4A6E]',
}

export function Avatar({
  name,
  initials,
  variant = 'auto',
  className = '',
  size = 28,
  ...props
}: AvatarProps) {
  const displayInitials = initials ?? getInitials(name)
  const resolvedVariant =
    variant === 'auto' ? pickVariant(name || displayInitials) : variant

  return (
    <i
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`not-italic inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold select-none ${variantStyles[resolvedVariant]} ${className}`}
      {...props}
    >
      {displayInitials}
    </i>
  )
}

import type { ReactNode } from 'react'
import type { EmployeeActivityDetails } from '@/utils/employeeDetail'

const toneBorder = {
  primary: 'border-primary',
  success: 'border-success',
  error: 'border-error',
}

export function Frame({
  tone,
  children,
}: {
  tone: keyof typeof toneBorder
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border bg-background-surface p-3 ${toneBorder[tone]}`}
    >
      {children}
    </div>
  )
}

export function Thumb({
  src,
  alt,
  onOpen,
}: {
  src?: string
  alt: string
  onOpen: (src: string) => void
}) {
  if (!src) return null
  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      className="cursor-pointer"
    >
      <img
        src={src}
        alt={alt}
        className="size-16 rounded-[14px] object-cover"
      />
    </button>
  )
}

export function BuyerTitle({
  label,
  activity,
}: {
  label: string
  activity: EmployeeActivityDetails
}) {
  return (
    <span className="text-sm font-semibold text-text-main">
      {label} - {activity.buyer_designation || 'N/A'} -{' '}
      {activity.buyer_name || 'N/A'}
    </span>
  )
}

import type { HTMLAttributes } from 'react'

export type AttendanceStatus = 'Present' | 'Absent' | 'Unmarked' | string

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  status?: AttendanceStatus | number | null
  label?: string
}

export function StatusPill({
  status,
  label,
  className = '',
  ...props
}: StatusPillProps) {
  let normalizedStatus: 'Present' | 'Absent' | 'Other' = 'Other'
  let displayLabel = label

  if (typeof status === 'number') {
    if (status === 1) {
      normalizedStatus = 'Present'
      displayLabel = displayLabel || 'Present'
    } else if (status === 0) {
      normalizedStatus = 'Absent'
      displayLabel = displayLabel || 'Absent'
    } else {
      normalizedStatus = 'Other'
      displayLabel = displayLabel || '—'
    }
  } else if (typeof status === 'string') {
    const s = status.trim().toLowerCase()
    if (s === 'present' || s === 'active') {
      normalizedStatus = 'Present'
      displayLabel = displayLabel || status
    } else if (s === 'absent' || s === 'deleted') {
      normalizedStatus = 'Absent'
      displayLabel = displayLabel || status
    } else {
      normalizedStatus = 'Other'
      displayLabel = displayLabel || status || '—'
    }
  } else {
    displayLabel = displayLabel || '—'
  }

  const styles = {
    Absent: {
      pill: 'bg-[#FEE2E2] text-[#991B1B]',
      dot: 'bg-[#DC2626]',
    },
    Present: {
      pill: 'bg-[#DCFCE7] text-[#166534]',
      dot: 'bg-[#16A34A]',
    },
    Other: {
      pill: 'bg-white/70 text-[#4C4A7A] border border-[rgba(79,70,229,0.15)]',
      dot: 'bg-[#94A3B8]',
    },
  }[normalizedStatus]

  return (
    <span
      className={`inline-flex items-center gap-1.5 self-start rounded-[20px] px-2.5 py-1 text-xs font-semibold select-none ${styles.pill} ${className}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={`inline-block size-[7px] shrink-0 rounded-full ${styles.dot}`}
      />
      <span>{displayLabel}</span>
    </span>
  )
}

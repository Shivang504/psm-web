import { Plus, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: LucideIcon
  actionDisabled?: boolean
  extraAction?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  actionDisabled = false,
  extraAction,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between px-1 pt-1.5 ${className}`}
    >
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1E1B4B]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-0.5 text-[14px] text-[#4C4A7A]">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {extraAction}

        {actionLabel && onAction ? (
          <button
            type="button"
            disabled={actionDisabled}
            onClick={onAction}
            className="inline-flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-[#4F46E5] px-[22px] text-[14px] font-semibold text-white shadow-md shadow-[#4F46E5]/25 transition duration-150 hover:bg-[#4338CA] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {ActionIcon ? (
              <ActionIcon
                className="size-[18px] stroke-[2.4]"
                aria-hidden="true"
              />
            ) : null}
            <span>{actionLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}

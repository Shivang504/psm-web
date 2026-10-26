import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

export type DrawerProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  panelClassName?: string
}

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  panelClassName = 'max-w-xl sm:max-w-2xl',
}: DrawerProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close panel"
        className="fixed inset-0 bg-[#1E1B4B]/25 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Surface */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`relative z-10 flex h-full w-full flex-col rounded-l-[24px] border-l border-white/85 bg-white/85 shadow-[0_24px_60px_-15px_rgba(30,27,75,0.25)] backdrop-blur-2xl ${panelClassName}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(79,70,229,0.12)] px-6 py-5">
          <div className="min-w-0 pr-4">
            <h2
              id="drawer-title"
              className="text-xl font-bold tracking-tight text-[#1E1B4B]"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-[#4C4A7A] truncate">
                {subtitle}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[#4C4A7A] transition hover:bg-white/80 hover:text-[#1E1B4B]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Optional Footer */}
        {footer ? (
          <div className="border-t border-[rgba(79,70,229,0.12)] bg-white/50 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

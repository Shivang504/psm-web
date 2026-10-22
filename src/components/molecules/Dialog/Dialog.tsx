import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  loading?: boolean
  handleSubmit?: () => void
  label?: string
  closeOnOutsideClick?: boolean
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  loading = false,
  handleSubmit,
  label = 'Confirm',
  closeOnOutsideClick = true,
}: DialogProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnOutsideClick) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose, closeOnOutsideClick])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-[#1E1B4B]/30 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (closeOnOutsideClick) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className="relative z-10 w-full max-w-md rounded-[22px] border border-white/90 bg-white/90 p-6 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(30,27,75,0.25)]"
      >
        {closeOnOutsideClick ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 inline-flex size-[36px] items-center justify-center rounded-[12px] text-[#4C4A7A] transition hover:bg-white hover:text-[#1E1B4B]"
          >
            <X className="size-4" />
          </button>
        ) : null}

        {title ? (
          <h2
            id="dialog-title"
            className="pr-8 text-lg font-bold text-[#1E1B4B]"
          >
            {title}
          </h2>
        ) : null}

        <div className={title ? 'mt-3 text-sm leading-6 text-[#4C4A7A]' : ''}>
          {children}
        </div>

        {handleSubmit ? (
          <div className="mt-6 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81] transition hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="inline-flex h-[40px] cursor-pointer items-center justify-center rounded-[14px] bg-[#DC2626] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] disabled:opacity-50"
            >
              {loading ? 'Processing...' : label}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

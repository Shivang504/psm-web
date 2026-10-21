import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Button } from '../../atoms/Button'

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
        className="absolute inset-0 bg-slate-950/45"
        onClick={() => {
          if (closeOnOutsideClick) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(42,37,120,0.55)]"
      >
        {closeOnOutsideClick ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        ) : null}

        {title ? (
          <h2
            id="dialog-title"
            className="pr-8 text-lg font-semibold text-slate-950"
          >
            {title}
          </h2>
        ) : null}

        <div className={title ? 'mt-3 text-sm leading-6 text-slate-600' : ''}>
          {children}
        </div>

        {handleSubmit ? (
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" size="compact" onClick={onClose}>
              Cancel
            </Button>
            <Button size="compact" loading={loading} onClick={handleSubmit}>
              {label}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

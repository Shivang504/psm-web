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
        className="absolute inset-0 bg-background-overlay/45"
        onClick={() => {
          if (closeOnOutsideClick) onClose()
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-background-surface p-6 shadow-dialog"
      >
        {closeOnOutsideClick ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-lg text-text-faint transition hover:bg-border-subtle hover:text-secondary"
          >
            <X className="size-4" />
          </button>
        ) : null}

        {title ? (
          <h2
            id="dialog-title"
            className="pr-8 text-lg font-semibold text-text-strong"
          >
            {title}
          </h2>
        ) : null}

        <div
          className={title ? 'mt-3 text-sm leading-6 text-text-secondary' : ''}
        >
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

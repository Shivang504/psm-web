import type { ReactNode } from 'react'
import { Button } from '../../atoms/Button'

type FormLayoutProps = {
  children: ReactNode
  onCancel: () => void
  isSubmitting?: boolean
  saving?: boolean
  isUploading?: boolean
  cancelText?: string
  saveText?: string
}

export function FormLayout({
  children,
  onCancel,
  isSubmitting = false,
  saving = false,
  isUploading = false,
  cancelText = 'Cancel',
  saveText = 'Save',
}: FormLayoutProps) {
  const isButtonDisabled = isSubmitting || saving || isUploading

  return (
    <div className="flex h-[calc(100svh-7.5rem)] flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto space-y-6">{children}</div>
      </div>

      <div className="shrink-0 border rounded-lg border-border bg-background-surface px-6 py-4">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="compact"
            onClick={onCancel}
            disabled={isButtonDisabled}
            className="min-w-36"
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            size="compact"
            loading={isButtonDisabled}
            className="min-w-36"
          >
            {saveText}
          </Button>
        </div>
      </div>
    </div>
  )
}

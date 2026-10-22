import type { ReactNode } from 'react'

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
    <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
      {/* Scrollable Form Body Card */}
      <div className="glass-card flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 rounded-[22px] border border-white/85 bg-white/62 backdrop-blur-md shadow-[0_4px_24px_rgba(79,70,229,0.06)]">
        <div className="mx-auto space-y-6">{children}</div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="glass-panel shrink-0 px-6 py-3.5 rounded-[18px] border border-white/85 flex items-center justify-end gap-3 shadow-xs">
        <button
          type="button"
          onClick={onCancel}
          disabled={isButtonDisabled}
          className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[14px] border border-[rgba(79,70,229,0.25)] bg-white/70 px-5 text-[13px] font-semibold text-[#312E81] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelText}
        </button>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="inline-flex h-[44px] cursor-pointer items-center justify-center rounded-[14px] bg-[#4F46E5] px-6 text-[13px] font-semibold text-white shadow-md shadow-[#4F46E5]/25 transition hover:bg-[#4338CA] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isButtonDisabled ? (
            <span className="flex items-center gap-2">
              <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            saveText
          )}
        </button>
      </div>
    </div>
  )
}

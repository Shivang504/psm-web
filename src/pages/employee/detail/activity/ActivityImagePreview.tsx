type ActivityImagePreviewProps = {
  src: string | null
  onClose: () => void
}

export function ActivityImagePreview({
  src,
  onClose,
}: ActivityImagePreviewProps) {
  if (!src) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        aria-label="Close image"
        className="absolute inset-0 bg-background-overlay"
        onClick={onClose}
      />
      <img
        src={src}
        alt="Activity capture"
        className="relative max-h-[80vh] max-w-full rounded-[22px] bg-background-surface"
      />
    </div>
  )
}

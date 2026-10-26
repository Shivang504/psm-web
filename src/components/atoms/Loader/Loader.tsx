export type LoaderProps = {
  /** Accessible status text */
  label?: string
  /** Size in pixels (approximate outer diameter) */
  size?: number
  /** Extra classes on the wrapper */
  className?: string
}

export function Loader({
  label = 'Loading',
  size = 24,
  className = '',
}: LoaderProps) {
  const diameter = `${size}px`

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`.trim()}
    >
      <span
        className="animate-spin rounded-full border-2 border-primary-muted border-t-primary"
        style={{ width: diameter, height: diameter }}
      />
    </span>
  )
}

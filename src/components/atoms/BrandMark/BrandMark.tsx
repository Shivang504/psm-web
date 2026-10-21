type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className = 'size-12' }: BrandMarkProps) {
  return (
    <img
      src="/logo.png"
      alt="PSM"
      className={`rounded-[22%] object-cover object-left shadow-lg shadow-indigo-950/25 ${className}`}
    />
  )
}

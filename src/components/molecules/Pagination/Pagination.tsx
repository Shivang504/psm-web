type PaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  dataLength: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  dataLength,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
}: PaginationProps) {
  if (isLoading || dataLength === 0 || !totalPages) return null

  const startPage = Math.max(1, page - 1)
  const endPage = Math.min(totalPages, page + 1)
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  const startRange = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const endRange = Math.min(page * pageSize, totalItems)

  return (
    <div
      className={`flex h-[64px] flex-col items-center justify-between gap-3 border-t border-[rgba(79,70,229,0.12)] px-5 text-[13px] text-[#4C4A7A] sm:flex-row ${className}`}
    >
      <div className="flex items-center gap-4">
        <span>
          Showing{' '}
          <b className="font-bold text-[#1E1B4B]">
            {startRange}–{endRange}
          </b>{' '}
          of <b className="font-bold text-[#1E1B4B]">{totalItems}</b>
        </span>

        {onPageSizeChange ? (
          <div className="flex items-center gap-1.5 text-xs text-[#4C4A7A]">
            <span>Rows:</span>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-[32px] cursor-pointer rounded-[10px] border border-white/80 bg-white/70 px-2 py-0.5 text-xs font-semibold text-[#1E1B4B] outline-none backdrop-blur-sm hover:bg-white"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div
        className="flex items-center gap-1.5"
        role="navigation"
        aria-label="Pagination Navigation"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[15px] font-semibold text-[#312E81] transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>

        {startPage > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              aria-label="Page 1"
              className="inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[13px] font-semibold text-[#312E81] transition hover:bg-white/50"
            >
              1
            </button>
            {startPage > 2 ? (
              <span className="px-1 text-xs text-[#4C4A7A]">…</span>
            ) : null}
          </>
        ) : null}

        {pages.map((pageNumber) => {
          const isCurrent = page === pageNumber
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[13px] font-semibold transition ${
                isCurrent
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-transparent text-[#312E81] hover:bg-white/50'
              }`}
            >
              {pageNumber}
            </button>
          )
        })}

        {endPage < totalPages ? (
          <>
            {endPage < totalPages - 1 ? (
              <span className="px-1 text-xs text-[#4C4A7A]">…</span>
            ) : null}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              aria-label={`Page ${totalPages}`}
              className="inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[13px] font-semibold text-[#312E81] transition hover:bg-white/50"
            >
              {totalPages}
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[15px] font-semibold text-[#312E81] transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  )
}

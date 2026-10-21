import { ChevronLeft, ChevronRight } from 'lucide-react'

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
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  dataLength,
  isLoading = false,
  onPageChange,
}: PaginationProps) {
  if (isLoading || dataLength === 0 || !totalPages) return null

  const startPage = Math.max(1, page - 1)
  const endPage = Math.min(totalPages, page + 1)
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  const startRange = (page - 1) * pageSize + 1
  const endRange = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-background-surface px-4 py-3 sm:flex-row">
      <p className="order-2 text-xs text-text-muted sm:order-1">
        Showing{' '}
        <span className="font-semibold text-text">
          {startRange}-{endRange}
        </span>{' '}
        of <span className="font-semibold text-text">{totalItems}</span>
      </p>

      <div className="order-1 flex items-center gap-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>

        {page > 2 ? (
          <span className="px-1 text-xs text-text-faint">...</span>
        ) : null}

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={page === pageNumber ? 'page' : undefined}
            className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition ${
              page === pageNumber
                ? 'bg-primary text-primary-foreground shadow-primary-sm'
                : 'text-text-secondary hover:bg-primary-soft hover:text-primary'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {page < totalPages - 1 ? (
          <span className="px-1 text-xs text-text-faint">...</span>
        ) : null}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-text-secondary transition hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

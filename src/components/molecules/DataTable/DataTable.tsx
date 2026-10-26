import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  RefreshCw,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
  type MouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Badge } from '@/components/atoms/Badge'
import { Pagination } from '@/components/molecules/Pagination'

export type ColumnType<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  sortKey?: string
  isNowrap?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export type ActionType<T> = {
  label: string
  icon?: ReactNode | LucideIcon
  onClick: (row: T) => void
  condition?: (row: T) => boolean
  disabled?: (row: T) => boolean
  title?: (row: T) => string
  variant?: 'default' | 'danger'
}

export interface DataTableProps<T> {
  columns: ColumnType<T>[]
  data: T[]
  actions?: ActionType<T>[]
  loading?: boolean
  skeletonRowCount?: number
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  onRowClick?: (row: T) => void
  selectedRowId?: string | null
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  page?: number
  pageSize?: number
  totalItems?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  minWidth?: string
}

function readRowId<T>(row: T, fallbackIndex: number): string {
  if (typeof row === 'object' && row !== null && 'id' in row) {
    const id = (row as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return String(id)
  }
  return String(fallbackIndex)
}

function renderActionIcon(icon?: ReactNode | LucideIcon) {
  if (!icon) return null
  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && 'render' in icon)
  ) {
    const IconComponent = icon as LucideIcon
    return <IconComponent className="size-4 shrink-0" />
  }
  return <span className="shrink-0">{icon}</span>
}

export function AreasCell({ areas }: { areas: string[] }) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const moreRef = useRef<HTMLSpanElement | null>(null)

  if (!areas || areas.length === 0) {
    return <span className="text-[#4C4A7A]">—</span>
  }

  const visible = areas.slice(0, 2)
  const remaining = areas.length - visible.length

  const handleMouseEnter = () => {
    if (!moreRef.current) return
    const rect = moreRef.current.getBoundingClientRect()
    setTooltipPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    })
    setTooltipVisible(true)
  }

  return (
    <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
      {visible.map((area, index) => (
        <Badge key={index} variant="area" title={area}>
          <span className="max-w-[90px] truncate">{area}</span>
        </Badge>
      ))}

      {remaining > 0 ? (
        <span
          ref={moreRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setTooltipVisible(false)}
          className="relative inline-flex"
        >
          <Badge variant="area-more" className="cursor-help">
            +{remaining}
          </Badge>

          {tooltipVisible
            ? createPortal(
                <div
                  role="tooltip"
                  className="fixed z-50 -translate-x-1/2 -translate-y-full rounded-[10px] bg-[#1E1B4B] px-3 py-1.5 text-xs text-white shadow-lg pointer-events-none max-w-xs whitespace-normal text-center"
                  style={{ top: tooltipPos.top, left: tooltipPos.left }}
                >
                  <p className="font-semibold text-[11px] text-[#C7D2FE] mb-0.5">
                    All Areas ({areas.length})
                  </p>
                  <p>{areas.join(', ')}</p>
                </div>,
                document.body,
              )
            : null}
        </span>
      ) : null}
    </div>
  )
}

function RowActionMenu<T>({
  row,
  actions,
}: {
  row: T
  actions: ActionType<T>[]
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  const availableActions = actions.filter(
    (action) => !action.condition || action.condition(row),
  )

  const updatePosition = () => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + 4,
      left: Math.max(12, rect.right - 144),
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (availableActions.length === 0) return null

  const handleOpen = (e: MouseEvent) => {
    e.stopPropagation()
    updatePosition()
    setOpen((prev) => !prev)
  }

  return (
    <div className="relative inline-flex items-center justify-end">
      <button
        ref={buttonRef}
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleOpen}
        className="inline-flex size-[36px] cursor-pointer items-center justify-center rounded-[12px] text-[#312E81] transition hover:bg-white/80 active:scale-95"
      >
        <MoreHorizontal className="size-5" />
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              aria-label="Row actions"
              onClick={(e) => e.stopPropagation()}
              className="glass-dropdown fixed z-50 w-36 overflow-hidden p-1 shadow-[0_12px_32px_rgba(30,27,75,0.18)]"
              style={{ top: menuPos.top, left: menuPos.left }}
            >
              {availableActions.map((action, idx) => {
                const isDisabled = action.disabled?.(row) ?? false
                const isDanger = action.variant === 'danger'
                const displayTitle = action.title?.(row) ?? action.label

                return (
                  <button
                    key={idx}
                    type="button"
                    role="menuitem"
                    disabled={isDisabled}
                    onClick={() => {
                      setOpen(false)
                      if (!isDisabled) action.onClick(row)
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      isDanger
                        ? 'text-[#DC2626] hover:bg-[#FEE2E2]'
                        : 'text-[#1E1B4B] hover:bg-[#EEF2FF] hover:text-[#3730A3]'
                    }`}
                  >
                    {renderActionIcon(action.icon)}
                    <span className="truncate">{displayTitle}</span>
                  </button>
                )
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

export function DataTable<T>({
  columns,
  data,
  actions = [],
  loading = false,
  skeletonRowCount = 6,
  error = null,
  onRetry,
  emptyMessage = 'No records found.',
  onRowClick,
  selectedRowId,
  sortBy,
  sortOrder,
  onSort,
  page = 1,
  pageSize = 20,
  totalItems = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = '',
  minWidth = '940px',
}: DataTableProps<T>) {
  const hasActions = actions.length > 0

  // Calculate grid template based on column widths or default 1fr
  const gridTemplate = useMemo(() => {
    const colDefs = columns.map((col) => col.width || '1fr').join(' ')
    return hasActions ? `${colDefs} 44px` : colDefs
  }, [columns, hasActions])

  const handleHeaderSort = (col: ColumnType<T>) => {
    if (!col.sortable || !onSort) return
    const sortField = col.sortKey ?? String(col.key)
    onSort(sortField)
  }

  return (
    <section
      className={`glass-card flex flex-1 min-h-0 flex-col overflow-hidden shadow-[0_4px_24px_rgba(79,70,229,0.06)] ${className}`}
    >
      {/* Scrollable table viewport */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
        <div style={{ minWidth }}>
          {/* Header Row */}
          <div
            style={{ gridTemplateColumns: gridTemplate }}
            className="sticky top-0 z-10 grid items-center gap-3 px-5 h-[46px] border-b border-[rgba(79,70,229,0.12)] bg-white/70 backdrop-blur-md text-[12px] font-semibold text-[#4338CA] tracking-[0.02em] select-none"
          >
            {columns.map((col) => {
              const sortField = col.sortKey ?? String(col.key)
              const isActive = sortBy === sortField

              return (
                <div
                  key={String(col.key)}
                  onClick={() => handleHeaderSort(col)}
                  className={`flex items-center gap-1.5 ${
                    col.align === 'center'
                      ? 'justify-center'
                      : col.align === 'right'
                        ? 'justify-end'
                        : 'justify-start'
                  } ${
                    col.sortable
                      ? 'cursor-pointer select-none hover:text-[#312E81]'
                      : ''
                  }`}
                >
                  <span className="truncate">{col.label}</span>
                  {col.sortable ? (
                    <span className="inline-flex flex-col -space-y-1">
                      <ChevronUp
                        className={`size-3 ${
                          isActive && sortOrder === 'asc'
                            ? 'text-[#4F46E5]'
                            : 'text-[#4C4A7A]/30'
                        }`}
                      />
                      <ChevronDown
                        className={`size-3 ${
                          isActive && sortOrder === 'desc'
                            ? 'text-[#4F46E5]'
                            : 'text-[#4C4A7A]/30'
                        }`}
                      />
                    </span>
                  ) : null}
                </div>
              )
            })}

            {hasActions ? <div aria-hidden="true" /> : null}
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[rgba(79,70,229,0.12)]">
            {loading ? (
              /* Loading Skeleton Rows */
              Array.from({ length: skeletonRowCount }).map((_, idx) => (
                <div
                  key={idx}
                  style={{ gridTemplateColumns: gridTemplate }}
                  className="grid items-center gap-3 px-5 h-[44px] animate-pulse"
                >
                  {columns.map((col, colIdx) => (
                    <div
                      key={colIdx}
                      className={`h-4 rounded bg-indigo-100/60 ${
                        col.width && col.width.includes('fr') ? 'w-3/4' : 'w-16'
                      }`}
                    />
                  ))}
                  {hasActions ? (
                    <div className="size-7 rounded-[10px] bg-indigo-100/40 justify-self-end" />
                  ) : null}
                </div>
              ))
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="size-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] mb-3">
                  <Users className="size-6" />
                </div>
                <h2 className="text-base font-bold text-[#1E1B4B]">
                  Unable to load data
                </h2>
                <p className="mt-1 max-w-md text-xs text-[#4C4A7A]">{error}</p>
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center gap-2 rounded-[14px] bg-[#4F46E5] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#4338CA]"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </button>
                ) : null}
              </div>
            ) : data.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="size-12 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-[#4F46E5] mb-3 shadow-xs">
                  <Users className="size-6" />
                </div>
                <h2 className="text-base font-bold text-[#1E1B4B]">
                  {emptyMessage}
                </h2>
                <p className="mt-1 max-w-sm text-xs text-[#4C4A7A]">
                  Try adjusting your search terms or filters to find what you
                  are looking for.
                </p>
              </div>
            ) : (
              /* Data Rows */
              data.map((row, index) => {
                const rowId = readRowId(row, index)
                const isSelected =
                  selectedRowId != null && selectedRowId === rowId

                return (
                  <div
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    style={{ gridTemplateColumns: gridTemplate }}
                    className={`grid items-center gap-3 px-5 h-[44px] text-[13px] text-[#1E1B4B] cursor-pointer transition duration-150 ${
                      isSelected ? 'bg-[#EEF2FF]/80' : 'hover:bg-white/45'
                    }`}
                  >
                    {columns.map((col) => {
                      const rendered = col.render
                        ? col.render(row)
                        : String(
                            (row as Record<string, unknown>)[String(col.key)] ??
                              '',
                          )

                      return (
                        <div
                          key={String(col.key)}
                          className={`min-w-0 ${
                            col.isNowrap ? 'whitespace-nowrap truncate' : ''
                          } ${
                            col.align === 'center'
                              ? 'text-center'
                              : col.align === 'right'
                                ? 'text-right'
                                : 'text-left'
                          }`}
                        >
                          {rendered}
                        </div>
                      )
                    })}

                    {hasActions ? (
                      <div
                        className="justify-self-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowActionMenu row={row} actions={actions} />
                      </div>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer / Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        dataLength={data.length}
        isLoading={loading}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </section>
  )
}

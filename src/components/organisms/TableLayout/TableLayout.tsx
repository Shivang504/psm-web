import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../../atoms/Button'
import { Skeleton } from '../../atoms/Skeleton'
import { Dialog } from '../../molecules/Dialog'
import { Pagination } from '../../molecules/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../molecules/Table'

export type ColumnType<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  sortKey?: string
  isNowrap?: boolean
}

export type ActionType<T> = {
  label: string
  icon?: ReactNode | LucideIcon
  onClick: (row: T) => void
  condition?: (row: T) => boolean
  disabled?: (row: T) => boolean
  title?: (row: T) => string
}

export type HeaderButton = {
  label: string
  onClick: () => void
  icon?: LucideIcon
  iconPlacement?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'ghost'
}

type TableLayoutProps<T> = {
  columns: ColumnType<T>[]
  data: T[]
  actions?: ActionType<T>[]
  emptyMessage?: string
  loading?: boolean
  skeletonRowCount?: number
  onRowClick?: (row: T) => void
  searchTerm?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
  page?: number
  totalPages?: number
  pageSize?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  dialogTitle?: string
  dialogOpen?: boolean
  setDialogOpen?: () => void
  dialogLoading?: boolean
  handleOnclick?: () => void
  dialogDescription?: ReactNode
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  filters?: ReactNode
  buttons?: HeaderButton[]
  detailInfo?: ReactNode
  selectedRowId?: string
  scrollbar?: boolean
}

function readRowId<T>(row: T): string | undefined {
  if (typeof row !== 'object' || row === null || !('id' in row))
    return undefined

  const id = (row as { id?: unknown }).id
  if (typeof id === 'string' || typeof id === 'number') return String(id)

  return undefined
}

function renderActionIcon(icon?: ReactNode | LucideIcon) {
  if (!icon) return <MoreHorizontal className="size-4" />

  if (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && 'render' in icon)
  ) {
    const IconComponent = icon as LucideIcon
    return <IconComponent className="size-4" />
  }

  return icon
}

export function TableLayout<T>({
  columns,
  data,
  actions = [],
  emptyMessage = 'No data available',
  loading = false,
  skeletonRowCount = 5,
  onRowClick,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  dialogTitle,
  dialogOpen = false,
  dialogLoading = false,
  handleOnclick,
  dialogDescription,
  setDialogOpen,
  sortBy,
  sortOrder,
  onSort,
  filters,
  buttons,
  detailInfo,
  selectedRowId,
  scrollbar = true,
}: TableLayoutProps<T>) {
  const isSidePanelOpen = Boolean(detailInfo)

  return (
    <>
      <div className="flex w-full flex-col items-start gap-5 lg:flex-row">
        <div
          className={isSidePanelOpen ? 'min-w-0 w-full lg:flex-1' : 'w-full'}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {onSearchChange ? (
                <div className="relative w-full sm:max-w-xs">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="size-4" />
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/15"
                  />
                </div>
              ) : null}
              {children ? (
                <div className="flex items-center gap-3">{children}</div>
              ) : null}
            </div>

            {buttons?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {buttons.map((button) => {
                  const Icon = button.icon

                  return (
                    <Button
                      key={button.label}
                      size="compact"
                      variant={button.variant ?? 'primary'}
                      loading={button.loading}
                      disabled={button.disabled || button.loading}
                      onClick={button.onClick}
                    >
                      {Icon && button.iconPlacement !== 'right' ? (
                        <Icon className="size-4" />
                      ) : null}
                      {button.label}
                      {Icon && button.iconPlacement === 'right' ? (
                        <Icon className="size-4" />
                      ) : null}
                    </Button>
                  )
                })}
              </div>
            ) : null}

            {filters ? (
              <div className="flex items-center gap-3">{filters}</div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_-32px_rgba(42,37,120,0.55)]">
            <p className="px-4 pt-3 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase sm:hidden">
              Swipe to explore
            </p>

            <div
              className={`overflow-x-auto ${
                scrollbar ? 'max-h-[calc(100vh-280px)] overflow-y-auto' : ''
              }`}
            >
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-b border-slate-200">
                    {columns.map((column) => {
                      const sortField = column.sortKey ?? String(column.key)
                      const isActive = sortBy === sortField

                      return (
                        <TableHead
                          key={String(column.key)}
                          onClick={
                            column.sortable && onSort
                              ? () => onSort(sortField)
                              : undefined
                          }
                          className={`text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase ${
                            column.sortable
                              ? 'cursor-pointer select-none hover:text-[#4f46e5]'
                              : ''
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                            {column.label}
                            {column.sortable ? (
                              <span className="inline-flex flex-col -space-y-1">
                                <ChevronUp
                                  className={`size-3 ${
                                    isActive && sortOrder === 'asc'
                                      ? 'text-[#4f46e5]'
                                      : 'text-slate-300'
                                  }`}
                                />
                                <ChevronDown
                                  className={`size-3 ${
                                    isActive && sortOrder === 'desc'
                                      ? 'text-[#4f46e5]'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </span>
                            ) : null}
                          </span>
                        </TableHead>
                      )
                    })}
                    {actions.length > 0 ? (
                      <TableHead className="text-right text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                        Actions
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: skeletonRowCount }).map((_, index) => (
                      <TableRow
                        key={index}
                        className="border-b border-slate-100"
                      >
                        {columns.map((column) => (
                          <TableCell key={String(column.key)}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                        {actions.length > 0 ? (
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-8" />
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))
                  ) : data.length > 0 ? (
                    data.map((row, index) => {
                      const availableActions = actions.filter(
                        (action) => !action.condition || action.condition(row),
                      )
                      const isSelected =
                        selectedRowId != null &&
                        selectedRowId === readRowId(row)

                      return (
                        <TableRow
                          key={readRowId(row) ?? index}
                          onClick={
                            onRowClick ? () => onRowClick(row) : undefined
                          }
                          className={`border-b border-slate-100 last:border-0 ${
                            onRowClick ? 'cursor-pointer' : ''
                          } ${
                            isSelected
                              ? 'bg-indigo-50'
                              : 'hover:bg-indigo-50/70'
                          }`}
                        >
                          {columns.map((column) => (
                            <TableCell
                              key={String(column.key)}
                              className={`text-sm font-medium text-slate-700 ${
                                column.isNowrap ? 'whitespace-nowrap' : ''
                              }`}
                            >
                              {column.render
                                ? column.render(row)
                                : String(
                                    (row as Record<string, unknown>)[
                                      String(column.key)
                                    ] ?? '',
                                  )}
                            </TableCell>
                          ))}

                          {actions.length > 0 ? (
                            <TableCell
                              className="text-right"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {availableActions.map((action) => {
                                  const isDisabled =
                                    action.disabled?.(row) ?? false

                                  return (
                                    <button
                                      key={action.label}
                                      type="button"
                                      title={
                                        action.title?.(row) ?? action.label
                                      }
                                      aria-label={action.label}
                                      disabled={isDisabled}
                                      onClick={() => action.onClick(row)}
                                      className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                      {renderActionIcon(action.icon)}
                                    </button>
                                  )
                                })}
                              </div>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                        className="py-12 text-center text-sm text-slate-500"
                      >
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination
              page={page || 1}
              pageSize={pageSize || 10}
              totalItems={totalItems || 0}
              totalPages={totalPages || 1}
              dataLength={data.length}
              isLoading={loading}
              onPageChange={onPageChange || (() => {})}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        </div>

        {isSidePanelOpen ? (
          <div className="w-full shrink-0 lg:w-[340px]">{detailInfo}</div>
        ) : null}
      </div>

      <Dialog
        title={dialogTitle}
        open={dialogOpen}
        loading={dialogLoading}
        onClose={setDialogOpen ?? (() => {})}
        handleSubmit={handleOnclick}
      >
        {dialogDescription}
      </Dialog>
    </>
  )
}

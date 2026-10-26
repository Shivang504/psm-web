import { useLayoutEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Eye } from 'lucide-react'
import { PanelState } from './PanelState'
import { ProductList } from './ProductList'
import { requestEmployeeOrders } from './requestEmployeeDetail'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  downloadCsv,
  ordersToCsv,
  todayDate,
  type ActivityProduct,
} from '@/utils/employeeDetail'

type EmployeeOrdersPanelProps = {
  userId: string
}

function statusClass(status?: string) {
  if (status === 'Approved') return 'bg-success-soft text-success'
  if (status === 'Rejected') return 'bg-error-soft text-error'
  return 'bg-warning-soft text-warning'
}

export function EmployeeOrdersPanel({ userId }: EmployeeOrdersPanelProps) {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((state) => state.employeeDetail.orders)
  const [fromDate, setFromDate] = useState(todayDate)
  const [toDate, setToDate] = useState(todayDate)
  const [products, setProducts] = useState<ActivityProduct[] | null>(null)

  const load = (start: string, end: string) => {
    if (start > end) {
      toast.error('The start date must be on or before the end date.')
      return
    }
    requestEmployeeOrders(dispatch, userId, start, end)
  }

  useLayoutEffect(() => {
    requestEmployeeOrders(dispatch, userId, todayDate(), todayDate())
  }, [dispatch, userId])

  const download = () => {
    downloadCsv(
      `Order Report ${orders.fromDate || fromDate}_${orders.toDate || toDate}.csv`,
      ordersToCsv(orders.items),
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-text-muted">
          From
          <input
            type="date"
            value={fromDate}
            max={todayDate()}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 block h-10 rounded-[14px] border border-border bg-background-surface px-3 text-sm text-text-main"
          />
        </label>
        <label className="text-xs text-text-muted">
          To
          <input
            type="date"
            value={toDate}
            max={todayDate()}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 block h-10 rounded-[14px] border border-border bg-background-surface px-3 text-sm text-text-main"
          />
        </label>
        <button
          type="button"
          onClick={() => load(fromDate, toDate)}
          className="h-10 cursor-pointer rounded-[14px] bg-primary px-4 text-xs font-semibold text-primary-foreground"
        >
          Apply
        </button>
        <button
          type="button"
          disabled={!orders.items.length}
          onClick={download}
          className="h-10 cursor-pointer rounded-[14px] border border-border-strong bg-background-surface px-4 text-xs font-semibold text-primary-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download report
        </button>
      </div>

      {products ? (
        <ProductList products={products} onClose={() => setProducts(null)} />
      ) : null}

      <PanelState
        loading={orders.loading}
        error={orders.error}
        empty={!orders.items.length}
        emptyMessage="No orders for this date range."
        loadingLabel="Loading orders"
        onRetry={() => load(fromDate, toDate)}
      >
        <div className="glass-panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-primary-hover">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.items.map((row, index) => (
                <tr key={row.id || index} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-text-main">
                    {row.date || '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {row.config?.buyer_company_name ||
                      row.config?.company_name ||
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {row.employee || '—'}
                  </td>
                  <td className="px-4 py-3 text-text-main">
                    {row.config?.gross_total ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${statusClass(row.config?.order_status)}`}
                    >
                      {row.config?.order_status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-label="View products"
                      onClick={() => setProducts(row.config?.products ?? [])}
                      className="inline-flex cursor-pointer items-center gap-1 text-primary"
                    >
                      <Eye className="size-4" />
                      Products
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelState>
    </div>
  )
}

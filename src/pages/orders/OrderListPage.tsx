import { Check, Download, Eye, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toolbar } from '@/components/layout/Toolbar'
import {
  DataTable,
  type ActionType,
  type ColumnType,
} from '@/components/molecules/DataTable'
import { Dialog } from '@/components/molecules/Dialog'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchOrders,
  fetchOrdersFailure,
  fetchOrdersSuccess,
  setOrderSaving,
} from '@/store/slices/ordersSlice'
import type {
  OrderListQuery,
  OrderListResponse,
  OrderRecord,
  OrderReportResponse,
} from '@/utils/types'
import { OrderDetailDrawer } from './OrderDetailDrawer'
import {
  ORDER_TAB_PARAM,
  ORDER_TABS,
  companyName,
  downloadOrderReport,
  orderListParams,
  orderTabLabel,
  orderText,
  readOrderList,
  readOrderReport,
  statusClass,
} from './orderModel'

function dispatchOrders(dispatch: AppDispatch, nextQuery: OrderListQuery) {
  dispatch(fetchOrders(nextQuery))
  if (nextQuery.startDate > nextQuery.endDate) return

  dispatch({
    type: sagaActions.GET_ORDERS,
    payload: {
      query: '/userActivities/status',
      method: 'GET',
      variables: orderListParams(nextQuery),
      onSuccess: (response: OrderListResponse) => {
        dispatch(fetchOrdersSuccess(readOrderList(response.data)))
      },
      onFailure: (message: string) => {
        dispatch(fetchOrdersFailure(message))
      },
    },
  })
}

function reloadOrders(dispatch: AppDispatch) {
  dispatchOrders(dispatch, store.getState().orders.query)
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex h-[44px] items-center gap-2 rounded-[14px] border border-white/85 bg-white/62 px-3 text-[13px] text-[#4C4A7A] shadow-[0_2px_8px_rgba(79,70,229,0.04)] backdrop-blur-md">
      <span className="shrink-0 text-[12px] font-semibold">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-[13px] font-medium text-[#1E1B4B] outline-none"
      />
    </label>
  )
}

export default function OrderListPage() {
  const { status: statusParam } = useParams()
  const status = statusParam ? ORDER_TAB_PARAM[statusParam] : undefined
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, total, loading, saving, error, query } = useAppSelector(
    (state) => state.orders,
  )
  const [searchText, setSearchText] = useState(query.search)
  const [exporting, setExporting] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [detailRefresh, setDetailRefresh] = useState(0)
  const [approveOrder, setApproveOrder] = useState<OrderRecord | null>(null)
  const [rejectOrder, setRejectOrder] = useState<OrderRecord | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const searchTimer = useRef<number | null>(null)
  const totalPages = Math.ceil(total / query.limit)
  const rangeInvalid = query.startDate > query.endDate

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!status) return
    const current = store.getState().orders.query
    dispatchOrders(dispatch, {
      ...current,
      status,
      page: current.status === status ? current.page : 1,
    })
  }, [dispatch, status])

  const loadList = (next: Partial<OrderListQuery>) => {
    dispatchOrders(dispatch, {
      ...store.getState().orders.query,
      ...next,
    })
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      loadList({ search: value.trim(), page: 1 })
    }, 500)
  }

  const finishMutation = (close: () => void, orderId?: string) => {
    close()
    dispatch(setOrderSaving(false))
    reloadOrders(dispatch)
    if (orderId && orderId === detailId) {
      setDetailRefresh((current) => current + 1)
    }
  }

  const handleDownload = () => {
    if (rangeInvalid || exporting) return
    const current = store.getState().orders.query
    dispatch({
      type: sagaActions.GET_ORDER_REPORT,
      payload: {
        query: '/userActivities/reportDownload',
        method: 'GET',
        variables: {
          event_type: 'order',
          startDate: current.startDate,
          endDate: current.endDate,
        },
        setLoading: setExporting,
        onSuccess: (response: OrderReportResponse) => {
          const rows = readOrderReport(response.data)
          if (!rows.length) {
            toast.error('No orders to download for this date range.')
            return false
          }
          downloadOrderReport(rows, current.startDate, current.endDate)
          return false
        },
        onFailure: (message: string) => {
          toast.error(message)
        },
      },
    })
  }

  const columns: ColumnType<OrderRecord>[] = useMemo(
    () => [
      {
        key: 'date',
        label: 'Date',
        width: '1.1fr',
        isNowrap: true,
        render: (row) => (
          <span className="whitespace-nowrap text-[#1E1B4B]">
            {orderText(row.date)}
          </span>
        ),
      },
      {
        key: 'company',
        label: 'Company name',
        width: '1.8fr',
        render: (row) => (
          <b className="block truncate text-[14px] font-semibold text-[#1E1B4B]">
            {companyName(row)}
          </b>
        ),
      },
      {
        key: 'employee',
        label: 'Employee name',
        width: '1.4fr',
        render: (row) => (
          <span className="block truncate">{orderText(row.employee)}</span>
        ),
      },
      {
        key: 'value',
        label: 'Order value',
        width: '1fr',
        render: (row) => (
          <span className="text-[#1E1B4B]">
            {orderText(row.config?.gross_total)}
          </span>
        ),
      },
      {
        key: 'region',
        label: 'Region',
        width: '1.2fr',
        render: (row) => (
          <span className="block truncate">
            {orderText(row.config?.locality)}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        width: '1fr',
        render: (row) => (
          <span
            className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${statusClass(row.config?.order_status)}`}
          >
            {row.config?.order_status || 'Pending'}
          </span>
        ),
      },
    ],
    [],
  )

  const actions: ActionType<OrderRecord>[] = useMemo(
    () => [
      {
        label: 'View',
        icon: Eye,
        onClick: (row) => {
          if (!row.id) {
            toast.error('This order cannot be opened.')
            return
          }
          setDetailId(row.id)
        },
      },
      {
        label: 'Approve',
        icon: Check,
        condition: (row) => row.config?.order_status === 'Pending',
        onClick: (row) => setApproveOrder(row),
      },
      {
        label: 'Reject',
        icon: Trash2,
        variant: 'danger',
        condition: (row) => row.config?.order_status === 'Pending',
        onClick: (row) => {
          setRejectReason('')
          setRejectError('')
          setRejectOrder(row)
        },
      },
    ],
    [],
  )

  if (!status) return <Navigate to="/orders/pending" replace />

  const tabLabel = orderTabLabel(status).toLowerCase()

  return (
    <AdminLayout hideHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title="Orders"
          subtitle={
            rangeInvalid
              ? 'Choose a start date that is on or before the end date.'
              : `${total} ${tabLabel} orders`
          }
          actionLabel={exporting ? 'Downloading...' : 'Download report'}
          actionIcon={Download}
          actionDisabled={rangeInvalid || exporting}
          onAction={handleDownload}
        />

        <Toolbar
          searchValue={searchText}
          onSearchChange={handleSearch}
          searchPlaceholder="Search company or employee"
          filters={
            <>
              <div
                role="tablist"
                aria-label="Order status"
                className="inline-flex h-[44px] items-center gap-0.5 rounded-[14px] border border-white/85 bg-white/62 p-1 backdrop-blur-md"
              >
                {ORDER_TABS.map((tab) => {
                  const selected = tab.id === status
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => navigate(`/orders/${tab.path}`)}
                      className={`h-[36px] cursor-pointer rounded-[11px] px-4 text-[13px] ${
                        selected
                          ? 'bg-[#4F46E5] font-semibold text-white shadow-sm'
                          : 'font-medium text-[#312E81] hover:bg-white/45'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
              <DateField
                label="From"
                value={query.startDate}
                onChange={(startDate) => loadList({ startDate, page: 1 })}
              />
              <DateField
                label="To"
                value={query.endDate}
                onChange={(endDate) => loadList({ endDate, page: 1 })}
              />
            </>
          }
        />

        <DataTable<OrderRecord>
          columns={columns}
          data={items}
          actions={actions}
          loading={loading}
          error={rangeInvalid ? null : error || null}
          onRetry={() => reloadOrders(dispatch)}
          onRowClick={(row) => {
            if (row.id) setDetailId(row.id)
          }}
          page={query.page}
          pageSize={query.limit}
          totalItems={total}
          totalPages={total === 0 ? 0 : totalPages}
          onPageChange={(page) => loadList({ page })}
          onPageSizeChange={(limit) => loadList({ limit, page: 1 })}
          pageSizeOptions={[20, 50, 100]}
          emptyMessage={
            rangeInvalid
              ? 'Start date must be on or before the end date.'
              : `No ${tabLabel} orders for this date range.`
          }
          minWidth="1080px"
        />
      </div>

      <OrderDetailDrawer
        orderId={detailId}
        refreshToken={detailRefresh}
        onClose={() => setDetailId(null)}
        onUpdated={() => reloadOrders(dispatch)}
      />

      <Dialog
        open={Boolean(approveOrder)}
        title="Approve order"
        onClose={() => setApproveOrder(null)}
      >
        <p>
          {approveOrder
            ? `Approve the order for ${companyName(approveOrder)}?`
            : 'Approve this order?'}
        </p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setApproveOrder(null)}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] border border-[rgba(79,70,229,0.2)] bg-white/70 px-4 text-xs font-semibold text-[#312E81]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (!approveOrder?.id) return
              dispatch(setOrderSaving(true))
              dispatch({
                type: sagaActions.UPDATE_ORDER,
                payload: {
                  query: `/userActivities/status/${approveOrder.id}`,
                  method: 'PUT',
                  variables: {
                    status: 'Approved',
                    event_type: approveOrder.event_type || 'order',
                  },
                  showToast: true,
                  successMessage: 'Order approved',
                  onSuccess: () =>
                    finishMutation(
                      () => setApproveOrder(null),
                      approveOrder.id,
                    ),
                  onFailure: () => dispatch(setOrderSaving(false)),
                },
              })
            }}
            className="inline-flex h-[40px] cursor-pointer items-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(rejectOrder)}
        title="Reject order"
        label="Reject"
        loading={saving}
        onClose={() => setRejectOrder(null)}
        handleSubmit={() => {
          const reason = rejectReason.trim()
          if (!reason) {
            setRejectError('Reason is required')
            return
          }
          if (!rejectOrder?.id) return
          dispatch(setOrderSaving(true))
          dispatch({
            type: sagaActions.UPDATE_ORDER,
            payload: {
              query: `/userActivities/status/${rejectOrder.id}`,
              method: 'PUT',
              variables: {
                status: 'Rejected',
                event_type: rejectOrder.event_type || 'order',
                reason,
              },
              showToast: true,
              successMessage: 'Order rejected',
              onSuccess: () =>
                finishMutation(() => setRejectOrder(null), rejectOrder.id),
              onFailure: () => dispatch(setOrderSaving(false)),
            },
          })
        }}
      >
        <label className="block text-[13px] font-semibold text-[#1E1B4B]">
          Reason
        </label>
        <textarea
          value={rejectReason}
          onChange={(event) => {
            setRejectReason(event.target.value)
            setRejectError('')
          }}
          rows={3}
          placeholder="Why is this order rejected?"
          className="mt-2 w-full rounded-[14px] border border-white/85 bg-white/70 px-4 py-3 text-[13px] text-[#1E1B4B] outline-none focus:border-[#4F46E5]"
        />
        {rejectError ? (
          <p className="mt-2 text-xs text-error">{rejectError}</p>
        ) : null}
      </Dialog>
    </AdminLayout>
  )
}

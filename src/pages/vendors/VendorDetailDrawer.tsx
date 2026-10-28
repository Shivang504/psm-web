import { useState } from 'react'
import toast from 'react-hot-toast'
import { Eye } from 'lucide-react'
import { DateRangePicker } from '@/components/molecules/DateRangePicker'
import { Drawer } from '@/components/molecules/Drawer'
import { ProductList } from '@/pages/employee/detail/ProductList'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchVendorOrders,
  fetchVendorOrdersFailure,
  fetchVendorOrdersSuccess,
} from '@/store/slices/vendorsSlice'
import {
  downloadCsv,
  ordersToCsv,
  todayDate,
  type ActivityProduct,
  type UserActivityRecord,
} from '@/utils/employeeDetail'
import { displayName, displayValue } from '@/utils/helper'
import type { ApiResponse } from '@/utils/types'
import type { VendorRecord } from '@/utils/types'
import { readVendorConfig, readVendorOrders } from './vendorModel'

type VendorDetailDrawerProps = {
  vendor: VendorRecord | null
  onClose: () => void
  onEdit: (vendor: VendorRecord) => void
  onDelete: (vendor: VendorRecord) => void
}

function statusClass(status?: string | null) {
  if (status === 'Active') return 'bg-success-soft text-success'
  if (status === 'Inactive') return 'bg-error-soft text-error'
  return 'bg-warning-soft text-warning'
}

export function VendorDetailDrawer({
  vendor,
  onClose,
  onEdit,
  onDelete,
}: VendorDetailDrawerProps) {
  const dispatch = useAppDispatch()
  const { orders, ordersLoading, ordersError } = useAppSelector(
    (state) => state.vendors,
  )
  const [tab, setTab] = useState<'details' | 'orders'>('details')
  const [trackedId, setTrackedId] = useState(vendor?.id ?? null)
  const [range, setRange] = useState({
    start: todayDate(),
    end: todayDate(),
  })
  const [products, setProducts] = useState<ActivityProduct[] | null>(null)

  if ((vendor?.id ?? null) !== trackedId) {
    setTrackedId(vendor?.id ?? null)
    setTab('details')
    setProducts(null)
  }

  const loadOrders = (id: string, start: string, end: string) => {
    if (start > end) {
      toast.error('The start date must be on or before the end date.')
      return
    }
    dispatch(fetchVendorOrders())
    dispatch({
      type: sagaActions.GET_VENDOR_ORDERS,
      payload: {
        query: `/userActivities/user/vendor/${id}`,
        method: 'GET',
        variables: { startDate: start, endDate: end },
        onSuccess: (response: ApiResponse<{ UserActivities?: unknown }>) => {
          dispatch(
            fetchVendorOrdersSuccess(
              readVendorOrders(response.data?.UserActivities),
            ),
          )
        },
        onFailure: (message: string) => {
          dispatch(fetchVendorOrdersFailure(message))
        },
      },
    })
  }

  const config = vendor ? readVendorConfig(vendor.config) : null
  const fields = vendor
    ? [
        ['Role', displayValue(vendor.designation)],
        ['Mobile', displayValue(vendor.contact_no)],
        ['Email', displayValue(vendor.email)],
        ['Company', displayValue(config?.company)],
        ['Region', displayValue(config?.regionName)],
        ['Territory', displayValue(config?.territories)],
        ['GST number', displayValue(config?.GSTN)],
        ['Created by', displayValue(vendor.created_by)],
        ['Address', displayValue(config?.address)],
      ]
    : []

  return (
    <>
      <Drawer
        open={Boolean(vendor)}
        title={vendor ? displayName(vendor) : 'Vendor'}
        subtitle={vendor?.designation || 'Vendor details'}
        onClose={onClose}
        panelClassName="max-w-3xl"
        footer={
          vendor ? (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onEdit(vendor)}
                className="inline-flex h-10 cursor-pointer items-center rounded-[14px] bg-[#4F46E5] px-4 text-xs font-semibold text-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(vendor)}
                className="inline-flex h-10 cursor-pointer items-center rounded-[14px] border border-error-border bg-error-soft px-4 text-xs font-semibold text-error"
              >
                Delete
              </button>
            </div>
          ) : null
        }
      >
        {vendor ? (
          <div className="space-y-5">
            <div
              role="tablist"
              aria-label="Vendor sections"
              className="inline-flex h-[40px] items-center gap-0.5 rounded-[14px] border border-white/85 bg-white/62 p-1"
            >
              {(
                [
                  ['details', 'Details'],
                  ['orders', 'Orders'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => {
                    setTab(id)
                    if (id === 'orders' && !orders.length && !ordersLoading) {
                      loadOrders(vendor.id, range.start, range.end)
                    }
                  }}
                  className={`h-[32px] cursor-pointer rounded-[11px] px-4 text-[13px] ${
                    tab === id
                      ? 'bg-[#4F46E5] font-semibold text-white'
                      : 'font-medium text-[#312E81] hover:bg-white/45'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'details' ? (
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fields.map(([label, value]) => (
                  <div
                    key={label}
                    className={label === 'Address' ? 'sm:col-span-2' : ''}
                  >
                    <dt className="text-[12px] font-semibold text-[#4C4A7A]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm text-[#1E1B4B]">{value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-[12px] font-semibold text-[#4C4A7A]">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${statusClass(vendor.status)}`}
                    >
                      {vendor.status || 'Active'}
                    </span>
                  </dd>
                </div>
              </dl>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <DateRangePicker
                    startDate={range.start}
                    endDate={range.end}
                    onChange={(start, end) => {
                      setRange({ start, end })
                      loadOrders(vendor.id, start, end)
                    }}
                  />
                  <button
                    type="button"
                    disabled={!orders.length}
                    onClick={() =>
                      downloadCsv(
                        `Vendor orders ${range.start}_${range.end}.csv`,
                        ordersToCsv(orders),
                      )
                    }
                    className="inline-flex h-[44px] cursor-pointer items-center rounded-[14px] border border-white/85 bg-white/70 px-4 text-[13px] font-semibold text-[#312E81] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Download report
                  </button>
                </div>
                {ordersLoading ? (
                  <p className="text-sm text-[#4C4A7A]">Loading orders...</p>
                ) : ordersError ? (
                  <p className="text-sm text-error">{ordersError}</p>
                ) : orders.length ? (
                  <OrderTable orders={orders} onViewProducts={setProducts} />
                ) : (
                  <p className="text-sm text-[#4C4A7A]">
                    No orders for this date range.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Drawer>
      {products ? (
        <ProductList products={products} onClose={() => setProducts(null)} />
      ) : null}
    </>
  )
}

function OrderTable({
  orders,
  onViewProducts,
}: {
  orders: UserActivityRecord[]
  onViewProducts: (products: ActivityProduct[]) => void
}) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-white/85 bg-white/50">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead className="text-[#4338CA]">
          <tr>
            <th className="px-3 py-3 font-semibold">Date</th>
            <th className="px-3 py-3 font-semibold">Company</th>
            <th className="px-3 py-3 font-semibold">Total</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((row, index) => (
            <tr
              key={row.id || index}
              className="border-t border-[rgba(79,70,229,0.12)]"
            >
              <td className="px-3 py-3 text-[#1E1B4B]">{row.date || '—'}</td>
              <td className="px-3 py-3 text-[#4C4A7A]">
                {row.config?.buyer_company_name ||
                  row.config?.company_name ||
                  '—'}
              </td>
              <td className="px-3 py-3 text-[#1E1B4B]">
                {row.config?.gross_total ?? '—'}
              </td>
              <td className="px-3 py-3 text-[#4C4A7A]">
                {row.config?.order_status || 'Pending'}
              </td>
              <td className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => onViewProducts(row.config?.products ?? [])}
                  className="inline-flex cursor-pointer items-center gap-1 text-[#4F46E5]"
                >
                  <Eye className="size-3.5" />
                  Products
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import { downloadCsv, ordersToCsv } from '@/utils/employeeDetail'
import type {
  LeadProduct,
  OrderListQuery,
  OrderListResponse,
  OrderProduct,
  OrderRecord,
  OrderReportResponse,
  OrderTab,
} from '@/utils/types'

export const ORDER_TABS: { id: OrderTab; path: string; label: string }[] = [
  { id: 'pending', path: 'pending', label: 'Pending' },
  { id: 'confirm', path: 'confirm', label: 'Approved' },
  { id: 'reject', path: 'reject', label: 'Rejected' },
  { id: 'cancel', path: 'cancel', label: 'Cancelled' },
  { id: 'all', path: 'all', label: 'All' },
]

const STATUS_BY_TAB: Record<OrderTab, string | undefined> = {
  pending: 'Pending',
  confirm: 'Approved',
  reject: 'Rejected',
  cancel: 'Cancelled',
  all: undefined,
}

export const ORDER_TAB_PARAM: Record<string, OrderTab> = {
  pending: 'pending',
  confirm: 'confirm',
  reject: 'reject',
  cancel: 'cancel',
  all: 'all',
}

export function orderTabLabel(status: OrderTab) {
  return ORDER_TABS.find((tab) => tab.id === status)?.label ?? 'Orders'
}

export function orderListParams(query: OrderListQuery) {
  const params: Record<string, string | number> = {
    event_type: 'order',
    startDate: query.startDate,
    endDate: query.endDate,
    page: query.page,
    limit: query.limit,
  }
  const status = STATUS_BY_TAB[query.status]
  if (status) params.status = status
  const search = query.search.trim()
  if (search) params.searchText = search
  return params
}

export function readOrderList(data: OrderListResponse['data']) {
  const activities = data?.UserActivities
  const items = Array.isArray(activities?.order) ? activities.order : []
  return {
    items,
    total: activities?.totalRowsValue ?? 0,
  }
}

export function readOrderDetail(
  activities: OrderRecord | OrderRecord[] | undefined,
) {
  if (!activities) return null
  if (Array.isArray(activities)) return activities[0] ?? null
  return activities
}

export function readOrderReport(data: OrderReportResponse['data']) {
  const activities = data?.UserActivities
  if (Array.isArray(activities)) return activities
  if (activities && Array.isArray(activities.order)) return activities.order
  return []
}

export function orderText(value?: string | number | null) {
  if (value == null) return '—'
  const text = String(value).trim()
  return text || '—'
}

export function companyName(order: OrderRecord) {
  return (
    order.config?.buyer_company_name?.trim() ||
    order.config?.company_name?.trim() ||
    '—'
  )
}

export function orderReason(order: OrderRecord) {
  return (
    order.reason?.trim() ||
    order.config?.reason?.trim() ||
    order.config?.Reason?.trim() ||
    ''
  )
}

export function toNumber(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function productLineId(product: OrderProduct) {
  return product.product_id ?? product.id ?? ''
}

export function productToApi(product: OrderProduct) {
  return {
    product_id: product.product_id ?? product.id,
    quantity: toNumber(product.quantity, 0),
    price: String(product.price ?? ''),
    total_price: String(product.total_price ?? ''),
  }
}

export function orderConfigPayload(
  order: OrderRecord,
  products: OrderProduct[],
) {
  return {
    config: {
      order_status: order.config?.order_status || '',
      products: products
        .map(productToApi)
        .filter((product) => product.product_id),
    },
  }
}

export function activeCatalog(products: LeadProduct[]) {
  return products.filter(
    (item) =>
      !item.status || item.status === 'Active' || item.status === 'active',
  )
}

export function downloadOrderReport(
  orders: OrderRecord[],
  startDate: string,
  endDate: string,
) {
  downloadCsv(`Order Report ${startDate}_${endDate}.csv`, ordersToCsv(orders))
}

export function statusClass(status?: string) {
  if (status === 'Approved') return 'bg-success-soft text-success'
  if (status === 'Rejected' || status === 'Cancelled') {
    return 'bg-error-soft text-error'
  }
  return 'bg-warning-soft text-warning'
}

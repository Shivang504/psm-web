import type { ApiResponse } from '@/utils/types'

export interface ActivityProduct {
  product_name?: string
  quantity?: number | string
  price?: number | string
  total_price?: number | string
}

export interface EmployeeActivityDetails {
  start_time?: string
  is_vehicle?: string | number
  files?: {
    selfie_fileName?: string
    meter_image_fileName?: string
  }
  meter_no?: string | number
  locality?: string
  address?: string
  buyer_designation?: string
  buyer_name?: string
  buyer_company_name?: string
  buyer_address?: string
  order_status?: string
  gross_total?: number | string
  products?: ActivityProduct[]
  is_out_side_route?: number | boolean
  random_image?: string
  meeting_with?: string
  notes?: string
  followup_description?: string
  followup_date?: string
}

export interface EmployeeActivityItem {
  event_type?: string
  activity?: EmployeeActivityDetails
}

export interface ActivityStats {
  total_count: number
  orderApproved: number
  revenueCount: number | string
  google_distance: number
  is_vehicle: number
  total_distance: number | string
}

export interface TrackingPoint {
  lat: number
  lng: number
  markerFlag?: number
  type?: number
}

export interface EmployeeActivityPayload {
  items: EmployeeActivityItem[]
  stats: ActivityStats
  tracking: TrackingPoint[]
}

export interface UserActivityConfig {
  buyer_name?: string
  buyer_designation?: string
  buyer_company_name?: string
  company_name?: string
  notes?: string
  followup_description?: string
  followup_date?: string
  gross_total?: number | string
  order_status?: string
  products?: ActivityProduct[]
  start_time?: string
}

export interface UserActivityRecord {
  id?: string
  date?: string
  employee?: string
  config?: UserActivityConfig
}

interface EmployeeHistory {
  activities?: EmployeeActivityItem[]
  total_count?: number
  orderApproved?: number
  revenueCount?: number | string
  google_distance?: number
  is_vehicle?: number
  total_distance?: number | string
  live_tracking?: unknown
}

export interface EmployeeHistoryData {
  history?: EmployeeHistory
}

export interface UserActivitiesData {
  UserActivities?: UserActivityRecord[]
}

export interface TrackingData {
  locations?: unknown
}

const emptyStats: ActivityStats = {
  total_count: 0,
  orderApproved: 0,
  revenueCount: 0,
  google_distance: 0,
  is_vehicle: 0,
  total_distance: 0,
}

export function todayDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function isVehicleMode(value?: string | number) {
  return value === 1 || value === '1'
}

export function formatActivityTime(startTime?: string) {
  if (!startTime || startTime.length < 16) return ''

  const [hourPart, minutes] = startTime.slice(10, 16).split(':')
  let hours = Number(hourPart)
  if (!Number.isFinite(hours) || minutes === undefined) return ''

  const suffix = hours >= 12 ? 'PM' : 'AM'
  if (hours === 0) hours = 12
  else if (hours > 12) hours -= 12

  return `${hours}:${minutes} ${suffix}`
}

function readNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function coordinateFromPair(first: unknown, second: unknown) {
  const primaryLat = readNumber(first)
  const primaryLng = readNumber(second)
  if (
    primaryLat !== null &&
    primaryLng !== null &&
    Math.abs(primaryLat) <= 90 &&
    Math.abs(primaryLng) <= 180
  ) {
    return { lat: primaryLat, lng: primaryLng }
  }

  if (
    primaryLat !== null &&
    primaryLng !== null &&
    Math.abs(primaryLng) <= 90 &&
    Math.abs(primaryLat) <= 180
  ) {
    return { lat: primaryLng, lng: primaryLat }
  }

  return null
}

function parseCoordinate(entry: unknown): TrackingPoint | null {
  if (Array.isArray(entry)) return coordinateFromPair(entry[0], entry[1])
  if (!entry || typeof entry !== 'object') return null

  const record = entry as Record<string, unknown>
  const location =
    record.location && typeof record.location === 'object'
      ? (record.location as Record<string, unknown>)
      : undefined
  const pair = coordinateFromPair(
    record.lat ?? record.latitude ?? location?.lat ?? location?.latitude,
    record.long ??
      record.lng ??
      record.lon ??
      record.longitude ??
      location?.long ??
      location?.lng,
  )
  if (!pair) return null

  return {
    ...pair,
    markerFlag: readNumber(record.marker_flag) ?? undefined,
    type: readNumber(record.type) ?? undefined,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function flattenEntries(source: unknown, depth = 0): unknown[] {
  if (source == null || depth > 8) return []
  if (Array.isArray(source)) {
    return source.flatMap((entry) => flattenEntries(entry, depth + 1))
  }
  if (!isRecord(source)) return []

  const nested = [
    source.tracking,
    source.config,
    source.locations,
    source.path,
    source.route,
    source.points,
  ].filter((value) => value != null)

  if (nested.length) {
    return nested.flatMap((value) => flattenEntries(value, depth + 1))
  }

  const groups = Object.values(source).filter((value) => Array.isArray(value))
  if (groups.length) {
    return groups.flatMap((value) => flattenEntries(value, depth + 1))
  }

  return [source]
}

function trackingTime(entry: unknown) {
  if (!isRecord(entry)) return 0
  const raw = entry.start_time ?? entry.timestamp ?? entry.time
  if (typeof raw !== 'string' || !raw.trim()) return 0
  const parsed = Date.parse(raw.includes('T') ? raw : raw.replace(' ', 'T'))
  return Number.isFinite(parsed) ? parsed : 0
}

export function collectTrackingPoints(source: unknown) {
  const points: TrackingPoint[] = []
  const entries = flattenEntries(source).sort(
    (left, right) => trackingTime(left) - trackingTime(right),
  )

  entries.forEach((entry) => {
    const point = parseCoordinate(entry)
    if (point) points.push(point)
  })
  return points
}

export function mapHistory(
  response: ApiResponse<EmployeeHistoryData>,
): EmployeeActivityPayload {
  const history = response.data?.history
  const live = Array.isArray(history?.live_tracking)
    ? history.live_tracking[0]
    : history?.live_tracking

  return {
    items: Array.isArray(history?.activities) ? history.activities : [],
    stats: {
      ...emptyStats,
      total_count: history?.total_count ?? 0,
      orderApproved: history?.orderApproved ?? 0,
      revenueCount: history?.revenueCount ?? 0,
      google_distance: Number(history?.google_distance ?? 0),
      is_vehicle: history?.is_vehicle ?? 0,
      total_distance: history?.total_distance ?? 0,
    },
    tracking: collectTrackingPoints(live),
  }
}

export function mapUserActivities(response: ApiResponse<UserActivitiesData>) {
  const items = response.data?.UserActivities
  return Array.isArray(items) ? items : []
}

export function mapTracking(response: ApiResponse<TrackingData>) {
  return collectTrackingPoints(response.data?.locations)
}

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value)
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

export function ordersToCsv(orders: UserActivityRecord[]) {
  const header = [
    'date',
    'product_name',
    'quantity',
    'price',
    'total_price',
    'company_name',
    'order_status',
  ]
  const rows = orders.flatMap((order) => {
    const products = order.config?.products ?? []
    const date = order.config?.start_time?.slice(0, 10) || order.date || ''
    return products.map((product) => [
      date,
      product.product_name,
      product.quantity,
      product.price,
      product.total_price,
      order.config?.company_name || order.config?.buyer_company_name,
      order.config?.order_status,
    ])
  })

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

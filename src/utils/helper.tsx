import type {
  AttendanceReportData,
  AttendanceReportQuery,
  AttendanceReportRow,
  UserListItem,
} from './types'

export function displayValue(value?: string | null) {
  const text = value?.trim()
  return text || '—'
}

export function attendanceLabel(attendance?: number | null) {
  if (attendance === 1) return 'Present'
  if (attendance === 0) return 'Absent'
  return '—'
}

export function displayName(user: UserListItem) {
  const fullName = user.full_name?.trim()
  if (fullName) return fullName

  const name = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return name || '—'
}

export function todayDateInput() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function attendanceReportParams(
  query: AttendanceReportQuery,
  options?: { paginate?: boolean },
) {
  const params: Record<string, string | number> = {
    startDate: query.startDate,
    endDate: query.endDate,
  }

  if (options?.paginate !== false) {
    params.page = query.page
    params.limit = query.limit
  }

  const search = query.search.trim()
  if (search.length >= 3) params.searchText = search

  return params
}

export function readAttendanceReport(data?: AttendanceReportData) {
  const attendance = data?.Attendance
  const items = attendance?.attendanceList ?? []
  const total =
    attendance?.totalRowsValue ??
    attendance?.total ??
    attendance?.count ??
    items.length

  return { items, total }
}

export function attendanceEmployeeName(row: AttendanceReportRow) {
  const employee = row.employee?.trim()
  if (employee) return employee

  const name = [row.first_name, row.last_name].filter(Boolean).join(' ').trim()

  return name || '—'
}

export function attendanceStatus(row: AttendanceReportRow) {
  return row.Attdance?.trim() || row.attendance?.trim() || ''
}

export function formatMeter(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '0'
  return String(value)
}

export function formatGoogleKm(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '0'
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2) : '0'
}

function sortValue(row: AttendanceReportRow, key: string) {
  switch (key) {
    case 'employeeCode':
      return row.config?.employeeCode ?? ''
    case 'region':
      return row.config?.regionName ?? ''
    case 'state':
      return row.config?.state ?? ''
    case 'contact_no':
      return row.contact_no ?? ''
    case 'date':
      return row.date ?? ''
    case 'startMeter':
      return Number(row.startMeter) || 0
    case 'endMeter':
      return Number(row.endMeter) || 0
    case 'difference':
      return Number(row.difference) || 0
    case 'googleDistance':
      return Number(row.googleDistance) || 0
    case 'attendance':
      return attendanceStatus(row)
    default:
      return attendanceEmployeeName(row)
  }
}

export function sortAttendanceRows(
  rows: AttendanceReportRow[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
) {
  const direction = sortOrder === 'asc' ? 1 : -1

  return [...rows].sort((left, right) => {
    const a = sortValue(left, sortBy)
    const b = sortValue(right, sortBy)

    if (typeof a === 'number' && typeof b === 'number') {
      return (a - b) * direction
    }

    return (
      String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * direction
    )
  })
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function downloadAttendanceReport(
  rows: AttendanceReportRow[],
  startDate: string,
  endDate: string,
) {
  const header = [
    'Name',
    'employeeCode',
    'Mobile_No',
    'Region',
    'state',
    'Date',
    'Start_Day_km',
    'End_Day_Km',
    'Difference_Km',
    'Google_Km',
    'Attendance',
  ]

  const lines = rows.map((row) =>
    [
      attendanceEmployeeName(row),
      row.config?.employeeCode ?? '',
      row.contact_no ?? '',
      row.config?.regionName ?? '',
      row.config?.state ?? '',
      row.date ?? '',
      formatMeter(row.startMeter),
      formatMeter(row.endMeter),
      formatMeter(row.difference),
      formatGoogleKm(row.googleDistance),
      attendanceStatus(row),
    ]
      .map((value) => csvCell(value))
      .join(','),
  )

  const csv = `\uFEFF${[header.join(','), ...lines].join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Attendance Report ${startDate} to ${endDate}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year || 1970, (month || 1) - 1, day || 1)
}

export function formatIso(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function formatDisplay(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}-${month}-${year}`
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function presetRange(id: PresetId) {
  const today = startOfToday()
  if (id === 'today') {
    const iso = formatIso(today)
    return { start: iso, end: iso }
  }
  if (id === 'yesterday') {
    const iso = formatIso(addDays(today, -1))
    return { start: iso, end: iso }
  }
  if (id === 'last7') {
    return { start: formatIso(addDays(today, -6)), end: formatIso(today) }
  }
  if (id === 'last30') {
    return { start: formatIso(addDays(today, -29)), end: formatIso(today) }
  }
  if (id === 'thisMonth') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { start: formatIso(start), end: formatIso(end) }
  }
  if (id === 'lastMonth') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return { start: formatIso(start), end: formatIso(end) }
  }
  return null
}
type PresetId =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom'

export function matchPreset(start: string, end: string): PresetId {
  const ids: PresetId[] = [
    'today',
    'yesterday',
    'last7',
    'last30',
    'thisMonth',
    'lastMonth',
  ]
  for (const id of ids) {
    const range = presetRange(id)
    if (range && range.start === start && range.end === end) return id
  }
  return 'custom'
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

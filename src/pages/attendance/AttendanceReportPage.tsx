import { Download } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Avatar } from '@/components/atoms/Avatar'
import { StatusPill } from '@/components/atoms/StatusPill'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toolbar } from '@/components/layout/Toolbar'
import { DataTable, type ColumnType } from '@/components/molecules/DataTable'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { sagaActions } from '@/store/actions'
import { store, type AppDispatch } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchAttendanceReport,
  fetchAttendanceReportFailure,
  fetchAttendanceReportSuccess,
} from '@/store/slices/attendanceReportSlice'
import {
  attendanceEmployeeName,
  attendanceReportParams,
  attendanceStatus,
  displayValue,
  downloadAttendanceReport,
  formatGoogleKm,
  formatMeter,
  readAttendanceReport,
  sortAttendanceRows,
} from '@/utils/helper'
import type {
  AttendanceReportQuery,
  AttendanceReportResponse,
  AttendanceReportRow,
} from '@/utils/types'

function dispatchAttendanceReport(
  dispatch: AppDispatch,
  nextQuery: AttendanceReportQuery,
) {
  dispatch(fetchAttendanceReport(nextQuery))
  if (nextQuery.startDate > nextQuery.endDate) return

  dispatch({
    type: sagaActions.GET_EMPLOYEE_ATTENDANCE,
    payload: {
      query: '/attendance/report',
      method: 'GET',
      variables: attendanceReportParams(nextQuery),
      onSuccess: (response: AttendanceReportResponse) => {
        dispatch(
          fetchAttendanceReportSuccess(readAttendanceReport(response.data)),
        )
      },
      onFailure: (message: string) => {
        dispatch(fetchAttendanceReportFailure(message))
      },
    },
  })
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

export default function AttendanceReportPage() {
  const dispatch = useAppDispatch()
  const { items, total, loading, error, query } = useAppSelector(
    (state) => state.attendanceReport,
  )
  const [searchText, setSearchText] = useState(query.search)
  const [exporting, setExporting] = useState(false)
  const [sortBy, setSortBy] = useState('employee')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const searchTimer = useRef<number | null>(null)
  const totalPages = Math.ceil(total / query.limit)
  const rangeInvalid = query.startDate > query.endDate

  useEffect(() => {
    dispatchAttendanceReport(dispatch, store.getState().attendanceReport.query)

    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current)
    }
  }, [dispatch])

  const loadReport = (next: Partial<AttendanceReportQuery>) => {
    const current = store.getState().attendanceReport.query
    dispatchAttendanceReport(dispatch, { ...current, ...next })
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)

    searchTimer.current = window.setTimeout(() => {
      const current = store.getState().attendanceReport.query
      const trimmed = value.trim()
      const search = trimmed.length >= 3 ? trimmed : ''
      if (search === current.search) return

      dispatchAttendanceReport(dispatch, {
        ...current,
        search,
        page: 1,
      })
    }, 500)
  }

  const handleDownload = () => {
    if (rangeInvalid || exporting) return

    const current = store.getState().attendanceReport.query
    dispatch({
      type: sagaActions.GET_EMPLOYEE_ATTENDANCE_EXPORT,
      payload: {
        query: '/attendance/report',
        method: 'GET',
        variables: attendanceReportParams(current, { paginate: false }),
        setLoading: setExporting,
        onSuccess: (response: AttendanceReportResponse) => {
          const { items: rows } = readAttendanceReport(response.data)
          if (!rows.length) {
            toast.error(
              'No attendance records to download for this date range.',
            )
            return false
          }

          downloadAttendanceReport(rows, current.startDate, current.endDate)
          return false
        },
        onFailure: (message: string) => {
          toast.error(message)
        },
      },
    })
  }

  const rows = useMemo(
    () => sortAttendanceRows(items, sortBy, sortOrder),
    [items, sortBy, sortOrder],
  )

  const columns: ColumnType<AttendanceReportRow>[] = useMemo(
    () => [
      {
        key: 'employee',
        label: 'Name',
        sortable: true,
        width: '2.2fr',
        render: (row) => {
          const name = attendanceEmployeeName(row)
          return (
            <div className="flex min-w-0 items-center gap-3 pr-2">
              <Avatar name={name} />
              <b className="block truncate text-[14px] font-semibold text-[#1E1B4B]">
                {name}
              </b>
            </div>
          )
        },
      },
      {
        key: 'employeeCode',
        label: 'Code',
        sortable: true,
        width: '1.1fr',
        render: (row) => (
          <span className="text-[12px] text-[#4C4A7A]">
            {displayValue(row.config?.employeeCode)}
          </span>
        ),
      },
      {
        key: 'contact_no',
        label: 'Mobile No',
        sortable: true,
        width: '1.2fr',
        render: (row) => (
          <span className="block truncate text-[#1E1B4B]">
            {displayValue(row.contact_no)}
          </span>
        ),
      },
      {
        key: 'region',
        label: 'Region',
        sortable: true,
        width: '1.2fr',
        render: (row) => {
          const region = displayValue(row.config?.regionName)
          return (
            <span className="block truncate text-[#1E1B4B]" title={region}>
              {region}
            </span>
          )
        },
      },
      {
        key: 'state',
        label: 'State',
        sortable: true,
        width: '1fr',
        render: (row) => {
          const state = displayValue(row.config?.state)
          return (
            <span className="block truncate text-[#1E1B4B]" title={state}>
              {state}
            </span>
          )
        },
      },
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        isNowrap: true,
        width: '1.1fr',
        render: (row) => (
          <span className="whitespace-nowrap text-[#1E1B4B]">
            {displayValue(row.date)}
          </span>
        ),
      },
      {
        key: 'startMeter',
        label: 'Start Day KM',
        sortable: true,
        width: '1.1fr',
        render: (row) => (
          <span className="text-[#1E1B4B]">{formatMeter(row.startMeter)}</span>
        ),
      },
      {
        key: 'endMeter',
        label: 'End Day KM',
        sortable: true,
        width: '1.1fr',
        render: (row) => (
          <span className="text-[#1E1B4B]">{formatMeter(row.endMeter)}</span>
        ),
      },
      {
        key: 'difference',
        label: 'Diff. KM',
        sortable: true,
        width: '0.9fr',
        render: (row) => (
          <span className="text-[#1E1B4B]">{formatMeter(row.difference)}</span>
        ),
      },
      {
        key: 'googleDistance',
        label: 'G-KM',
        sortable: true,
        width: '0.8fr',
        render: (row) => (
          <span className="text-[#1E1B4B]">
            {formatGoogleKm(row.googleDistance)}
          </span>
        ),
      },
      {
        key: 'attendance',
        label: 'Attendance',
        sortable: true,
        width: '1.1fr',
        render: (row) => <StatusPill status={attendanceStatus(row)} />,
      },
    ],
    [],
  )

  return (
    <AdminLayout hideHeader={true}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <PageHeader
          title="Attendance report"
          subtitle={
            rangeInvalid
              ? 'Choose a start date that is on or before the end date.'
              : `${total} records from ${query.startDate} to ${query.endDate}`
          }
          actionLabel={exporting ? 'Downloading...' : 'Download report'}
          actionIcon={Download}
          actionDisabled={rangeInvalid || exporting}
          onAction={handleDownload}
        />

        <Toolbar
          searchValue={searchText}
          onSearchChange={handleSearch}
          searchPlaceholder="Search name or mobile"
          filters={
            <>
              <DateField
                label="From"
                value={query.startDate}
                onChange={(startDate) => loadReport({ startDate, page: 1 })}
              />
              <DateField
                label="To"
                value={query.endDate}
                onChange={(endDate) => loadReport({ endDate, page: 1 })}
              />
            </>
          }
        />

        <DataTable<AttendanceReportRow>
          columns={columns}
          data={rows}
          loading={loading}
          error={rangeInvalid ? null : error || null}
          onRetry={() =>
            dispatchAttendanceReport(
              dispatch,
              store.getState().attendanceReport.query,
            )
          }
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(column) => {
            setSortOrder((current) =>
              sortBy === column && current === 'asc' ? 'desc' : 'asc',
            )
            setSortBy(column)
          }}
          page={query.page}
          pageSize={query.limit}
          totalItems={total}
          totalPages={total === 0 ? 0 : totalPages}
          onPageChange={(page) => loadReport({ page })}
          onPageSizeChange={(limit) => loadReport({ limit, page: 1 })}
          emptyMessage={
            rangeInvalid
              ? 'Start date must be on or before the end date.'
              : 'No attendance records for this date range.'
          }
          minWidth="1280px"
        />
      </div>
    </AdminLayout>
  )
}

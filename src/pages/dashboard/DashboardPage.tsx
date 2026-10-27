import {
  AlertCircle,
  Briefcase,
  Building2,
  CalendarCheck,
  Clock,
  IndianRupee,
  Package,
  RefreshCw,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Skeleton } from '@/components/atoms/Skeleton'
import { StatusPill } from '@/components/atoms/StatusPill'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { StartDayModal } from '@/components/organisms/StartDayModal'
import { sagaActions } from '@/store/actions'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchAttendanceFailure,
  fetchAttendanceStart,
  fetchAttendanceSuccess,
  fetchDashboardFailure,
  fetchDashboardStart,
  fetchDashboardSuccess,
} from '@/store/slices/dashboardSlice'
import type { DashboardResponse, TodayAttendanceResponse } from '@/utils/types'

export default function DashboardPage() {
  const dispatch = useAppDispatch()

  const [startDayModalOpen, setStartDayModalOpen] = useState(false)
  const [endDayModalOpen, setEndDayModalOpen] = useState(false)

  // Profile data from Redux
  const profile = useAppSelector((state) => state.profile.profile)
  const profileLoading = useAppSelector((state) => state.profile.loading)

  // Dashboard data & attendance from Redux
  const dashboardData = useAppSelector((state) => state.dashboard.data)
  const dashboardLoading = useAppSelector((state) => state.dashboard.loading)
  const dashboardError = useAppSelector((state) => state.dashboard.error)

  const attendance = useAppSelector((state) => state.dashboard.attendance)
  const attendanceLoading = useAppSelector(
    (state) => state.dashboard.attendanceLoading,
  )

  const isDayStarted = Number(attendance?.is_start) === 1
  const isDayEnded = Number(attendance?.is_end) === 1

  // Load / Refresh dashboard & attendance data
  const loadDashboardData = useCallback(() => {
    // 1. Call /api/dashboard
    dispatch(fetchDashboardStart())
    dispatch({
      type: sagaActions.GET_DASHBOARD,
      payload: {
        query: '/api/dashboard',
        method: 'GET',
        onSuccess: (res: DashboardResponse) => {
          if (res.data) {
            dispatch(fetchDashboardSuccess(res.data))
          }
        },
        onFailure: (err: string) => {
          dispatch(fetchDashboardFailure(err))
        },
      },
    })

    // 2. Call /api/attendance to check today's start-day status
    dispatch(fetchAttendanceStart())
    dispatch({
      type: sagaActions.GET_TODAY_ATTENDANCE,
      payload: {
        query: '/api/attendance',
        method: 'GET',
        onSuccess: (res: TodayAttendanceResponse) => {
          if (res.data) {
            dispatch(fetchAttendanceSuccess(res.data))
          }
        },
        onFailure: () => {
          dispatch(fetchAttendanceFailure())
        },
      },
    })
  }, [dispatch])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // Personalized Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const employeeFullName = useMemo(() => {
    if (!profile) return 'Employee'
    const name = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ')
      .trim()
    return name || profile.contact_no || 'Employee'
  }, [profile])

  const formattedOrderValue = useMemo(() => {
    const rawVal = dashboardData?.total_order_value
    const num = Number(rawVal)
    if (isNaN(num)) return '₹0.00'
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }, [dashboardData?.total_order_value])

  const orderCountDisplay = useMemo(() => {
    if (
      dashboardData?.order_count === undefined ||
      dashboardData?.order_count === null
    ) {
      return '0'
    }
    return String(dashboardData.order_count)
  }, [dashboardData?.order_count])

  const todayFormattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [])

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of today's field performance, orders, and attendance."
      headerAction={
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDashboardData}
            title="Refresh dashboard data"
            aria-label="Refresh dashboard data"
            className="inline-flex size-[44px] cursor-pointer items-center justify-center rounded-[14px] border border-white/85 bg-white/70 text-[#312E81] transition hover:bg-white hover:text-[#4F46E5] shadow-xs active:scale-95"
          >
            <RefreshCw
              className={`size-4.5 ${dashboardLoading || attendanceLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-8">
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-gradient-to-br from-white/90 via-[#EEF2FF]/70 to-[#FDF4FF]/60 p-6 md:p-8 backdrop-blur-2xl shadow-[0_12px_36px_-10px_rgba(30,27,75,0.12)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-4">
              <Avatar
                name={employeeFullName}
                className="size-16 rounded-[20px] text-xl font-bold shadow-md shadow-[#4F46E5]/20 ring-4 ring-white"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1E1B4B]">
                    {greeting}, {employeeFullName}!
                  </h1>
                  {profile?.role && (
                    <Badge variant="role">{profile.role}</Badge>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-[13px] font-medium text-[#4C4A7A]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#4F46E5]" />
                    {todayFormattedDate}
                  </span>
                  {profile?.company_name && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-[#4F46E5]" />
                      {profile.company_name}
                    </span>
                  )}
                  {profile?.designation && (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-[#4F46E5]" />
                      {profile.designation}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Shift Status Pill in Banner */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isDayEnded ? (
                <div className="flex items-center gap-2.5 rounded-[16px] border border-[#4F46E5]/15 bg-[#EEF2FF]/80 px-4 py-2.5 text-xs font-semibold text-[#312E81]">
                  <Moon className="size-3.5" />
                  <span>Day Ended</span>
                </div>
              ) : isDayStarted ? (
                <>
                  <div className="flex items-center gap-2.5 rounded-[16px] border border-[#16A34A]/20 bg-[#DCFCE7]/80 px-4 py-2.5 text-xs font-semibold text-[#166534]">
                    <span className="size-2 rounded-full bg-[#16A34A] animate-pulse" />
                    <span>Shift Active & Logged Today</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEndDayModalOpen(true)}
                    className="inline-flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#1E1B4B] px-5 text-[14px] font-semibold text-white shadow-md shadow-[#1E1B4B]/20 transition hover:bg-[#312E81] active:scale-[0.99] md:hidden"
                  >
                    <Moon className="size-4" />
                    <span>End Day</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="hidden items-center gap-2.5 rounded-[16px] border border-[#4F46E5]/15 bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#4C4A7A] md:flex">
                    <Sun className="size-3.5 text-[#4F46E5]" />
                    <span>Day not started</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStartDayModalOpen(true)}
                    className="inline-flex h-[44px] cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#4F46E5] px-5 text-[14px] font-semibold text-white shadow-md shadow-[#4F46E5]/25 transition hover:bg-[#4338CA] active:scale-[0.99] md:hidden"
                  >
                    <Sun className="size-4" />
                    <span>Start Day Now</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Decorative blur backdrop orb */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-gradient-to-br from-[#4F46E5]/10 to-[#F43F5E]/10 blur-2xl" />
        </div>

        {/* Stats & Key Performance Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Today's Orders */}
          <div className="glass-card flex flex-col justify-between p-5.5 transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#4C4A7A]">
                Today's Orders
              </span>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#EEF2FF] text-[#4F46E5]">
                <Package className="size-5" />
              </div>
            </div>

            <div className="mt-4">
              {dashboardLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#1E1B4B] tabular-nums">
                    {orderCountDisplay}
                  </span>
                  <span className="text-xs font-medium text-[#4C4A7A]">
                    orders booked
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-[rgba(79,70,229,0.1)] pt-3 text-[11px] font-medium text-[#4C4A7A]">
              Daily order count
            </div>
          </div>

          {/* 2. Total Order Value */}
          <div className="glass-card flex flex-col justify-between p-5.5 transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#4C4A7A]">
                Total Order Value
              </span>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#DCFCE7] text-[#16A34A]">
                <IndianRupee className="size-5" />
              </div>
            </div>

            <div className="mt-4">
              {dashboardLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] tabular-nums truncate">
                    {formattedOrderValue}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-[rgba(79,70,229,0.1)] pt-3 text-[11px] font-medium text-[#4C4A7A]">
              Gross revenue generated today
            </div>
          </div>

          {/* 3. Daily Attendance Status */}
          <div className="glass-card flex flex-col justify-between p-5.5 transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#4C4A7A]">
                Attendance Status
              </span>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#FDF4FF] text-[#C026D3]">
                <CalendarCheck className="size-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              {attendanceLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <StatusPill
                  status={isDayStarted ? 1 : 0}
                  label={
                    isDayEnded
                      ? 'Day Ended'
                      : isDayStarted
                        ? 'Present (Day Started)'
                        : 'Not Started'
                  }
                />
              )}
            </div>

            <div className="mt-4 border-t border-[rgba(79,70,229,0.1)] pt-3 text-[11px] font-medium text-[#4C4A7A]">
              {isDayEnded
                ? 'Day closed for today'
                : isDayStarted
                  ? 'Attendance confirmed for today'
                  : 'Pending start day check-in'}
            </div>
          </div>

          {/* 4. Employee Designation / Position */}
          <div className="glass-card flex flex-col justify-between p-5.5 transition duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#4C4A7A]">
                Designation & Role
              </span>
              <div className="flex size-10 items-center justify-center rounded-[12px] bg-[#FEF3C7] text-[#D97706]">
                <ShieldCheck className="size-5" />
              </div>
            </div>

            <div className="mt-4">
              {profileLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div>
                  <h4 className="text-[16px] font-bold text-[#1E1B4B] truncate">
                    {profile?.designation || 'Staff Member'}
                  </h4>
                  <p className="text-[12px] text-[#4C4A7A]">
                    {profile?.role || 'PSM Team'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-[rgba(79,70,229,0.1)] pt-3 text-[11px] font-medium text-[#4C4A7A]">
              Role: {profile?.role || 'Authorized User'}
            </div>
          </div>
        </div>

        {/* Detailed Sections: Employee Information & Operations Overview */}

        {/* Error notification if API failed */}
        {dashboardError && (
          <div className="flex items-center justify-between rounded-[16px] border border-[#DC2626]/20 bg-[#FEE2E2]/80 px-4 py-3 text-[13px] text-[#991B1B]">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>Dashboard API notice: {dashboardError}</span>
            </div>
            <button
              type="button"
              onClick={loadDashboardData}
              className="text-xs font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Start Day Modal */}
      <StartDayModal
        open={startDayModalOpen}
        onClose={() => setStartDayModalOpen(false)}
        onSuccess={() => {
          loadDashboardData()
        }}
      />
      <StartDayModal
        purpose="end"
        open={endDayModalOpen}
        onClose={() => setEndDayModalOpen(false)}
        onSuccess={() => {
          loadDashboardData()
        }}
      />
    </AdminLayout>
  )
}

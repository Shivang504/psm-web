import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DashboardData, TodayAttendanceData } from '../../utils/types'
import { logout } from './authSlice'

export interface DashboardState {
  data: DashboardData | null
  attendance: TodayAttendanceData | null
  loading: boolean
  attendanceLoading: boolean
  startDayLoading: boolean
  endDayLoading: boolean
  error: string | null
  startDayError: string | null
  endDayError: string | null
}

const initialState: DashboardState = {
  data: null,
  attendance: null,
  loading: false,
  attendanceLoading: false,
  startDayLoading: false,
  endDayLoading: false,
  error: null,
  startDayError: null,
  endDayError: null,
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchDashboardSuccess: (state, action: PayloadAction<DashboardData>) => {
      state.loading = false
      state.error = null
      state.data = action.payload
    },
    fetchDashboardFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    fetchAttendanceStart: (state) => {
      state.attendanceLoading = true
    },
    fetchAttendanceSuccess: (
      state,
      action: PayloadAction<TodayAttendanceData>,
    ) => {
      state.attendanceLoading = false
      state.attendance = action.payload
    },
    fetchAttendanceFailure: (state) => {
      state.attendanceLoading = false
    },
    startDayStart: (state) => {
      state.startDayLoading = true
      state.startDayError = null
    },
    startDaySuccess: (
      state,
      action: PayloadAction<TodayAttendanceData | undefined>,
    ) => {
      state.startDayLoading = false
      state.startDayError = null
      state.attendance = {
        ...(state.attendance ?? {}),
        is_start: 1,
        ...(action.payload ?? {}),
      }
    },
    startDayFailure: (state, action: PayloadAction<string>) => {
      state.startDayLoading = false
      state.startDayError = action.payload
    },
    endDayStart: (state) => {
      state.endDayLoading = true
      state.endDayError = null
    },
    endDaySuccess: (
      state,
      action: PayloadAction<TodayAttendanceData | undefined>,
    ) => {
      state.endDayLoading = false
      state.endDayError = null
      state.attendance = {
        ...(state.attendance ?? {}),
        ...(action.payload ?? {}),
        is_start: 1,
        is_end: 1,
      }
    },
    endDayFailure: (state, action: PayloadAction<string>) => {
      state.endDayLoading = false
      state.endDayError = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  fetchAttendanceStart,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  startDayStart,
  startDaySuccess,
  startDayFailure,
  endDayStart,
  endDaySuccess,
  endDayFailure,
} = dashboardSlice.actions

export default dashboardSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from './authSlice'
import { todayDateInput } from '@/utils/helper'
import type { AttendanceReportQuery, AttendanceReportRow } from '@/utils/types'

export interface AttendanceReportState {
  items: AttendanceReportRow[]
  total: number
  loading: boolean
  error: string
  query: AttendanceReportQuery
}

const today = todayDateInput()

const initialQuery: AttendanceReportQuery = {
  startDate: today,
  endDate: today,
  page: 1,
  limit: 20,
  search: '',
}

const initialState: AttendanceReportState = {
  items: [],
  total: 0,
  loading: false,
  error: '',
  query: initialQuery,
}

const attendanceReportSlice = createSlice({
  name: 'attendanceReport',
  initialState,
  reducers: {
    fetchAttendanceReport: (
      state,
      action: PayloadAction<AttendanceReportQuery>,
    ) => {
      state.query = action.payload
      state.error = ''

      if (action.payload.startDate > action.payload.endDate) {
        state.loading = false
        state.items = []
        state.total = 0
        state.error = 'Start date must be on or before the end date.'
        return
      }

      state.loading = true
    },
    fetchAttendanceReportSuccess: (
      state,
      action: PayloadAction<{ items: AttendanceReportRow[]; total: number }>,
    ) => {
      state.loading = false
      state.error = ''
      state.items = action.payload.items
      state.total = action.payload.total
    },
    fetchAttendanceReportFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.items = []
      state.total = 0
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchAttendanceReport,
  fetchAttendanceReportSuccess,
  fetchAttendanceReportFailure,
} = attendanceReportSlice.actions

export default attendanceReportSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from './authSlice'
import type {
  ActivityStats,
  EmployeeActivityItem,
  EmployeeActivityPayload,
  TrackingPoint,
  UserActivityRecord,
} from '@/utils/employeeDetail'

interface ActivityState extends EmployeeActivityPayload {
  loading: boolean
  error: string
  date: string
  trackingLoading: boolean
  trackingLoaded: boolean
}

interface RecordState {
  loading: boolean
  error: string
  items: UserActivityRecord[]
}

interface OrdersState extends RecordState {
  fromDate: string
  toDate: string
}

export interface EmployeeDetailState {
  employeeId: string
  activity: ActivityState
  discussion: RecordState
  followups: RecordState
  orders: OrdersState
}

const emptyStats: ActivityStats = {
  total_count: 0,
  orderApproved: 0,
  revenueCount: 0,
  google_distance: 0,
  is_vehicle: 0,
  total_distance: 0,
}

function createActivityState(): ActivityState {
  return {
    loading: false,
    error: '',
    items: [],
    stats: emptyStats,
    tracking: [],
    date: '',
    trackingLoading: false,
    trackingLoaded: false,
  }
}

function createRecordState(): RecordState {
  return { loading: false, error: '', items: [] }
}

function createDetailState(): EmployeeDetailState {
  return {
    employeeId: '',
    activity: createActivityState(),
    discussion: createRecordState(),
    followups: createRecordState(),
    orders: { ...createRecordState(), fromDate: '', toDate: '' },
  }
}

const initialState: EmployeeDetailState = createDetailState()

const employeeDetailSlice = createSlice({
  name: 'employeeDetail',
  initialState,
  reducers: {
    fetchEmployeeActivity: (
      state,
      action: PayloadAction<{ id: string; date: string }>,
    ) => {
      state.employeeId = action.payload.id
      state.activity.loading = true
      state.activity.error = ''
      state.activity.date = action.payload.date
      state.activity.items = []
      state.activity.stats = emptyStats
      state.activity.tracking = []
      state.activity.trackingLoaded = false
      state.activity.trackingLoading = false
    },
    fetchEmployeeActivitySuccess: (
      state,
      action: PayloadAction<EmployeeActivityPayload & { id: string }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.activity.loading = false
      state.activity.error = ''
      state.activity.items = action.payload.items
      state.activity.stats = action.payload.stats
      state.activity.tracking = action.payload.tracking
      state.activity.trackingLoaded = false
    },
    fetchEmployeeActivityFailure: (
      state,
      action: PayloadAction<{ id: string; message: string }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.activity.loading = false
      state.activity.error = action.payload.message
      state.activity.items = []
    },
    fetchEmployeeTracking: (state) => {
      state.activity.trackingLoading = true
    },
    setEmployeeTracking: (
      state,
      action: PayloadAction<{
        id: string
        date: string
        points: TrackingPoint[]
      }>,
    ) => {
      if (
        state.employeeId !== action.payload.id ||
        state.activity.date !== action.payload.date
      ) {
        return
      }
      state.activity.trackingLoading = false
      state.activity.trackingLoaded = true
      state.activity.tracking = action.payload.points
    },
    fetchEmployeeDiscussion: (state, action: PayloadAction<string>) => {
      state.employeeId = action.payload
      state.discussion.loading = true
      state.discussion.error = ''
      state.discussion.items = []
    },
    fetchEmployeeDiscussionSuccess: (
      state,
      action: PayloadAction<{ id: string; items: UserActivityRecord[] }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.discussion.loading = false
      state.discussion.items = action.payload.items
    },
    fetchEmployeeDiscussionFailure: (
      state,
      action: PayloadAction<{ id: string; message: string }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.discussion.loading = false
      state.discussion.error = action.payload.message
    },
    fetchEmployeeFollowups: (state, action: PayloadAction<string>) => {
      state.employeeId = action.payload
      state.followups.loading = true
      state.followups.error = ''
      state.followups.items = []
    },
    fetchEmployeeFollowupsSuccess: (
      state,
      action: PayloadAction<{ id: string; items: UserActivityRecord[] }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.followups.loading = false
      state.followups.items = action.payload.items
    },
    fetchEmployeeFollowupsFailure: (
      state,
      action: PayloadAction<{ id: string; message: string }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.followups.loading = false
      state.followups.error = action.payload.message
    },
    fetchEmployeeOrders: (
      state,
      action: PayloadAction<{ id: string; fromDate: string; toDate: string }>,
    ) => {
      state.employeeId = action.payload.id
      state.orders.loading = true
      state.orders.error = ''
      state.orders.items = []
      state.orders.fromDate = action.payload.fromDate
      state.orders.toDate = action.payload.toDate
    },
    fetchEmployeeOrdersSuccess: (
      state,
      action: PayloadAction<{ id: string; items: UserActivityRecord[] }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.orders.loading = false
      state.orders.items = action.payload.items
    },
    fetchEmployeeOrdersFailure: (
      state,
      action: PayloadAction<{ id: string; message: string }>,
    ) => {
      if (state.employeeId !== action.payload.id) return
      state.orders.loading = false
      state.orders.error = action.payload.message
    },
    clearEmployeeDetail: () => createDetailState(),
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => createDetailState())
  },
})

export const {
  fetchEmployeeActivity,
  fetchEmployeeActivitySuccess,
  fetchEmployeeActivityFailure,
  fetchEmployeeTracking,
  setEmployeeTracking,
  fetchEmployeeDiscussion,
  fetchEmployeeDiscussionSuccess,
  fetchEmployeeDiscussionFailure,
  fetchEmployeeFollowups,
  fetchEmployeeFollowupsSuccess,
  fetchEmployeeFollowupsFailure,
  fetchEmployeeOrders,
  fetchEmployeeOrdersSuccess,
  fetchEmployeeOrdersFailure,
  clearEmployeeDetail,
} = employeeDetailSlice.actions

export type { EmployeeActivityItem }
export default employeeDetailSlice.reducer

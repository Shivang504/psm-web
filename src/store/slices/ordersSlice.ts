import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from './authSlice'
import { todayDateInput } from '@/utils/helper'
import type { LeadProduct, OrderListQuery, OrderRecord } from '@/utils/types'

export interface OrdersState {
  items: OrderRecord[]
  total: number
  loading: boolean
  saving: boolean
  error: string
  query: OrderListQuery
  detail: OrderRecord | null
  detailLoading: boolean
  detailError: string
  catalog: LeadProduct[]
}

const today = todayDateInput()

const initialQuery: OrderListQuery = {
  status: 'pending',
  startDate: today,
  endDate: today,
  page: 1,
  limit: 20,
  search: '',
}

const initialState: OrdersState = {
  items: [],
  total: 0,
  loading: false,
  saving: false,
  error: '',
  query: initialQuery,
  detail: null,
  detailLoading: false,
  detailError: '',
  catalog: [],
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrders: (state, action: PayloadAction<OrderListQuery>) => {
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
    fetchOrdersSuccess: (
      state,
      action: PayloadAction<{ items: OrderRecord[]; total: number }>,
    ) => {
      state.loading = false
      state.error = ''
      state.items = action.payload.items
      state.total = action.payload.total
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.items = []
      state.total = 0
      state.error = action.payload
    },
    setOrderSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload
    },
    fetchOrderDetail: (state) => {
      state.detailLoading = true
      state.detailError = ''
    },
    fetchOrderDetailSuccess: (
      state,
      action: PayloadAction<OrderRecord | null>,
    ) => {
      state.detailLoading = false
      state.detailError = ''
      state.detail = action.payload
    },
    fetchOrderDetailFailure: (state, action: PayloadAction<string>) => {
      state.detailLoading = false
      state.detail = null
      state.detailError = action.payload
    },
    clearOrderDetail: (state) => {
      state.detail = null
      state.detailLoading = false
      state.detailError = ''
    },
    setOrderCatalog: (state, action: PayloadAction<LeadProduct[]>) => {
      state.catalog = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchOrders,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  setOrderSaving,
  fetchOrderDetail,
  fetchOrderDetailSuccess,
  fetchOrderDetailFailure,
  clearOrderDetail,
  setOrderCatalog,
} = ordersSlice.actions

export default ordersSlice.reducer

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from './authSlice'
import type {
  Designation,
  Lead,
  LeadListQuery,
  LeadProduct,
  UserListItem,
} from '@/utils/types'

export interface LeadsState {
  items: Lead[]
  total: number
  loading: boolean
  saving: boolean
  error: string
  query: LeadListQuery
  designations: Designation[]
  employees: UserListItem[]
  products: LeadProduct[]
  vendorRoleId: string
}

const initialQuery: LeadListQuery = {
  status: 'Pending',
  page: 1,
  limit: 20,
  search: '',
}

const initialState: LeadsState = {
  items: [],
  total: 0,
  loading: false,
  saving: false,
  error: '',
  query: initialQuery,
  designations: [],
  employees: [],
  products: [],
  vendorRoleId: '',
}

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    fetchLeads: (state, action: PayloadAction<LeadListQuery>) => {
      state.loading = true
      state.error = ''
      state.query = action.payload
    },
    fetchLeadsSuccess: (
      state,
      action: PayloadAction<{ items: Lead[]; total: number }>,
    ) => {
      state.loading = false
      state.error = ''
      state.items = action.payload.items
      state.total = action.payload.total
    },
    fetchLeadsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.items = []
      state.total = 0
      state.error = action.payload
    },
    setLeadSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload
    },
    setLeadOptions: (
      state,
      action: PayloadAction<{
        designations?: Designation[]
        employees?: UserListItem[]
        products?: LeadProduct[]
        vendorRoleId?: string
      }>,
    ) => {
      if (action.payload.designations) {
        state.designations = action.payload.designations
      }
      if (action.payload.employees) state.employees = action.payload.employees
      if (action.payload.products) state.products = action.payload.products
      if (action.payload.vendorRoleId !== undefined) {
        state.vendorRoleId = action.payload.vendorRoleId
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchLeads,
  fetchLeadsSuccess,
  fetchLeadsFailure,
  setLeadSaving,
  setLeadOptions,
} = leadsSlice.actions

export default leadsSlice.reducer

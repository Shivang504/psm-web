import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from './authSlice'
import type { UserActivityRecord } from '@/utils/employeeDetail'
import type {
  Designation,
  EmployeeFormOptions,
  VendorListQuery,
  VendorRecord,
} from '@/utils/types'

export interface VendorsState {
  items: VendorRecord[]
  total: number
  loading: boolean
  error: string
  query: VendorListQuery
  designations: Designation[]
  designationsLoading: boolean
  designationsError: string
  vendorRoleId: string
  formOptions: EmployeeFormOptions
  formOptionsLoading: boolean
  formOptionsLoaded: boolean
  editing: VendorRecord | null
  editingLoading: boolean
  editingError: string
  saving: boolean
  saveError: string
  selectedId: string | null
  orders: UserActivityRecord[]
  ordersLoading: boolean
  ordersError: string
  deleteTargetId: string | null
  actionLoading: boolean
}

const emptyFormOptions: EmployeeFormOptions = {
  regions: [],
  locationOptions: [],
  stateOptions: [],
  regionOptions: [],
  territoryOptions: [],
}

const initialQuery: VendorListQuery = {
  role: '',
  designation: '',
  page: 1,
  limit: 20,
  search: '',
}

const initialState: VendorsState = {
  items: [],
  total: 0,
  loading: false,
  error: '',
  query: initialQuery,
  designations: [],
  designationsLoading: false,
  designationsError: '',
  vendorRoleId: '',
  formOptions: emptyFormOptions,
  formOptionsLoading: false,
  formOptionsLoaded: false,
  editing: null,
  editingLoading: false,
  editingError: '',
  saving: false,
  saveError: '',
  selectedId: null,
  orders: [],
  ordersLoading: false,
  ordersError: '',
  deleteTargetId: null,
  actionLoading: false,
}

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    fetchVendors: (state, action: PayloadAction<VendorListQuery>) => {
      state.loading = true
      state.error = ''
      state.query = action.payload
    },
    fetchVendorsSuccess: (
      state,
      action: PayloadAction<{ items: VendorRecord[]; total: number }>,
    ) => {
      state.loading = false
      state.error = ''
      state.items = action.payload.items
      state.total = action.payload.total
    },
    fetchVendorsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.items = []
      state.total = 0
      state.error = action.payload
    },
    fetchVendorOptions: (state) => {
      state.designationsLoading = true
      state.designationsError = ''
      state.formOptionsLoading = true
    },
    fetchVendorOptionsSuccess: (
      state,
      action: PayloadAction<{
        designations: Designation[]
        vendorRoleId: string
        formOptions: EmployeeFormOptions
      }>,
    ) => {
      state.designationsLoading = false
      state.formOptionsLoading = false
      state.formOptionsLoaded = true
      state.designations = action.payload.designations
      state.vendorRoleId = action.payload.vendorRoleId
      state.formOptions = action.payload.formOptions
    },
    fetchVendorOptionsFailure: (state, action: PayloadAction<string>) => {
      state.designationsLoading = false
      state.formOptionsLoading = false
      state.formOptionsLoaded = true
      state.designationsError = action.payload
    },
    fetchVendor: (state) => {
      state.editingLoading = true
      state.editingError = ''
      state.editing = null
    },
    fetchVendorSuccess: (state, action: PayloadAction<VendorRecord>) => {
      state.editingLoading = false
      state.editing = action.payload
    },
    fetchVendorFailure: (state, action: PayloadAction<string>) => {
      state.editingLoading = false
      state.editingError = action.payload
    },
    clearVendorForm: (state) => {
      state.editing = null
      state.editingLoading = false
      state.editingError = ''
      state.saving = false
      state.saveError = ''
    },
    saveVendor: (state) => {
      state.saving = true
      state.saveError = ''
    },
    saveVendorSuccess: (state) => {
      state.saving = false
      state.saveError = ''
    },
    saveVendorFailure: (state, action: PayloadAction<string>) => {
      state.saving = false
      state.saveError = action.payload
    },
    setSelectedVendorId: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload
      state.orders = []
      state.ordersError = ''
    },
    fetchVendorOrders: (state) => {
      state.ordersLoading = true
      state.ordersError = ''
    },
    fetchVendorOrdersSuccess: (
      state,
      action: PayloadAction<UserActivityRecord[]>,
    ) => {
      state.ordersLoading = false
      state.orders = action.payload
    },
    fetchVendorOrdersFailure: (state, action: PayloadAction<string>) => {
      state.ordersLoading = false
      state.orders = []
      state.ordersError = action.payload
    },
    requestDeleteVendor: (state, action: PayloadAction<string>) => {
      state.deleteTargetId = action.payload
    },
    cancelDeleteVendor: (state) => {
      state.deleteTargetId = null
      state.actionLoading = false
    },
    deleteVendor: (state) => {
      state.actionLoading = true
    },
    deleteVendorFinished: (state) => {
      state.actionLoading = false
      state.deleteTargetId = null
    },
    updateVendorStatus: (state) => {
      state.actionLoading = true
    },
    updateVendorStatusFinished: (state) => {
      state.actionLoading = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchVendors,
  fetchVendorsSuccess,
  fetchVendorsFailure,
  fetchVendorOptions,
  fetchVendorOptionsSuccess,
  fetchVendorOptionsFailure,
  fetchVendor,
  fetchVendorSuccess,
  fetchVendorFailure,
  clearVendorForm,
  saveVendor,
  saveVendorSuccess,
  saveVendorFailure,
  setSelectedVendorId,
  fetchVendorOrders,
  fetchVendorOrdersSuccess,
  fetchVendorOrdersFailure,
  requestDeleteVendor,
  cancelDeleteVendor,
  deleteVendor,
  deleteVendorFinished,
  updateVendorStatus,
  updateVendorStatusFinished,
} = vendorsSlice.actions

export default vendorsSlice.reducer

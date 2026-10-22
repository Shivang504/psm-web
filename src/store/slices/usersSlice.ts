import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { logout } from './authSlice'
import type {
  Designation,
  EmployeeFormOptions,
  EmployeeFormValues,
  UserListItem,
  UserListQuery,
} from '../../utils/types'

export interface UsersState {
  items: UserListItem[]
  total: number
  loading: boolean
  error: string
  selectedId: string | null
  query: UserListQuery
  designations: Designation[]
  designationsLoading: boolean
  designationsError: string
  employeeRoleId: string
  formOpen: boolean
  formOptions: EmployeeFormOptions
  formOptionsLoading: boolean
  formOptionsLoaded: boolean
  editingUser: UserListItem | null
  editingLoading: boolean
  editingError: string
  saving: boolean
  saveError: string
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

const initialQuery: UserListQuery = {
  role: '',
  designation: '',
  tab: 'Active',
  page: 1,
  limit: 20,
  sort: 'asc',
  column: 'first_name',
  search: '',
}

const initialState: UsersState = {
  items: [],
  total: 0,
  loading: false,
  error: '',
  selectedId: null,
  query: initialQuery,
  designations: [],
  designationsLoading: false,
  designationsError: '',
  employeeRoleId: '',
  formOpen: false,
  formOptions: emptyFormOptions,
  formOptionsLoading: false,
  formOptionsLoaded: false,
  editingUser: null,
  editingLoading: false,
  editingError: '',
  saving: false,
  saveError: '',
  deleteTargetId: null,
  actionLoading: false,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUserList: (state, action: PayloadAction<UserListQuery>) => {
      state.loading = true
      state.error = ''
      state.selectedId = null
      state.query = action.payload
    },
    fetchUserListSuccess: (
      state,
      action: PayloadAction<{ items: UserListItem[]; total: number }>,
    ) => {
      state.loading = false
      state.error = ''
      state.items = action.payload.items
      state.total = action.payload.total
    },
    fetchUserListFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.items = []
      state.total = 0
      state.error = action.payload
    },
    setSelectedUserId: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload
    },
    fetchDesignations: (state) => {
      state.designationsLoading = true
      state.designationsError = ''
      state.loading = true
    },
    fetchDesignationsSuccess: (
      state,
      action: PayloadAction<{
        designations: Designation[]
        employeeRoleId?: string
        listRoleId?: string
      }>,
    ) => {
      const {
        designations,
        employeeRoleId = '',
        listRoleId = '',
      } = action.payload
      const role = listRoleId || employeeRoleId

      state.designationsLoading = false
      state.designations = designations
      if (employeeRoleId) state.employeeRoleId = employeeRoleId

      if (role) state.query.role = role
    },
    fetchDesignationsFailure: (state, action: PayloadAction<string>) => {
      state.designationsLoading = false
      state.designations = []
      state.loading = false
      state.designationsError = action.payload
    },
    openCreateForm: (state) => {
      state.formOpen = true
      state.saveError = ''
      state.formOptionsLoading = true
    },
    closeCreateForm: (state) => {
      state.formOpen = false
      state.saveError = ''
      state.saving = false
    },
    fetchEmployeeFormOptions: (state) => {
      state.formOptionsLoading = true
    },
    fetchEmployeeFormOptionsSuccess: (
      state,
      action: PayloadAction<EmployeeFormOptions>,
    ) => {
      state.formOptionsLoading = false
      state.formOptionsLoaded = true
      state.formOptions = action.payload
    },
    fetchEmployeeFormOptionsFailure: (state) => {
      state.formOptionsLoading = false
      state.formOptionsLoaded = true
      state.formOptions = emptyFormOptions
    },
    clearEmployeeFormState: (state) => {
      state.saveError = ''
      state.saving = false
      state.editingUser = null
      state.editingError = ''
      state.editingLoading = false
    },
    fetchEmployee: {
      reducer(state) {
        state.editingLoading = true
        state.editingError = ''
        state.editingUser = null
      },
      prepare(id: string) {
        return { payload: id }
      },
    },
    fetchEmployeeSuccess: (state, action: PayloadAction<UserListItem>) => {
      state.editingLoading = false
      state.editingError = ''
      state.editingUser = action.payload
    },
    fetchEmployeeFailure: (state, action: PayloadAction<string>) => {
      state.editingLoading = false
      state.editingUser = null
      state.editingError = action.payload
    },
    updateEmployee: {
      reducer(state) {
        state.saving = true
        state.saveError = ''
      },
      prepare(payload: { id: string; values: EmployeeFormValues }) {
        return { payload }
      },
    },
    updateEmployeeSuccess: (state) => {
      state.saving = false
      state.saveError = ''
    },
    updateEmployeeFailure: (state, action: PayloadAction<string>) => {
      state.saving = false
      state.saveError = action.payload
    },
    createEmployee: {
      reducer(state) {
        state.saving = true
        state.saveError = ''
      },
      prepare(values: EmployeeFormValues) {
        return { payload: values }
      },
    },
    createEmployeeSuccess: (state) => {
      state.saving = false
      state.saveError = ''
      state.formOpen = false
    },
    createEmployeeFailure: (state, action: PayloadAction<string>) => {
      state.saving = false
      state.saveError = action.payload
    },
    updateEmployeeStatus: {
      reducer(state) {
        state.actionLoading = true
      },
      prepare(payload: { id: string; status: 'Active' | 'Inactive' }) {
        return { payload }
      },
    },
    updateEmployeeStatusFinished: (state) => {
      state.actionLoading = false
    },
    requestDeleteEmployee: (state, action: PayloadAction<string>) => {
      state.deleteTargetId = action.payload
    },
    cancelDeleteEmployee: (state) => {
      state.deleteTargetId = null
      state.actionLoading = false
    },
    deleteEmployee: {
      reducer(state) {
        state.actionLoading = true
      },
      prepare(id: string) {
        return { payload: id }
      },
    },
    deleteEmployeeSuccess: (state) => {
      state.actionLoading = false
      state.deleteTargetId = null
    },
    deleteEmployeeFailure: (state) => {
      state.actionLoading = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
  },
})

export const {
  fetchUserList,
  fetchUserListSuccess,
  fetchUserListFailure,
  setSelectedUserId,
  fetchDesignations,
  fetchDesignationsSuccess,
  fetchDesignationsFailure,
  openCreateForm,
  closeCreateForm,
  fetchEmployeeFormOptions,
  fetchEmployeeFormOptionsSuccess,
  fetchEmployeeFormOptionsFailure,
  clearEmployeeFormState,
  fetchEmployee,
  fetchEmployeeSuccess,
  fetchEmployeeFailure,
  updateEmployee,
  updateEmployeeSuccess,
  updateEmployeeFailure,
  createEmployee,
  createEmployeeSuccess,
  createEmployeeFailure,
  updateEmployeeStatus,
  updateEmployeeStatusFinished,
  requestDeleteEmployee,
  cancelDeleteEmployee,
  deleteEmployee,
  deleteEmployeeSuccess,
  deleteEmployeeFailure,
} = usersSlice.actions
export default usersSlice.reducer

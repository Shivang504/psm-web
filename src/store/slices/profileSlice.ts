import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getStoredRoleId } from '@/utils/auth'
import type { UserProfile } from '@/utils/types'
import { logout } from './authSlice'

export interface ProfileState {
  profile: UserProfile | null
  roleId: string
  loading: boolean
  error: string
}

const initialState: ProfileState = {
  profile: null,
  roleId: getStoredRoleId() ?? '',
  loading: false,
  error: '',
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchProfile: (state) => {
      state.loading = true
      state.error = ''
    },
    fetchProfileSuccess: (
      state,
      action: PayloadAction<{ profile: UserProfile; roleId: string }>,
    ) => {
      state.loading = false
      state.error = ''
      state.profile = action.payload.profile
      state.roleId = action.payload.roleId
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => ({
      profile: null,
      roleId: '',
      loading: false,
      error: '',
    }))
  },
})

export const { fetchProfile, fetchProfileSuccess, fetchProfileFailure } =
  profileSlice.actions
export default profileSlice.reducer

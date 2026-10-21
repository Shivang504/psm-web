import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  getAccessToken,
  getRefreshToken,
  getStoredMobile,
} from '../../utils/auth'

export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  mobile: string | null
}

export interface LoginSuccessPayload {
  accessToken: string
  refreshToken: string
  mobile?: string | null
}

const initialState: AuthState = {
  isAuthenticated: Boolean(getAccessToken()),
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  mobile: getStoredMobile(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.isAuthenticated = true
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.mobile = action.payload.mobile ?? state.mobile
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.accessToken = null
      state.refreshToken = null
      state.mobile = null
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer

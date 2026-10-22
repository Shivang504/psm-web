import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import usersReducer from './slices/usersSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  users: usersReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer

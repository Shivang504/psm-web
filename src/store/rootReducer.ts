import { combineReducers } from '@reduxjs/toolkit'
import attendanceReportReducer from './slices/attendanceReportSlice'
import authReducer from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import profileReducer from './slices/profileSlice'
import employeeDetailReducer from './slices/employeeDetailSlice'
import usersReducer from './slices/usersSlice'

const rootReducer = combineReducers({
  attendanceReport: attendanceReportReducer,
  auth: authReducer,
  dashboard: dashboardReducer,
  employeeDetail: employeeDetailReducer,
  profile: profileReducer,
  users: usersReducer,
})

export type RootState = ReturnType<typeof rootReducer>
export default rootReducer

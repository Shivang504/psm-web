export interface ApiErrorBody {
  code?: string
  details?: string | null
  message?: string
}

export interface ApiMeta {
  message?: string
}

export interface ApiResponse<TData> {
  success?: number | boolean
  message?: string
  error?: ApiErrorBody | string
  meta?: ApiMeta
  data?: TData
}

export interface SendOtpRequest {
  mobile_no: string
}

export interface SendOtpData {
  otp?: string
}

export type SendOtpResponse = ApiResponse<SendOtpData>

export interface LoginRequest {
  username: string
  otp: string
  config: {
    source: 'web'
  }
}

export interface LoginData {
  accessToken: string
  refreshToken: string
}

export type LoginResponse = ApiResponse<LoginData>

export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  designation?: string
  designation_id?: string
  contact_no?: string
  status?: string
  role?: string
  role_id?: string
  email?: string
  company_id?: string
  company_name?: string
}

export type ProfileResponse = ApiResponse<{
  profile?: UserProfile
}>

export type UserStatusTab = 'Active' | 'Inactive' | 'Deleted'

export interface UserConfig {
  regionName?: string
  employeeCode?: string
  location?: string
  state?: string
  territories?: string
  regionID?: string
  hierarchy?: {
    parent?: string[]
    child?: string[]
    vendor?: unknown[]
  }
}

export interface UserListItem {
  id: string
  first_name?: string | null
  last_name?: string | null
  full_name?: string | null
  email?: string | null
  designation?: string | null
  contact_no?: string | null
  status?: string | null
  role?: string | null
  attendance?: number | null
  config?: UserConfig | null
}

export interface UserListData {
  users?: {
    totalRowsValue?: number
    user?: UserListItem[]
  }
}

export type UserListResponse = ApiResponse<UserListData>

export type UserByIdResponse = ApiResponse<{
  user?: UserListItem | UserListItem[]
}>

export interface UserListQuery {
  role: string
  designation: string
  tab: UserStatusTab
  page: number
  limit: number
  sort: 'asc' | 'desc'
  column: string
  search: string
}

export interface EmployeeFormValues {
  firstName: string
  lastName: string
  employeeCode: string
  designation: string
  location: string
  state: string
  regionName: string
  territories: string
  phone: string
  email: string
}

export interface AppRole {
  id: string
  role: string
}

export interface RegionItem {
  id: string
  region: string
}

export interface EmployeeFormOptions {
  regions: RegionItem[]
  locationOptions: string[]
  stateOptions: string[]
  regionOptions: string[]
  territoryOptions: string[]
}

export interface Designation {
  id: string
  designation: string
}

export interface DesignationListData {
  Designations?: {
    designation?: Designation[]
  }
}

export type DesignationListResponse = ApiResponse<DesignationListData>

export type RolesResponse = ApiResponse<{
  Roles?: AppRole[] | { role?: AppRole[] }
}>

export type RegionsResponse = ApiResponse<{
  Regions?: {
    region?: RegionItem[]
  }
}>

export type TerritoryMasterResponse = ApiResponse<{
  territoryMaster?: {
    data?: unknown
  }
}>

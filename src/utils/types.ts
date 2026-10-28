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

export interface UserCompanyConfig {
  zipCode?: string
  GSTN?: string
  landlineNumber?: string
}

export interface UserProfileConfig {
  birthDate?: string
  flag?: string | number | boolean | null
  regionName?: string
  companyName?: string
  GSTN?: string
  landlineNumber?: string
  address?: string
  state?: string
  city?: string
  country?: string
  pincode?: string
  BankName?: string
  BankIFSC?: string
  BankAccountNumber?: string
  hierarchy?: {
    parent?: string[]
    child?: string[]
    vendor?: unknown[]
  }
}

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
  company_country?: string
  company_address?: string
  company_state?: string
  company_city?: string
  company_pincode?: string
  company_config?: UserCompanyConfig
  config?: UserProfileConfig
}

export type ProfileSection =
  'personal-information' | 'company-detail' | 'bank-detail'

export interface ProfileFormValues {
  firstName: string
  lastName: string
  phone: string
  email: string
  birthDate: string
  companyName: string
  state: string
  city: string
  gstin: string
  landlineNumber: string
  country: string
  address: string
  pincode: string
  bankName: string
  bankIfsc: string
  bankAccountNumber: string
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

export interface DashboardData {
  order_count?: string | number
  total_order_value?: number | string | null
}

export type DashboardResponse = ApiResponse<DashboardData>

export interface TodayAttendanceData {
  is_start?: number
  is_end?: number
  is_leave?: number
  is_vehicle?: number
  meter_no?: string
  start_time?: string
  [key: string]: unknown
}

export type TodayAttendanceResponse = ApiResponse<TodayAttendanceData>

export interface AttendanceReportConfig {
  employeeCode?: string
  regionName?: string
  state?: string
}

export interface AttendanceReportRow {
  employee?: string | null
  first_name?: string | null
  last_name?: string | null
  contact_no?: string | null
  date?: string | null
  startMeter?: string | number | null
  endMeter?: string | number | null
  difference?: string | number | null
  googleDistance?: string | number | null
  Attdance?: string | null
  attendance?: string | null
  config?: AttendanceReportConfig | null
}

export interface AttendanceReportData {
  Attendance?: {
    attendanceList?: AttendanceReportRow[]
    totalRowsValue?: number
    total?: number
    count?: number
  }
}

export type AttendanceReportResponse = ApiResponse<AttendanceReportData>

export interface AttendanceReportQuery {
  startDate: string
  endDate: string
  page: number
  limit: number
  search: string
}

export type LeadStatus = 'Pending' | 'New' | 'Rejected'

export interface LeadConfig {
  company?: string
  companyName?: string
  address?: string
  leadtype?: string
  origin?: string
  valueoflead?: string
  productname?: string
  employee?: string
  buyer_id?: string | number
  Reason?: string
}

export interface Lead {
  id: string
  first_name?: string | null
  last_name?: string | null
  designation?: string | null
  designation_id?: string | null
  contact_no?: string | null
  employee_id?: string | null
  status?: string | null
  config?: LeadConfig | null
}

export interface LeadListQuery {
  status: LeadStatus
  page: number
  limit: number
  search: string
}

export interface LeadFormValues {
  firstName: string
  lastName: string
  phone: string
  company: string
  designationId: string
  address: string
  employeeId: string
  leadType: string
  origin: string
  value: string
  productName: string
}

export interface LeadProduct {
  id?: string
  product_name?: string
  status?: string
  price?: string | number
}

export type OrderTab = 'pending' | 'confirm' | 'reject' | 'cancel' | 'all'

export interface OrderProduct {
  id?: string
  product_id?: string
  product_name?: string
  quantity?: number | string
  price?: number | string
  total_price?: number | string
  config?: {
    selected_package?: string
  }
}

export interface OrderConfig {
  order_id?: string
  buyer_company_name?: string
  company_name?: string
  gross_total?: number | string
  locality?: string
  order_status?: string
  start_time?: string
  reason?: string
  Reason?: string
  products?: OrderProduct[]
}

export interface OrderRecord {
  id?: string
  date?: string
  employee?: string
  event_type?: string
  reason?: string
  config?: OrderConfig
}

export interface OrderListQuery {
  status: OrderTab
  startDate: string
  endDate: string
  page: number
  limit: number
  search: string
}

export type OrderListResponse = ApiResponse<{
  UserActivities?: {
    order?: OrderRecord[]
    totalRowsValue?: number
  }
}>

export type OrderDetailResponse = ApiResponse<{
  UserActivities?: OrderRecord | OrderRecord[]
}>

export type OrderReportResponse = ApiResponse<{
  UserActivities?:
    | OrderRecord[]
    | {
        order?: OrderRecord[]
      }
}>

export type LeadListResponse = ApiResponse<{
  leads?: {
    lead?: Lead[]
    totalRowsValue?: number
  }
}>

export type LeadDetailResponse = ApiResponse<{
  leads?: Lead[] | Lead
}>

export type ProductListResponse = ApiResponse<{
  productList?: {
    products?: LeadProduct[]
  }
}>

export interface StartDayPayload {
  is_vehicle: number
  lat: number
  long: number
  address: string
  locality: string
  pincode: number
  is_flag: number
  start_time: string
  meter_no?: string
  user_selfie: File | Blob
  meter_image?: File | Blob
}

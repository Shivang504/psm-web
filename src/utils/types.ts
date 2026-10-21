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

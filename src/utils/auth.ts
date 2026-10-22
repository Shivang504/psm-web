const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const MOBILE_KEY = 'auth_mobile'
const ROLE_ID_KEY = 'role_id'
const PENDING_MOBILE_KEY = 'pending_mobile'

export interface AuthSession {
  accessToken: string
  refreshToken: string
  mobile?: string | null
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getStoredMobile(): string | null {
  return localStorage.getItem(MOBILE_KEY)
}

export function getStoredRoleId(): string | null {
  return localStorage.getItem(ROLE_ID_KEY)
}

export function setStoredRoleId(roleId: string): void {
  localStorage.setItem(ROLE_ID_KEY, roleId)
}

export function getPendingMobile(): string | null {
  return sessionStorage.getItem(PENDING_MOBILE_KEY)
}

export function setPendingMobile(mobile: string): void {
  sessionStorage.setItem(PENDING_MOBILE_KEY, mobile)
}

export function clearPendingMobile(): void {
  sessionStorage.removeItem(PENDING_MOBILE_KEY)
}

export function setAuthSession({
  accessToken,
  refreshToken,
  mobile,
}: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

  if (mobile) {
    localStorage.setItem(MOBILE_KEY, mobile)
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(MOBILE_KEY)
  localStorage.removeItem(ROLE_ID_KEY)
  clearPendingMobile()
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken())
}

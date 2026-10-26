import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearAuthSession, getAccessToken } from '../utils/auth'
import type { ApiResponse } from '../utils/types'

declare module 'axios' {
  export interface AxiosRequestConfig {
    isPublic?: boolean
  }
}

const baseURL = (import.meta.env.REACT_APP_BASE_URL ?? '')
  .trim()
  .replace(/\/$/, '')

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!baseURL) {
    return Promise.reject(new Error('REACT_APP_BASE_URL is not configured'))
  }

  if (config.url?.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '')
  }

  if (config.data instanceof FormData) {
    // Axios stores this as "content-type". A bracket delete leaves
    // application/json in place, which turns FormData into JSON and drops files.
    config.headers.delete('Content-Type')
  }

  if (!config.isPublic) {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      config.headers['x-auth-token'] = token
    }
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status
    const isPublic = error.config?.isPublic

    if (status === 401 && !isPublic) {
      clearAuthSession()

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

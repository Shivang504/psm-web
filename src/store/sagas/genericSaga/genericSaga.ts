import type { PayloadAction } from '@reduxjs/toolkit'
import axios, { type AxiosError } from 'axios'
import toast from 'react-hot-toast'
import { call, cancelled } from 'redux-saga/effects'
import { apiClient } from '../../../services/axiosInstance'
import type { ApiResponse } from '../../../utils/types'

export interface GenericSagaPayload<T> {
  query: string
  variables?: object
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  onSuccess?: (data: T) => void | boolean
  onFailure?: (error: string) => void
  showToast?: boolean
  successMessage?: string
  errorMessage?: string
  setLoading?: (loading: boolean) => void
  isPublic?: boolean
}

function readErrorMessage(
  error: ApiResponse<unknown>['error'],
): string | undefined {
  if (!error) return undefined
  if (typeof error === 'string') return error || undefined
  return error.message
}

function readMessage(
  payload: ApiResponse<unknown> | undefined,
  fallback: string,
): string {
  if (!payload) return fallback

  return (
    readErrorMessage(payload.error) ||
    payload.meta?.message ||
    payload.message ||
    fallback
  )
}

function isSuccessfulResponse(response: ApiResponse<unknown>): boolean {
  if (response.success === false || response.success === 0) return false
  if (response.success === true || response.success === 1) return true
  return !readErrorMessage(response.error)
}

export function* genericSaga<T extends ApiResponse<unknown>>(
  action: PayloadAction<GenericSagaPayload<T>>,
): Generator<unknown, void, unknown> {
  const {
    query,
    variables,
    method = 'POST',
    onSuccess,
    onFailure,
    showToast = false,
    successMessage,
    errorMessage,
    setLoading,
    isPublic = false,
  } = action.payload

  try {
    setLoading?.(true)

    const response = (yield call(() =>
      apiClient
        .request<T>({
          url: query,
          method,
          data: method === 'GET' ? undefined : variables,
          params: method === 'GET' ? variables : undefined,
          isPublic,
        })
        .then((result) => result.data),
    )) as T

    if (isSuccessfulResponse(response)) {
      const shouldToast = onSuccess?.(response)

      if (showToast && shouldToast !== false) {
        toast.success(
          response.meta?.message ||
            response.message ||
            successMessage ||
            'Success',
        )
      }
    } else {
      const message = errorMessage || readMessage(response, 'Request failed')
      onFailure?.(message)
      if (showToast) toast.error(message)
    }
  } catch (error: unknown) {
    const axiosError = axios.isAxiosError(error)
      ? (error as AxiosError<ApiResponse<unknown>>)
      : null
    const message =
      errorMessage ||
      readMessage(
        axiosError?.response?.data,
        error instanceof Error ? error.message : 'Something went wrong',
      )

    onFailure?.(message)
    if (showToast) toast.error(message)
  } finally {
    const wasCancelled = (yield cancelled()) as boolean
    if (!wasCancelled) setLoading?.(false)
  }
}

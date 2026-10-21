import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

type GuardProps = {
  children: ReactNode
}

export function AuthGuard({ children }: GuardProps) {
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export function GuestGuard({ children }: GuardProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return children
}

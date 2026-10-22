import { Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../../layout/Sidebar'
import { PageHeader } from '../../layout/PageHeader'
import { sagaActions } from '../../../store/actions'
import { logout } from '../../../store/slices/authSlice'
import {
  fetchProfile,
  fetchProfileFailure,
  fetchProfileSuccess,
} from '../../../store/slices/profileSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { clearAuthSession, setStoredRoleId } from '../../../utils/auth'
import type { ProfileResponse } from '../../../utils/types'

export interface AdminLayoutProps {
  title?: string
  subtitle?: string
  headerAction?: ReactNode
  hideHeader?: boolean
  children: ReactNode
}

export function AdminLayout({
  title,
  subtitle,
  headerAction,
  hideHeader = false,
  children,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tabletCollapsed, setTabletCollapsed] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const mobile = useAppSelector((state) => state.auth.mobile)
  const roleId = useAppSelector((state) => state.profile.roleId)
  const profileLoading = useAppSelector((state) => state.profile.loading)
  const profileError = useAppSelector((state) => state.profile.error)

  // Handle auto-collapse on tablet screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1200) {
        setTabletCollapsed(true)
      } else {
        setTabletCollapsed(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (roleId || profileLoading || profileError) return

    dispatch(fetchProfile())
    dispatch({
      type: sagaActions.GET_PROFILE,
      payload: {
        query: '/profile',
        method: 'GET',
        onSuccess: (response: ProfileResponse) => {
          const profile = response.data?.profile
          const nextRoleId = profile?.role_id?.trim() ?? ''

          if (!profile || !nextRoleId) {
            dispatch(fetchProfileFailure('Profile did not include a role.'))
            return
          }

          setStoredRoleId(nextRoleId)
          dispatch(fetchProfileSuccess({ profile, roleId: nextRoleId }))
        },
        onFailure: (message: string) => {
          dispatch(fetchProfileFailure(message))
        },
      },
    })
  }, [dispatch, profileError, profileLoading, roleId])

  const handleSignOut = () => {
    clearAuthSession()
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden p-3 sm:p-5 gap-4 sm:gap-5 bg-[linear-gradient(135deg,#C7D2FE_0%,#FBCFE8_55%,#BAE6FD_100%)] text-[#1E1B4B] font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          mobile={mobile}
          onSignOut={handleSignOut}
          collapsed={tabletCollapsed}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 bg-[#1E1B4B]/30 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex h-full w-[270px] max-w-[85vw] flex-col p-4">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 z-10 inline-flex size-8 items-center justify-center rounded-[10px] bg-white/80 text-[#312E81] shadow-xs"
            >
              <X className="size-4" />
            </button>
            <Sidebar
              mobile={mobile}
              onSignOut={handleSignOut}
              onNavigate={() => setMobileMenuOpen(false)}
              className="h-full shadow-2xl"
            />
          </div>
        </div>
      ) : null}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col gap-4 overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between md:hidden glass-panel px-4 py-2.5">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[12px] bg-white/70 text-[#312E81] border border-white/80 shadow-xs"
          >
            <Menu className="size-5" />
          </button>
          <div className="text-right">
            <h2 className="text-sm font-bold text-[#1E1B4B]">
              {title || 'Admin'}
            </h2>
            {mobile ? (
              <p className="text-[11px] text-[#4C4A7A] truncate">{mobile}</p>
            ) : null}
          </div>
        </div>

        {/* Desktop Header if not hidden and title exists */}
        {!hideHeader && title ? (
          <PageHeader
            title={title}
            subtitle={subtitle}
            extraAction={headerAction}
          />
        ) : null}

        {/* Page Children (Toolbar + Table or Forms) */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  )
}

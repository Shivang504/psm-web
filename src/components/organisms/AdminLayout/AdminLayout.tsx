import { LogOut, Menu, Users, X, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BrandMark } from '../../atoms/BrandMark'
import { logout } from '../../../store/slices/authSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { clearAuthSession } from '../../../utils/auth'

type AdminLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

type NavItem = {
  label: string
  to: string
  icon: LucideIcon
}

const navItems: NavItem[] = [{ label: 'Users', to: '/home', icon: Users }]

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const mobile = useAppSelector((state) => state.auth.mobile)

  const handleSignOut = () => {
    clearAuthSession()
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-svh bg-[#f6f7fb] text-slate-900">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-[linear-gradient(165deg,#2a2578_0%,#4f46e5_52%,#7c73f6_100%)] text-white lg:flex">
        <SidebarBody mobile={mobile} onSignOut={handleSignOut} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-[linear-gradient(165deg,#2a2578_0%,#4f46e5_52%,#7c73f6_100%)] text-white shadow-2xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
            <SidebarBody
              mobile={mobile}
              onSignOut={handleSignOut}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-xl text-slate-600 ring-1 ring-slate-200 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  )
}

function SidebarBody({
  mobile,
  onSignOut,
  onNavigate,
}: {
  mobile: string | null
  onSignOut: () => void
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-6 pb-6">
        <BrandMark className="size-10 rounded-2xl shadow-lg shadow-indigo-950/30" />
        <div>
          <p className="text-[15px] font-semibold tracking-tight">Admin</p>
          <p className="text-xs text-white/70">Manage · Monitor · Grow</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-white ring-1 ring-white/25'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-white/15 p-4">
        <p className="truncate text-xs text-white/70">
          {mobile ? `Signed in · ${mobile}` : 'Signed in'}
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold ring-1 ring-white/25 transition hover:bg-white/25"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </>
  )
}

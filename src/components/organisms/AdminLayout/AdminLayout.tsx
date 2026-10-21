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
    <div className="flex min-h-svh bg-background text-text">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-primary-gradient text-primary-foreground lg:flex">
        <SidebarBody mobile={mobile} onSignOut={handleSignOut} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-background-overlay/45"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-primary-gradient text-primary-foreground shadow-2xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10"
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
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/80 bg-background-surface/90 px-4 py-4 backdrop-blur sm:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-xl text-text-secondary ring-1 ring-border lg:hidden"
          >
            <Menu className="size-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-text-strong">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-sm text-text-muted">{subtitle}</p>
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
        <BrandMark className="size-10 rounded-2xl shadow-lg shadow-primary-deep/30" />
        <div>
          <p className="text-[15px] font-semibold tracking-tight">Admin</p>
          <p className="text-xs text-primary-foreground/70">
            Manage · Monitor · Grow
          </p>
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
                    ? 'bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/25'
                    : 'text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground'
                }`
              }
            >
              <Icon className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-primary-foreground/15 p-4">
        <p className="truncate text-xs text-primary-foreground/70">
          {mobile ? `Signed in · ${mobile}` : 'Signed in'}
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-foreground/15 px-3 py-2 text-sm font-semibold ring-1 ring-primary-foreground/25 transition hover:bg-primary-foreground/25"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </>
  )
}

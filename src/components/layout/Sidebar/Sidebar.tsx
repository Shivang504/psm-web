import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Contact,
  LayoutDashboard,
  LogOut,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

export interface NavItemConfig {
  label: string
  to: string
  icon: LucideIcon
}

const DEFAULT_NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', to: '/leads', icon: Contact },
  { label: 'Employee list', to: '/home', icon: Users },
  { label: 'Attendance report', to: '/attendance', icon: CalendarCheck },
  { label: 'Profile', to: '/profile', icon: User },
]

export interface SidebarProps {
  mobile?: string | null
  onSignOut: () => void
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function Sidebar({
  mobile,
  onSignOut,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  className = '',
}: SidebarProps) {
  return (
    <aside
      className={`glass-panel flex h-full flex-col transition-all duration-200 select-none ${
        collapsed ? 'w-[76px] p-3' : 'w-[250px] p-[20px_16px]'
      } ${className}`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center pb-5 transition-all ${
          collapsed
            ? 'flex-col justify-center gap-2 px-0'
            : 'justify-between px-1.5'
        }`}
      >
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="The PSM Application Logo"
            className={`w-auto object-contain transition-all ${
              collapsed ? 'h-8 max-w-[48px]' : 'h-11'
            }`}
          />
        </div>

        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:inline-flex size-[32px] cursor-pointer items-center justify-center rounded-[10px] border border-white/85 bg-white/70 text-[#312E81] transition duration-150 hover:bg-white hover:text-[#4F46E5] hover:border-[#4F46E5]/30 shadow-xs"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        ) : null}
      </div>

      {/* Navigation Links */}
      <nav
        className="flex flex-1 flex-col gap-1.5"
        role="navigation"
        aria-label="Admin navigation"
      >
        {DEFAULT_NAV_ITEMS.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex h-[44px] items-center gap-3 rounded-[14px] text-[14px] font-medium transition duration-150 ${
                  collapsed ? 'justify-center px-0' : 'px-3.5'
                } ${
                  isActive
                    ? 'bg-[#4F46E5] text-white font-semibold shadow-sm shadow-[#4F46E5]/25'
                    : 'text-[#312E81] hover:bg-white/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`size-5 shrink-0 transition-transform ${
                      isActive ? 'text-white' : 'text-[#312E81]'
                    }`}
                    aria-hidden="true"
                  />
                  {!collapsed ? (
                    <span className="truncate">{item.label}</span>
                  ) : null}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Profile & Sign out */}
      <div className="mt-auto border-t border-[rgba(79,70,229,0.15)] pt-4">
        {!collapsed ? (
          <div className="px-1.5 pb-3 text-[12px] text-[#4C4A7A] truncate">
            {mobile ? `Signed in · ${mobile}` : 'Signed in'}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSignOut}
          title={collapsed ? 'Sign out' : undefined}
          aria-label="Sign out"
          className={`flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-[rgba(79,70,229,0.25)] bg-white/70 text-[14px] font-semibold text-[#312E81] transition duration-150 hover:bg-white hover:border-[rgba(79,70,229,0.4)] ${
            collapsed ? 'px-0' : 'px-3'
          }`}
        >
          <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
          {!collapsed ? <span>Sign out</span> : null}
        </button>
      </div>
    </aside>
  )
}

import {
  Boxes,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Contact,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavChildConfig {
  label: string
  to: string
  end?: boolean
}

export interface NavItemConfig {
  label: string
  to?: string
  icon: LucideIcon
  children?: NavChildConfig[]
}

const DEFAULT_NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', to: '/leads', icon: Contact },
  { label: 'Orders', to: '/orders', icon: ShoppingBag },
  { label: 'Vendors', to: '/vendors', icon: Store },
  {
    label: 'Inventory',
    icon: Boxes,
    children: [
      { label: 'Category', to: '/inventory/category', end: true },
      { label: 'Product', to: '/inventory/products' },
      { label: 'Stock', to: '/inventory/stock' },
      { label: 'Price list', to: '/inventory/price', end: true },
    ],
  },
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
  const { pathname } = useLocation()
  const inventoryActive = pathname.startsWith('/inventory')
  const [inventoryOpen, setInventoryOpen] = useState(inventoryActive)
  const [seenPath, setSeenPath] = useState(pathname)

  if (seenPath !== pathname) {
    setSeenPath(pathname)
    if (inventoryActive) setInventoryOpen(true)
  }

  return (
    <aside
      className={`glass-panel flex h-full min-h-0 flex-col transition-all duration-200 select-none ${
        collapsed ? 'w-[76px] p-3' : 'w-[268px] py-5 pl-4 pr-0'
      } ${className}`}
    >
      {/* Brand Header */}
      <div
        className={`flex shrink-0 items-center pb-5 transition-all ${
          collapsed
            ? 'flex-col justify-center gap-2 px-0'
            : 'justify-between pr-4 pl-1.5'
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
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto ${
          collapsed ? '' : 'sidebar-scroll'
        }`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <div className={`flex flex-col gap-2 ${collapsed ? '' : 'pr-3.5'}`}>
          {DEFAULT_NAV_ITEMS.map((item) => {
            const Icon = item.icon

            if (item.children) {
              const open = !collapsed && inventoryOpen

              return (
                <div
                  key={item.label}
                  className="flex shrink-0 flex-col gap-1.5"
                >
                  <button
                    type="button"
                    title={collapsed ? item.label : undefined}
                    aria-expanded={open}
                    onClick={() => {
                      if (collapsed) {
                        onToggleCollapse?.()
                        setInventoryOpen(true)
                        return
                      }
                      setInventoryOpen((current) => !current)
                    }}
                    className={`group flex h-[44px] shrink-0 cursor-pointer items-center gap-3 rounded-[14px] text-[14px] font-medium transition duration-150 ${
                      collapsed ? 'justify-center px-0' : 'px-3.5'
                    } ${
                      inventoryActive && collapsed
                        ? 'bg-[#4F46E5] font-semibold text-white shadow-sm shadow-[#4F46E5]/25'
                        : inventoryActive
                          ? 'bg-white/70 font-semibold text-[#312E81]'
                          : 'text-[#312E81] hover:bg-white/50'
                    }`}
                  >
                    <Icon
                      className={`size-5 shrink-0 ${
                        inventoryActive && collapsed
                          ? 'text-white'
                          : 'text-[#312E81]'
                      }`}
                      aria-hidden="true"
                    />
                    {!collapsed ? (
                      <>
                        <span className="truncate">{item.label}</span>
                        <ChevronDown
                          className={`ml-auto size-4 shrink-0 transition-transform ${
                            open ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </>
                    ) : null}
                  </button>
                  {open ? (
                    <div className="flex flex-col gap-1.5 pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          end={child.end}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            `flex h-[40px] shrink-0 items-center rounded-[12px] px-3.5 text-[13px] transition duration-150 ${
                              isActive
                                ? 'bg-[#4F46E5] font-semibold text-white shadow-sm shadow-[#4F46E5]/25'
                                : 'font-medium text-[#312E81] hover:bg-white/50'
                            }`
                          }
                        >
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            }

            if (!item.to) return null

            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `group flex h-[44px] shrink-0 items-center gap-3 rounded-[14px] text-[14px] font-medium transition duration-150 ${
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
        </div>
      </nav>

      {/* Bottom Profile & Sign out */}
      <div
        className={`mt-3 shrink-0 border-t border-[rgba(79,70,229,0.15)] pt-4 ${
          collapsed ? '' : 'pr-4'
        }`}
      >
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

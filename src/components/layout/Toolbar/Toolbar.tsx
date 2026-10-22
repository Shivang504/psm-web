import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { StatusTabs } from '../../atoms/StatusTabs'
import type { UserStatusTab } from '../../../utils/types'

export interface ToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  activeTab?: UserStatusTab
  onTabChange?: (tab: UserStatusTab) => void
  filters?: ReactNode
  className?: string
}

export function Toolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search name or mobile',
  activeTab,
  onTabChange,
  filters,
  className = '',
}: ToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${className}`}
      role="search"
      aria-label="Filter and search employees"
    >
      {/* Search Bar */}
      {onSearchChange ? (
        <label className="flex h-[44px] w-full items-center gap-2.5 rounded-[14px] border border-white/85 bg-white/62 px-4 text-[13px] text-[#4C4A7A] backdrop-blur-md transition shadow-[0_2px_8px_rgba(79,70,229,0.04)] focus-within:border-[#4F46E5]/40 focus-within:bg-white/80 sm:w-[320px]">
          <Search
            className="size-[18px] shrink-0 text-[#4C4A7A]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full bg-transparent text-[13px] font-medium text-[#1E1B4B] placeholder:text-[#4C4A7A]/75 outline-none"
          />
          {searchValue ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="inline-flex size-4 cursor-pointer items-center justify-center rounded-full text-[#4C4A7A] hover:bg-white/60 hover:text-[#1E1B4B]"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
      ) : null}

      {/* Segmented Status Tabs */}
      {activeTab && onTabChange ? (
        <StatusTabs value={activeTab} onChange={onTabChange} />
      ) : null}

      {/* Filter Dropdowns */}
      {filters ? (
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          {filters}
        </div>
      ) : null}
    </div>
  )
}

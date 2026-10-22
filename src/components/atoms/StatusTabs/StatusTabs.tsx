import type { UserStatusTab } from '../../../utils/types'

type StatusTabsProps = {
  value: UserStatusTab
  onChange: (tab: UserStatusTab) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TABS: UserStatusTab[] = ['Active', 'Inactive', 'Deleted']

export default function StatusTabs({
  value,
  onChange,
  className = '',
}: StatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter employees by status"
      className={`inline-flex h-[44px] items-center gap-0.5 rounded-[14px] border border-white/85 bg-white/62 p-1 backdrop-blur-md transition shadow-[0_2px_8px_rgba(79,70,229,0.04)] ${className}`}
    >
      {TABS.map((tab) => {
        const selected = value === tab

        return (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(tab)}
            className={`h-[36px] cursor-pointer rounded-[11px] px-4 text-[13px] transition duration-150 select-none ${
              selected
                ? 'bg-[#4F46E5] text-white font-semibold shadow-sm'
                : 'bg-transparent text-[#312E81] font-medium hover:bg-white/45'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

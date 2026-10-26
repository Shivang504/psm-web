export type EmployeeDetailTab =
  'details' | 'activity' | 'discussion' | 'followups' | 'orders'

const TABS: { id: EmployeeDetailTab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'activity', label: 'Activity' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'followups', label: 'Follow-ups' },
  { id: 'orders', label: 'Orders' },
]

type DetailTabsProps = {
  value: EmployeeDetailTab
  onChange: (tab: EmployeeDetailTab) => void
}

export function DetailTabs({ value, onChange }: DetailTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Employee detail sections"
      className="flex gap-1 overflow-x-auto rounded-[14px] border border-white/85 bg-white/62 p-1"
    >
      {TABS.map((tab) => {
        const selected = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`h-9 shrink-0 cursor-pointer rounded-[11px] px-3 text-[13px] transition ${
              selected
                ? 'bg-primary font-semibold text-primary-foreground'
                : 'font-medium text-primary-deep hover:bg-background-surface/70'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

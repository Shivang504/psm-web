import type { UserStatusTab } from '../../../utils/types'

type StatusTabsProps = {
  value: UserStatusTab
  onChange: (tab: UserStatusTab) => void
  size?: 'sm' | 'md' | 'lg'
}

const TABS: UserStatusTab[] = ['Active', 'Inactive', 'Deleted']

const SIZE_CLASSES = {
  sm: {
    container: 'p-0.5',
    button: 'rounded-md px-3 py-1 text-xs',
  },
  md: {
    container: 'p-1',
    button: 'rounded-lg px-4 py-1.5 text-sm',
  },
  lg: {
    container: 'p-1.5',
    button: 'rounded-lg px-5 py-2 text-base',
  },
}

export default function StatusTabs({
  value,
  onChange,
  size = 'md',
}: StatusTabsProps) {
  const sizeClasses = SIZE_CLASSES[size]

  return (
    <div
      className={`inline-flex rounded-xl border border-border bg-background-surface ${sizeClasses.container}`}
    >
      {TABS.map((tab) => {
        const selected = value === tab

        return (
          <button
            key={tab}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab)}
            className={`${sizeClasses.button} cursor-pointer font-semibold transition ${
              selected
                ? 'bg-primary text-primary-foreground shadow-primary-sm'
                : 'text-secondary hover:bg-background-muted'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

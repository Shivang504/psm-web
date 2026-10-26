import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PanelState } from './PanelState'
import type { UserActivityRecord } from '@/utils/employeeDetail'

type EmployeeRecordPanelProps = {
  items: UserActivityRecord[]
  loading: boolean
  error: string
  emptyMessage: string
  loadingLabel?: string
  onRetry: () => void
  detail: (item: UserActivityRecord) => string
  meta: (item: UserActivityRecord) => string
}

function matchesQuery(item: UserActivityRecord, query: string) {
  const haystack = [
    item.config?.buyer_name,
    item.config?.buyer_designation,
    item.config?.notes,
    item.config?.followup_description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function EmployeeRecordPanel({
  items,
  loading,
  error,
  emptyMessage,
  loadingLabel,
  onRetry,
  detail,
  meta,
}: EmployeeRecordPanelProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 3) return items
    return items.filter((item) => matchesQuery(item, term))
  }, [items, query])
  const selected =
    items.find((item) => item.id && item.id === selectedId) || items[0] || null

  return (
    <PanelState
      loading={loading}
      error={error}
      empty={!items.length}
      emptyMessage={emptyMessage}
      loadingLabel={loadingLabel}
      onRetry={onRetry}
    >
      <div className="grid min-h-[420px] grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
        <div className="glass-panel flex min-h-0 flex-col p-3">
          <label className="relative mb-2 block">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-text-disabled" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-9 w-full rounded-[12px] border border-border bg-background-surface pr-3 pl-8 text-xs text-text-main outline-none"
            />
          </label>
          <div className="max-h-[460px] space-y-1 overflow-y-auto">
            {filtered.map((item, index) => {
              const active = selected?.id === item.id
              return (
                <button
                  key={item.id || index}
                  type="button"
                  onClick={() => setSelectedId(item.id ?? null)}
                  className={`w-full cursor-pointer rounded-[12px] px-3 py-2 text-left ${
                    active ? 'bg-primary-soft' : 'hover:bg-background-surface'
                  }`}
                >
                  <span
                    className={`block text-sm font-semibold ${
                      active ? 'text-primary' : 'text-text-main'
                    }`}
                  >
                    {item.config?.buyer_name || '—'}
                  </span>
                  <span className="block text-xs text-text-muted">
                    {item.config?.buyer_designation || '—'}
                  </span>
                </button>
              )
            })}
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-xs text-text-muted">No matches</p>
            ) : null}
          </div>
        </div>
        {selected ? (
          <div className="glass-panel p-4">
            <p className="text-sm leading-6 whitespace-pre-wrap text-text-main">
              {detail(selected)}
            </p>
            <p className="mt-3 text-xs font-semibold text-success">
              {meta(selected)}
            </p>
          </div>
        ) : null}
      </div>
    </PanelState>
  )
}

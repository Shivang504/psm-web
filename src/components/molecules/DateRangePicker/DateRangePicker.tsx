import {
  formatDisplay,
  formatIso,
  matchPreset,
  monthLabel,
  parseDate,
  presetRange,
  startOfToday,
} from '@/utils/helper'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type PresetId =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom'

const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 Days' },
  { id: 'last30', label: 'Last 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' },
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export type DateRangePickerProps = {
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
  className?: string
}

function monthCells(visible: Date) {
  const year = visible.getFullYear()
  const month = visible.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const cells: { iso: string; day: number; outside: boolean }[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(year, month, 1 - firstWeekday + index)
    cells.push({
      iso: formatIso(date),
      day: date.getDate(),
      outside: date.getMonth() !== month,
    })
  }

  return cells
}

function orderedRange(start: string, end: string) {
  return start <= end ? { start, end } : { start: end, end: start }
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  className = '',
}: DateRangePickerProps) {
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [draftStart, setDraftStart] = useState(startDate)
  const [draftEnd, setDraftEnd] = useState(endDate)
  const [preset, setPreset] = useState<PresetId>('today')
  const [anchor, setAnchor] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [visibleMonth, setVisibleMonth] = useState(() => parseDate(startDate))
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, width: 680 })

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const width = Math.min(700, window.innerWidth - 16)
    let left = rect.right - width
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8))

    const estimatedHeight = 430
    let top = rect.bottom + 8
    if (top + estimatedHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimatedHeight - 8)
    }

    setPanelStyle({ top, left, width })
  }, [])

  const close = () => {
    setOpen(false)
    setAnchor(null)
    setHoverDate(null)
  }

  const openPicker = () => {
    const nextPreset = matchPreset(startDate, endDate)
    setDraftStart(startDate)
    setDraftEnd(endDate)
    setPreset(nextPreset)
    setAnchor(null)
    setHoverDate(null)
    setVisibleMonth(parseDate(startDate))
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }
      close()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  const preview = (() => {
    if (anchor && hoverDate) return orderedRange(anchor, hoverDate)
    return orderedRange(draftStart, draftEnd)
  })()

  const selectPreset = (id: PresetId) => {
    setPreset(id)
    setHoverDate(null)
    if (id === 'custom') {
      setAnchor(null)
      return
    }
    const range = presetRange(id)
    if (!range) return
    setDraftStart(range.start)
    setDraftEnd(range.end)
    setAnchor(null)
    setVisibleMonth(parseDate(range.start))
  }

  const selectDay = (iso: string) => {
    setPreset('custom')
    setHoverDate(null)
    if (!anchor) {
      setAnchor(iso)
      setDraftStart(iso)
      setDraftEnd(iso)
      return
    }
    const range = orderedRange(anchor, iso)
    setDraftStart(range.start)
    setDraftEnd(range.end)
    setAnchor(null)
  }

  const apply = () => {
    const range = orderedRange(draftStart, draftEnd)
    onChange(range.start, range.end)
    close()
  }

  const rightMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    1,
  )
  const todayIso = formatIso(startOfToday())

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : openPicker())}
        className="inline-flex h-[44px] cursor-pointer items-center gap-2 rounded-[14px] border border-white/85 bg-white/62 px-3.5 text-[13px] font-semibold text-[#1E1B4B] shadow-[0_2px_8px_rgba(79,70,229,0.04)] backdrop-blur-md transition hover:bg-white/80"
      >
        <Calendar
          className="size-4 shrink-0 text-[#4F46E5]"
          aria-hidden="true"
        />
        <span className="whitespace-nowrap">
          {formatDisplay(startDate)} - {formatDisplay(endDate)}
        </span>
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label="Choose date range"
              className="glass-dropdown fixed z-[70] flex max-h-[calc(100vh-16px)] flex-col overflow-hidden"
              style={{
                top: panelStyle.top,
                left: panelStyle.left,
                width: panelStyle.width,
              }}
            >
              <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
                <div
                  role="listbox"
                  aria-label="Date presets"
                  className="flex shrink-0 gap-1 overflow-x-auto border-b border-[rgba(79,70,229,0.12)] p-2 sm:w-[156px] sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0"
                >
                  {PRESETS.map((item) => {
                    const selected = preset === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => selectPreset(item.id)}
                        className={`shrink-0 cursor-pointer rounded-[10px] px-3 py-2 text-left text-[13px] font-medium whitespace-nowrap transition ${
                          selected
                            ? 'bg-[#4F46E5] font-semibold text-white'
                            : 'text-[#312E81] hover:bg-[#EEF2FF]'
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                <div
                  className="grid min-w-0 flex-1 grid-cols-1 gap-2 overflow-auto p-3 sm:grid-cols-2"
                  onMouseLeave={() => setHoverDate(null)}
                >
                  {[visibleMonth, rightMonth].map((month, index) => (
                    <MonthCalendar
                      key={formatIso(month)}
                      month={month}
                      rangeStart={preview.start}
                      rangeEnd={preview.end}
                      todayIso={todayIso}
                      showPrevious={index === 0}
                      showNext={index === 1}
                      onPrevious={() =>
                        setVisibleMonth(
                          (current) =>
                            new Date(
                              current.getFullYear(),
                              current.getMonth() - 1,
                              1,
                            ),
                        )
                      }
                      onNext={() =>
                        setVisibleMonth(
                          (current) =>
                            new Date(
                              current.getFullYear(),
                              current.getMonth() + 1,
                              1,
                            ),
                        )
                      }
                      onSelect={selectDay}
                      onHover={setHoverDate}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[rgba(79,70,229,0.12)] px-4 py-3">
                <span className="mr-auto text-[13px] font-medium text-[#4C4A7A]">
                  {formatDisplay(preview.start)} - {formatDisplay(preview.end)}
                </span>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-[36px] cursor-pointer items-center rounded-[12px] border border-[rgba(79,70,229,0.2)] bg-white/80 px-4 text-[13px] font-semibold text-[#312E81] hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="inline-flex h-[36px] cursor-pointer items-center rounded-[12px] bg-[#4F46E5] px-4 text-[13px] font-semibold text-white hover:bg-[#4338CA]"
                >
                  Apply
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function MonthCalendar({
  month,
  rangeStart,
  rangeEnd,
  todayIso,
  showPrevious,
  showNext,
  onPrevious,
  onNext,
  onSelect,
  onHover,
}: {
  month: Date
  rangeStart: string
  rangeEnd: string
  todayIso: string
  showPrevious: boolean
  showNext: boolean
  onPrevious: () => void
  onNext: () => void
  onSelect: (iso: string) => void
  onHover: (iso: string | null) => void
}) {
  const cells = monthCells(month)

  return (
    <div>
      <div className="mb-2 flex h-8 items-center justify-between px-1">
        {showPrevious ? (
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrevious}
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-[#312E81] hover:bg-[#EEF2FF]"
          >
            <ChevronLeft className="size-4" />
          </button>
        ) : (
          <span className="size-7" />
        )}
        <p className="text-[14px] font-semibold text-[#1E1B4B]">
          {monthLabel(month)}
        </p>
        {showNext ? (
          <button
            type="button"
            aria-label="Next month"
            onClick={onNext}
            className="inline-flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-[#312E81] hover:bg-[#EEF2FF]"
          >
            <ChevronRight className="size-4" />
          </button>
        ) : (
          <span className="size-7" />
        )}
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="py-1 text-[11px] font-semibold text-[#4C4A7A]"
          >
            {day}
          </span>
        ))}
        {cells.map((cell) => {
          const isStart = cell.iso === rangeStart
          const isEnd = cell.iso === rangeEnd
          const inRange = cell.iso > rangeStart && cell.iso < rangeEnd
          const single = rangeStart === rangeEnd
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelect(cell.iso)}
              onMouseEnter={() => onHover(cell.iso)}
              className="relative h-9 cursor-pointer text-[13px]"
            >
              {!single && isStart ? (
                <span className="absolute inset-y-1 right-0 left-1/2 bg-[#EEF2FF]" />
              ) : null}
              {!single && isEnd ? (
                <span className="absolute inset-y-1 right-1/2 left-0 bg-[#EEF2FF]" />
              ) : null}
              {inRange ? (
                <span className="absolute inset-y-1 inset-x-0 bg-[#EEF2FF]" />
              ) : null}
              <span
                className={`relative z-10 mx-auto flex size-8 items-center justify-center rounded-full ${
                  isStart || isEnd
                    ? 'bg-[#4F46E5] font-semibold text-white'
                    : cell.iso === todayIso
                      ? 'font-semibold text-[#4F46E5] ring-1 ring-[#4F46E5]'
                      : cell.outside
                        ? 'text-[#94A3B8]'
                        : 'text-[#1E1B4B] hover:bg-[#EEF2FF]'
                }`}
              >
                {cell.day}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

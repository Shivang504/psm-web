import { Filter, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type FilterOption = {
  label: string
  value: string
}

type FilterDropdownProps = {
  options: FilterOption[]
  selected?: string
  placeholder?: string
  onChange: (value: string) => void
  clearbutton?: boolean
}

export function FilterDropdown({
  options,
  selected,
  placeholder = 'Select filter',
  onChange,
  clearbutton = true,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    minWidth: 0,
  })

  const updateMenuPosition = useCallback(() => {
    const rect = dropdownRef.current?.getBoundingClientRect()
    if (!rect) return

    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      minWidth: rect.width,
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        dropdownRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return

    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, updateMenuPosition])

  const selectedLabel =
    options.find((option) => option.value === selected)?.label || placeholder

  return (
    <div ref={dropdownRef} className="relative w-full max-w-40">
      <button
        type="button"
        onClick={() => {
          updateMenuPosition()
          setOpen((current) => !current)
        }}
        className={`flex h-10 w-full min-w-28 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 text-sm outline-none transition ${
          selected
            ? 'border-primary bg-primary-soft text-primary'
            : 'border-border bg-background-surface text-secondary hover:border-border-strong'
        }`}
      >
        <Filter className="size-3.5 shrink-0 text-primary" />
        <span className="truncate text-xs font-semibold">{selectedLabel}</span>
        {selected && clearbutton ? (
          <X
            className="size-4 shrink-0 text-text-faint hover:text-secondary"
            onClick={(event) => {
              event.stopPropagation()
              onChange('')
              setOpen(false)
            }}
          />
        ) : (
          <span className="size-4 shrink-0" />
        )}
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-50 max-h-60 overflow-y-auto rounded-xl border border-border bg-background-surface py-1 shadow-card"
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                minWidth: menuStyle.minWidth,
              }}
            >
              {options.length ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`block w-full cursor-pointer px-4 py-2 text-left text-sm whitespace-nowrap transition hover:bg-primary-soft ${
                      selected === option.value
                        ? 'bg-primary-soft font-semibold text-primary'
                        : 'text-text-emphasis'
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-text-muted">No roles</p>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

import { ChevronDown, X } from 'lucide-react'
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
  className?: string
}

export function FilterDropdown({
  options,
  selected,
  placeholder = 'Select filter',
  onChange,
  clearbutton = true,
  className = '',
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
      top: rect.bottom + 6,
      left: rect.left,
      minWidth: Math.max(rect.width, 160),
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open, updateMenuPosition])

  const selectedOption = options.find((option) => option.value === selected)
  const selectedLabel = selectedOption?.label || placeholder
  const isSelected = Boolean(selected)

  return (
    <div ref={dropdownRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          updateMenuPosition()
          setOpen((current) => !current)
        }}
        className={`flex h-[44px] cursor-pointer items-center justify-between gap-2 rounded-[14px] border px-4 text-[13px] font-medium transition duration-150 select-none shadow-[0_2px_8px_rgba(79,70,229,0.04)] ${
          isSelected
            ? 'border-[#4F46E5]/40 bg-[#EEF2FF]/90 text-[#3730A3] font-semibold'
            : 'border-white/85 bg-white/62 backdrop-blur-md text-[#1E1B4B] hover:bg-white/80'
        }`}
      >
        <span className="truncate max-w-[140px]">{selectedLabel}</span>

        {isSelected && clearbutton ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Clear ${placeholder} filter`}
            className="inline-flex size-4 items-center justify-center rounded-full text-[#4C4A7A] hover:bg-white hover:text-[#1E1B4B]"
            onClick={(event) => {
              event.stopPropagation()
              onChange('')
              setOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.stopPropagation()
                onChange('')
                setOpen(false)
              }
            }}
          >
            <X className="size-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={`size-4 text-[#4C4A7A] transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        )}
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label={placeholder}
              className="glass-dropdown fixed z-50 max-h-64 overflow-y-auto p-1.5 shadow-[0_12px_36px_rgba(30,27,75,0.16)]"
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                minWidth: menuStyle.minWidth,
              }}
            >
              {options.length ? (
                options.map((option) => {
                  const isCurrent = selected === option.value
                  return (
                    <button
                      key={option.value}
                      role="option"
                      aria-selected={isCurrent}
                      type="button"
                      onClick={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className={`block w-full cursor-pointer rounded-[10px] px-3.5 py-2 text-left text-[13px] whitespace-nowrap transition ${
                        isCurrent
                          ? 'bg-[#4F46E5] text-white font-semibold'
                          : 'text-[#1E1B4B] hover:bg-[#EEF2FF] hover:text-[#3730A3]'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })
              ) : (
                <p className="px-4 py-2 text-[13px] text-[#4C4A7A]">
                  No options
                </p>
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

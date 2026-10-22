import { ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from 'react-hook-form'

export type SelectOption = {
  label: string
  value: string
}

type SelectFieldProps<T extends FieldValues> = {
  name: Path<T>
  options: SelectOption[]
  placeholder?: string
  label?: string
  isSearch?: boolean
  isRequired?: boolean
  disabled?: boolean
  variant?: 'dark' | 'light'
  onValueChange?: (value: string) => void
}

export function SelectField<T extends FieldValues>({
  name,
  options,
  placeholder = 'Select option',
  label,
  isSearch = false,
  isRequired = false,
  disabled = false,
  variant = 'light',
  onValueChange,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  })
  const { control, trigger } = useFormContext<T>()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase()),
  )

  const themeStyles = {
    dark: {
      label: 'text-sm text-primary-foreground/70',
      trigger:
        'border-primary-foreground/40 bg-transparent text-primary-foreground',
      value: 'text-primary-foreground',
      placeholder: 'text-primary-foreground/20',
      icon: 'text-primary-foreground/40',
      menu: 'border-primary-foreground/40 bg-primary-deep text-primary-foreground',
      search:
        'border-primary-foreground/20 bg-transparent text-primary-foreground placeholder:text-primary-foreground/20',
      option: 'text-primary-foreground hover:bg-primary-foreground/10',
      optionSelected: 'bg-primary-foreground/10 font-semibold',
      empty: 'text-primary-foreground/50',
    },
    light: {
      label: 'text-[13px] font-semibold text-[#1E1B4B]',
      trigger:
        'border border-white/85 bg-white/70 text-[#1E1B4B] backdrop-blur-sm hover:bg-white/85',
      value: 'text-[#1E1B4B]',
      placeholder: 'text-[#4C4A7A]/60',
      icon: 'text-[#4C4A7A]',
      menu: 'glass-dropdown p-1.5 shadow-[0_12px_36px_rgba(30,27,75,0.16)]',
      search:
        'border-b border-[rgba(79,70,229,0.12)] bg-white/50 text-[#1E1B4B] placeholder:text-[#4C4A7A]/60 rounded-t-[10px]',
      option:
        'text-[#1E1B4B] hover:bg-[#EEF2FF] hover:text-[#3730A3] rounded-[8px]',
      optionSelected: 'bg-[#4F46E5] text-white font-semibold rounded-[8px]',
      empty: 'text-[#4C4A7A]',
    },
  }

  const currentTheme = themeStyles[variant]

  const updateMenuPosition = useCallback(() => {
    const rect = dropdownRef.current?.getBoundingClientRect()
    if (!rect) return

    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
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
      setSearch('')
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

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedLabel = options.find(
          (option) => option.value === field.value,
        )?.label
        const isDisabled = disabled || field.disabled

        return (
          <div className="relative w-full" ref={dropdownRef}>
            {label ? (
              <label
                className={`mb-2 block tracking-wide ${currentTheme.label}`}
              >
                {label}{' '}
                {isRequired ? <span className="text-error">*</span> : null}
              </label>
            ) : null}

            <button
              type="button"
              disabled={isDisabled}
              aria-expanded={open}
              aria-invalid={Boolean(fieldState.error)}
              onClick={() => {
                if (isDisabled) return
                updateMenuPosition()
                setOpen((current) => !current)
                setSearch('')
              }}
              className={`flex h-[44px] w-full cursor-pointer items-center justify-between gap-3 rounded-[14px] border px-4 text-left text-[13px] outline-none transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentTheme.trigger} ${
                open ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15' : ''
              } ${
                fieldState.error ? 'border-red-400 ring-2 ring-red-100' : ''
              }`}
            >
              <span
                className={`truncate ${
                  selectedLabel ? currentTheme.value : currentTheme.placeholder
                }`}
              >
                {selectedLabel || placeholder}
              </span>
              {open ? (
                <ChevronUp className={`size-4 shrink-0 ${currentTheme.icon}`} />
              ) : (
                <ChevronDown
                  className={`size-4 shrink-0 ${currentTheme.icon}`}
                />
              )}
            </button>

            {open
              ? createPortal(
                  <div
                    ref={menuRef}
                    className={`fixed z-50 rounded-xl border ${currentTheme.menu}`}
                    style={{
                      top: menuStyle.top,
                      left: menuStyle.left,
                      width: menuStyle.width,
                    }}
                  >
                    {isSearch ? (
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        tabIndex={-1}
                        onChange={(event) => setSearch(event.target.value)}
                        className={`w-full border-b px-4 py-2 text-sm outline-none ${currentTheme.search}`}
                      />
                    ) : null}

                    <ul className="max-h-48 overflow-y-auto py-1">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
                          const selected = option.value === field.value

                          return (
                            <li key={option.value}>
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(option.value)
                                  field.onBlur()
                                  void trigger(name)
                                  onValueChange?.(option.value)
                                  setOpen(false)
                                  setSearch('')
                                }}
                                className={`block w-full cursor-pointer px-4 py-2 text-left text-sm transition ${currentTheme.option} ${
                                  selected ? currentTheme.optionSelected : ''
                                }`}
                              >
                                {option.label}
                              </button>
                            </li>
                          )
                        })
                      ) : (
                        <li
                          className={`px-4 py-2 text-xs ${currentTheme.empty}`}
                        >
                          No results found
                        </li>
                      )}
                    </ul>
                  </div>,
                  document.body,
                )
              : null}

            {fieldState.error ? (
              <p className="mt-2 text-xs text-error">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        )
      }}
    />
  )
}

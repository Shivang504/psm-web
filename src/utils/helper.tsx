import type { UserListItem } from './types'

export function displayValue(value?: string | null) {
  const text = value?.trim()
  return text || '—'
}

export function attendanceLabel(attendance?: number | null) {
  if (attendance === 1) return 'Present'
  if (attendance === 0) return 'Absent'
  return '—'
}

export function displayName(user: UserListItem) {
  const fullName = user.full_name?.trim()
  if (fullName) return fullName

  const name = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
  return name || '—'
}

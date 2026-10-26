import { useEffect, useMemo, useState } from 'react'
import { Pencil, Power, Trash2 } from 'lucide-react'
import { Drawer } from '@/components/molecules/Drawer'
import { useAppDispatch } from '@/store/hooks'
import { clearEmployeeDetail } from '@/store/slices/employeeDetailSlice'
import { DetailTabs, type EmployeeDetailTab } from './detail/DetailTabs'
import { EmployeeActivityPanel } from './detail/EmployeeActivityPanel'
import { EmployeeDetailsPanel } from './detail/EmployeeDetailsPanel'
import { EmployeeDiscussionPanel } from './detail/EmployeeDiscussionPanel'
import { EmployeeFollowupsPanel } from './detail/EmployeeFollowupsPanel'
import { EmployeeOrdersPanel } from './detail/EmployeeOrdersPanel'
import { displayName, displayValue } from '@/utils/helper'
import type { UserListItem } from '@/utils/types'

export interface EmployeeDrawerProps {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onEdit?: (user: UserListItem) => void
  onToggleStatus?: (user: UserListItem) => void
  onDelete?: (user: UserListItem) => void
  canModify?: boolean
}

function parseAreas(user: UserListItem): string[] {
  const territories = user.config?.territories?.trim()
  const source = territories || user.config?.location?.trim()
  if (!source) return []

  return source
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function EmployeeDrawer({
  user,
  open,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
  canModify = true,
}: EmployeeDrawerProps) {
  const dispatch = useAppDispatch()
  const [tabState, setTabState] = useState<{
    id: string
    tab: EmployeeDetailTab
  }>({ id: '', tab: 'details' })
  const areas = useMemo(() => (user ? parseAreas(user) : []), [user])
  const tab = tabState.id === user?.id ? tabState.tab : 'details'

  useEffect(() => {
    if (!user) dispatch(clearEmployeeDetail())
  }, [dispatch, user])

  if (!user) return null

  return (
    <Drawer
      open={open}
      title="Employee Details"
      subtitle={`${displayName(user)} (${displayValue(user.config?.employeeCode)})`}
      onClose={onClose}
      panelClassName="max-w-xl sm:max-w-5xl"
      footer={
        canModify ? (
          <div className="flex items-center justify-end gap-3">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(user)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[14px] bg-primary px-4 text-xs font-semibold text-primary-foreground"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
            ) : null}
            {onToggleStatus ? (
              <button
                type="button"
                onClick={() => onToggleStatus(user)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[14px] border border-border-strong bg-background-surface/80 px-4 text-xs font-semibold text-primary-deep"
              >
                <Power className="size-3.5" />
                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(user)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[14px] border border-error-border bg-error-soft/80 px-4 text-xs font-semibold text-error"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            ) : null}
          </div>
        ) : null
      }
    >
      <DetailTabs
        value={tab}
        onChange={(next) => {
          if (!user) return
          setTabState({ id: user.id, tab: next })
        }}
      />
      <div className="mt-5" role="tabpanel">
        {tab === 'details' ? (
          <EmployeeDetailsPanel user={user} areas={areas} />
        ) : null}
        {tab === 'activity' ? (
          <EmployeeActivityPanel key={user.id} userId={user.id} />
        ) : null}
        {tab === 'discussion' ? (
          <EmployeeDiscussionPanel key={user.id} userId={user.id} />
        ) : null}
        {tab === 'followups' ? (
          <EmployeeFollowupsPanel key={user.id} userId={user.id} />
        ) : null}
        {tab === 'orders' ? (
          <EmployeeOrdersPanel key={user.id} userId={user.id} />
        ) : null}
      </div>
    </Drawer>
  )
}

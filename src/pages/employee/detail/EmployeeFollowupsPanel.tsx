import { useLayoutEffect } from 'react'
import { EmployeeRecordPanel } from './EmployeeRecordPanel'
import { requestEmployeeFollowups } from './requestEmployeeDetail'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { UserActivityRecord } from '@/utils/employeeDetail'

type EmployeeFollowupsPanelProps = {
  userId: string
}

export function EmployeeFollowupsPanel({
  userId,
}: EmployeeFollowupsPanelProps) {
  const dispatch = useAppDispatch()
  const followups = useAppSelector((state) => state.employeeDetail.followups)

  useLayoutEffect(() => {
    requestEmployeeFollowups(dispatch, userId)
  }, [dispatch, userId])

  return (
    <EmployeeRecordPanel
      items={followups.items}
      loading={followups.loading}
      error={followups.error}
      emptyMessage="No follow-ups yet."
      loadingLabel="Loading follow-ups"
      onRetry={() => requestEmployeeFollowups(dispatch, userId)}
      detail={(item: UserActivityRecord) =>
        item.config?.followup_description || '—'
      }
      meta={(item: UserActivityRecord) =>
        `Date : ${item.date || '—'} Follow up Date: ${item.config?.followup_date || '—'}`
      }
    />
  )
}

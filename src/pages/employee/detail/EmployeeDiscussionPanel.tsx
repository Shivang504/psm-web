import { useLayoutEffect } from 'react'
import { EmployeeRecordPanel } from './EmployeeRecordPanel'
import { requestEmployeeDiscussion } from './requestEmployeeDetail'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { UserActivityRecord } from '@/utils/employeeDetail'

type EmployeeDiscussionPanelProps = {
  userId: string
}

export function EmployeeDiscussionPanel({
  userId,
}: EmployeeDiscussionPanelProps) {
  const dispatch = useAppDispatch()
  const discussion = useAppSelector((state) => state.employeeDetail.discussion)

  useLayoutEffect(() => {
    requestEmployeeDiscussion(dispatch, userId)
  }, [dispatch, userId])

  return (
    <EmployeeRecordPanel
      items={discussion.items}
      loading={discussion.loading}
      error={discussion.error}
      emptyMessage="No discussions yet."
      loadingLabel="Loading discussion"
      onRetry={() => requestEmployeeDiscussion(dispatch, userId)}
      detail={(item: UserActivityRecord) => item.config?.notes || '—'}
      meta={(item: UserActivityRecord) => `Date : ${item.date || '—'}`}
    />
  )
}
